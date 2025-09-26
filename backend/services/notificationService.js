import { Notification } from "../models/notification.model.js";
import User from "../models/user.model.js";
import Key from "../models/key.model.js";
import { sendNotificationEmail } from "../nodemailer/emails.js";

/**
 * Notification Service
 * Handles creation, delivery, and management of notifications
 */

/**
 * Create a new notification
 * @param {Object} notificationData - The notification data
 * @returns {Promise<Object>} Created notification
 */
export const createNotification = async (notificationData) => {
  try {
    console.log('🔵 Creating notification with data:', JSON.stringify(notificationData, null, 2));

    // Validate required fields
    if (!notificationData.recipient?.userId) {
      throw new Error('Recipient userId is required');
    }
    if (!notificationData.recipient?.name) {
      throw new Error('Recipient name is required');
    }
    if (!notificationData.recipient?.email) {
      throw new Error('Recipient email is required');
    }
    if (!notificationData.recipient?.role) {
      throw new Error('Recipient role is required');
    }
    if (!notificationData.title) {
      throw new Error('Notification title is required');
    }
    if (!notificationData.message) {
      throw new Error('Notification message is required');
    }

    const notification = new Notification(notificationData);
    console.log('🔵 Notification model created, validating...');

    // Run model validation
    const validationError = notification.validateSync();
    if (validationError) {
      console.error('❌ Validation failed:', validationError);
      throw validationError;
    }

    console.log('✅ Validation passed, saving to database...');
    await notification.save();
    console.log('✅ Notification saved to database successfully');
    console.log(`📢 Notification created: ${notification.title} for user ${notification.recipient.name}`);

    return notification;
  } catch (error) {
    console.error("❌ Error creating notification:", error);
    console.error("Error details:", error?.message);
    if (error?.errors) {
      console.error("Validation errors:", JSON.stringify(error.errors, null, 2));
    }
    throw error;
  }
};

/**
 * Send real-time notification via Socket.IO
 * @param {Object} notification - The notification object
 */
export const sendRealTimeNotification = async (notification) => {
  try {
    if (!global.io) {
      console.warn('Socket.IO not initialized, skipping real-time notification');
      return;
    }

    const notificationData = {
      id: notification._id,
      title: notification.title,
      message: notification.message,
      createdAt: notification.createdAt,
      read: notification.read
    };

    try {
      // Send to specific user
      if (notification?.recipient?.userId) {
        global.io.to(`user-${notification.recipient.userId}`).emit('new-notification', notificationData);
        console.log('✅ Notification emitted to user:', notification.recipient.userId);
      } else {
        console.warn('Notification recipient.userId missing, skipping user emission');
      }

      // Send to role-based rooms (for security notifications)
      if (notification.recipient?.role === 'security') {
        global.io.to('security-room').emit('new-notification', notificationData);
        console.log('✅ Notification emitted to security room');
      }
    } catch (error) {
      console.error('❌ Error in socket emission:', error);
      // Don't throw - socket errors shouldn't break the notification flow
    }

    console.log(`🔄 Real-time notification processed for ${notification.recipient?.name || 'unknown user'}`);
  } catch (error) {
    console.error("❌ Error sending real-time notification:", error);
  }
};

/**
 * Send email notification
 * @param {Object} notification - The notification object
 */
export const sendEmailNotification = async (notification) => {
  try {
    if (!notification?.recipient?.email) {
      console.warn('No recipient email provided, skipping email send');
      return;
    }

    await sendNotificationEmail(
      notification.recipient.email,
      notification.recipient.name,
      notification.title,
      notification.message
    );

    console.log(`📧 Email notification sent to ${notification.recipient.email}`);
  } catch (error) {
    console.error("❌ Error sending email notification:", error);
  }
};

/**
 * Create notification when faculty takes a key
 * @param {Object} key - The taken key
 * @param {Object} faculty - The faculty who took the key
 */
