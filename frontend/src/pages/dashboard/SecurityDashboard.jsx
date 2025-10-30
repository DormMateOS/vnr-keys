import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { QrCode, Key, KeyRound, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useKeyStore } from "../../store/keyStore";
import { useAuthStore } from "../../store/authStore";
import BottomNavigation from "../../components/ui/BottomNavigation";
import KeyCard from "../../components/keys/KeyCard";
import QRScanner from "../../components/keys/QRScanner";
import BatchReturnConfirmationModal from "../../components/keys/BatchReturnConfirmationModal";
import { processQRScanRequest, processBatchQRScanReturn, validateQRData, parseQRString } from "../../services/qrService";
import { config } from "../../utils/config";
import { handleSuccess } from "../../utils/errorHandler";

const SecurityDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTabFromPath = () => {
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    const validTabs = ['scanner', 'available', 'unavailable'];
    if (validTabs.includes(lastPart)) {
      return lastPart;
    }
    return 'scanner'; // Default tab
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());
  const [showScanner, setShowScanner] = useState(false);
  const [showScanResult, setShowScanResult] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [showReturnConfirmation, setShowReturnConfirmation] = useState(false);
  const [pendingReturnData, setPendingReturnData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [scannerKey, setScannerKey] = useState(0); // Force re-mount of scanner
  const [showBatchReturnModal, setShowBatchReturnModal] = useState(false);
  const [pendingBatchReturn, setPendingBatchReturn] = useState(null);

  const { user } = useAuthStore();
  const {
    keys,
    getAvailableKeys,
    getUnavailableKeys,
    fetchKeys,
    returnKeyAPI,
    manualAssignKeyAPI,
    initializeSocket,
    disconnectSocket
  } = useKeyStore();

    // Effect to sync active tab with URL changes
  useEffect(() => {
    setActiveTab(getActiveTabFromPath());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    const loadKeys = async () => {
      try {
        console.log('🔄 SecurityDashboard: Fetching keys...');
        await fetchKeys();
        console.log('✅ SecurityDashboard: Keys fetched successfully');
      } catch (error) {
        console.error('❌ SecurityDashboard: Failed to fetch keys:', error);
        // Show error to user
        setScanResult({
          success: false,
          message: 'Failed to load keys. Please refresh the page.',
          type: 'error'
        });
      }
    };

    loadKeys();
    
    // Initialize socket connection for real-time updates
    initializeSocket();

    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const availableKeys = getAvailableKeys();
  const unavailableKeys = getUnavailableKeys();

  // Debug logging
  // console.log('🔍 SecurityDashboard render:', {
  //   totalKeys: keys.length,
  //   availableCount: availableKeys.length,
  //   unavailableCount: unavailableKeys.length,
  // });

  const handleDepartmentClick = (department) => {
    setSelectedDepartment(department);
  };

  const handleBackToListing = () => {
    setSelectedDepartment(null);
  };

      const tabs = [
    {
                  id: "scanner",
      label: "QR Scanner",
      icon: <QrCode className="w-6 h-6" />,
    },
    {
                  id: "available",
      label: "Available",
      icon: <Key className="w-6 h-6" />,
      badge: availableKeys.length,
    },
    {
                  id: "unavailable",
      label: "Unavailable",
      icon: <KeyRound className="w-6 h-6" />,
      badge: unavailableKeys.length,
    },
  ];

  const handleQRScan = async (qrData) => {
    console.log('🔍 SecurityDashboard: QR scan initiated with data:', qrData);
    let parsedData = qrData;
    
    try {
      if (typeof qrData === 'string') {
        console.log('🔄 SecurityDashboard: Parsing QR string...');
        parsedData = parseQRString(qrData);
      }

      console.log('🔍 SecurityDashboard: Validating QR data:', parsedData);
      const validation = validateQRData(parsedData);
      
      if (!validation.isValid) {
        console.log('❌ SecurityDashboard: QR validation failed:', validation.errors);
        throw new Error(validation.errors.join(', '));
      }
      
      console.log('✅ SecurityDashboard: QR validation passed, type:', validation.type);

      // Handle batch return QR codes
      if (validation.type === 'batch-return') {
        try {
          // Fetch details for all keys in the batch
          const keyDetailsPromises = parsedData.keyIds.map(async (keyId) => {
            try {
              const keyUrl = `${config.api.keysUrl}/${keyId}`;
              const keyResponse = await axios.get(keyUrl, { withCredentials: true });
              const keyResult = keyResponse.data;
              const keyData = keyResult?.data?.key || keyResult?.data || keyResult;
              return {
                id: keyId,
                keyNumber: keyData?.keyNumber || keyData?.number || 'Unknown',
                name: keyData?.keyName || keyData?.name || 'Unknown Key'
              };
            } catch (error) {
              console.warn(`Failed to fetch details for key ${keyId}:`, error);
              return {
                id: keyId,
                keyNumber: 'Unknown',
                name: `Key #${keyId.substring(0, 8)}...`
              };
            }
          });

          const keys = await Promise.all(keyDetailsPromises);
          setPendingBatchReturn({
            ...parsedData,
            keys
          });
          setShowBatchReturnModal(true);
          setShowScanner(false);
          return;
        } catch (error) {
          console.error("Error processing batch return:", error);
          throw error;
        }
      }

      // Handle different QR code types
      if (validation.type === 'key-return') {
        // For returns, fetch key and user details first, then show confirmation dialog
        try {
          console.log('🔍 Fetching details for keyId:', parsedData.keyId, 'userId:', parsedData.userId);

          // Create proper API URLs using configured backend base URL
          const keyUrl = `${config.api.keysUrl}/${parsedData.keyId}`;
          const userUrl = `${config.api.authUrl}/user/${parsedData.userId}`;

          console.log('🔍 Key URL:', keyUrl);
          console.log('🔍 User URL:', userUrl);

          const [keyResponse, userResponse] = await Promise.all([
            axios.get(keyUrl, { withCredentials: true }),
            axios.get(userUrl, { withCredentials: true })
          ]);

          let keyData = null;
          let userData = null;

          console.log('🔍 Key response status:', keyResponse.status);
          console.log('🔍 User response status:', userResponse.status);

          // Axios wraps data under .data
          const keyResult = keyResponse.data;
          const userResult = userResponse.data;
          console.log('🔍 Key result:', keyResult);
          console.log('🔍 User result:', userResult);

          // Handle nested data structure: keyResult.data.key
          keyData = keyResult?.data?.key || keyResult?.data || keyResult;
          userData = userResult?.user || userResult?.data || userResult;
          console.log('🔍 Extracted keyData:', keyData);
          console.log('🔍 Extracted userData:', userData);

          // Extract data with multiple fallback strategies
          const extractedKeyNumber = keyData?.keyNumber || keyData?.number || 'Unknown';
          const extractedKeyName = keyData?.keyName || keyData?.name || 'Unknown Key';
          const extractedUserName = userData?.name || userData?.username || userData?.displayName || 'Unknown User';
          const extractedUserEmail = userData?.email || userData?.emailAddress || 'Unknown Email';

          // Create display data with fallbacks
          const displayData = {
            ...parsedData,
            keyNumber: extractedKeyNumber,
            keyName: extractedKeyName,
            keyFullName: (extractedKeyNumber !== 'Unknown' && extractedKeyName !== 'Unknown Key')
              ? `key ${extractedKeyNumber} , ${extractedKeyName}`
              : `Key #${parsedData.keyId.substring(0, 8)}...`,
            userName: extractedUserName,
            userEmail: extractedUserEmail
          };

          console.log('🔍 Final display data:', displayData);

          setPendingReturnData(displayData);
          setShowReturnConfirmation(true);
          setShowScanner(false);
        } catch (error) {
          console.error("Error fetching key/user details:", error);

          // Show confirmation with basic data and shortened ID
          const shortKeyId = parsedData.keyId.substring(0, 8);
          const shortUserId = parsedData.userId.substring(0, 8);

          setPendingReturnData({
            ...parsedData,
            keyNumber: 'Unknown',
            keyName: 'Unknown Key',
            keyFullName: `Key #${shortKeyId}...`,
            userName: `User #${shortUserId}...`,
            userEmail: 'Unknown Email'
          });
          setShowReturnConfirmation(true);
          setShowScanner(false);
        }
      } else if (validation.type === 'key-request') {
        // For requests, process immediately as before
        const result = await processQRScanRequest(parsedData);
        setScanResult({
          success: true,
          message: result.message,
          keyData: {
            ...result.data.key,
            keyNumber: result.data.key.keyNumber,
            keyName: result.data.key.keyName,
            takenBy: result.data.originalUser || result.data.requestedBy, // The person who requested the key
            givenBy: result.data.scannedBy    // The security person who gave it
          },
          type: 'request'
        });
        setShowScanResult(true);
        setShowScanner(false);
      } else {
        throw new Error('Unsupported QR code type');
      }
    } catch (error) {
      console.error("QR scan error:", error);

      // Try to enrich error modal with key details if QR is expired but contains a keyId
      let enrichedKeyData = null;
      try {
        const isExpired = (error?.message || '').toLowerCase().includes('expired');
        if (isExpired && parsedData && parsedData.keyId) {
          const keyUrl = `${config.api.keysUrl}/${parsedData.keyId}`;
          const keyResponse = await axios.get(keyUrl, { withCredentials: true });
          const keyResult = keyResponse.data;
          const keyData = keyResult?.data?.key || keyResult?.data || keyResult;
          if (keyData) {
            enrichedKeyData = {
              keyNumber: keyData.keyNumber || keyData.number,
              keyName: keyData.keyName || keyData.name
            };
          }
        }
      } catch (e) {
        // If enrichment fails, continue with generic error info
        console.warn('Failed to enrich expired QR error with key details:', e);
      }

      setScanResult({
        success: false,
        message: error.message || 'Failed to process QR code',
        type: 'error',
        keyData: enrichedKeyData || undefined
      });
      setShowScanResult(true);
      setShowScanner(false);
    }
  };

  // Removed unused handleCollectReturn function


  const handleCloseScanResult = () => {
    const wasRejected = scanResult?.type === 'rejected';
    const wasReturnSuccess = scanResult?.type === 'return';
    setShowScanResult(false);
    if (wasRejected || wasReturnSuccess) {
      // Re-open the scanner so security can continue scanning
      setShowScanner(true);
    }
  };

  const handleCollectKey = async (keyId) => {
    try {
      // Skip API notification since we'll show our own
      const updatedKey = await returnKeyAPI(keyId, true);
      
      // Show success toast notification
      handleSuccess(`Key ${updatedKey.keyNumber} (${updatedKey.keyName}) collected successfully`);
    } catch (error) {
      console.error("Collect key error:", error);
    }
  };

  const handleManualAssign = async (keyId, keyTakerName) => {
    try {
      const result = await manualAssignKeyAPI(keyId, keyTakerName);
      
      return result;
    } catch (error) {
      console.error("Manual assign key error:", error);
      throw error;
    }
  };

  const handleConfirmReturn = async () => {
    if (!pendingReturnData) return;
    
    try {
      // Perform the actual key return with the returner's ID
      const updatedKey = await returnKeyAPI(pendingReturnData.keyId, true, pendingReturnData.userId);
      
      // Show success toast notification
      handleSuccess(`Key ${pendingReturnData.keyNumber} (${pendingReturnData.keyName}) returned successfully`);
      
      // Close the confirmation modal
      setShowReturnConfirmation(false);
      setPendingReturnData(null);
      
      // Re-open scanner for next scan
      setShowScanner(false);
    } catch (error) {
      console.error("Return key error:", error);
      // Close modal even on error
      setShowReturnConfirmation(false);
      setPendingReturnData(null);
    }
  };

  const handleConfirmBatchReturn = async () => {
    if (!pendingBatchReturn) return;
    
    try {
      // Use the original faculty user's ID from the QR data as the returnerId
      const qrDataWithReturnerId = {
        ...pendingBatchReturn,
        returnerId: pendingBatchReturn.userId // Use the faculty user's ID who generated the QR
      };
      
      // Process the batch return with the faculty's ID as returner
      const result = await processBatchQRScanReturn(qrDataWithReturnerId);
      
      // Show success notification
      handleSuccess(result.message || 'Keys returned successfully');
      
      // Close the modal
      setShowBatchReturnModal(false);
      setPendingBatchReturn(null);
      
      // Show success result
      setScanResult({
        success: true,
        message: result.message,
        type: 'batch-return'
      });
      setShowScanResult(true);
    } catch (error) {
      console.error("Batch return error:", error);
      // Show error
      setScanResult({
        success: false,
        message: error.message || 'Failed to process batch return',
        type: 'error'
      });
      setShowScanResult(true);
      // Close batch return modal
      setShowBatchReturnModal(false);
      setPendingBatchReturn(null);
    }
  };

      const outletContext = {
    // Page props
    setShowScanner,
    searchQuery,
    setSearchQuery,
    selectedDepartment,
    keys,
    handleCollectKey,
    handleManualAssign,
    handleDepartmentClick,
    handleBackToListing,
    unavailableKeys,
    getAvailableKeys,
    // Modals and handlers
    showScanner,
    scannerKey,
    handleQRScan,
    setShowScanResult,
    setScannerKey,
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Security Dashboard</h1>
            <p className="text-gray-300">Welcome, {user?.name}</p>
          </div>
          {/* <div className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-2">
            <span className="text-green-400 font-medium">Online</span>
          </div> */}
        </div>
      </div>

                  {/* Render nested route content */}
      <Outlet context={outletContext} />

      {/* Bottom Navigation */}
                  <BottomNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => navigate(`/dashboard/security/${tabId}`)}
      />

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          key={scannerKey}
          isOpen={showScanner}
          onScan={handleQRScan}
          onClose={() => {
            setShowScanner(false);
            setScannerKey(prev => prev + 1); // Force re-mount next time
          }}
        />
      )}

      {/* Scan Result Modal */}
      {showScanResult && scanResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-sm w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{scanResult.success ? 'Success' : 'Error'}</h3>
              <button
                onClick={() => setShowScanResult(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                {/* Close icon could go here */}
              </button>
            </div>

            <div className="text-center">
              {scanResult.success ? (
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              )}
              <p className="text-gray-700 mb-2">{scanResult.message}</p>
            </div>

            <div className="mt-4">
              <button
                onClick={handleCloseScanResult}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Return Confirmation Modal */}
      {showReturnConfirmation && pendingReturnData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-sm w-full"
          >
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Confirm Key Return
              </h3>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">
                Key {pendingReturnData.keyNumber}
              </h4>
              <p className="text-gray-600 mb-2">
                ({pendingReturnData.keyName})
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="font-medium text-gray-900 mb-1">Returned By:</p>
                <p className="text-gray-600">{pendingReturnData.userName}</p>
                <p className="text-gray-500 text-sm">{pendingReturnData.userEmail}</p>
                <p className="text-gray-400 text-xs mt-1">
                  {new Date().toLocaleString()}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowReturnConfirmation(false);
                    setPendingReturnData(null);
                    setShowScanner(true);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReturn}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Confirm Return
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Batch Return Confirmation Modal */}
      {showBatchReturnModal && pendingBatchReturn && (
        <BatchReturnConfirmationModal
          isOpen={showBatchReturnModal}
          onClose={() => {
            setShowBatchReturnModal(false);
            setPendingBatchReturn(null);
            setShowScanner(true);
          }}
          onConfirm={handleConfirmBatchReturn}
          keys={pendingBatchReturn.keys}
        />
      )}
    </div>
  );
};

export default SecurityDashboard;