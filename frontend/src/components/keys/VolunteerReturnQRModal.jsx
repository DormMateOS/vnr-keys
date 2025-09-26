import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import QRCode from "react-qr-code";
import { generateBatchReturnQRData } from "../../services/qrService.js";

const VolunteerReturnQRModal = ({
  isOpen,
  onClose,
  selectedKeys,
  user,
  onQRExpired,
}) => {
  const [qrData, setQrData] = useState(null);
  const [timer, setTimer] = useState(60); // 5 minutes in seconds
  const [qrExpired, setQrExpired] = useState(false);

  // Generate QR data when modal opens
  useEffect(() => {
    if (isOpen && selectedKeys.length > 0) {
      const newQRData = generateBatchReturnQRData(selectedKeys, user.id);
      setQrData(newQRData);
      setTimer(60); // Reset timer
      setQrExpired(false);
    }
  }, [isOpen, selectedKeys, user.id]);

  // Timer countdown
  useEffect(() => {
    let interval;
    if (isOpen && timer > 0 && !qrExpired) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setQrExpired(true);
            onQRExpired?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer, qrExpired, onQRExpired]);

  if (!isOpen) return null;

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 max-w-sm w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 m-auto">
            Return {selectedKeys.length} Key{selectedKeys.length > 1 ? "s" : ""}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="text-center">
          {/* QR Code Display */}
          {qrData && !qrExpired && (
            <div className="flex justify-center mb-4">
              <QRCode
                value={JSON.stringify(qrData)}
                size={200}
              />
            </div>
          )}

          {/* Instructions */}
          <p className="text-gray-600 text-center mb-2">
            Show this QR code to security to return the keys
          </p>

          {/* Timer Display */}
          <p className={`text-center mb-4 text-sm font-bold ${qrExpired ? 'text-red-600' : 'text-gray-900'}`}>
            {qrExpired 
              ? 'QR expired' 
              : `Expires in ${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`}
          </p>
        </div>

        {/* Action Buttons */}
        {qrExpired ? (
          <div className="flex gap-3">
            <button
              onClick={() => {
                setTimer(60);
                setQrExpired(false);
                const newQRData = generateBatchReturnQRData(selectedKeys, user.id);
                setQrData(newQRData);
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Regenerate
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        )}
      </motion.div>
    </div>
  );
};

export default VolunteerReturnQRModal;