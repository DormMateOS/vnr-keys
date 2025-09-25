import User from "../models/user.model.js";
import Key from "../models/key.model.js";
import { asyncHandler } from "../utils/errorHandler.js";
import mongoose from "mongoose";

/**
 * Admin Dashboard - Accessible only to admin users
 */
export const getAdminDashboard = asyncHandler(async (req, res) => {
	// Get admin-specific data
	const totalUsers = await User.countDocuments();
	const usersByRole = await User.aggregate([
		{
			$group: {
				_id: "$role",
				count: { $sum: 1 }
			}
		}
	]);

	const recentUsers = await User.find()
		.select('-password -resetPasswordToken -verificationToken')
		.sort({ createdAt: -1 })
		.limit(10);

	const verifiedUsers = await User.countDocuments({ isVerified: true });
	const unverifiedUsers = await User.countDocuments({ isVerified: false });

	// Get key statistics (admin has access to all)
	const totalKeys = await Key.countDocuments();
	const activeKeys = await Key.countDocuments({ isActive: true });
	const keysByDepartment = await Key.aggregate([
		{
			$group: {
				_id: "$department",
				count: { $sum: 1 },
				activeCount: { $sum: { $cond: ["$isActive", 1, 0] } },
			}
		},
		{
			$sort: { _id: 1 }
		}
	]);

	const recentKeys = await Key.find()
		.sort({ createdAt: -1 })
		.limit(5)
		.select('keyNumber keyName department isActive createdAt');

	res.status(200).json({
		success: true,
		message: "Admin dashboard data retrieved successfully",
		data: {
			stats: {
				totalUsers,
				verifiedUsers,
				unverifiedUsers,
				usersByRole: usersByRole.reduce((acc, item) => {
					acc[item._id] = item.count;
					return acc;
				}, {}),
				// Key statistics
				totalKeys,
				activeKeys,
				inactiveKeys: totalKeys - activeKeys,
			},
			recentUsers,
			keyStats: {
				byDepartment: keysByDepartment,
				recentKeys: recentKeys,
			},
			userRole: req.userRole,
			// Admin has access to all departments
			accessibleDepartments: ["CSE", "EEE", "AIML", "IoT", "ECE", "MECH", "CIVIL", "IT", "ADMIN", "RESEARCH"]
		}
	});
});

/**
 * Faculty Dashboard - Accessible to faculty and admin users
 */
export const getFacultyDashboard = asyncHandler(async (req, res) => {
	// Get faculty-specific data
	const currentUser = await User.findById(req.userId).select('-password');
	
	// Mock faculty-specific metrics (replace with actual business logic)
	const facultyStats = {
		activeRequests: 15,
		completedRequests: 42,
		pendingApprovals: 8,
		totalRequests: 65
	};

	res.status(200).json({
		success: true,
		message: "Faculty dashboard data retrieved successfully",
		data: {
			user: currentUser,
			stats: facultyStats,
			userRole: req.userRole
		}
	});

	// Recent activity (mock data - replace with actual activity tracking)
	const recentActivity = [
		{ id: 1, action: "Resolved ticket #1234", timestamp: new Date(Date.now() - 1000 * 60 * 30) },
		{ id: 2, action: "Updated task status", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
		{ id: 3, action: "Created new report", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) }
	];

	res.status(200).json({
		success: true,
		message: "Operator dashboard data retrieved successfully",
		data: {
			user: currentUser,
			stats: operatorStats,
			recentActivity,
			userRole: req.userRole
		}
	});
});

/**
 * Security Dashboard - Accessible to security and admin users
 */
