import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { KeyRound, List } from "lucide-react";
import { useKeyStore } from "../../store/keyStore";
import { useAuthStore } from "../../store/authStore";
import BottomNavigation from "../../components/ui/BottomNavigation";
import QRCode from "react-qr-code";
import socketService from "../../services/socketService";
import { config } from "../../utils/config";

const FacultyDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTabFromPath = () => {
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    const validTabs = ['taken', 'keylist'];
    
    // Check localStorage first if we're on the root faculty path
    if (location.pathname === '/dashboard/faculty') {
      const lastRoute = localStorage.getItem('lastFacultyRoute');
      if (lastRoute) {
        const lastParts = lastRoute.split('/');
        const lastTab = lastParts[lastParts.length - 1];
        if (validTabs.includes(lastTab)) {
          return lastTab;
        }
      }
    }
    
    if (validTabs.includes(lastPart)) {
      return lastPart;
    }
    return 'taken'; // Default tab
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());
  const [searchQuery, setSearchQuery] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [qrSecondsLeft, setQrSecondsLeft] = useState(20);
  const [qrExpired, setQrExpired] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [qrCollected, setQrCollected] = useState(false);

  const { user } = useAuthStore();
  const {
    keys,
    frequentlyUsedKeys,
    usageCounts,
    getTakenKeys,
    generateKeyRequestQR,
    generateKeyReturnQR,
    fetchKeys,
    fetchTakenKeys,
    fetchUserFrequentlyUsedKeys,
    isLoadingTakenKeys,
  } = useKeyStore();

  // Effect to sync active tab with URL changes
  useEffect(() => {
    setActiveTab(getActiveTabFromPath());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleTabChange = (tabId) => {
    const newPath = `/dashboard/faculty/${tabId}`;
    // Store the current route in localStorage
    localStorage.setItem('lastFacultyRoute', newPath);
    navigate(newPath);
    if (tabId === "taken" && user) {
      fetchTakenKeys(user.id).catch(console.error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchKeys().catch(console.error);
      fetchTakenKeys(user.id).catch(console.error);
      fetchUserFrequentlyUsedKeys().catch(console.error);
      
      // Restore last visited route from localStorage if available
      const lastRoute = localStorage.getItem('lastFacultyRoute');
      if (lastRoute && location.pathname === '/dashboard/faculty') {
        navigate(lastRoute);
      }
    }
  }, [user, fetchKeys, fetchTakenKeys, fetchUserFrequentlyUsedKeys, navigate, location.pathname]);

  const takenKeys = getTakenKeys(user?.id);

  const tabs = [
    {
      id: "taken",
      label: "My Keys",
      icon: <KeyRound className="w-6 h-6" />,
      badge: takenKeys.length > 0 ? takenKeys.length : null,
    },
    {
      id: "keylist",
      label: "All Keys",
      icon: <List className="w-6 h-6" />,
    },
  ];

  const handleRequestKey = async (keyId) => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated or user ID missing');
      }

      if (!keyId) {
        throw new Error('Key ID is required');
      }

      // Generate QR code for key request
      const qrData = await generateKeyRequestQR(keyId, user.id);
      // Attach key metadata for better UX in the modal (e.g., show key number)
      const selectedKey = keys.find(k => k.id === keyId);
      const qrDataWithMeta = selectedKey?.keyNumber
        ? { ...qrData, keyNumber: selectedKey.keyNumber }
        : qrData;
      setQrData(qrDataWithMeta);
      setShowQRModal(true);
      setQrExpired(false);
      setQrCollected(false); // reset
    } catch (error) {
      console.error("Request key error:", error);
      // Show error to user
      alert(`Error generating QR code: ${error.message}`);
    }
  };

  // Countdown timer for QR modal using config.qr.validitySeconds
  useEffect(() => {
    const MAX_SECONDS = config.qr.validitySeconds;
    if (!showQRModal || !qrData?.timestamp) return;

    const update = () => {
      const createdAt = new Date(qrData.timestamp).getTime();
      const elapsed = Math.max(0, Math.floor((Date.now() - createdAt) / 1000));
      const left = Math.max(0, MAX_SECONDS - elapsed);
      setQrSecondsLeft(left);
      setQrExpired(left <= 0);
    };

    update();
    const id = setInterval(update, 500);
    return () => clearInterval(id);
  }, [showQRModal, qrData]);

  // Listen for request/return QR collected via sockets
  useEffect(() => {
    if (!showQRModal || !qrData) return;
    try { socketService.connect(); } catch { /* intentionally ignored */ }

    const onEvent = (data) => {
      try {
        // Check for both request and return actions
        const isRequestAction = data?.action === 'qr-request';
        const isReturnAction = data?.action === 'qr-return';
        
        if (!isRequestAction && !isReturnAction) return;
        
        const eventKeyId = data.key?._id || data.key?.id;
        const eventUserId = data.requestingUserId || data.returningUserId;
        
        // Match based on QR type
        const isMatchingRequest = qrData.type === 'key-request' && isRequestAction;
        const isMatchingReturn = qrData.type === 'key-return' && isReturnAction;
        
        if ((isMatchingRequest || isMatchingReturn) && eventKeyId === qrData.keyId && eventUserId === user?.id) {
          setQrCollected(true);
          setQrExpired(false);
          
          // Optionally refresh taken keys after successful scan
          if (user?.id) {
            setTimeout(() => {
              fetchTakenKeys(user.id).catch(console.error);
            }, 1000);
          }
        }
      } catch {
        // intentionally left blank
      }
    };

    socketService.on('userKeyUpdated', onEvent);
    socketService.on('keyUpdated', onEvent);
    return () => {
      socketService.off('userKeyUpdated', onEvent);
      socketService.off('keyUpdated', onEvent);
    };
  }, [showQRModal, qrData, user?.id, fetchTakenKeys]);

  const handleRegenerateRequestQR = async () => {
    if (!qrData?.keyId || !user?.id) return;
    try {
      const newQR = await generateKeyRequestQR(qrData.keyId, user.id);
      const selectedKey = keys.find(k => k.id === qrData.keyId);
      const withMeta = selectedKey?.keyNumber ? { ...newQR, keyNumber: selectedKey.keyNumber } : newQR;
      setQrData(withMeta);
      setQrExpired(false);
      setQrCollected(false);
    } catch (e) {
      console.error('Failed to regenerate request QR:', e);
    }
  };

  const handleReturnKey = async (keyId) => {
    if (!user?.id || !keyId) return null;
    return await generateKeyReturnQR(keyId, user.id);
  };

  const handleDepartmentClick = (department) => {
    setSelectedDepartment(department);
  };

  const handleBackToDepartments = () => {
    setSelectedDepartment(null);
  };

  const handleToggleFrequent = (keyId) => {
    // Add your logic for toggling frequent keys here
    console.log('Toggle frequent for key:', keyId);
  };

  const outletContext = {
    // Common props for all pages
    searchQuery,
    setSearchQuery,
    selectedDepartment,
    keys,
    handleRequestKey,
    handleReturnKey,
    handleDepartmentClick,
    handleBackToDepartments: handleBackToDepartments,
    handleToggleFrequent,
    user,
    // My Keys page specific
    takenKeys,
    fetchTakenKeys,
    isLoadingTakenKeys,
    // All Keys page specific
    frequentlyUsedKeys,
    usageCounts,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Faculty Dashboard</h1>
            <p className="text-gray-300">Welcome, {user?.name}</p>
          </div>        </div>
      </div>

      {/* Render nested route content */}
      <Outlet context={outletContext} />

      {/* Bottom Navigation */}
      <BottomNavigation tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

      {/* QR Request Modal */}
      {showQRModal && qrData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-sm w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 m-auto">
                {qrData?.type === 'key-return'
                  ? `Return Key ${qrData?.keyNumber ? `#${qrData.keyNumber}` : ''}`
                  : `Request Key ${qrData?.keyNumber ? `#${qrData.keyNumber}` : ''}`}
              </h3>
              <button
                onClick={() => { setShowQRModal(false); setQrCollected(false); }}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              ></button>
            </div>
            <div className="text-center">
              {!qrCollected && (
                <div className="flex justify-center mb-4">
                  <QRCode value={JSON.stringify(qrData)} size={200} />
                </div>
              )}

              {qrCollected ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="mb-4"
                >
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 mb-4 shadow-lg">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                      className="text-6xl mb-3"
                    >
                      ✅
                    </motion.div>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-green-700 font-bold text-2xl mb-2"
                    >
                      Successfully Scanned!
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-green-600 text-base"
                    >
                      🔐 Security has {qrData.type === 'key-return' ? 'received' : 'collected'} the key
                    </motion.p>
                  </div>
                </motion.div>
              ) : (
                <>
                  <p className="text-gray-900 mb-2 text-center text-sm whitespace-nowrap">
                    {qrData.type === 'key-request'
                      ? 'Show this QR code to security to request the key'
                      : 'Show this QR code to security to return the key'}
                  </p>
                  <p className={`text-center mb-4 text-sm font-bold ${qrExpired ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                    {qrExpired ? 'QR expired' : `Expires in ${String(Math.floor(qrSecondsLeft / 60)).padStart(2,'0')}:${String(qrSecondsLeft % 60).padStart(2,'0')}`}
                  </p>
                </>
              )}
              {/* <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-500">
                  {qrData.type === 'key-request' ? 'Request ID:' : 'Return ID:'}
                </p>
                <p className="text-xs font-mono text-gray-700 break-all">
                  {qrData.requestId || qrData.returnId}
                </p>
              </div> */}
              {qrCollected ? (
                <button
                  onClick={() => { setShowQRModal(false); setQrCollected(false); }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Done
                </button>
              ) : qrExpired ? (
                <div className="flex gap-3">
                  <button
                    onClick={handleRegenerateRequestQR}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Regenerate
                  </button>
                  <button
                    onClick={() => { setShowQRModal(false); setQrCollected(false); }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setShowQRModal(false); setQrCollected(false); }}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
