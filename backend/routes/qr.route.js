import express from "express";
import { rolePermissions } from '../middleware/roleAuth.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { asyncHandler } from '../utils/errorHandler.js';
import Key from '../models/key.model.js';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errorHandler.js';
import mongoose from 'mongoose';
import User from '../models/user.model.js';
import { Logbook } from '../models/logbook.model.js';
import { emitKeyReturned } from '../services/socketService.js';
import AuditService from '../services/auditService.js';

const router = express.Router();

// Apply token verification middleware to all routes
router.use(verifyToken);

/**
 * Process a batch QR scan key return
 * POST /api/qr/batch-return
 */
router.post("/batch-return", rolePermissions.adminOrSecurity, asyncHandler(async (req, res) => {
  console.log('Processing QR return request:', req.body);
  
  const { qrData } = req.body;
  
  if (!qrData) {
    throw new ValidationError("QR data is required");
  }

  // Parse QR data if it's a string
  let parsedData;
  try {
    parsedData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    console.log('Parsed QR data:', parsedData);
  } catch (err) {
    console.error('QR data parsing error:', err);
    throw new ValidationError("Invalid QR data format - must be valid JSON");
  }

  // Basic structure validation
  if (!parsedData.type) {
    throw new ValidationError("QR data must include 'type' field");
  }

  // Handle different QR schemas based on type
  let keyIdsToProcess = [];
  let userId;

  switch (parsedData.type) {
    case 'batch-return':
      // Validate batch return schema
      if (!parsedData.keyIds || !Array.isArray(parsedData.keyIds)) {
        throw new ValidationError("Batch return QR must include keyIds array");
      }
      if (!parsedData.userId) {
        throw new ValidationError("Batch return QR must include userId");
      }
      if (!parsedData.timestamp) {
        throw new ValidationError("Batch return QR must include timestamp");
      }
      if (!parsedData.returnId) {
        throw new ValidationError("Batch return QR must include returnId");
      }

      userId = parsedData.userId;
      keyIdsToProcess = parsedData.keyIds;
      break;

    case 'key-return':
      // Support single key return format
      if (!parsedData.keyId) {
        throw new ValidationError("Key return QR must include keyId");
      }
      if (!parsedData.userId) {
        throw new ValidationError("Key return QR must include userId");
      }
      if (!parsedData.timestamp) {
        throw new ValidationError("Key return QR must include timestamp");
      }
      if (!parsedData.returnId) {
        throw new ValidationError("Key return QR must include returnId");
      }

      userId = parsedData.userId;
      keyIdsToProcess = [parsedData.keyId];
      break;

    default:
      throw new ValidationError(`Unsupported QR type: ${parsedData.type}`);
  }

  // Convert and validate key IDs
  const validatedKeyIds = keyIdsToProcess.map((id, index) => {
    try {
      // Clean the ID and try different formats
      const cleanId = String(id).trim();
      
      // Try direct conversion first
      try {
        return new mongoose.Types.ObjectId(cleanId);
      } catch {
        // If that fails, try to extract ObjectId from the string
        const idMatch = cleanId.match(/([0-9a-fA-F]{24})/);
        if (idMatch) {
          return new mongoose.Types.ObjectId(idMatch[1]);
        }
        throw new Error("No valid ObjectId found");
      }
    } catch (err) {
      throw new ValidationError(`Invalid key ID format at index ${index}: ${id}`);
    }
  });

  if (validatedKeyIds.length === 0) {
    throw new ValidationError("No valid keys provided for return");
  }

  // Validate timestamp and expiry
  const qrTimestamp = new Date(parsedData.timestamp);
  const now = new Date();
  if (isNaN(qrTimestamp.getTime())) {
    throw new ValidationError("Invalid timestamp format");
  }
  
  const timeDiff = Math.abs(now - qrTimestamp) / 1000;
  if (timeDiff > 300) { // 5 minutes expiry
    throw new ValidationError("QR code has expired");
  }

  // Find keys and validate requester
  const [keys, requester] = await Promise.all([
    Key.find({ _id: { $in: validatedKeyIds } }).populate('takenBy.userId'),
    User.findById(userId)
  ]);

  if (!requester) {
    throw new NotFoundError("QR code user not found");
  }

  if (keys.length !== validatedKeyIds.length) {
    throw new NotFoundError("One or more keys not found");
  }

  // Validate key statuses
  const unavailableKeys = keys.filter(key => key.status === 'available');
  if (unavailableKeys.length > 0) {
    throw new ConflictError(
      `Some keys are already available: ${unavailableKeys.map(k => k.keyNumber).join(', ')}`
    );
  }

  // Process returns for all keys
  const returnedBy = await User.findById(parsedData.returnerId || parsedData.userId); // Use the faculty user's ID
  const securityUser = await User.findById(req.userId); // Keep track of security user who processed it

  // Store original users before returning keys
  const keyOriginalUsers = {};
  for (const key of keys) {
    if (key.takenBy && key.takenBy.userId) {
      const originalUser = await User.findById(key.takenBy.userId);
      if (originalUser) {
        keyOriginalUsers[key._id.toString()] = originalUser;
      }
    }
  }

  const returnResults = await Promise.all(keys.map(async (key) => {
    try {
      const originalUser = keyOriginalUsers[key._id.toString()];

      // Return the key with the security user who processed the return
      await key.returnKey(returnedBy);

      // Update the existing logbook entry for batch return (instead of creating new one)
      const existingLogEntry = await Logbook.findOne({
        keyNumber: key.keyNumber,
        status: 'unavailable',
        returnedAt: null
      }).sort({ createdAt: -1 });

      if (existingLogEntry) {
        // Update the existing entry with return information
        existingLogEntry.status = 'available';
        existingLogEntry.returnedBy = {
          userId: returnedBy._id,
          name: returnedBy.name,
          email: returnedBy.email
        };
        existingLogEntry.returnedAt = new Date();
        await existingLogEntry.save();
      } else {
        // Fallback: Create new entry if no existing entry found (shouldn't happen normally)
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
      }

      // Log the return
      await AuditService.logKeyReturned(key, returnedBy, req, originalUser, {
        isBatchReturn: parsedData.type === 'batch-return',
        returnId: parsedData.returnId
      });

      // Emit socket event
      emitKeyReturned(key, req.userId);

      return {
        success: true,
        keyNumber: key.keyNumber,
        keyId: key._id,
        originalUser: originalUser
      };
    } catch (error) {
      console.error(`Error processing key ${key.keyNumber}:`, error);
      return {
        success: false,
        keyNumber: key.keyNumber,
        keyId: key._id,
        error: error.message
      };
    }
  }));

  // Check if any keys failed to process
  const failedKeys = returnResults.filter(result => !result.success);
  if (failedKeys.length > 0) {
    throw new Error(
      `Failed to process some keys: ${failedKeys.map(k => k.keyNumber).join(', ')}`
    );
  }

  // Create notifications for batch return
  try {
    const { createBatchReturnNotifications } = await import('../services/notificationService.js');
    await createBatchReturnNotifications(keys, returnedBy, keyOriginalUsers);
  } catch (notificationError) {
    console.error('❌ Error sending batch return notifications:', notificationError);
  }

  res.status(200).json({
    success: true,
    message: `Successfully returned ${keys.length} key(s)`,
    data: {
      keys: returnResults,
      returnId: parsedData.returnId,
      returnedBy: {
        id: returnedBy._id,
        name: returnedBy.name,
        role: returnedBy.role
      },
      processedAt: new Date().toISOString()
    }
  });
}));

export default router;