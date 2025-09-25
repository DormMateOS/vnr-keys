import { motion } from "framer-motion";
import { X } from "lucide-react";

const BatchReturnConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  keys = [] 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-bold text-gray-900">
            Confirm Key Return
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Keys List */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-gray-600 mb-4">
            Please confirm the return of the following keys:
          </p>
          <div className="space-y-2">
            {keys.map((key) => (
              <div
                key={key.id}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="font-medium text-gray-900">
                  Key #{key.keyNumber}
                </div>
                {key.name && (
                  <div className="text-sm text-gray-600">
                    {key.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Confirm Return
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default BatchReturnConfirmationModal;