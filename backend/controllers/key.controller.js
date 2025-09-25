import mongoose from "mongoose";
import Key from "../models/key.model.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/errorHandler.js";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from "../utils/errorHandler.js";
import {
  emitKeyTaken,
  emitKeyReturned,
  emitKeyCreated,
  emitKeyUpdated,
  emitKeyDeleted,
  emitFrequentlyUsedToggled,
  emitQRScanReturn,
  emitQRScanRequest
} from "../services/socketService.js";
import AuditService from "../services/auditService.js";

/**
 * Get all keys with optional filtering (respects user department access)
 */
export const getAllKeys = asyncHandler(async (req, res) => {
  const { status, category, search, frequentlyUsed } = req.query;

  // Get user to apply department-based filtering
  const user = await User.findById(req.userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Start with keys accessible to the user
  let keysQuery = Key.findAccessibleToUser(user);

  // Apply additional filters
  const additionalFilters = {};
  if (status) additionalFilters.status = status;
  if (category) additionalFilters.category = category;
  if (frequentlyUsed === 'true') additionalFilters.frequentlyUsed = true;

  // Apply additional filters if any
  if (Object.keys(additionalFilters).length > 0) {
    keysQuery = keysQuery.find(additionalFilters);
  }

  // Search functionality
  if (search) {
    keysQuery = keysQuery.find({
      $or: [
        { keyNumber: { $regex: search, $options: 'i' } },
        { keyName: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ]
    });
  }

  const keys = await keysQuery
    .populate('takenBy.userId', 'name email')
    .sort({ keyNumber: 1 });

  res.status(200).json({
    success: true,
    message: "Keys retrieved successfully",
    data: {
      keys,
      total: keys.length,
    },
  });
});

/**
 * Get available keys (respects user department access)
 */
export const getAvailableKeys = asyncHandler(async (req, res) => {
  // Get user to apply department-based filtering
  const user = await User.findById(req.userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const keys = await Key.findAvailableForUser(user)
    .sort({ keyNumber: 1 });

  res.status(200).json({
    success: true,
    message: "Available keys retrieved successfully",
    data: {
      keys,
      total: keys.length,
    },
  });
});

/**
 * Get unavailable keys
 */
export const getUnavailableKeys = asyncHandler(async (req, res) => {
  const keys = await Key.findUnavailable()
    .populate('takenBy.userId', 'name email')
    .sort({ takenAt: -1 });
  
  res.status(200).json({
    success: true,
    message: "Unavailable keys retrieved successfully",
    data: {
      keys,
      total: keys.length,
    },
  });
});

/**
 * Get keys taken by current user
 */
export const getMyTakenKeys = asyncHandler(async (req, res) => {
  const keys = await Key.findTakenByUser(req.userId)
    .sort({ takenAt: -1 });

  res.status(200).json({
    success: true,
    message: "Your taken keys retrieved successfully",
    data: {
      keys,
      total: keys.length,
    },
  });
});

/**
 * Get all currently taken keys (for collective return interface)
 * Only accessible to Security, Faculty, and Admin
 */
export const getAllTakenKeys = asyncHandler(async (req, res) => {
  // Verify user has permission to view all taken keys
  if (req.userRole !== 'admin' && req.userRole !== 'security' && req.userRole !== 'faculty') {
    throw new ValidationError("Only Security, Faculty, or Admin users can view all taken keys");
  }

  const keys = await Key.findUnavailable()
    .populate('takenBy.userId', 'name email role department')
    .sort({ takenAt: -1 });

  res.status(200).json({
    success: true,
    message: "All taken keys retrieved successfully",
    data: {
      keys,
      total: keys.length,
    },
  });
});

/**
 * Get frequently used keys
 */
export const getFrequentlyUsedKeys = asyncHandler(async (req, res) => {
  const keys = await Key.findFrequentlyUsed()
    .sort({ keyNumber: 1 });
  
  res.status(200).json({
    success: true,
    message: "Frequently used keys retrieved successfully",
    data: {
      keys,
      total: keys.length,
    },
  });
});

/**
 * Get user's most frequently used keys based on usage count
 */
export const getUserFrequentlyUsedKeys = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Get user's key usage data
  const keyUsage = user.keyUsage || new Map();
  
  // Convert Map to array and sort by usage count (descending)
  const sortedKeyUsage = Array.from(keyUsage.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10); // Limit to top 10 keys

  if (sortedKeyUsage.length === 0) {
    return res.status(200).json({
      success: true,
      message: "No frequently used keys found",
      data: {
        keys: [],
        total: 0,
      },
    });
  }

  // Get the key IDs
  const keyIds = sortedKeyUsage.map(([keyId]) => keyId);

  // Fetch the actual key data
  const keys = await Key.find({
    _id: { $in: keyIds },
  }).sort({ keyNumber: 1 });

  // Create a mapping from keyId to usage count for response
  const usageCounts = Object.fromEntries(sortedKeyUsage);

  res.status(200).json({
    success: true,
    message: "User frequently used keys retrieved successfully",
    data: {
      keys,
      usageCounts,
      total: keys.length,
    },
  });
});

/**
 * Get a single key by ID
 */
export const getKeyById = asyncHandler(async (req, res) => {
  const { keyId } = req.params;

  const key = await Key.findById(keyId)
    .populate('takenBy.userId', 'name email');

  if (!key) {
    throw new NotFoundError("Key not found");
  }

  res.status(200).json({
    success: true,
    message: "Key retrieved successfully",
    data: { key },
  });
});

/**
 * Take a key (for faculty/admin)
 */
export const takeKey = asyncHandler(async (req, res) => {
  const { keyId } = req.params;

  const key = await Key.findById(keyId);
  if (!key) {
    throw new NotFoundError("Key not found");
  }

  if (key.status === 'unavailable') {
    throw new ConflictError("Key is already taken");
  }

  const user = await User.findById(req.userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  await key.takeKey(user);

  // Log the take operation
  await AuditService.logKeyTaken(key, user, req);

  // Create a detailed logbook entry for key taken
  const Logbook = mongoose.model('Logbook');
  await Logbook.create({
    keyNumber: key.keyNumber,
    keyName: key.keyName,
    location: key.location,
    status: 'unavailable',
    category: key.category,
    department: key.department,
    block: key.block,
    description: key.description,
    takenBy: {
      userId: user._id,
      name: user.name,
      email: user.email
    },
    takenAt: new Date(),
    returnedAt: null,
    frequentlyUsed: key.frequentlyUsed,
    isActive: true,
    recordedBy: {
      userId: user._id,
      role: user.role
    }
  });

  // Create notification for key taken
  try {
    const { createKeyTakenNotification } = await import('../services/notificationService.js');
    await createKeyTakenNotification(key, user);
  } catch (notificationError) {
    console.error('❌ Error sending key taken notification:', notificationError);
  }

  // Increment usage count for the user
  if (!user.keyUsage) {
    user.keyUsage = new Map();
  }
  const currentCount = user.keyUsage.get(keyId) || 0;
  user.keyUsage.set(keyId, currentCount + 1);
  await user.save();

  // Emit real-time update
  emitKeyTaken(key, req.userId);

  res.status(200).json({
    success: true,
    message: `Key ${key.keyNumber} (${key.keyName}) taken successfully`,
    data: { key },
  });
});

/**
 * Return a key (user who took it, or security/admin)
 */
export const returnKey = asyncHandler(async (req, res) => {
  const { keyId } = req.params;

  const key = await Key.findById(keyId);
  if (!key) {
    throw new NotFoundError("Key not found");
  }

  if (key.status === 'available') {
    throw new ConflictError("Key is already available");
  }

  // Only the taker, security, or admin can return
  if (
    req.userRole !== 'admin' &&
    req.userRole !== 'security' &&
    key.takenBy?.userId?.toString() !== req.userId
  ) {
    throw new ValidationError("You can only return keys you have taken");
  }

  // Get the original user who had the key for audit logging
  const originalUser = key.takenBy?.userId ? await User.findById(key.takenBy.userId) : null;
  const returnedBy = await User.findById(req.userId);

  await key.returnKey(returnedBy);

  // Create notifications based on who is returning the key
  try {
    console.log('🔄 Starting notification process for key return...');
    console.log('Original user:', originalUser ? { id: originalUser._id, name: originalUser.name } : 'null');
    console.log('Returned by:', returnedBy ? { id: returnedBy._id, name: returnedBy.name } : 'null');

    const { createKeySelfReturnedNotification, createKeyPendingReturnNotification } = await import('../services/notificationService.js');
    
    if (originalUser && returnedBy) {
      if (originalUser._id.toString() === returnedBy._id.toString()) {
        // Key returned by original taker
        console.log('📢 Self-return detected, creating self-return notification');
        const notification = await createKeySelfReturnedNotification(key, originalUser);
        console.log('✅ Self-return notification created:', notification._id);
      } else {
        // If key is being returned by someone else and it's after hours, send a pending notification
        console.log('📢 Return by different user detected, checking time...');
        const now = new Date();
        const keyTakenTime = new Date(key.takenAt);
        if (keyTakenTime.getDate() === now.getDate() && now.getHours() >= 17) {
          console.log('📢 After-hours return detected, creating pending notification');
          const notification = await createKeyPendingReturnNotification(key, originalUser);
          console.log('✅ Pending notification created:', notification._id);
        }
      }
    } else {
      console.log('⚠️ Missing user information for notification:', { originalUser: !!originalUser, returnedBy: !!returnedBy });
    }
  } catch (notificationError) {
    console.error('❌ Error sending key return notification:', notificationError);
    console.error('Error stack:', notificationError.stack);
  }

  // Log the return operation
  await AuditService.logKeyReturned(key, returnedBy, req, originalUser);

  // Create a detailed logbook entry for key return
  const Logbook = mongoose.model('Logbook');
  await Logbook.create({
    keyNumber: key.keyNumber,
    keyName: key.keyName,
    location: key.location,
    status: 'available',
    category: key.category,
    department: key.department,
    block: key.block,
    description: key.description,
    takenBy: originalUser ? {
      userId: originalUser._id,
      name: originalUser.name,
      email: originalUser.email
    } : null,
    takenAt: key.takenAt,
    returnedBy: {
      userId: returnedBy._id,
      name: returnedBy.name,
      email: returnedBy.email
    },
    returnedAt: new Date(),
    frequentlyUsed: key.frequentlyUsed,
    isActive: true,
    recordedBy: {
      userId: returnedBy._id,
      role: returnedBy.role
    }
  });

  // Emit real-time update
  emitKeyReturned(key, req.userId);

  res.status(200).json({
    success: true,
    message: `Key ${key.keyNumber} (${key.keyName}) returned successfully`,
    data: { key },
  });
});

/**
 * Volunteer Key Return - allows Security and Faculty to return any key
 */
export const collectiveReturnKey = asyncHandler(async (req, res) => {
  const { keyId } = req.params;
  const { reason } = req.body;

  // Verify user has permission for collective returns (Security or Faculty)
  if (req.userRole !== 'admin' && req.userRole !== 'security' && req.userRole !== 'faculty') {
    throw new ValidationError("Only Security, Faculty, or Admin users can perform Volunteer Key Returns");
  }

  const key = await Key.findById(keyId);
  if (!key) {
    throw new NotFoundError("Key not found");
  }

  if (key.status === 'available') {
    throw new ConflictError("Key is already available");
  }

  // Get the original user who had the key
  const originalUser = key.takenBy?.userId ? await User.findById(key.takenBy.userId) : null;
  const returnedBy = await User.findById(req.userId);

  if (!returnedBy) {
    throw new NotFoundError("User not found");
  }

  // Store original user info before returning the key
  const originalUserInfo = originalUser ? {
    id: originalUser._id,
    name: originalUser.name,
    email: originalUser.email,
    role: originalUser.role
  } : null;

  await key.returnKey(returnedBy);

  // Send appropriate notification based on who is returning the key
  try {
    const { createKeySelfReturnedNotification, createKeyPendingReturnNotification } = await import('../services/notificationService.js');

    if (originalUser && returnedBy) {
      if (originalUser._id.toString() === returnedBy._id.toString()) {
        // Original faculty volunteering to return their own key
        await createKeySelfReturnedNotification(key, originalUser);
      } else {
        // Send pending notification if key is being returned after hours
        const now = new Date();
        const keyTakenTime = new Date(key.takenAt);
        if (keyTakenTime.getDate() === now.getDate() && now.getHours() >= 17) {
          await createKeyPendingReturnNotification(key, originalUser);
        }
      }
    }
  } catch (notificationError) {
    console.error('❌ Error sending key return notification:', notificationError);
  }

  // Log the Volunteer Key Return operation with additional metadata
  await AuditService.logKeyReturned(key, returnedBy, req, originalUser, {
    reason: reason || "Volunteer Key Return",
    isCollectiveReturn: true
  });

  // Emit real-time update
  emitKeyReturned(key, req.userId);

  res.status(200).json({
    success: true,
    message: `Key ${key.keyNumber} (${key.keyName}) returned successfully via collective return`,
    data: {
      key,
      originalUser: originalUserInfo,
      returnedBy: {
        id: returnedBy._id,
        name: returnedBy.name,
        email: returnedBy.email,
        role: returnedBy.role
      },
      reason: reason || "Volunteer Key Return"
    },
  });
});

/**
 * Create a new key (admin or security)
 */
export const createKey = asyncHandler(async (req, res) => {
  const {
    keyNumber,
    keyName,
    location,
    description,
    category,
    block,
    frequentlyUsed,
  } = req.body;

  // Check if key number already exists (only check active keys)
  const existingKey = await Key.findOne({ keyNumber, isActive: true });
  if (existingKey) {
    throw new ConflictError("Key number already exists");
  }

  const key = new Key({
    keyNumber,
    keyName,
    location,
    description,
    category,
    block,
    frequentlyUsed: frequentlyUsed || false,
  });

  await key.save();

  // Emit real-time update
  emitKeyCreated(key, req.userId);

  res.status(201).json({
    success: true,
    message: "Key created successfully",
    data: { key },
  });
});

/**
 * Update a key (admin only)
 */
export const updateKey = asyncHandler(async (req, res) => {
  const { keyId } = req.params;
  const updates = req.body;
  
  const key = await Key.findById(keyId);
  if (!key) {
    throw new NotFoundError("Key not found");
  }
  
  // If updating key number, check for duplicates (only check active keys)
  if (updates.keyNumber && updates.keyNumber !== key.keyNumber) {
    const existingKey = await Key.findOne({ keyNumber: updates.keyNumber, isActive: true });
    if (existingKey) {
      throw new ConflictError("Key number already exists");
    }
  }
  
  Object.assign(key, updates);
  await key.save();
  
  res.status(200).json({
    success: true,
    message: "Key updated successfully",
    data: { key },
  });
});

/**
 * Delete a key (admin only) - soft delete by default, hard delete with ?hard=true
 */
export const deleteKey = asyncHandler(async (req, res) => {
  const { keyId } = req.params;
  const { hard } = req.query; // Check for hard delete parameter

  const key = await Key.findById(keyId);
  if (!key) {
    throw new NotFoundError("Key not found");
  }

  // Check if key is currently taken
  if (key.status === 'unavailable') {
    throw new ConflictError("Cannot delete a key that is currently taken. Please return the key first.");
  }

  if (hard === 'true') {
    // Hard delete - completely remove from database
    await Key.findByIdAndDelete(keyId);

    // Emit real-time update
    emitKeyDeleted(key, req.userId);

    res.status(200).json({
      success: true,
      message: "Key permanently deleted successfully",
      data: { keyId, deleted: true },
    });
  } else {
    // Soft delete - mark as inactive
    key.isActive = false;
    await key.save();

    // Emit real-time update
    emitKeyDeleted(key, req.userId);

    res.status(200).json({
      success: true,
      message: "Key deleted successfully (soft delete)",
      data: { key },
    });
  }
});

/**
 * Toggle frequently used status
 */
export const toggleFrequentlyUsed = asyncHandler(async (req, res) => {
  const { keyId } = req.params;

  const key = await Key.findById(keyId);
  if (!key) {
    throw new NotFoundError("Key not found");
  }

  key.frequentlyUsed = !key.frequentlyUsed;
  await key.save();

  // Emit real-time update
  emitFrequentlyUsedToggled(key, req.userId);

  res.status(200).json({
    success: true,
    message: `Key ${key.frequentlyUsed ? 'added to' : 'removed from'} frequently used`,
    data: { key },
  });
});

/**
 * Handle QR code scan for key return (security/admin only)
 */
export const qrScanReturn = asyncHandler(async (req, res) => {
  console.log('🔍 qrScanReturn function called');
  console.log('🔍 Request URL:', req.originalUrl);
  console.log('🔍 Request method:', req.method);
  console.log('🔍 Request body:', req.body);

  const { qrData } = req.body;

  if (!qrData) {
    console.log('❌ No QR data provided');
    throw new ValidationError("QR data is required");
  }

  // Parse QR data
  let parsedData;
  try {
    parsedData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    console.log('✅ Parsed QR data:', parsedData);
  } catch (error) {
    console.log('❌ QR data parsing error:', error);
    throw new ValidationError("Invalid QR code format");
  }

  const { keyId, userId, returnId } = parsedData;
  console.log('🔍 Extracted IDs:', { keyId, userId, returnId });

  if (!keyId || !userId || !returnId) {
    console.log('❌ Missing required fields');
    throw new ValidationError("Invalid QR code data - missing required fields");
  }

  // Validate MongoDB ObjectId format
  console.log('🔍 Validating ObjectId formats...');
  if (!mongoose.Types.ObjectId.isValid(keyId)) {
    console.log('❌ Invalid keyId format:', keyId);
    throw new ValidationError("Invalid key ID format");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.log('❌ Invalid userId format:', userId);
    throw new ValidationError("Invalid user ID format");
  }

  console.log('✅ ObjectId validation passed');

  // Find the key
  console.log('🔍 Looking up key with ID:', keyId);
  const key = await Key.findById(keyId);
  if (!key) {
    console.log('❌ Key not found with ID:', keyId);
    throw new NotFoundError("Key not found");
  }
  console.log('✅ Key found:', key.keyNumber, key.keyName, 'Status:', key.status);

  // Verify the key is currently taken by the specified user
  if (key.status === 'available') {
    console.log('❌ Key is already available');
    throw new ConflictError("Key is already available");
  }

  console.log('🔍 Checking if key is taken by user:', userId);
  console.log('🔍 Key takenBy:', key.takenBy);
  if (!key.takenBy.userId || key.takenBy.userId.toString() !== userId) {
    console.log('❌ Key is not taken by the specified user');
    console.log('🔍 Expected userId:', userId);
    console.log('🔍 Actual takenBy.userId:', key.takenBy.userId?.toString());
    throw new ValidationError("Key is not currently taken by the specified user");
  }

  // Get the original user who took the key
  console.log('🔍 Looking up original user with ID:', userId);
  const originalUser = await User.findById(userId);
  if (!originalUser) {
    console.log('❌ Original user not found with ID:', userId);
    throw new NotFoundError("Original user not found");
  }
  console.log('✅ Original user found:', originalUser.name, originalUser.email);

  // Get the user performing the return (from QR code's returnId)
  console.log('🔍 Looking up returning user with ID:', returnId);
  const returnedBy = await User.findById(returnId);
  if (!returnedBy) {
    console.log('❌ Returning user not found with ID:', returnId);
    throw new NotFoundError("Returning user not found");
  }
  console.log('✅ Returning user found:', returnedBy.name);

  // Return the key
  await key.returnKey(returnedBy);

  // Create a detailed logbook entry for QR-based key return
  const Logbook = mongoose.model('Logbook');
  await Logbook.create({
    keyNumber: key.keyNumber,
    keyName: key.keyName,
    location: key.location,
    status: 'available',
    category: key.category,
    department: key.department,
    block: key.block,
    description: key.description,
    takenBy: {
      userId: originalUser._id,
      name: originalUser.name,
      email: originalUser.email
    },
    takenAt: key.takenAt,
    returnedBy: {
      userId: returnedBy._id,
      name: returnedBy.name,
      email: returnedBy.email
    },
    returnedAt: new Date(),
    frequentlyUsed: key.frequentlyUsed,
    isActive: true,
    recordedBy: {
      userId: req.userId,
      role: req.userRole
    }
  });

  // Send notification based on who is returning the key
  try {
    console.log('🔵 Processing return notification...');
    const returnedBy = await User.findById(req.userId);
    console.log('🔵 Return processed by:', returnedBy.name);

    const { createKeySelfReturnedNotification, createKeyReturnedNotification, createKeyPendingReturnNotification } = 
      await import('../services/notificationService.js');

    if (originalUser) {
      console.log('🔵 Processing notification for original user:', originalUser.name);
      
      if (originalUser._id.toString() === returnedBy._id.toString()) {
        // Original faculty returning their own key
        console.log('🔵 Self-return detected, creating self-return notification');
        await createKeySelfReturnedNotification(key, originalUser);
        console.log('✅ Self-return notification created');
      } else {
        // Security or another user returning the key
        console.log('🔵 Return by other user detected, creating return notification');
        await createKeyReturnedNotification(key, originalUser, returnedBy);
        console.log('✅ Return notification created');

        // Also send pending notification if key was overdue
        const now = new Date();
        const keyTakenTime = new Date(key.takenAt);
        if (keyTakenTime.getDate() === now.getDate() && now.getHours() >= 17) {
          console.log('🔵 After-hours return detected, creating pending notification');
          await createKeyPendingReturnNotification(key, originalUser);
          console.log('✅ Pending notification created');
        }
      }
    }
  } catch (notificationError) {
    console.error('❌ Error sending key return notification:', notificationError);
  }

  // Emit real-time update for QR scan return
  emitQRScanReturn(key, req.userId, userId);

  res.status(200).json({
    success: true,
    message: `Key ${key.keyNumber} (${key.keyName}) returned successfully via QR scan`,
    data: {
      key,
      originalUser: {
        id: originalUser._id,
        name: originalUser.name,
        email: originalUser.email
      },
      scannedBy: {
        id: returnedBy._id,
        name: returnedBy.name,
        email: returnedBy.email,
        role: returnedBy.role
      }
    },
  });
});

/**
 * Handle QR code scan for key request (security/admin only)
 */
export const qrScanRequest = asyncHandler(async (req, res) => {
  const { qrData } = req.body;

  if (!qrData) {
    throw new ValidationError("QR data is required");
  }

  // Parse QR data
  let parsedData;
  try {
    parsedData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
  } catch (error) {
    throw new ValidationError("Invalid QR code format");
  }

  const { keyId, userId, requestId } = parsedData;

  if (!keyId || !userId || !requestId) {
    throw new ValidationError("Invalid QR code data - missing required fields");
  }

  // Validate MongoDB ObjectId format
  if (!mongoose.Types.ObjectId.isValid(keyId)) {
    throw new ValidationError("Invalid key ID format");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ValidationError("Invalid user ID format");
  }

  // Find the key
  const key = await Key.findById(keyId);
  if (!key) {
    throw new NotFoundError("Key not found");
  }

  // Verify the key is available
  if (key.status === 'unavailable') {
    throw new ConflictError("Key is already taken");
  }

  // Get the user who requested the key
  const requestingUser = await User.findById(userId);
  if (!requestingUser) {
    throw new NotFoundError("Requesting user not found");
  }

  // Take the key for the requesting user
  await key.takeKey(requestingUser);

  // Create a detailed logbook entry for QR-based key request
  const Logbook = mongoose.model('Logbook');
  await Logbook.create({
    keyNumber: key.keyNumber,
    keyName: key.keyName,
    location: key.location,
    status: 'unavailable',
    category: key.category,
    department: key.department,
    block: key.block,
    description: key.description,
    takenBy: {
      userId: requestingUser._id,
      name: requestingUser.name,
      email: requestingUser.email
    },
    takenAt: new Date(),
    returnedAt: null,
    frequentlyUsed: key.frequentlyUsed,
    isActive: true,
    recordedBy: {
      userId: req.userId,
      role: req.userRole
    }
  });

  // Create notification for key taken
  try {
    const { createKeyTakenNotification } = await import('../services/notificationService.js');
    await createKeyTakenNotification(key, requestingUser);
    console.log('✅ Key taken notification created for user:', requestingUser.name);
  } catch (notificationError) {
    console.error('❌ Error sending key taken notification:', notificationError);
  }

  // Increment usage count for the requesting user
  if (!requestingUser.keyUsage) {
    requestingUser.keyUsage = new Map();
  }
  const currentCount = requestingUser.keyUsage.get(keyId) || 0;
  requestingUser.keyUsage.set(keyId, currentCount + 1);
  await requestingUser.save();

  // Emit real-time update for QR scan request
  emitQRScanRequest(key, req.userId, userId);

  res.status(200).json({
    success: true,
    message: `Key ${key.keyNumber} (${key.keyName}) assigned successfully via QR scan`,
    data: {
      key,
      requestingUser: {
        id: requestingUser._id,
        name: requestingUser.name,
        email: requestingUser.email
      },
      scannedBy: {
        id: req.userId,
        name: req.userName || 'Security',
        role: req.userRole
      }
    },
  });
});

/**
 * Cleanup inactive keys (admin only) - permanently delete keys that have been inactive for more than 30 days
 */
export const cleanupInactiveKeys = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Find inactive keys older than 30 days
  const inactiveKeys = await Key.find({
    isActive: false,
    updatedAt: { $lt: thirtyDaysAgo }
  });

  if (inactiveKeys.length === 0) {
    return res.status(200).json({
      success: true,
      message: "No inactive keys found for cleanup",
      data: { deletedCount: 0 }
    });
  }

  // Delete the inactive keys
  const result = await Key.deleteMany({
    isActive: false,
    updatedAt: { $lt: thirtyDaysAgo }
  });

  res.status(200).json({
    success: true,
    message: `Cleanup completed: ${result.deletedCount} inactive keys permanently deleted`,
    data: {
      deletedCount: result.deletedCount,
      deletedKeys: inactiveKeys.map(key => ({ keyNumber: key.keyNumber, keyName: key.keyName }))
    }
  });
});
