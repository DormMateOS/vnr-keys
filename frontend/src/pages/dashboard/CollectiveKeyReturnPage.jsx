import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  KeyRound, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  User, 
  Clock, 
  MapPin,
  RefreshCw,
  QrCode
} from "lucide-react";
import VolunteerReturnQRModal from "../../components/keys/VolunteerReturnQRModal";
import { useAuthStore } from "../../store/authStore";
import { useKeyStore } from "../../store/keyStore";
import { useSidebar } from "../../components/layout/DashboardLayout";


const CollectiveKeyReturnPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [takenKeys, setTakenKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  const { sidebarOpen } = useSidebar();
  const { collectiveReturnKeyAPI, getAllTakenKeysAPI } = useKeyStore();
  const { user } = useAuthStore();

  const fetchAllTakenKeys = useCallback(async () => {
    if (!getAllTakenKeysAPI) {
      console.error('❌ getAllTakenKeysAPI is not available');
      setError('API function not available');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      console.log('🔄 Fetching all taken keys...');
      const takenKeysData = await getAllTakenKeysAPI();
      console.log('✅ Fetched taken keys:', takenKeysData?.length || 0, 'keys');
      setTakenKeys(takenKeysData || []);
    } catch (error) {
      console.error('❌ Error fetching taken keys:', error);
      setError(error.message || 'Failed to fetch taken keys');
      setTakenKeys([]); // Set empty array on error to prevent undefined issues
    } finally {
      setIsLoading(false);
    }
  }, [getAllTakenKeysAPI]);
  // Fetch all taken keys on component mount
  useEffect(() => {
    fetchAllTakenKeys();
  }, [fetchAllTakenKeys]);

  // Filter keys based on search query
  const filteredKeys = takenKeys.filter(key => 
    key.keyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    key.keyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    key.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    key.takenBy?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleKeySelect = (keyId) => {
    setSelectedKeys(prev =>
      prev.includes(keyId)
        ? prev.filter(id => id !== keyId)
        : [...prev, keyId]
    );
  };

  const handleSelectAll = () => {
    if (selectedKeys.length === filteredKeys.length && filteredKeys.length > 0) {
      setSelectedKeys([]);
    } else {
      setSelectedKeys(filteredKeys.map(key => key.id));
    }
  };

  const handleReturnKeys = () => {
    if (selectedKeys.length === 0) return;
    setShowQRModal(true);
  };

  const handleQRExpired = () => {
    // You may want to show a notification or message here
    console.log('QR code expired');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeSinceTaken = (takenAt) => {
    const now = new Date();
    const taken = new Date(takenAt);
    const diffInHours = Math.floor((now - taken) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Less than 1 hour ago";
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  if (isLoading) {
    return (
      <div className={`p-6 transition-all duration-300 ${sidebarOpen ? 'ml-0' : 'ml-0'}`}>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
          <span className="ml-2 text-gray-300">Loading taken keys...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 transition-all duration-300 ${sidebarOpen ? 'ml-0' : 'ml-0'}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg mb-4">Error loading taken keys</p>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={fetchAllTakenKeys}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 transition-all duration-300 ${sidebarOpen ? 'ml-0' : 'ml-0'}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Volunteer Key Return
            </h1>
            <p className="text-gray-400">
              Return keys on behalf of other Faculty/Staff members
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchAllTakenKeys}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Search and Actions */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by key number, name, location, or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {selectedKeys.length === filteredKeys.length && filteredKeys.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
            
            {selectedKeys.length > 0 && (
              <button
                onClick={handleReturnKeys}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                <KeyRound className="w-4 h-4" />
                <span>Return {selectedKeys.length} Key{selectedKeys.length > 1 ? 's' : ''}</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
      </motion.div>

      {/* Keys List */}
      <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
          >
        <div className="p-4 sm:p-6 border-b border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Currently Taken Keys</h2>
            </div>
            {selectedKeys.length > 0 && (
              <div className="mt-3 sm:mt-0">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-900/30 text-orange-300 border border-orange-700">
                  {selectedKeys.length} selected
                </span>
              </div>
            )}
          </div>
        </div>

        {filteredKeys.length === 0 ? (
          <div className="p-8 text-center">
            <KeyRound className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              {searchQuery ? 'No keys match your search criteria' : 'No keys are currently taken'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {filteredKeys.map((key, index) => (
              <motion.div
                key={key.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`p-4 sm:p-6 hover:bg-gray-750 transition-colors cursor-pointer ${
                  selectedKeys.includes(key.id) ? 'bg-orange-900/20 border-l-4 border-orange-400' : ''
                }`}
                onClick={() => handleKeySelect(key.id)}
              >
                {/* Mobile Layout */}
                <div className="block sm:hidden">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer flex-shrink-0 mt-1 ${
                      selectedKeys.includes(key.id)
                        ? 'bg-orange-400 border-orange-400'
                        : 'border-gray-500 hover:border-gray-400'
                    }`}>
                      {selectedKeys.includes(key.id) && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col space-y-1">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {key.keyNumber}
                        </h3>
                        <p className="text-gray-300 text-sm truncate">{key.keyName}</p>
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{key.location}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <User className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{key.takenBy?.name || 'Unknown User'}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          <span>{getTimeSinceTaken(key.takenAt)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-2 border-t border-gray-700">
                        <p className="text-xs text-gray-400">Taken on</p>
                        <p className="text-xs text-white">{formatDate(key.takenAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop/Tablet Layout */}
                <div className="hidden sm:flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer flex-shrink-0 ${
                      selectedKeys.includes(key.id)
                        ? 'bg-orange-400 border-orange-400'
                        : 'border-gray-500 hover:border-gray-400'
                    }`}>
                      {selectedKeys.includes(key.id) && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {key.keyNumber}
                        </h3>
                        <span className="text-gray-400 flex-shrink-0">•</span>
                        <span className="text-gray-300 truncate">{key.keyName}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{key.location}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{key.takenBy?.name || 'Unknown User'}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span className="whitespace-nowrap">{getTimeSinceTaken(key.takenAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-sm text-gray-400">Taken on</p>
                    <p className="text-sm text-white whitespace-nowrap">{formatDate(key.takenAt)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* QR Code Modal */}
      <VolunteerReturnQRModal
        isOpen={showQRModal}
        onClose={() => {
          setShowQRModal(false);
          setSelectedKeys([]);
        }}
        selectedKeys={selectedKeys}
        user={user}
        onQRExpired={handleQRExpired}
      />
    </div>
  );
};

export default CollectiveKeyReturnPage;