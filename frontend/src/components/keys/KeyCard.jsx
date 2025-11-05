import { motion } from "framer-motion";
import {
  Clock,
  MapPin,
  User,
  QrCode,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import QRCode from "react-qr-code";
import { useState, useEffect } from "react";
import socketService from "../../services/socketService.js";
import { config } from "../../utils/config.js";
import { useAuthStore } from "../../store/authStore";
import ManualKeyAssignmentModal from "./ManualKeyAssignmentModal";

const KeyCard = ({
  keyData,
  variant = "default", // "default", "available", "unavailable", "taken"
  onRequestKey,
  onCollectKey,
  onReturnKey,
  onManualAssign,
  showQR = false,
  qrData = null,
  usageCount,
}) => {
  const { user } = useAuthStore();
  const [showQRModal, setShowQRModal] = useState(false);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [showManualAssignModal, setShowManualAssignModal] = useState(false);
  const [localQRData, setLocalQRData] = useState(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [qrSecondsLeft, setQrSecondsLeft] = useState(20);
  const [qrExpired, setQrExpired] = useState(false);
  const [qrCollected, setQrCollected] = useState(false);

  const getStatusColor = () => {
    switch (keyData.status) {
      case "available":
        return "bg-indigo-500/20 text-indigo-300 border-indigo-400/40";
      case "unavailable":
        return "bg-red-500/20 text-red-300 border-red-400/40";
      default:
        return "bg-gray-700/40 text-gray-300 border-gray-600/40";
    }
  };

  const getStatusIcon = () => {
    switch (keyData.status) {
      case "available":
        return <CheckCircle className="w-4 h-4" />;
      case "unavailable":
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        return `${diffInMinutes} minutes ago`;
      } else if (diffInHours < 24) {
        return `${diffInHours} hours ago`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} days ago`;
      }
    } catch (error) {
      return "";
    }
  };

  const handleRequestKey = () => {
    if (onRequestKey) onRequestKey(keyData.id);
  };

  const handleReturnKeyClick = async () => {
    if (onReturnKey) {
      setIsGeneratingQR(true);
      try {
        const qrData = await onReturnKey(keyData.id);
        setLocalQRData(qrData);
        setShowQRModal(true);
        setQrExpired(false);
      } catch (error) {
        console.error("Error generating return QR:", error);
      } finally {
        setIsGeneratingQR(false);
      }
    }
  };

  // Countdown for return QR inside this card's modal
  useEffect(() => {
    const MAX_SECONDS = config.qr.validitySeconds;
    if (!showQRModal || !(localQRData || qrData)?.timestamp) return;

    const source = localQRData || qrData;
    const update = () => {
      const createdAt = new Date(source.timestamp).getTime();
      const elapsed = Math.max(0, Math.floor((Date.now() - createdAt) / 1000));
      const left = Math.max(0, MAX_SECONDS - elapsed);
      setQrSecondsLeft(left);
      setQrExpired(left <= 0);
    };

    update();
    const id = setInterval(update, 500);
    return () => clearInterval(id);
  }, [showQRModal, localQRData, qrData]);

  // Listen for socket event indicating the QR was scanned/collected by security
  useEffect(() => {
    if (!showQRModal) return;

    // Ensure socket is connected
    try { socketService.connect(); } catch (_) {
      // Ignore connection errors; socket may already be connected
    }

    const handler = (data) => {
      try {
        if (data?.action !== 'qr-return') return;
        const currentQR = localQRData || qrData;
        if (!currentQR) return;
        const eventKeyId = data.key?._id || data.key?.id;
        if (eventKeyId && eventKeyId === currentQR.keyId) {
          setQrCollected(true);
          setQrExpired(false);
        }
      } catch {
        // Ignore errors
      }
    };

    // Primary: user-specific event
    socketService.on('userKeyUpdated', handler);
    // Fallback: global key update event
    socketService.on('keyUpdated', handler);
    return () => {
      socketService.off('userKeyUpdated', handler);
      socketService.off('keyUpdated', handler);
    };
  }, [showQRModal, localQRData, qrData]);

  const handleCollectKey = () => {
    if (onCollectKey) onCollectKey(keyData.id);
  };

  const handleCollectClick = () => {
    setShowCollectModal(true);
  };

  const handleManualAssignClick = () => {
    setShowManualAssignModal(true);
  };

  const handleManualAssign = async (keyTakerName) => {
    if (onManualAssign) {
      await onManualAssign(keyData.id, keyTakerName);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 border border-gray-700 rounded-2xl p-5
          transition-all duration-500
          hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:border-indigo-500"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white">
                {keyData.keyName}
              </h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor()}`}
              >
                {getStatusIcon()}
                <span className="capitalize">{keyData.status}</span>
              </span>
            </div>
            {usageCount && (
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-blue-400 font-medium">
                  Used {usageCount} time{usageCount !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 mb-3 text-gray-400">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{keyData.location}</span>
        </div>

        {/* Status Info */}
        {keyData.status === "unavailable" && keyData.takenBy && (
          <div className="flex items-center gap-2 mb-3 text-gray-400">
            <User className="w-4 h-4" />
            <span className="text-sm">
              Taken by {keyData.takenBy.name}
              {keyData.takenAt && (
                <span className="text-gray-500 ml-1">
                  • {formatTime(keyData.takenAt)}
                </span>
              )}
            </span>
          </div>
        )}
        {keyData.status === "available" && keyData.returnedBy && keyData.returnedAt && (
          <div className="flex items-center gap-2 mb-3 text-gray-400">
            <User className="w-4 h-4" />
            <span className="text-sm">
              Returned by {keyData.returnedBy.name}
              <span className="text-gray-500 ml-1">
                • {formatTime(keyData.returnedAt)}
              </span>
            </span>
          </div>
        )}

        {/* QR Code Display */}
        {showQR && qrData && (
          <div className="mb-4 p-3 bg-gray-900 rounded-lg border border-blue-500/40">
            <div className="flex justify-center">
              <QRCode
                value={JSON.stringify(qrData)}
                size={120}
                bgColor="#0f172a"
                fgColor="#ffffff"   // 🔵 changed to white QR
              />
            </div>
            <p className="text-center text-sm text-blue-200 mb-2">
  Show this QR code to security to return the key
</p>

          </div>
        )}

        {/* Action Buttons */}
        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          {/* Faculty: Generate QR when available */}
          {user?.role === "faculty" &&
            variant === "default" &&
            keyData.status === "available" && (
              <button
                onClick={handleRequestKey}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                Generate QR
              </button>
            )}

          {/* Faculty: Return QR when taken */}
          {user?.role === "faculty" && variant === "taken" && (
            <button
              onClick={handleReturnKeyClick}
              disabled={isGeneratingQR}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isGeneratingQR ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4" />
                  Show Return QR
                </>
              )}
            </button>
          )}

          {/* Security/Admin: Manual assign when available */}
          {(user?.role === "security" || user?.role === "admin") && 
            variant === "default" && 
            keyData.status === "available" && (
            <button
              onClick={handleManualAssignClick}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              Assign Key
            </button>
          )}

          {/* Security: Collect when unavailable */}
          {user?.role === "security" && variant === "unavailable" && (
            <button
              onClick={handleCollectClick}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Collect
            </button>
          )}

          {/* Common: Not Available for both when unavailable */}
          {variant === "default" && keyData.status === "unavailable" && (
            <div className="flex-1 bg-red-600/20 text-red-300 py-2 px-4 rounded-lg font-medium text-center border border-red-600/30">
              Not Available
            </div>
          )}
        </div>

      </motion.div>

      {/* QR Modal */}
      {showQRModal && (localQRData || qrData) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-sm w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 m-auto">
                Return Key {keyData.keyNumber ? `#${keyData.keyNumber}` : keyData.keyName}
              </h3>
              <button
                onClick={() => { setShowQRModal(false); setQrCollected(false); }}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              ></button>
            </div>

            <div className="text-center">
              {/* QR */}
              {!qrCollected && (
                <div className="flex justify-center mb-4">
                  <QRCode
                    value={JSON.stringify(localQRData || qrData)}
                    size={200}
                  />
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
                      🔐 Security has received the key
                    </motion.p>
                  </div>
                </motion.div>
              ) : (
                <>
                  {/* Instructions */}
                  <p className="text-gray-900 mb-2 text-center text-sm whitespace-nowrap">
                    Show this QR code to security to return the key
                  </p>

                  {/* Expiry Timer */}
                  <p
                    className={`text-center mb-4 text-sm font-bold ${
                      qrExpired ? "text-red-600" : "text-gray-900"
                    }`}
                  >
                    {qrExpired
                      ? "QR expired"
                      : `Expires in ${String(Math.floor(qrSecondsLeft / 60)).padStart(
                          2,
                          "0"
                        )}:${String(qrSecondsLeft % 60).padStart(2, "0")}`}
                  </p>
                </>
              )}
            </div>

            {/* Buttons */}
            {qrCollected ? (
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setLocalQRData(null);
                  setQrCollected(false);
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Done
              </button>
            ) : qrExpired ? (
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    if (!onReturnKey) return;
                    setIsGeneratingQR(true);
                    try {
                      const newQR = await onReturnKey(keyData.id);
                      setLocalQRData(newQR);
                      setQrExpired(false);
                      setQrCollected(false);
                    } finally {
                      setIsGeneratingQR(false);
                    }
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Regenerate
                </button>
                <button
                  onClick={() => {
                    setShowQRModal(false);
                    setLocalQRData(null);
                    setQrCollected(false);
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setLocalQRData(null);
                  setQrCollected(false);
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            )}
          </motion.div>
        </div>
      )}

      {/* Collect Confirmation Modal */}
      {showCollectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-sm w-full"
          >
            <div className="flex flex-col items-center justify-center mb-4">
              <h3 className="text-xl font-bold text-white mb-2">
                Collect Key {keyData.keyNumber}
              </h3>
              <p className="text-gray-300 text-center mb-4">
                Are you sure you want to collect this key?
              </p>

              {/* Key Details */}
              <div className="w-full space-y-2 mb-6 bg-gray-900/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="w-4 h-4" />
                  <span>{keyData.location}</span>
                </div>
                {keyData.takenBy && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <User className="w-4 h-4" />
                    <span>Taken by: {keyData.takenBy.name}</span>
                  </div>
                )}
                {keyData.takenAt && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span>Taken at: {new Date(keyData.takenAt).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowCollectModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleCollectKey();
                    setShowCollectModal(false);
                  }}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Manual Key Assignment Modal */}
      <ManualKeyAssignmentModal
        isOpen={showManualAssignModal}
        onClose={() => setShowManualAssignModal(false)}
        onConfirm={handleManualAssign}
        keyData={keyData}
      />
    </>
  );
};

export default KeyCard;
