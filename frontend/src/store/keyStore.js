import { create } from "zustand";
import axios from "axios";
import { handleError, handleSuccess } from "../utils/errorHandler.js";
import socketService from "../services/socketService.js";
import { generateKeyReturnQRData, generateKeyRequestQRData, generateBatchReturnQRData } from "../services/qrService.js";
import { config } from "../utils/config.js";
import { useAuthStore } from "./authStore.js";

const API_URL = config.api.keysUrl;

// Helper function to transform backend key data to frontend format
const transformKeyData = (backendKey) => {
  return {
    id: backendKey._id,
    keyNumber: backendKey.keyNumber,
    keyName: backendKey.keyName,
    location: backendKey.location,
    status: backendKey.status,
    description: backendKey.description || "",
    category: backendKey.category,
    department: backendKey.department,
    block: backendKey.block,
    frequentlyUsed: backendKey.frequentlyUsed,
    takenBy: backendKey.takenBy?.userId ? {
      id: backendKey.takenBy.userId,
      name: backendKey.takenBy.name,
      email: backendKey.takenBy.email
    } : null,
    takenAt: backendKey.takenAt,
    returnedAt: backendKey.returnedAt,
    isActive: backendKey.isActive,
    createdAt: backendKey.createdAt,
    updatedAt: backendKey.updatedAt
  };
};