export const createKeyTakenNotification = async (key, faculty) => {
  try {
    console.log('🔵 createKeyTakenNotification called with:', {
      keyId: key?._id,
      keyName: key?.keyName,
      facultyId: faculty?._id,
      facultyName: faculty?.name
    });

    const notificationData = {
      recipient: {
        userId: faculty._id,
        name: faculty.name,
        email: faculty.email,
        role: faculty.role,
      },
      title: 'Key Taken',
      message: `You have taken the key for ${key.keyName}`,
      type: 'general',
      priority: 'low',
      metadata: {
        keyId: key._id,
        keyNumber: key.keyNumber,
        keyName: key.keyName,
      }
    };

    console.log('🔵 Notification data prepared:', JSON.stringify(notificationData, null, 2));

    const notification = await createAndSendNotification(notificationData, {
      email: false,
      realTime: true
    });
    console.log('✅ Key taken notification created and sent successfully');
    return notification;
  } catch (error) {
    console.error("❌ Error creating key taken notification:", error);
    console.error("Error details:", error?.message);
    console.error("Stack trace:", error?.stack);
    throw error;
  }
};

/**
 * Create notification when a key is returned by someone else
 * @param {Object} key - The returned key
 * @param {Object} originalUser - The user who originally took the key
 * @param {Object} returnedBy - The user who returned the key
 */
export const createKeyReturnedNotification = async (key, originalUser, returnedBy) => {
  try {
    console.log('🔵 Creating key returned notification:', {
      keyId: key?._id,
      keyName: key?.keyName,
      originalUserId: originalUser?._id,
      originalUserName: originalUser?.name,
      returnedById: returnedBy?._id,
      returnedByName: returnedBy?.name
    });

    const notificationData = {
      recipient: {
        userId: originalUser._id,
        name: originalUser.name,
        email: originalUser.email,
        role: originalUser.role,
      },
      title: 'Key Returned',
      message: `Your key ${key.keyName} was returned by ${returnedBy.name}`,
      type: 'general',
      priority: 'low',
      metadata: {
        keyId: key._id,
        keyNumber: key.keyNumber,
        keyName: key.keyName,
        returnTime: new Date().toISOString(),
        returnType: 'returned-by-other',
        returnedBy: {
          id: returnedBy._id,
          name: returnedBy.name,
          role: returnedBy.role
        }
      }
    };

    console.log('🔵 Sending notification with data:', JSON.stringify(notificationData, null, 2));

    const notification = await createAndSendNotification(notificationData, {
      email: false,
      realTime: true
    });

    console.log('✅ Key return notification sent:', notification._id);
    return notification;
  } catch (error) {
    console.error("❌ Error creating key returned notification:", error);
    console.error("Error details:", error?.message);
    console.error("Stack trace:", error?.stack);
    throw error;
  }
};

export const createKeySelfReturnedNotification = async (key, faculty) => {
  try {
    console.log('🔵 createKeySelfReturnedNotification called with:', {
      keyId: key?._id,
      keyName: key?.keyName,
      facultyId: faculty?._id,
      facultyName: faculty?.name,
      facultyRole: faculty?.role
    });

    const notificationData = {
      recipient: {
        userId: faculty._id,
        name: faculty.name,
        email: faculty.email,
        role: faculty.role,
      },
      title: 'Key Returned',
      message: `You have returned key successfully ${key.keyName}`,
      type: 'key_returned',
      priority: 'low',
      metadata: {
        keyId: key._id,
        keyNumber: key.keyNumber,
        keyName: key.keyName,
        timestamp: new Date().toISOString(),
        actionType: 'self-return'
      }
    };

    console.log('🔵 Preparing to create notification with data:', JSON.stringify(notificationData, null, 2));

    const notification = await createAndSendNotification(notificationData, {
      email: false,
      realTime: true
    });

    console.log('✅ Key return notification created with ID:', notification._id);
    return notification;
  } catch (error) {
    console.error("❌ Error creating key self-returned notification:", error);
    console.error("Error details:", error?.message);
    console.error("Stack trace:", error?.stack);
    throw error;
  }
};

/**
 * Create notification for unreturned key after 5 PM
 * @param {Object} key - The unreturned key
 * @param {Object} faculty - The faculty who has the key
 */