export const getSecurityDashboard = asyncHandler(async (req, res) => {
	// Get security-specific data
	const currentUser = await User.findById(req.userId).select('-password');
	
	// Mock security-specific metrics (replace with actual business logic)
	const securityStats = {
		activeKeys: 25,
		keysInUse: 12,
		pendingReturns: 5,
		totalTransactions: 42
	};

	res.status(200).json({
		success: true,
		message: "Security dashboard data retrieved successfully",
		data: {
			user: currentUser,
			stats: securityStats,
			userRole: req.userRole
		}
	});

	// Recent incidents (mock data - replace with actual incident tracking)
	const recentIncidents = [
		{ 
			id: 1, 
			type: "Emergency", 
			location: "Building A - Floor 3", 
			status: "Active",
			timestamp: new Date(Date.now() - 1000 * 60 * 15)
		},
		{ 
			id: 2, 
			type: "Maintenance", 
			location: "Building B - Parking", 
			status: "Resolved",
			timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1)
		}
	];

	res.status(200).json({
		success: true,
		message: "Responder dashboard data retrieved successfully",
		data: {
			user: currentUser,
			stats: responderStats,
			recentIncidents,
			userRole: req.userRole
		}
	});
});

/**
 * Get current user profile with role information
 */
export const getUserProfile = asyncHandler(async (req, res) => {
	const user = await User.findById(req.userId).select('-password -resetPasswordToken -verificationToken');

	if (!user) {
		return res.status(404).json({
			success: false,
			message: "User not found"
		});
	}

	res.status(200).json({
		success: true,
		message: "User profile retrieved successfully",
		data: {
			user,
			userRole: req.userRole
		}
	});
});

/**
 * Get all users for admin management
 */
export const getAllUsers = asyncHandler(async (req, res) => {
	const { page = 1, limit = 10, search = '', role = '' } = req.query;

	// Build search query
	const searchQuery = {};
	if (search) {
		searchQuery.$or = [
			{ name: { $regex: search, $options: 'i' } },
			{ email: { $regex: search, $options: 'i' } }
		];
	}
	if (role) {
		searchQuery.role = role;
	}

	const users = await User.find(searchQuery)
		.select('-password -resetPasswordToken -verificationToken')
		.sort({ createdAt: -1 })
		.limit(limit * 1)
		.skip((page - 1) * limit);

	const totalUsers = await User.countDocuments(searchQuery);

	// Transform users to use 'id' instead of '_id' for frontend consistency
	const transformedUsers = users.map(user => ({
		id: user._id,
		name: user.name,
		email: user.email,
		role: user.role,
		department: user.department,
		facultyId: user.facultyId,
		avatar: user.avatar,
		isVerified: user.isVerified,
		lastLogin: user.lastLogin,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt
	}));

	res.status(200).json({
		success: true,
		message: "Users retrieved successfully",
		data: {
			users: transformedUsers,
			pagination: {
				currentPage: parseInt(page),
				totalPages: Math.ceil(totalUsers / limit),
				totalUsers,
				hasNext: page * limit < totalUsers,
				hasPrev: page > 1
			}
		}
	});
});

/**
 * Update user information
 */
export const updateUser = asyncHandler(async (req, res) => {
	const { userId } = req.params;
	const { name, email, role } = req.body;

	// Validate input
	if (!name && !email && !role) {
		return res.status(400).json({
			success: false,
			message: "At least one field (name, email, or role) must be provided"
		});
	}

	// Validate role
	const validRoles = ['admin', 'faculty', 'security'];
	if (role && !validRoles.includes(role)) {
		return res.status(400).json({
			success: false,
			message: "Invalid role specified"
		});
	}

	const user = await User.findById(userId);
	if (!user) {
		return res.status(404).json({
			success: false,
			message: "User not found"
		});
	}

	// Prevent admin from changing their own role
	if (userId === req.userId && role && role !== user.role) {
		return res.status(400).json({
			success: false,
			message: "Cannot change your own role"
		});
	}

	// Prepare update object
	const updateData = {};
	const unsetData = {};

	if (name) updateData.name = name;
	if (email) updateData.email = email;
	if (role) {
		updateData.role = role;

		// Clear faculty-specific fields when changing from faculty to other roles
		if (role !== 'faculty') {
			unsetData.department = "";
			unsetData.facultyId = "";
		}
	}

	// Build the update query
	const updateQuery = { $set: updateData };
	if (Object.keys(unsetData).length > 0) {
		updateQuery.$unset = unsetData;
	}

	// Update the user directly in the database
	const updatedUser = await User.findByIdAndUpdate(
		userId,
		updateQuery,
		{ new: true, runValidators: false }
	);

	res.status(200).json({
		success: true,
		message: "User updated successfully",
		data: {
			user: {
				id: updatedUser._id,
				name: updatedUser.name,
				email: updatedUser.email,
				role: updatedUser.role,
				department: updatedUser.department,
				facultyId: updatedUser.facultyId,
				isVerified: updatedUser.isVerified,
				lastLogin: updatedUser.lastLogin,
				createdAt: updatedUser.createdAt
			}
		}
	});
});

