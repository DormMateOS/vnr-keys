import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';
import socketService from '../services/socketService.js';

const API_BASE_URL = import.meta.env.VITE_API_URL_LOCAL || 'http://localhost:6203/api';

// Configure axios for notifications to use cookies like the auth store
axios.defaults.withCredentials = true;

const useNotificationStore = create(
  devtools(
    (set, get) => ({
      // State
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: null,
      lastFetch: null,

      // Actions
      setNotifications: (notifications) => {
        const unreadCount = notifications.filter(n => !n.read).length;
        set({
          notifications, 
          unreadCount,
          lastFetch: new Date().toISOString()
        });
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Fetch notifications from API
      fetchNotifications: async () => {
        const { setLoading, setError, setNotifications } = get();

        try {
          setLoading(true);
          setError(null);

          console.log('Fetching notifications from:', `${API_BASE_URL}/notifications`);

          const response = await axios.get(`${API_BASE_URL}/notifications`);

          console.log('Response status:', response.status);
          console.log('Notifications data:', response.data);

          // Handle different response structures
          const notifications = response.data.data?.notifications || response.data.notifications || [];
          setNotifications(notifications);
        } catch (error) {
          console.error('Error fetching notifications:', error);
          if (error.response?.status === 401) {
            setError('Please login to view notifications');
          } else {
            setError(error.response?.data?.message || error.message);
          }
        } finally {
          setLoading(false);
        }
      },

      // Mark notification as read
      markAsRead: async (notificationId) => {
        const { notifications, setNotifications } = get();
        
        try {
          console.log('Marking notification as read:', notificationId);
          console.log('API URL:', `${API_BASE_URL}/notifications/${notificationId}/read`);
          
          const response = await axios.patch(`${API_BASE_URL}/notifications/${notificationId}/read`);
          console.log('Mark as read response:', response.data);

          // Update local state
          const updatedNotifications = notifications.map(notification =>
            notification._id === notificationId
              ? { ...notification, read: true, readAt: new Date().toISOString() }
              : notification
          );
          setNotifications(updatedNotifications);
        } catch (error) {
          console.error('Error marking notification as read:', error);
          console.error('Error details:', error.response?.data || error.message);
        }
      },

      // Mark notification as unread
      markAsUnread: async (notificationId) => {
        const { notifications, setNotifications } = get();
        
        try {
          console.log('Marking notification as unread:', notificationId);
          console.log('API URL:', `${API_BASE_URL}/notifications/${notificationId}/unread`);
          
          const response = await axios.patch(`${API_BASE_URL}/notifications/${notificationId}/unread`);
          console.log('Mark as unread response:', response.data);

          // Update local state
          const updatedNotifications = notifications.map(notification =>
            notification._id === notificationId
              ? { ...notification, read: false, readAt: null }
              : notification
          );
          setNotifications(updatedNotifications);
        } catch (error) {
          console.error('Error marking notification as unread:', error);
          console.error('Error details:', error.response?.data || error.message);
        }
      },

      // Mark all notifications as read
      markAllAsRead: async () => {
        const { notifications, setNotifications } = get();
        
        try {
          await axios.patch(`${API_BASE_URL}/notifications/mark-all-read`);

          // Update local state
          const updatedNotifications = notifications.map(notification => ({
            ...notification,
            read: true,
            readAt: new Date().toISOString()
          }));
          setNotifications(updatedNotifications);
        } catch (error) {
          console.error('Error marking all notifications as read:', error);
        }
      },


      // Add new notification (for real-time updates)
      addNotification: (notification) => {
        const { notifications, setNotifications } = get();
        const updatedNotifications = [notification, ...notifications];
        setNotifications(updatedNotifications);
      },

      // Update notification (for real-time updates)
      updateNotification: (notificationId, updates) => {
        const { notifications, setNotifications } = get();
        const updatedNotifications = notifications.map(notification =>
          notification._id === notificationId
            ? { ...notification, ...updates }
            : notification
        );
        setNotifications(updatedNotifications);
      },

      // Clear all notifications
      clearNotifications: () => {
        set({ 
          notifications: [], 
          unreadCount: 0, 
          error: null,
          lastFetch: null 
        });
      },

      // Get notifications by type
      getNotificationsByType: (type) => {
        const { notifications } = get();
        return notifications.filter(notification => notification.type === type);
      },

      // Get unread notifications
      getUnreadNotifications: () => {
        const { notifications } = get();
        return notifications.filter(notification => !notification.read);
      },

      // Get notifications by priority
      getNotificationsByPriority: (priority) => {
        const { notifications } = get();
        return notifications.filter(notification => notification.priority === priority);
      },

      // Initialize socket connection for real-time notifications
      initializeSocket: () => {
        try {
          socketService.connect();
          
          // Listen for new notifications
          socketService.on('notification', (notificationData) => {
            console.log('📢 New notification received:', notificationData);
            const { addNotification } = get();
            
            // Add the new notification to the store
            const notification = {
              _id: notificationData.id,
              title: notificationData.title,
              message: notificationData.message,
              createdAt: notificationData.createdAt,
              read: notificationData.read || false,
              type: notificationData.type || 'general',
              priority: notificationData.priority || 'medium'
            };
            
            addNotification(notification);
          });

          console.log('✅ Notification socket listeners initialized');
        } catch (error) {
          console.error('❌ Failed to initialize notification socket:', error);
        }
      },

      // Disconnect socket
      disconnectSocket: () => {
        try {
          socketService.off('notification');
          console.log('🔌 Notification socket listeners removed');
        } catch (error) {
          console.error('❌ Error disconnecting notification socket:', error);
        }
      },
    }),
    {
      name: 'notification-store',
    }
  )
);

export { useNotificationStore };