export const createKeyPendingReturnNotification = async (key, faculty) => {
  try {
    const notificationData = {
      recipient: {
        userId: faculty._id,
        name: faculty.name,
        email: faculty.email,
        role: faculty.role,
      },
      title: 'Key Return Pending',
      message: `You have not returned the key ${key.keyName} yet. Please inform the security office or return it as soon as possible.`,
      type: 'key_pending_return',
      priority: 'high',
      metadata: {
        keyId: key._id,
        keyNumber: key.keyNumber,
        keyName: key.keyName,
      }
    };

    return await createAndSendNotification(notificationData, { email: true, realTime: true });
  } catch (error) {
    console.error("❌ Error creating key pending return notification:", error);
    throw error;
  }
};

/**
 * Create notification for batch key returns
 * @param {Array} keys - Array of returned keys
 * @param {Object} returnedBy - The user who returned the keys
 * @param {Object} keyOriginalUsers - optional mapping of keyId -> originalUser object
 */
export const createBatchReturnNotifications = async (keys, returnedBy, keyOriginalUsers = {}) => {
  try {
    console.log('🔵 Creating batch return notifications for', keys.length, 'keys');

    const notifications = [];
    const returnedKeysByUser = {};

    // Group keys by original user using the stored user info
    for (const key of keys) {
      const originalUser = keyOriginalUsers?.[key._id?.toString()];
      if (originalUser) {
        const originalUserId = originalUser._id.toString();
        if (!returnedKeysByUser[originalUserId]) {
          returnedKeysByUser[originalUserId] = {
            user: originalUser,
            keys: []
          };
        }
        returnedKeysByUser[originalUserId].keys.push(key);
      } else {
        // If mapping not provided, try using key.takenBy.userId (populated)
        const maybeUser = key?.takenBy?.userId;
        if (maybeUser) {
          const originalUserId = maybeUser._id.toString();
          if (!returnedKeysByUser[originalUserId]) {
            returnedKeysByUser[originalUserId] = {
              user: maybeUser,
              keys: []
            };
          }
          returnedKeysByUser[originalUserId].keys.push(key);
        } else {
          console.warn(`No original user found for key ${key._id}, skipping grouping for that key`);
        }
      }
    }
    console.log('🔵 Grouped returned keys by user:', Object.keys(returnedKeysByUser).length, 'users');

    // Create notifications for each original user
    for (const [userId, data] of Object.entries(returnedKeysByUser)) {
      const originalUser = data.user;
      const userKeys = data.keys;
      const keyList = userKeys.map(k => `${k.keyNumber} (${k.keyName})`).join(', ');

      const originalUserNotification = {
        recipient: {
          userId: originalUser._id,
          name: originalUser.name,
          email: originalUser.email,
          role: originalUser.role,
        },
        title: 'Keys Returned by Security',
        message: `Your keys have been handed over to security by ${returnedBy.name}: ${keyList}`,
        type: 'general',
        priority: 'low',
        metadata: {
          keyIds: userKeys.map(k => k._id),
          returnTime: new Date().toISOString(),
          returnType: 'batch-return',
          returnedBy: {
            id: returnedBy._id,
            name: returnedBy.name,
            role: returnedBy.role
          }
        }
      };

      try {
        const notification = await createAndSendNotification(originalUserNotification, {
          email: false,
          realTime: true
        });
        notifications.push(notification);
      } catch (err) {
        console.error(`❌ Failed to create notification for user ${originalUser._id}:`, err);
        // continue with other users
      }
    }

    // Create a notification for the returner (security/faculty)
    const allKeysList = keys.map(key => `${key.keyNumber} (${key.keyName})`).join(', ');
    const returnerNotification = {
      recipient: {
        userId: returnedBy._id,
        name: returnedBy.name,
        email: returnedBy.email,
        role: returnedBy.role,
      },
      title: 'Batch Key Return Completed',
      message: `You have successfully returned the following keys: ${allKeysList}`,
      type: 'general',
      priority: 'low',
      metadata: {
        keyIds: keys.map(key => key._id),
        returnTime: new Date().toISOString(),
        returnType: 'batch-return-confirmation'
      }
    };

    try {
      const returnerNotificationResult = await createAndSendNotification(returnerNotification, {
        email: false,
        realTime: true
      });
      notifications.push(returnerNotificationResult);
    } catch (err) {
      console.error('❌ Failed to create returner notification:', err);
    }

    console.log('✅ Created', notifications.length, 'batch return notifications');
    return notifications;
  } catch (error) {
    console.error("❌ Error creating batch return notifications:", error);
    console.error("Error details:", error?.message);
    console.error("Stack trace:", error?.stack);
    throw error;
  }
};