/**
 * Delete user (admin only)
 */
export const deleteUser = asyncHandler(async (req, res) => {
	const { userId } = req.params;

	// Prevent admin from deleting themselves
	if (userId === req.userId) {
		return res.status(400).json({
			success: false,
			message: "Cannot delete your own account"
		});
	}

	const user = await User.findById(userId);
	if (!user) {
		return res.status(404).json({
			success: false,
			message: "User not found"
		});
	}

	await User.findByIdAndDelete(userId);

	res.status(200).json({
		success: true,
		message: "User deleted successfully"
	});
});

/**
 * Toggle user verification status
 */
export const toggleUserVerification = asyncHandler(async (req, res) => {
	const { userId } = req.params;

	const user = await User.findById(userId);
	if (!user) {
		return res.status(404).json({
			success: false,
			message: "User not found"
		});
	}

	user.isVerified = !user.isVerified;
	await user.save();

	res.status(200).json({
		success: true,
		message: `User ${user.isVerified ? 'verified' : 'unverified'} successfully`,
		data: {
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				isVerified: user.isVerified,
				lastLogin: user.lastLogin,
				createdAt: user.createdAt
			}
		}
	});
});

/**
 * Get security settings
 */
export const getSecuritySettings = asyncHandler(async (req, res) => {
	// Mock security settings - in a real app, these would be stored in database
	const securitySettings = {
		passwordPolicy: {
			minLength: 8,
			requireUppercase: true,
			requireLowercase: true,
			requireNumbers: true,
			requireSpecialChars: true,
			maxAge: 90 // days
		},
		sessionSettings: {
			maxSessionDuration: 24, // hours
			maxConcurrentSessions: 3,
			sessionTimeout: 30 // minutes of inactivity
		},
		rateLimiting: {
			loginAttempts: 5,
			lockoutDuration: 15, // minutes
			apiRequestsPerMinute: 100
		},
		auditLogging: {
			enabled: true,
			logLevel: 'INFO',
			retentionDays: 30
		}
	};

	res.status(200).json({
		success: true,
		message: "Security settings retrieved successfully",
		data: securitySettings
	});
});

/**
 * Update security settings
 */
export const updateSecuritySettings = asyncHandler(async (req, res) => {
	const { passwordPolicy, sessionSettings, rateLimiting, auditLogging } = req.body;

	// In a real app, you would validate and save these settings to database
	// For now, we'll just return success

	res.status(200).json({
		success: true,
		message: "Security settings updated successfully",
		data: {
			passwordPolicy,
			sessionSettings,
			rateLimiting,
			auditLogging
		}
	});
});

/**
 * Get system reports and analytics
 */
