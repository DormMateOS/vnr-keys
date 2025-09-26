import express from "express";
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAsUnread,
  markMultipleAsRead,
  markAllAsRead,
  triggerKeyReminders,
  getNotificationStats,
  cleanupNotifications,
  getNotificationById
} from "../controllers/notification.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { rolePermissions } from "../middleware/roleAuth.js";
import { asyncHandler } from "../utils/errorHandler.js";
import { createDailySummaryNotifications } from "../services/notificationService.js";

const router = express.Router();

// All notification routes require authentication
router.use(verifyToken);

// GET routes - accessible to all authenticated users
router.get("/", getMyNotifications); // Get user's notifications with optional filtering
router.get("/unread-count", getUnreadCount); // Get unread notification count
router.get("/:notificationId", getNotificationById); // Get specific notification by ID

// POST routes - accessible to all authenticated users
router.post("/mark-multiple-read", markMultipleAsRead); // Mark multiple notifications as read

// PUT/PATCH routes - accessible to all authenticated users
router.patch("/:notificationId/read", markAsRead); // Mark specific notification as read
router.patch("/:notificationId/unread", markAsUnread); // Mark specific notification as unread
router.patch("/mark-all-read", markAllAsRead); // Mark all notifications as read


// Admin-only routes
router.post("/trigger-reminders", rolePermissions.adminOnly, triggerKeyReminders); // Manually trigger key reminders
router.get("/admin/stats", rolePermissions.adminOnly, getNotificationStats); // Get notification statistics
router.post("/admin/cleanup", rolePermissions.adminOnly, cleanupNotifications); // Cleanup expired notifications

// Security & Admin route for resending daily summary
router.post(
  "/resend-daily-summary",
  rolePermissions.adminOrSecurity,
  asyncHandler(async (req, res) => {
    // Check if it's after 5:20 PM
    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(17, 20, 0, 0); // 5:20 PM

    if (now < targetTime) {
      return res.status(400).json({
        success: false,
        message: 'Daily summary notifications can only be resent after 5:20 PM'
      });
    }

    // Generate and send notifications ONLY to the requester
    const result = await createDailySummaryNotifications(req.user._id);

    res.status(200).json({
      success: true,
      message: `Successfully sent ${result.totalNotifications} notification(s) about ${result.totalUnreturnedKeys} unreturned keys to you`,
      data: result
    });
  })
);

export default router;
