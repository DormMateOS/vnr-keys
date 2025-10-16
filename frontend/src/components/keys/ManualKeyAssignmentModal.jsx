import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { User, MapPin, Key, X } from "lucide-react";

const ManualKeyAssignmentModal = ({ isOpen, onClose, onConfirm, keyData }) => {
  const [keyTakerName, setKeyTakerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!keyTakerName.trim()) return;
    if (isSubmitting || submittingRef.current) return; // guard against double submit

    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      await onConfirm(keyTakerName.trim());
      setKeyTakerName("");
      onClose();
    } catch (error) {
      console.error("Error assigning key:", error);
    } finally {
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  };

  const handleClose = () => {
    setKeyTakerName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Volunteer Key Take Away</h3>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Key Details */}
        <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-white mb-2">
            <Key className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold">
              {keyData.keyName} ({keyData.keyNumber})
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <MapPin className="w-4 h-4" />
            <span>{keyData.location}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label 
              htmlFor="keyTakerName" 
              className="block text-sm font-medium text-white mb-2 flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Name of Key Taker
            </label>
            <input
              type="text"
              id="keyTakerName"
              value={keyTakerName}
              onChange={(e) => setKeyTakerName(e.target.value)}
              placeholder="Enter the name of the person taking the key"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg 
                       text-white placeholder-gray-400 
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                       transition-colors"
              autoFocus
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600/50 
                       text-white py-3 px-4 rounded-lg font-medium 
                       transition-colors disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !keyTakerName.trim()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 
                       text-white py-3 px-4 rounded-lg font-medium 
                       transition-colors disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Confirming...
                </>
              ) : (
                "Confirm"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ManualKeyAssignmentModal;