/**
 * Create and send a complete notification (in-app + real-time + email)
 * @param {Object} notificationData - The notification data
 * @param {Object} options - Delivery options
 * @returns {Promise<Object>} Created notification
 */
export const createAndSendNotification = async (notificationData, options = {}) => {
  try {
    console.log('🔵 createAndSendNotification called with options:', options);

    // Create the notification
    console.log('🔵 Creating notification in database...');
    const notification = await createNotification(notificationData);
    console.log('✅ Notification created in database with ID:', notification._id);

    // Send real-time notification
    // Always send real-time notification unless explicitly disabled
    if (options.realTime !== false) {
      console.log('🔵 Sending real-time notification...');
      try {
        await sendRealTimeNotification(notification);
        console.log('✅ Real-time notification sent');
      } catch (error) {
        console.error('❌ Error sending real-time notification:', error);
      }
    }

    // Send email notification only if explicitly enabled
    if (options.email === true) {
      console.log('🔵 Sending email notification...');
      await sendEmailNotification(notification);
      console.log('✅ Email notification sent');
    }

    return notification;
  } catch (error) {
    console.error("❌ Error in createAndSendNotification:", error);
    console.error("Error details:", error?.message);
    console.error("Stack trace:", error?.stack);
    throw error;
  }
};

/**
 * Create key reminder notification for faculty
 * @param {Object} user - The faculty user
 * @param {Array} unreturnedKeys - Array of unreturned keys
 */
export const createKeyReminderNotification = async (user, unreturnedKeys) => {
  try {
    const keyCount = unreturnedKeys.length;
    const keyList = unreturnedKeys.map(key => `${key.keyNumber} (${key.keyName})`).join(', ');

    const notificationData = {
      recipient: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      title: `Key Return Reminder - ${keyCount} Key${keyCount > 1 ? 's' : ''} Pending`,
      message: `You have ${keyCount} unreturned key${keyCount > 1 ? 's' : ''}: ${keyList}. Please return ${keyCount > 1 ? 'them' : 'it'} as soon as possible.`,
      type: 'key_reminder',
      priority: 'high',
      metadata: {
        keyCount,
        keyIds: unreturnedKeys.map(key => key._id),
        reminderType: 'daily_5pm'
      }
    };

    return await createAndSendNotification(notificationData, { email: true, realTime: true });
  } catch (error) {
    console.error("❌ Error creating key reminder notification:", error);
    throw error;
  }
};

/**
 * Create security alert notification for watchman (in-app only, no email)
 * @param {Object} facultyUser - The faculty user with unreturned keys
 * @param {Array} unreturnedKeys - Array of unreturned keys
 */
export const createSecurityAlertNotification = async (facultyUser, unreturnedKeys) => {
  try {
    // Get all security users
    const securityUsers = await User.find({ role: 'security', isVerified: true });

    if (!securityUsers || securityUsers.length === 0) {
      console.warn('No security users found to send alert');
      return [];
    }

    const keyCount = unreturnedKeys.length;
    const keyList = unreturnedKeys.map(key => `${key.keyNumber} (${key.keyName})`).join(', ');

    const notifications = [];

    for (const securityUser of securityUsers) {
      const notificationData = {
        recipient: {
          userId: securityUser._id,
          name: securityUser.name,
          email: securityUser.email,
          role: securityUser.role,
        },
        title: `Unreturned Keys Alert`,
        message: `Faculty ${facultyUser.name} has ${keyCount} unreturned key${keyCount > 1 ? 's' : ''}: ${keyList}. Please follow up for key return.`,
        type: 'security_alert',
        priority: 'medium',
        metadata: {
          facultyId: facultyUser._id,
          facultyName: facultyUser.name,
          keyCount,
          keyIds: unreturnedKeys.map(key => key._id)
        }
      };

      // Create notification but do NOT send email to security (email: false)
      try {
        const notification = await createAndSendNotification(notificationData, {
          email: false,
          realTime: true
        });
        notifications.push(notification);
      } catch (err) {
        console.error(`❌ Failed to create security notification for ${securityUser._id}:`, err);
      }
    }

    return notifications;
  } catch (error) {
    console.error("❌ Error creating security alert notification:", error);
    throw error;
  }
};