export const useKeyStore = create((set, get) => ({
  keys: [],
  takenKeys: [], // Separate state for taken keys
  frequentlyUsedKeys: [], // State for user's frequently used keys
  usageCounts: {}, // State for usage counts
  isLoading: false,
  isLoadingTakenKeys: false, // Separate loading state for taken keys
  isLoadingFrequentlyUsed: false, // Loading state for frequently used keys
  error: null,
  searchQuery: "",
  activeQRRequest: null,
  isSocketConnected: false,

  // Get available keys
  getAvailableKeys: () => {
    const { keys } = get();
    return keys.filter(key => key.status === "available");
  },

  // Get unavailable keys
  getUnavailableKeys: () => {
    const { keys } = get();
    return keys.filter(key => key.status === "unavailable");
  },

  // Get keys taken by current user
  getTakenKeys: (userId) => {
    const { takenKeys, keys } = get();
    // console.log('🔍 getTakenKeys called with userId:', userId);
    // console.log('🔍 Taken keys from separate state:', takenKeys.length);
    // console.log('🔍 Total keys in main array:', keys.length);
    
    if (!userId) {
      console.log('❌ getTakenKeys: No userId provided');
      return [];
    }
    
    // If we have taken keys in the separate state, return them
    if (takenKeys.length > 0) {
      console.log('✅ getTakenKeys: Returning taken keys from separate state');
      return takenKeys;
    }
    
    // Fallback to filtering from main keys array (for backward compatibility)
    // console.log('🔄 getTakenKeys: Falling back to filtering from main keys array');
    // console.log('🔍 Keys status breakdown:', keys.reduce((acc, key) => {
    //   acc[key.status] = (acc[key.status] || 0) + 1;
    //   return acc;
    // }, {}));
    
    const userIdStr = String(userId);
    // console.log('🔍 Looking for userId:', userIdStr);
    
    const filteredTakenKeys = keys.filter(key => {
      if (key.status !== "unavailable" || !key.takenBy?.id) {
        // console.log(`🔍 Key ${key.keyNumber}: status=${key.status}, takenBy.id=${key.takenBy?.id}`);
        return false;
      }
      
      const keyUserId = key.takenBy.id;
      // console.log(`🔍 Key ${key.keyNumber}: takenBy.id=${keyUserId}, type=${typeof keyUserId}`);
      
      // Try exact string match first
      if (String(keyUserId) === userIdStr) {
        // console.log(`✅ Key ${key.keyNumber}: Exact string match found for user ${userIdStr}`);
        return true;
      }
      
      // Try ObjectId comparison if the keyUserId is an ObjectId-like object
      if (keyUserId && typeof keyUserId === 'object' && keyUserId.toString) {
        const keyUserIdStr = keyUserId.toString();
        const match = keyUserIdStr === userIdStr;
        // console.log(`🔍 Key ${key.keyNumber}: ObjectId comparison: ${keyUserIdStr} === ${userIdStr} = ${match}`);
        return match;
      }
      
      // Try to extract the actual ID if it's nested
      if (keyUserId && typeof keyUserId === 'object' && keyUserId.userId) {
        const nestedUserId = keyUserId.userId;
        const nestedUserIdStr = String(nestedUserId);
        const match = nestedUserIdStr === userIdStr;
        console.log(`🔍 Key ${key.keyNumber}: Nested userId comparison: ${nestedUserIdStr} === ${userIdStr} = ${match}`);
        return match;
      }
      
      console.log(`❌ Key ${key.keyNumber}: No match found for user ${userIdStr}`);
      return false;
    });
    
    // console.log('🔍 getTakenKeys fallback result:', filteredTakenKeys.length, 'keys found');
    return filteredTakenKeys;
  },

  // Fetch keys taken by current user from API
  fetchTakenKeys: async (userId) => {
    // console.log('🚀 fetchTakenKeys called with userId:', userId);
    if (!userId) {
      console.log('❌ fetchTakenKeys: No userId provided');
      return [];
    }
    
    set({ isLoadingTakenKeys: true, error: null });

    try {
      // console.log('🌐 fetchTakenKeys: Making API request to:', `${API_URL}/my-taken`);
      const response = await axios.get(`${API_URL}/my-taken`, {
        withCredentials: true,
      });

      // console.log('✅ fetchTakenKeys: API response received:', response.data);
      const backendKeys = response.data.data.keys || [];
      // console.log('🔑 fetchTakenKeys: Backend keys count:', backendKeys.length);
      
      const takenKeys = backendKeys.map(transformKeyData);
      // console.log('🔑 fetchTakenKeys: Transformed keys count:', takenKeys.length);

      // Store taken keys in separate state
      set({ takenKeys, isLoadingTakenKeys: false });
      // console.log('✅ fetchTakenKeys: Taken keys stored in separate state');

      // Also update the main keys array with the taken keys
      const { keys } = get();
      const updatedKeys = [...keys];
      
      takenKeys.forEach(takenKey => {
        const existingIndex = updatedKeys.findIndex(k => k.id === takenKey.id);
        if (existingIndex !== -1) {
          updatedKeys[existingIndex] = takenKey;
        } else {
          updatedKeys.push(takenKey);
        }
      });

      set({ keys: updatedKeys });
      // console.log('✅ fetchTakenKeys: Main keys array also updated');
      return takenKeys;
    } catch (error) {
      console.error("❌ fetchTakenKeys: API error:", error);
      console.error("❌ fetchTakenKeys: Error response:", error.response?.data);
      console.error("❌ fetchTakenKeys: Error status:", error.response?.status);
      const errorMessage = handleError(error);
      set({ error: errorMessage, isLoadingTakenKeys: false });
      return [];
    }
  },

  // Fetch user's frequently used keys
  fetchUserFrequentlyUsedKeys: async () => {
    set({ isLoadingFrequentlyUsed: true, error: null });

    try {
      const response = await axios.get(`${API_URL}/my-frequently-used`, {
        withCredentials: true,
      });

      const backendKeys = response.data.data.keys || [];
      const keys = backendKeys.map(transformKeyData);
      const usageCounts = response.data.data.usageCounts || {};

      set({ 
        frequentlyUsedKeys: keys, 
        usageCounts,
        isLoadingFrequentlyUsed: false 
      });
      return { keys, usageCounts };
    } catch (error) {
      console.error("Error fetching frequently used keys:", error);
      const errorMessage = handleError(error);
      set({ 
        frequentlyUsedKeys: [], 
        usageCounts: {},
        error: errorMessage, 
        isLoadingFrequentlyUsed: false 
      });
      throw error;
    }
  },

  // Get frequently used keys
  getFrequentlyUsedKeys: () => {
    const { keys } = get();
    return keys.filter(key => key.frequentlyUsed);
  },

  // Search keys
  searchKeys: (query) => {
    const { keys } = get();
    if (!query.trim()) return keys;

    const searchTerm = query.toLowerCase();
    return keys.filter(key =>
      key.keyName?.toLowerCase().includes(searchTerm) ||
      key.keyNumber?.toLowerCase().includes(searchTerm) ||
      key.location?.toLowerCase().includes(searchTerm) ||
      key.category?.toLowerCase().includes(searchTerm) ||
      key.department?.toLowerCase().includes(searchTerm) ||
      key.block?.toLowerCase().includes(searchTerm)
    );
  },

  // Set search query
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  // Generate QR code for key request
  generateKeyRequestQR: async (keyId, userId) => {
    try {
      const qrData = generateKeyRequestQRData(keyId, userId);

      set({
        activeQRRequest: qrData
      });

      return qrData;
    } catch (error) {
      const errorMessage = handleError(error);
      set({ error: errorMessage });
      throw error;
    }
  },

  // Generate QR code for key return
  generateKeyReturnQR: async (keyId, userId) => {
    try {
      const qrData = generateKeyReturnQRData(keyId, userId);
      return qrData;
    } catch (error) {
      const errorMessage = handleError(error);
      set({ error: errorMessage });
      throw error;
    }
  },

  // Process QR scan (for security users)
  processQRScan: async (qrData) => {
    set({ isLoading: true, error: null });

    try {
      const { keys } = get();
      const key = keys.find(k => k.id === qrData.keyId);

      if (!key) {
        throw new Error("Key not found");
      }

      let updatedKeys;
      let message;

      if (qrData.type === "KEY_REQUEST") {
        if (key.status !== "available") {
          throw new Error("Key is not available");
        }

        updatedKeys = keys.map(k =>
          k.id === qrData.keyId
            ? {
                ...k,
                status: "unavailable",
                takenBy: { id: qrData.userId, name: "Faculty User"}, // In real app, get user details
                takenAt: new Date().toISOString(),
                returnedAt: null
              }
            : k
        );
        message = `Key ${key.keyNumber} (${key.keyName}) assigned successfully`;
      } else if (qrData.type === "batch-return") {
        if (key.status !== "unavailable") {
          throw new Error("Key is not currently taken");
        }

        updatedKeys = keys.map(k =>
          k.id === qrData.keyId
            ? {
                ...k,
                status: "available",
                takenBy: null,
                takenAt: null,
                returnedAt: new Date().toISOString()
              }
            : k
        );
        message = `Key ${key.keyNumber} (${key.keyName}) returned successfully`;
      }

      set({
        keys: updatedKeys,
        isLoading: false,
        activeQRRequest: null
      });

      handleSuccess(message);
      return { success: true, message, key };
    } catch (error) {
      const errorMessage = handleError(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Manually collect key (for security users)
  manuallyCollectKey: async (keyId) => {
    set({ isLoading: true, error: null });

    try {
      const { keys } = get();
      const key = keys.find(k => k.id === keyId);

      if (!key) {
        throw new Error("Key not found");
      }

      if (key.status !== "unavailable") {
        throw new Error("Key is not currently taken");
      }

      const updatedKeys = keys.map(k =>
        k.id === keyId
          ? {
              ...k,
              status: "available",
              takenBy: null,
              takenAt: null,
              returnedAt: new Date().toISOString()
            }
          : k
      );

      set({
        keys: updatedKeys,
        isLoading: false
      });

      handleSuccess(`Key ${key.keyNumber} (${key.keyName}) collected successfully`);
      return { success: true, key };
    } catch (error) {
      const errorMessage = handleError(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Toggle frequently used status
  toggleFrequentlyUsed: async (keyId) => {
    set({ isLoading: true, error: null });

    try {
      const { keys } = get();
      const updatedKeys = keys.map(k =>
        k.id === keyId
          ? { ...k, frequentlyUsed: !k.frequentlyUsed }
          : k
      );

      set({
        keys: updatedKeys,
        isLoading: false
      });

      const key = updatedKeys.find(k => k.id === keyId);
      const message = key.frequentlyUsed
        ? "Added to frequently used keys"
        : "Removed from frequently used keys";

      handleSuccess(message);
      return { success: true };
    } catch (error) {
      const errorMessage = handleError(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Clear active QR request
  clearActiveQRRequest: () => {
    set({ activeQRRequest: null });
  },

  // Clear taken keys
  clearTakenKeys: () => {
    set({ takenKeys: [] });
  },

  // Initialize WebSocket connection
  initializeSocket: () => {
    try {
      socketService.connect();

      // Set up event listeners for real-time updates
      socketService.on('keyUpdated', (data) => {
        const { keys } = get();
        let updatedKeys = [...keys];
        const existingKeyIndex = keys.findIndex(key => key.id === data.key._id);

        if (data.action === 'delete' && existingKeyIndex !== -1) {
          // Remove deleted key
          updatedKeys.splice(existingKeyIndex, 1);
        } else if (existingKeyIndex !== -1) {
          // Update existing key
          updatedKeys[existingKeyIndex] = transformKeyData(data.key);
        } else {
          // Add new key
          updatedKeys.push(transformKeyData(data.key));
        }

        set({ keys: updatedKeys });

        // Keep takenKeys in sync for faculty users
        try {
          const { takenKeys } = get();
          const currentUserId = (() => {
            try { return useAuthStore.getState()?.user?.id || null; } catch { return null; }
          })();

          if (data.action === 'return' || data.action === 'qr-return') {
            // Remove returned key from takenKeys if present
            const filtered = takenKeys.filter(k => k.id !== data.key._id);
            if (filtered.length !== takenKeys.length) {
              set({ takenKeys: filtered });
            }
          } else if (data.action === 'qr-request') {
            // If this user just got a key via QR, add/update it in takenKeys
            if (currentUserId && data.requestingUserId === currentUserId) {
              const transformed = transformKeyData(data.key);
              const idx = takenKeys.findIndex(k => k.id === transformed.id);
              const newTaken = [...takenKeys];
              if (idx !== -1) newTaken[idx] = transformed; else newTaken.push(transformed);
              set({ takenKeys: newTaken });
            }
          }
        } catch (e) {
          // non-fatal
        }

        // Show notification based on action
        // Skip notifications for QR scan actions as they are handled by the UI components
        switch (data.action) {
          case 'take': {
            handleSuccess(`Key ${data.key.keyNumber} has been taken by ${data.key.takenBy?.name || 'someone'}`);
            break;
          }
          case 'return': {
            // Skip notification for regular returns to avoid duplicates with API calls
            // Only show for manual/collective returns not triggered by QR
            if (data.returnType === 'collective' || data.returnType === 'manual') {
              handleSuccess(`Key ${data.key.keyNumber} has been returned`);
            }
            break;
          }
          case 'qr-return': {
            // Skip notification - handled by SecurityDashboard scan result modal
            break;
          }
          case 'qr-request': {
            // Skip notification - handled by SecurityDashboard scan result modal
            break;
          }
          case 'create': {
            handleSuccess(`New key ${data.key.keyNumber} has been added`);
            break;
          }
          case 'update': {
            handleSuccess(`Key ${data.key.keyNumber} has been updated`);
            break;
          }
          case 'delete': {
            handleSuccess(`Key ${data.key.keyNumber} has been removed`);
            break;
          }
          case 'toggle-frequent': {
            const status = data.key.frequentlyUsed ? 'added to' : 'removed from';
            handleSuccess(`Key ${data.key.keyNumber} (${data.key.keyName}) ${status} favorites`);
            break;
          }
          default: {
            break;
          }
        }
      });

      socketService.on('userKeyUpdated', (data) => {
        // Handle user-specific key updates (e.g., keys taken/returned by current user)
        console.log('User key update:', data);

        // Skip QR scan notifications as they are handled by the UI components
        // You could add specific logic here for user-specific notifications
        // if (data.action === 'qr-return') {
        //   handleSuccess(`Your key ${data.key.keyNumber} was successfully returned via QR scan`);
        // } else if (data.action === 'qr-request') {
        //   handleSuccess(`Your key request for ${data.key.keyNumber} was approved via QR scan`);
        // }
      });

      set({ isSocketConnected: true });
      console.log('✅ Socket service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      set({ isSocketConnected: false });
    }
  },

  // Refresh keys data
  refreshKeys: async () => {
    try {
      await get().fetchKeys();
    } catch (error) {
      console.error('Failed to refresh keys:', error);
    }
  },

  // Handle real-time key update
  handleRealTimeUpdate: (data) => {
    const { keys } = get();
    let updatedKeys = [...keys];
    const existingKeyIndex = keys.findIndex(key => key.id === data.key._id);

    if (data.action === 'delete' && existingKeyIndex !== -1) {
      updatedKeys.splice(existingKeyIndex, 1);
    } else if (existingKeyIndex !== -1) {
      updatedKeys[existingKeyIndex] = transformKeyData(data.key);
    } else {
      updatedKeys.push(transformKeyData(data.key));
    }

    set({ keys: updatedKeys });
  },

  // Disconnect WebSocket
  disconnectSocket: () => {
    socketService.disconnect();
    set({ isSocketConnected: false });
  },

  // Fetch keys from API
  fetchKeys: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.get(API_URL, {
        withCredentials: true,
      });

      const backendKeys = response.data.data.keys || [];
      const keys = backendKeys.map(transformKeyData);

      set({ keys, isLoading: false });
      return keys;
    } catch (error) {
      console.error("Error fetching keys:", error);
      const errorMessage = handleError(error);
      set({ keys: [], error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Take a key via API
  takeKeyAPI: async (keyId) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.post(`${API_URL}/${keyId}/take`, {}, {
        withCredentials: true,
      });

      const updatedKey = transformKeyData(response.data.data.key);
      const { keys } = get();
      const updatedKeys = keys.map(key =>
        key.id === keyId ? updatedKey : key
      );

      set({ keys: updatedKeys, isLoading: false });
      handleSuccess(response.data.message);
      return updatedKey;
    } catch (error) {
      console.error("Error taking key:", error);
      const errorMessage = handleError(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Return a key via API
  returnKeyAPI: async (keyId, skipNotification = false, returnerId = null) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.post(`${API_URL}/${keyId}/return`, {
        returnerId: returnerId
      }, {
        withCredentials: true,
      });

      const updatedKey = transformKeyData(response.data.data.key);
      const { keys } = get();
      const updatedKeys = keys.map(key =>
        key.id === keyId ? updatedKey : key
      );

      set({ keys: updatedKeys, isLoading: false });
      
      // Only show notification if not skipped (e.g., when called from QR scan)
      if (!skipNotification) {
        handleSuccess(response.data.message);
      }
      
      return updatedKey;
    } catch (error) {
      console.error("Error returning key:", error);
      const errorMessage = handleError(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Collective return a key via API
  collectiveReturnKeyAPI: async (keyId, reason = null) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.post(`${API_URL}/${keyId}/collective-return`, {
        reason: reason
      }, {
        withCredentials: true,
      });

      const updatedKey = transformKeyData(response.data.data.key);
      const { keys } = get();
      const updatedKeys = keys.map(key =>
        key.id === keyId ? updatedKey : key
      );

      set({ keys: updatedKeys, isLoading: false });
      handleSuccess(response.data.message);
      return {
        key: updatedKey,
        originalUser: response.data.data.originalUser,
        returnedBy: response.data.data.returnedBy,
        reason: response.data.data.reason
      };
    } catch (error) {
      console.error("Error performing collective return:", error);
      const errorMessage = handleError(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Get all taken keys (for collective return interface)
  getAllTakenKeysAPI: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.get(`${API_URL}/all-taken`, {
        withCredentials: true,
      });

      const backendKeys = response.data.data.keys || [];
      const takenKeys = backendKeys.map(transformKeyData);

      set({ isLoading: false });
      return takenKeys;
    } catch (error) {
      console.error("Error fetching all taken keys:", error);
      const errorMessage = handleError(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Toggle frequently used status via API
  toggleFrequentlyUsedAPI: async (keyId) => {
    try {
      const response = await axios.post(`${API_URL}/${keyId}/toggle-frequent`, {}, {
        withCredentials: true,
      });

      const updatedKey = transformKeyData(response.data.data.key);
      const { keys } = get();
      const updatedKeys = keys.map(key =>
        key.id === keyId ? updatedKey : key
      );

      set({ keys: updatedKeys });
      // Don't show notification here - let the socket handle it with key name
      return updatedKey;
    } catch (error) {
      console.error("Error toggling frequently used:", error);
      const errorMessage = handleError(error);
      set({ error: errorMessage });
      throw error;
    }
  },

  // Admin functions for key management

  // Create a new key (admin only)
  createKey: async (keyData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.post(API_URL, keyData, {
        withCredentials: true,
      });

      const newKey = transformKeyData(response.data.data.key);
      const { keys } = get();
      const updatedKeys = [...keys, newKey];

      set({ keys: updatedKeys, isLoading: false });
      handleSuccess(response.data.message);
      return newKey;
    } catch (error) {
      console.error("Error creating key:", error);
      const errorMessage = handleError(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Update an existing key (admin only)
  updateKey: async (keyId, keyData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.put(`${API_URL}/${keyId}`, keyData, {
        withCredentials: true,
      });

      const updatedKey = transformKeyData(response.data.data.key);
      const { keys } = get();
      const updatedKeys = keys.map(key =>
        key.id === keyId ? updatedKey : key
      );

      set({ keys: updatedKeys, isLoading: false });
      handleSuccess(response.data.message);
      return updatedKey;
    } catch (error) {
      console.error("Error updating key:", error);
      const errorMessage = handleError(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Delete a key (admin only)
  deleteKey: async (keyId, hardDelete = false) => {
    set({ isLoading: true, error: null });

    try {
      const url = hardDelete ? `${API_URL}/${keyId}?hard=true` : `${API_URL}/${keyId}`;
      const response = await axios.delete(url, {
        withCredentials: true,
      });

      const { keys } = get();
      const updatedKeys = keys.filter(key => key.id !== keyId);

      set({ keys: updatedKeys, isLoading: false });
      handleSuccess(response.data.message);
      return true;
    } catch (error) {
      console.error("Error deleting key:", error);
      const errorMessage = handleError(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Get a single key by ID
  getKeyById: async (keyId) => {
    try {
      const response = await axios.get(`${API_URL}/${keyId}`, {
        withCredentials: true,
      });

      return transformKeyData(response.data.data.key);
    } catch (error) {
      console.error("Error fetching key:", error);
      const errorMessage = handleError(error);
      set({ error: errorMessage });
      throw error;
    }
  }
}));