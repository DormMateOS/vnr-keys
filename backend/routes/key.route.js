import express from "express";
import {
  getAllKeys,
  getAvailableKeys,
  getUnavailableKeys,
  getMyTakenKeys,
  getAllTakenKeys,
  getFrequentlyUsedKeys,
  getUserFrequentlyUsedKeys,
  getKeyById,
  takeKey,
  returnKey,
  collectiveReturnKey,
  createKey,
  updateKey,
  deleteKey,
  toggleFrequentlyUsed,
  qrScanReturn,
  qrScanRequest,
  manualAssignKey,
  // cleanupInactiveKeys,
} from "../controllers/key.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { rolePermissions } from "../middleware/roleAuth.js";

const router = express.Router();

// All key routes require authentication
router.use(verifyToken);

// GET routes - accessible to all authenticated users
router.get("/", getAllKeys); // Get all keys with optional filtering
router.get("/available", getAvailableKeys); // Get available keys
router.get("/unavailable", getUnavailableKeys); // Get unavailable keys
router.get("/my-taken", getMyTakenKeys); // Get keys taken by current user
router.get("/all-taken", rolePermissions.adminOrSecurityOrFaculty, getAllTakenKeys); // Get all taken keys (for collective return)
router.get("/frequently-used", getFrequentlyUsedKeys); // Get frequently used keys
router.get("/my-frequently-used", getUserFrequentlyUsedKeys); // Get user's frequently used keys

// POST routes - specific routes MUST come before parameterized routes
router.post("/", rolePermissions.adminOrSecurity, createKey); // Create new key (admin or security)
// router.post("/cleanup", rolePermissions.admin, cleanupInactiveKeys); // Cleanup inactive keys (admin only) - temporarily disabled

// Add debugging middleware for QR scan routes
router.use("/qr-scan/*", (req, res, next) => {
  console.log('🔍 QR scan route hit:', req.originalUrl, req.method);
  next();
});

// Test endpoint to verify routing
router.post("/qr-scan/test", (req, res) => {
  console.log('✅ QR scan test endpoint hit successfully');
  res.json({ success: true, message: "QR scan routing is working correctly" });
});

// Alternative route patterns to avoid conflicts
router.post("/qr-scan-return", rolePermissions.adminOrSecurity, qrScanReturn); // QR scan return (security/admin only)
router.post("/qr-scan-request", rolePermissions.adminOrSecurity, qrScanRequest); // QR scan request (security/admin only)

// Keep original routes for backward compatibility
router.post("/qr-scan/return", rolePermissions.adminOrSecurity, qrScanReturn); // QR scan return (security/admin only)
router.post("/qr-scan/request", rolePermissions.adminOrSecurity, qrScanRequest); // QR scan request (security/admin only)

// Parameterized routes - MUST come after all specific routes
// Add debugging middleware for parameterized routes
router.use("/:keyId/*", (req, res, next) => {
  console.log('🔍 Parameterized route hit:', req.originalUrl, req.method, 'keyId:', req.params.keyId);
  next();
});

router.post("/:keyId/take", rolePermissions.adminOrFaculty, takeKey); // Take a key (faculty/admin)
router.post("/:keyId/manual-assign", rolePermissions.adminOrSecurity, manualAssignKey); // Manually assign a key (admin/security only)
router.post("/:keyId/return", returnKey); // Return a key (any user can return their own key, security/admin can return any)
router.post("/:keyId/collective-return", rolePermissions.adminOrSecurityOrFaculty, collectiveReturnKey); // Volunteer Key Return (security/faculty/admin)
router.post("/:keyId/toggle-frequent", toggleFrequentlyUsed); // Toggle frequently used status

// GET routes with parameters - MUST come after specific routes
router.get("/:keyId", getKeyById); // Get single key by ID

// PUT routes with parameters
router.put("/:keyId", rolePermissions.adminOrSecurity, updateKey); // Update key (admin or security)

// DELETE routes
router.delete("/:keyId", rolePermissions.adminOrSecurity, deleteKey); // Delete key (admin or security)



export default router;