/**
 * Check for unreturned keys and send 5PM reminders
 * This function is called by the scheduled job
 */
export const checkAndSendKeyReminders = async () => {
  try {
    console.log('🔍 Checking for unreturned keys at 5:00 PM...');

    // Find all unreturned keys
    const unreturnedKeys = await Key.find({
      status: 'unavailable',
      'takenBy.userId': { $ne: null },
      isActive: true
    }).populate('takenBy.userId');

    if (!unreturnedKeys || unreturnedKeys.length === 0) {
      console.log('✅ No unreturned keys found');
      return { facultyNotifications: 0, securityNotifications: 0, totalUnreturnedKeys: 0 };
    }

    // Group keys by faculty user
    const keysByFaculty = {};

    for (const key of unreturnedKeys) {
      const userObj = key?.takenBy?.userId;
      if (!userObj) {
        console.warn(`Key ${key._id} has no takenBy.userId, skipping`);
        continue;
      }
      const userId = userObj._id.toString();
      if (!keysByFaculty[userId]) {
        keysByFaculty[userId] = {
          user: userObj,
          keys: []
        };
      }
      keysByFaculty[userId].keys.push(key);
    }

    let facultyNotificationCount = 0;
    let securityNotificationCount = 0;

    // Send notifications for each faculty with unreturned keys
    for (const [userId, data] of Object.entries(keysByFaculty)) {
      const { user, keys } = data;

      // Send individual pending return notifications for each key
      for (const key of keys) {
        try {
          await createKeyPendingReturnNotification(key, user);
          facultyNotificationCount++;
        } catch (err) {
          console.error(`❌ Failed to send pending return notification for key ${key._id} to ${user._id}:`, err);
        }
      }

      // Send alert to security
      try {
        const securityNotifications = await createSecurityAlertNotification(user, keys);
        securityNotificationCount += (securityNotifications?.length || 0);
      } catch (err) {
        console.error(`❌ Failed to send security alerts for ${user._id}:`, err);
      }
    }

    console.log(`📢 Sent ${facultyNotificationCount} faculty reminders and ${securityNotificationCount} security alerts`);

    return {
      facultyNotifications: facultyNotificationCount,
      securityNotifications: securityNotificationCount,
      totalUnreturnedKeys: unreturnedKeys.length
    };
  } catch (error) {
    console.error("❌ Error checking and sending key reminders:", error);
    throw error;
  }
};

/**
 * Get notifications for a user
 * @param {string} userId - The user ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of notifications
 */
export const getUserNotifications = async (userId, options = {}) => {
  try {
    return await Notification.findForUser(userId, options);
  } catch (error) {
    console.error("❌ Error getting user notifications:", error);
    throw error;
  }
};

/**
 * Mark notification as read
 * @param {string} notificationId - The notification ID
 * @param {string} userId - The user ID (for security)
 * @returns {Promise<Object>} Updated notification
 */
