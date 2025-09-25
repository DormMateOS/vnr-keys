import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MoreVertical,
  Shield,
  X
} from 'lucide-react';
import { useKeyStore } from '../../store/keyStore';
import { handleSuccess } from '../../utils/errorHandler';

const ManageApiKeysPage = () => {
  const {
    keys,
    isLoading,
    fetchKeys,
    createKey,
    updateKey,
    deleteKey
  } = useKeyStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingKey, setEditingKey] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keysToShow, setKeysToShow] = useState(10); // Default for larger screens
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  // Handle screen size changes
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      setKeysToShow(mobile ? 4 : 10); // Reset keys to show when screen size changes
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Filter keys based on search and filters
  const filteredKeys = keys.filter(key => {
    const matchesSearch = 
      key.keyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.keyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment = departmentFilter === 'all' || key.department === departmentFilter;
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'available' && key.status === 'available') ||
      (statusFilter === 'unavailable' && key.status === 'unavailable');

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Get unique departments for filter
  const departments = [...new Set(keys.map(key => key.department).filter(Boolean))];

  // Get keys to display with pagination
  const displayedKeys = filteredKeys.slice(0, keysToShow);
  const hasMoreKeys = filteredKeys.length > keysToShow;

  // Handle load more
  const handleLoadMore = () => {
    const increment = isMobile ? 4 : 10;
    setKeysToShow(prev => prev + increment);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setKeysToShow(isMobile ? 4 : 10);
  }, [searchQuery, departmentFilter, statusFilter, isMobile]);


  const handleDeleteKey = async () => {
    if (!keyToDelete) return;

    try {
      setIsSubmitting(true);
      await deleteKey(keyToDelete.id);
      setShowDeleteModal(false);
      setKeyToDelete(null);
    } catch (error) {
      console.error('Error deleting key:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (key) => {
    setEditingKey(key);
  };

  const openDeleteModal = (key) => {
    setKeyToDelete(key);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setEditingKey(null);
    setShowDeleteModal(false);
    setShowAddModal(false);
    setKeyToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-400" />
            Manage Keys
          </h1>
          <p className="text-gray-400">
            Add, edit, and manage all keys in the system
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search keys..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Department Filter */}
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                {departments.map(department => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="available">Available Keys</option>
                <option value="unavailable">Unavailable Keys</option>
              </select>
            </div>

            {/* Add Key Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add New Key
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{keys.length}</div>
              <div className="text-sm text-gray-400">Total Keys</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {keys.filter(k => k.status === 'unavailable').length}
              </div>
              <div className="text-sm text-gray-400">Actively In Use</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {keys.filter(k => k.status === 'available').length}
              </div>
              <div className="text-sm text-gray-400">Inactive Keys</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {departments.length}
              </div>
              <div className="text-sm text-gray-400">Departments</div>
            </div>
          </div>
        </motion.div>

        {/* API Keys Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : displayedKeys.length === 0 && filteredKeys.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No keys found</p>
              <p className="text-gray-500 text-sm mt-1">
                {searchQuery || departmentFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Add your first key to get started'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Key Info</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Location</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Taken By</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {displayedKeys.map((key) => (
                    <KeyTableRow
                      key={key.id}
                      keyData={key}
                      onEdit={openEditModal}
                      onDelete={openDeleteModal}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Load More Button */}
          {hasMoreKeys && !isLoading && (
            <div className="px-6 py-4 bg-gray-800 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Showing {displayedKeys.length} of {filteredKeys.length} keys
                </div>
                <button
                  onClick={handleLoadMore}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Load More ({isMobile ? '4' : '10'} more)
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Add New Key Modal */}
      {showAddModal && (
        <AddKeyModal
          isOpen={showAddModal}
          onClose={closeModals}
          onSubmit={createKey}
          isLoading={isSubmitting}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && keyToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={closeModals}
          onConfirm={handleDeleteKey}
          keyData={keyToDelete}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
};

// Key Table Row Component
const KeyTableRow = ({ keyData, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);

  const getStatusBadge = (status) => {
    if (status === 'available') {
      return { label: 'Available', color: 'bg-green-600' };
    } else {
      return { label: 'In Use', color: 'bg-red-600' };
    }
  };

  return (
    <tr className="hover:bg-gray-700/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">{keyData.keyNumber}</span>
              {keyData.frequentlyUsed && (
                <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 text-xs rounded-full">
                  Frequent
                </span>
              )}
            </div>
            <div className="text-sm text-gray-400">{keyData.keyName}</div>
            <div className="text-xs text-gray-500 mt-1">
              {keyData.department} • {keyData.category} • Block {keyData.block}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-gray-300">{keyData.location}</div>
        <div className="text-sm text-gray-400">{keyData.description}</div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusBadge(keyData.status).color}`}>
            {getStatusBadge(keyData.status).label}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        {keyData.takenBy ? (
          <div>
            <div className="text-gray-300">{keyData.takenBy.name}</div>
            <div className="text-sm text-gray-400">{keyData.takenBy.email}</div>
            <div className="text-xs text-gray-500">
              {keyData.takenAt ? new Date(keyData.takenAt).toLocaleDateString() : ''}
            </div>
          </div>
        ) : (
          <span className="text-gray-500">-</span>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {showActions && (
            <div className="absolute right-0 top-full mt-1 bg-gray-700 rounded-lg shadow-lg border border-gray-600 z-10 min-w-[120px]">
              <button
                onClick={() => {
                  onEdit(keyData);
                  setShowActions(false);
                }}
                className="w-full px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-gray-600 flex items-center gap-2 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete(keyData);
                  setShowActions(false);
                }}
                className="w-full px-4 py-2 text-left text-red-400 hover:text-red-300 hover:bg-gray-600 flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, keyData, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-gray-700"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-400" />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">Delete Key</h3>
          <p className="text-gray-400 mb-6">
            Are you sure you want to delete key <strong>{keyData.keyNumber} ({keyData.keyName})</strong>? 
            This action cannot be undone.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Add Key Modal Component
const AddKeyModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    keyNumber: '',
    keyName: '',
    location: '',
    description: '',
    category: 'other',
    department: 'COMMON',
    block: 'A',
    frequentlyUsed: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      onClose();
      setFormData({
        keyNumber: '',
        keyName: '',
        location: '',
        description: '',
        category: 'other',
        department: 'COMMON',
        block: 'A',
        frequentlyUsed: false
      });
    } catch (error) {
      console.error('Error creating key:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Add New Key</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Key Number *
              </label>
              <input
                type="text"
                name="keyNumber"
                value={formData.keyNumber}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., K001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Key Name *
              </label>
              <input
                type="text"
                name="keyName"
                value={formData.keyName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Main Lab"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Block A, Room 101"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="classroom">Classroom</option>
                <option value="lab">Lab</option>
                <option value="office">Office</option>
                <option value="storage">Storage</option>
                <option value="library">Library</option>
                <option value="auditorium">Auditorium</option>
                <option value="cafeteria">Cafeteria</option>
                <option value="hostel">Hostel</option>
                <option value="maintenance">Maintenance</option>
                <option value="security">Security</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CSE">CSE</option>
                <option value="EEE">EEE</option>
                <option value="AIML">AIML</option>
                <option value="IoT">IoT</option>
                <option value="CSE_AIDS">CSE</option>
                <option value="CSE_CYS">CSE</option>
                <option value="CSE_DS">CSE</option>
                <option value="ECE">ECE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
                <option value="IT">IT</option>
                <option value="ADMIN">ADMIN</option>
                <option value="RESEARCH">RESEARCH</option>
                <option value="COMMON">COMMON</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Block
              </label>
              <select
                name="block"
                value={formData.block}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
                <option value="F">F</option>
                <option value="G">G</option>
                <option value="H">H</option>
                <option value="PG">PG</option>
                <option value="MAIN">MAIN</option>
                <option value="LIB">LIB</option>
                <option value="AUD">AUD</option>
                <option value="CAF">CAF</option>
                <option value="HOSTEL">HOSTEL</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional description..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="frequentlyUsed"
              checked={formData.frequentlyUsed}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-300">
              Mark as frequently used
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Key
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ManageApiKeysPage;
