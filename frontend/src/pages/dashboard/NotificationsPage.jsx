import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Key,
  Shield,
  Info,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { useAuthStore } from '../../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import NotificationResendButton from '../../components/notifications/NotificationResendButton';

const NotificationsPage = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAsUnread
  } = useNotificationStore();
  
  const { user } = useAuthStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getNotificationIcon = (type, priority, isRead) => {
    const iconClass = `h-5 w-5 ${
      isRead ? 'text-green-400' : 'text-blue-400'
    }`;

    switch (type) {
      case 'key_reminder':
        return <Key className={iconClass} />;
      case 'security_alert':
        return <Shield className={iconClass} />;
      case 'system_alert':
        return <Info className={iconClass} />;
      default:
        return <Info className={iconClass} />;
    }
  };

  const getNotificationColor = (isRead) => {
    return isRead ? 'border-l-green-500 bg-green-900/10' : 'border-l-blue-500 bg-blue-900/10';
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-blue-400" />
              <h1 className="text-3xl font-bold text-white">Notifications</h1>
            </div>
            <div className="flex items-center gap-3">
              {(user?.role === 'security' || user?.role === 'admin') && (
                <NotificationResendButton />
              )}
              <button
                onClick={fetchNotifications}
                disabled={loading}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          <p className="text-gray-400">View your notifications</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <span className="text-red-300">Error: {error}</span>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {/* List Header */}
          <div className="p-4 border-b border-gray-700 bg-gray-750">
            <span className="text-sm text-gray-300">
              {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Notifications */}
          <div className="divide-y divide-gray-700">
            <AnimatePresence>
              {loading ? (
                <div className="p-8 text-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-2" />
                  <p className="text-gray-400">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">No notifications</h3>
                  <p className="text-gray-400">
                    You're all caught up! New notifications will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((notification, index) => (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.02 }}
                    className={`p-4 hover:bg-gray-750 transition-colors border-l-4 cursor-pointer ${
                      getNotificationColor(notification.read)
                    } ${!notification.read ? 'bg-gray-750/50' : ''}`}
                    onClick={() =>
                      notification.read
                        ? markAsUnread(notification._id)
                        : markAsRead(notification._id)
                    }
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(
                          notification.type,
                          notification.priority,
                          notification.read
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="mb-2">
                          <h3
                            className={`text-sm font-medium ${
                              notification.read ? 'text-gray-300' : 'text-white'
                            }`}
                          >
                            {notification.title || 'Notification'}
                          </h3>
                        </div>

                        <p
                          className={`text-sm mb-3 ${
                            notification.read ? 'text-gray-400' : 'text-gray-300'
                          }`}
                        >
                          {notification.message || 'No message available'}
                        </p>

                        {/* Metadata */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {notification.createdAt
                                ? formatDistanceToNow(new Date(notification.createdAt), {
                                    addSuffix: true,
                                  })
                                : 'Unknown time'}
                            </div>
                            <span className="capitalize">
                              {notification.type?.replace('_', ' ') || 'notification'}
                            </span>
                            {notification.read && notification.readAt && (
                              <span>
                                Read{' '}
                                {formatDistanceToNow(new Date(notification.readAt), {
                                  addSuffix: true,
                                })}
                              </span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
                              title={notification.read ? 'Mark as unread' : 'Mark as read'}
                              onClick={(e) => {
                                e.stopPropagation(); // prevent triggering parent onClick
                                notification.read
                                  ? markAsUnread(notification._id)
                                  : markAsRead(notification._id);
                              }}
                            >
                              {notification.read ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