export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOne({
      _id: notificationId,
      'recipient.userId': userId
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return await notification.markAsRead();
  } catch (error) {
    console.error("❌ Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Get unread notification count for a user
 * @param {string} userId - The user ID
 * @returns {Promise<number>} Unread notification count
 */
export const getUnreadNotificationCount = async (userId) => {
  try {
    return await Notification.countUnreadForUser(userId);
  } catch (error) {
    console.error("❌ Error getting unread notification count:", error);
    throw error;
  }
};

/**
 * Cleanup expired notifications
 * @returns {Promise<Object>} Cleanup result
 */
export const cleanupExpiredNotifications = async () => {
  try {
    const result = await Notification.cleanupExpired();
    console.log(`🧹 Cleaned up ${result.deletedCount} expired notifications`);
    return result;
  } catch (error) {
    console.error("❌ Error cleaning up expired notifications:", error);
    throw error;
  }
};

/**
 * Create daily summary notifications for security and admin
 * @returns {Promise<Object>} Summary of notifications sent
 */
export const createDailySummaryNotifications = async () => {
  try {
    console.log('🔍 Generating daily summary at 5:20 PM...');

    // Find all unreturned keys with their holders
    const unreturnedKeys = await Key.find({
      status: 'unavailable',
      'takenBy.userId': { $ne: null },
      isActive: true
    }).populate('takenBy.userId');

    // Group keys by department
    const keysByDepartment = {};
    let totalUnreturnedKeys = 0;

    for (const key of unreturnedKeys) {
      totalUnreturnedKeys++;
      const department = key.department || 'Unknown Department';
      if (!keysByDepartment[department]) {
        keysByDepartment[department] = [];
      }
      keysByDepartment[department].push({
        keyNumber: key.keyNumber,
        keyName: key.keyName,
        holder: key.takenBy?.userId?.name || 'Unknown',
        holderId: key.takenBy?.userId?._id,
        takenAt: key.takenBy?.timestamp
      });
    }

    // Generate summary message
    let summaryMessage = `Daily Key Return Summary\n\n`;
    summaryMessage += `Total Unreturned Keys: ${totalUnreturnedKeys}\n\n`;

    for (const [department, keys] of Object.entries(keysByDepartment)) {
      summaryMessage += `${department} (${keys.length} keys):\n`;
      keys.forEach(k => {
        summaryMessage += `• Key ${k.keyNumber} (${k.keyName}) - Held by ${k.holder}\n`;
      });
      summaryMessage += '\n';
    }

    // Get all security and admin users
    const [securityUsers, adminUsers] = await Promise.all([
      User.find({ role: 'security', isVerified: true }),
      User.find({ role: 'admin', isVerified: true })
    ]);

    const notifications = [];

    // Send to security users
    for (const user of securityUsers || []) {
      const notificationData = {
        recipient: {
          userId: user._id,
          name: user.name,
          email: user.email,
          role: 'security',
        },
        title: `Daily Key Return Summary - ${totalUnreturnedKeys} Keys Pending`,
        message: summaryMessage,
        type: 'key_summary',
        priority: 'medium',
        metadata: {
          totalKeys: totalUnreturnedKeys,
          departmentSummary: keysByDepartment,
          generatedAt: new Date().toISOString()
        }
      };

      try {
        const notification = await createAndSendNotification(notificationData, {
          email: true,
          realTime: true
        });
        notifications.push(notification);
      } catch (err) {
        console.error(`❌ Failed to create daily summary notification for security user ${user._id}:`, err);
      }
    }

    // Send to admin users
    for (const user of adminUsers || []) {
      const notificationData = {
        recipient: {
          userId: user._id,
          name: user.name,
          email: user.email,
          role: 'admin',
        },
        title: `Daily Key Return Summary - ${totalUnreturnedKeys} Keys Pending`,
        message: summaryMessage,
        type: 'key_summary',
        priority: 'medium',
        metadata: {
          totalKeys: totalUnreturnedKeys,
          departmentSummary: keysByDepartment,
          generatedAt: new Date().toISOString()
        }
      };

      try {
        const notification = await createAndSendNotification(notificationData, {
          email: true,
          realTime: true
        });
        notifications.push(notification);
      } catch (err) {
        console.error(`❌ Failed to create daily summary notification for admin user ${user._id}:`, err);
      }
    }

    console.log(`✅ Sent daily summary to ${securityUsers.length} security and ${adminUsers.length} admin users`);
    return {
      totalNotifications: notifications.length,
      totalUnreturnedKeys,
      securityRecipients: securityUsers.length,
      adminRecipients: adminUsers.length
    };
  } catch (error) {
    console.error("❌ Error creating daily summary notifications:", error);
    throw error;
  }
};