export const getSystemReports = asyncHandler(async (req, res) => {
	const { timeRange = '30d' } = req.query;

	// Calculate date range
	const now = new Date();
	let startDate;
	switch (timeRange) {
		case '7d':
			startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
			break;
		case '30d':
			startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
			break;
		case '90d':
			startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
			break;
		default:
			startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
	}

	// User analytics
	const totalUsers = await User.countDocuments();
	const newUsers = await User.countDocuments({ createdAt: { $gte: startDate } });
	const activeUsers = await User.countDocuments({ lastLogin: { $gte: startDate } });
	const verifiedUsers = await User.countDocuments({ isVerified: true });

	// User registration trend (last 7 days)
	const registrationTrend = [];
	for (let i = 6; i >= 0; i--) {
		const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
		const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
		const count = await User.countDocuments({
			createdAt: { $gte: date, $lt: nextDate }
		});
		registrationTrend.push({
			date: date.toISOString().split('T')[0],
			count
		});
	}

	// Role distribution
	const roleDistribution = await User.aggregate([
		{
			$group: {
				_id: "$role",
				count: { $sum: 1 }
			}
		}
	]);

	// Key statistics
	const totalKeys = await Key.countDocuments();
	const activeKeys = await Key.countDocuments({ isActive: true });

	// System health metrics (mock data)
	const systemHealth = {
		uptime: process.uptime(),
		memoryUsage: process.memoryUsage(),
		cpuUsage: Math.random() * 100, // Mock CPU usage
		diskUsage: Math.random() * 100, // Mock disk usage
		responseTime: Math.random() * 100 + 50 // Mock response time
	};

	res.status(200).json({
		success: true,
		message: "System reports retrieved successfully",
		data: {
			timeRange,
			userAnalytics: {
				totalUsers,
				newUsers,
				activeUsers,
				verifiedUsers,
				registrationTrend,
				roleDistribution: roleDistribution.reduce((acc, item) => {
					acc[item._id] = item.count;
					return acc;
				}, {})
			},
			keyAnalytics: {
				totalKeys,
				activeKeys,
				inactiveKeys: totalKeys - activeKeys,
			},
			systemHealth,
			generatedAt: new Date().toISOString()
		}
	});
});

/**
 * Get key usage analytics with time-based filters
 */
export const getKeyUsageAnalytics = asyncHandler(async (req, res) => {
	const { timeRange = '7d', department = 'all' } = req.query;

	// Calculate date range
	const now = new Date();
	let startDate;
	let groupBy;
	
	switch (timeRange) {
		case '1d':
			startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
			groupBy = { $dateToString: { format: "%H:00", date: "$takenAt" } };
			break;
		case '7d':
			startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
			groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$takenAt" } };
			break;
		case '30d':
			startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
			groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$takenAt" } };
			break;
		case '90d':
			startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
			groupBy = { $dateToString: { format: "%Y-W%U", date: "$takenAt" } };
			break;
		default:
			startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
			groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$takenAt" } };
	}

	// Build match query
	const matchQuery = {
		takenAt: { $gte: startDate, $lte: now },
		status: 'unavailable'
	};

	if (department !== 'all') {
		matchQuery.department = department;
	}

	// Get key usage over time
	const usageOverTime = await Key.aggregate([
		{ $match: matchQuery },
		{
			$group: {
				_id: groupBy,
				count: { $sum: 1 },
				uniqueKeys: { $addToSet: "$_id" }
			}
		},
		{
			$project: {
				period: "$_id",
				count: 1,
				uniqueKeysCount: { $size: "$uniqueKeys" }
			}
		},
		{ $sort: { period: 1 } }
	]);

	// Get peak usage hours (for daily view)
	const peakUsageHours = await Key.aggregate([
		{
			$match: {
				takenAt: { $gte: startDate, $lte: now },
				...(department !== 'all' && { department })
			}
		},
		{
			$group: {
				_id: { $hour: "$takenAt" },
				count: { $sum: 1 }
			}
		},
		{ $sort: { count: -1 } },
		{ $limit: 5 }
	]);

	// Get most used keys
	const mostUsedKeys = await Key.aggregate([
		{
			$match: {
				takenAt: { $gte: startDate, $lte: now },
				...(department !== 'all' && { department })
			}
		},
		{
			$group: {
				_id: "$_id",
				keyNumber: { $first: "$keyNumber" },
				keyName: { $first: "$keyName" },
				department: { $first: "$department" },
				usageCount: { $sum: 1 }
			}
		},
		{ $sort: { usageCount: -1 } },
		{ $limit: 10 }
	]);

	res.status(200).json({
		success: true,
		message: "Key usage analytics retrieved successfully",
		data: {
			timeRange,
			department,
			usageOverTime,
			peakUsageHours,
			mostUsedKeys,
			totalUsage: usageOverTime.reduce((sum, item) => sum + item.count, 0)
		}
	});
});

/**
 * Get active users analytics with filters
 */
