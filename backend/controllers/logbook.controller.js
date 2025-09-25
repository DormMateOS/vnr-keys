import { Logbook } from "../models/logbook.model.js";
import { globalErrorHandler } from "../utils/errorHandler.js";

// Create a new logbook entry
export const createLogbookEntry = async (req, res) => {
  try {
    const logData = {
      ...req.body,
      recordedBy: {
        userId: req.user._id,
        role: req.user.role
      }
    };

    const logEntry = new Logbook(logData);
    await logEntry.save();

    res.status(201).json({
      success: true,
      message: "Logbook entry created successfully",
      data: logEntry
    });
  } catch (error) {
    globalErrorHandler(error, req, res);
  }
};

// Get logbook entries (for security personnel and admin)
export const getLogbookEntries = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      department, 
      block,
      keyNumber 
    } = req.query;

    let query = {};

    // Apply filters if provided
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (department) {
      query.department = department;
    }

    if (block) {
      query.block = block;
    }

    if (keyNumber) {
      query.keyNumber = keyNumber;
    }

    // If the user is not an admin, ensure they can only see entries from their department
    if (req.user.role === 'security') {
      if (req.user.department !== 'ADMIN') {
        query.department = req.user.department;
      }
    }

    const entries = await Logbook.find(query)
      .sort({ createdAt: -1 })
      .populate('recordedBy.userId', 'name email')
      .populate('takenBy.userId', 'name email')
      .populate('returnedBy.userId', 'name email');

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    globalErrorHandler(error, req, res);
  }
};

// Get detailed logbook entries (admin only)
export const getAdminLogbookEntries = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      department, 
      block,
      keyNumber,
      recorderRole,
      sortBy,
      sortOrder,
      page = 1,
      limit = 50
    } = req.query;

    let query = {};
    let sort = {};

    // Apply filters if provided
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (department) {
      query.department = department;
    }

    if (block) {
      query.block = block;
    }

    if (keyNumber) {
      query.keyNumber = keyNumber;
    }

    if (recorderRole) {
      query["recordedBy.role"] = recorderRole;
    }

    // Sorting
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Default sort by creation date descending
    }

    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Logbook.countDocuments(query);

    const entries = await Logbook.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('recordedBy.userId', 'name email role department')
      .populate('takenBy.userId', 'name email role department')
      .populate('returnedBy.userId', 'name email role department');

    res.status(200).json({
      success: true,
      data: {
        entries,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    globalErrorHandler(error, req, res);
  }
};

// Get logbook statistics (for admin only)
export const getLogbookStats = async (req, res) => {
  try {
    const stats = await Logbook.aggregate([
      {
        $group: {
          _id: {
            department: "$department",
            block: "$block"
          },
          totalTransactions: { $sum: 1 },
          uniqueKeys: { $addToSet: "$keyNumber" }
        }
      },
      {
        $project: {
          _id: 0,
          department: "$_id.department",
          block: "$_id.block",
          totalTransactions: 1,
          uniqueKeysCount: { $size: "$uniqueKeys" }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    globalErrorHandler(error, req, res);
  }
};