export const getActiveUsersAnalytics = asyncHandler(async (req, res) => {
    const { timeRange = '7d', role = 'all', department = 'all' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
        case '1d':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
        case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case '90d':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        default:
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Build match queries
    const matchQuery = {
        lastLogin: { $gte: startDate }
    };

    const recentUsersQuery = {};

    if (role !== 'all') {
        matchQuery.role = role;
        recentUsersQuery.role = role;
    }

    if (department !== 'all') {
        matchQuery.department = department;
        recentUsersQuery.department = department;
    }

    // Get data in parallel for better performance
    const [
        activeUsersCount,
        usersByRole,
        usersByDepartment,
        loginActivity,
        recentUsers
    ] = await Promise.all([
        User.countDocuments(matchQuery),
        User.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: "$role",
                    count: { $sum: 1 },
                    users: {
                        $push: {
                            id: "$_id",
                            name: "$name",
                            email: "$email",
                            lastLogin: "$lastLogin"
                        }
                    }
                }
            }
        ]),
        User.aggregate([
            { 
                $match: {
                    ...matchQuery,
                    department: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: "$department",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]),
        User.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        $dateToString: { 
                            format: timeRange === '1d' ? "%H:00" : "%Y-%m-%d", 
                            date: "$lastLogin" 
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]),
        User.find(recentUsersQuery)
            .select('name email role department lastLogin createdAt')
            .sort({ createdAt: -1 })
            .limit(10)
    ]);

    res.status(200).json({
        success: true,
        message: "Active users analytics retrieved successfully",
        data: {
            timeRange,
            role,
            department,
            activeUsersCount,
            recentUsers: recentUsers.map(user => ({
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt
            })),
            usersByRole: usersByRole.reduce((acc, item) => {
                acc[item._id] = {
                    count: item.count,
                    users: item.users
                };
                return acc;
            }, {}),
            usersByDepartment,
            loginActivity
        }
    });
});

/**
 * Get peak usage analytics
 */
export const getPeakUsageAnalytics = asyncHandler(async (req, res) => {
	const { timeRange = '7d', department = 'all' } = req.query;

	// Calculate date range
	const now = new Date();
	let startDate;
	
	switch (timeRange) {
		case '1d':
			startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
			break;
		case '7d':
			startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
			break;
		case '30d':
			startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
			break;
		case '90d':
			startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
			break;
		default:
			startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
	}

	// Build match query
	const matchQuery = {
		takenAt: { $gte: startDate, $lte: now }
	};

	if (department !== 'all') {
		matchQuery.department = department;
	}

	// Get hourly usage pattern
	const hourlyUsage = await Key.aggregate([
		{ $match: matchQuery },
		{
			$group: {
				_id: { $hour: "$takenAt" },
				count: { $sum: 1 }
			}
		},
		{ $sort: { _id: 1 } }
	]);

	// Get daily usage pattern
	const dailyUsage = await Key.aggregate([
		{ $match: matchQuery },
		{
			$group: {
				_id: { $dayOfWeek: "$takenAt" },
				count: { $sum: 1 }
			}
		},
		{ $sort: { _id: 1 } }
	]);

	// Get peak usage times
	const peakHours = hourlyUsage
		.sort((a, b) => b.count - a.count)
		.slice(0, 3)
		.map(item => ({
			hour: item._id,
			count: item.count,
			timeLabel: `${item._id}:00 - ${item._id + 1}:00`
		}));

	// Get current active keys
	const currentActiveKeys = await Key.countDocuments({
		status: 'unavailable',
		...(department !== 'all' && { department })
	});

	// Get total keys
	const totalKeys = await Key.countDocuments({
		...(department !== 'all' && { department })
	});

	// Calculate usage percentage
	const usagePercentage = totalKeys > 0 ? (currentActiveKeys / totalKeys) * 100 : 0;

	res.status(200).json({
		success: true,
		message: "Peak usage analytics retrieved successfully",
		data: {
			timeRange,
			department,
			currentActiveKeys,
			totalKeys,
			usagePercentage: Math.round(usagePercentage * 100) / 100,
			hourlyUsage,
			dailyUsage,
			peakHours
		}
	});
});
