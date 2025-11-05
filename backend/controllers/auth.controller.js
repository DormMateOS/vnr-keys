import mongoose from "mongoose";

import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendWelcomeEmail } from "../nodemailer/emails.js";
import User from "../models/user.model.js";
import {
	validateEmail,
	validateName,
	sanitizeEmail,
} from "../utils/validation.js";
import {
	ValidationError,
	AuthenticationError,
	ConflictError,
	NotFoundError,
	asyncHandler,
} from "../utils/errorHandler.js";

// Complete user registration after OAuth (for new users)
export const completeRegistration = asyncHandler(async (req, res) => {
	const { department, facultyId } = req.body;
	const userId = req.userId; // From verifyToken middleware

	// Find the user first to get their email
	const user = await User.findById(userId);
	if (!user) {
		throw new NotFoundError('User not found');
	}

	// Determine role based on email
	let role;
	if (user.email === 'security@vnrvjiet.in') {
		role = 'security';
	} else if (user.email === '23071a7228@vnrvjiet.in') {
		role = 'admin';
	} else {
		role = 'faculty';
	}

	// Validate faculty-specific fields (only for faculty role)
	if (role === 'faculty') {
		if (!department || !['CSE', 'EEE', 'CSE-AIML', 'CSE_AIDS', 'IoT', 'ECE', 'MECH', 'CIVIL', 'IT'].includes(department)) {
			throw new ValidationError('Valid department is required for faculty');
		}
		if (!facultyId || facultyId.trim().length === 0) {
			throw new ValidationError('Faculty ID is required for faculty');
		}

		// Check if faculty ID already exists
		const existingFaculty = await User.findOne({ facultyId: facultyId.trim() });
		if (existingFaculty && existingFaculty._id.toString() !== userId) {
			throw new ConflictError('Faculty ID already exists');
		}
	}

	// Check if user already completed registration
	if (user.role !== 'pending' && !(user.role === 'faculty' && (!user.department || !user.facultyId))) {
		throw new ConflictError('User registration already completed');
	}

	// Update user with registration details
	user.role = role;
	if (role === 'faculty') {
		user.department = department;
		user.facultyId = facultyId.trim();
	}
	// For security and admin roles, no additional fields needed

	await user.save();

	// Send welcome email
	try {
		await sendWelcomeEmail(user.email, user.name);
	} catch (emailError) {
		console.error("Failed to send welcome email:", emailError);
		// Don't fail the registration if email fails
	}

	console.log(`✅ User registration completed: ${user.email} as ${role}`);

	res.status(200).json({
		success: true,
		message: "Registration completed successfully",
		user: {
			id: user._id,
			email: user.email,
			name: user.name,
			role: user.role,
			department: user.department,
			facultyId: user.facultyId,
			avatar: user.avatar,
			isVerified: user.isVerified,
			createdAt: user.createdAt,
		},
	});
});

// Check authentication status
export const checkAuth = asyncHandler(async (req, res) => {
	const user = await User.findById(req.userId).select("-__v");
	if (!user) {
		throw new AuthenticationError("User not found");
	}

	res.status(200).json({
		success: true,
		user: {
			id: user._id,
			email: user.email,
			name: user.name,
			role: user.role,
			department: user.department,
			facultyId: user.facultyId,
			avatar: user.avatar,
			isVerified: user.isVerified,
			lastLogin: user.lastLogin,
			createdAt: user.createdAt,
		},
	});
});

// Get user by ID
export const getUserById = asyncHandler(async (req, res) => {
	const { userId } = req.params;

	// Validate ObjectId
	if (!mongoose.Types.ObjectId.isValid(userId)) {
		throw new ValidationError("Invalid user ID format");
	}

	const user = await User.findById(userId).select("-__v");
	if (!user) {
		throw new NotFoundError("User not found");
	}

	res.status(200).json({
		success: true,
		user: {
			id: user._id,
			email: user.email,
			name: user.name,
			role: user.role,
			department: user.department,
			facultyId: user.facultyId,
			avatar: user.avatar,
			isVerified: user.isVerified,
			lastLogin: user.lastLogin,
			createdAt: user.createdAt,
		},
	});
});

// Logout
export const logout = asyncHandler(async (req, res) => {
	// Use the same cookie configuration as when setting the cookie
	const cookieOptions = {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
		maxAge: 0, // Expire immediately
	};

	res.cookie("token", "", cookieOptions);

	res.status(200).json({
		success: true,
		message: "Logged out successfully",
	});
});

// Check if user needs to complete registration
export const checkRegistrationStatus = asyncHandler(async (req, res) => {
	const userId = req.userId; // From verifyToken middleware

	const user = await User.findById(userId);
	if (!user) {
		throw new NotFoundError('User not found');
	}

	// Check if user needs to complete registration
	const needsRegistration = user.role === 'pending' || (user.role === 'faculty' && (!user.department || !user.facultyId));

	res.status(200).json({
		success: true,
		needsRegistration,
		user: {
			id: user._id,
			email: user.email,
			name: user.name,
			role: user.role,
			department: user.department,
			facultyId: user.facultyId,
			avatar: user.avatar,
		},
	});
});

// Update user profile
export const updateProfile = asyncHandler(async (req, res) => {
	const { name, email, department, facultyId, bio, location, website } = req.body;
	const userId = req.userId; // From verifyToken middleware

	// Find the user
	const user = await User.findById(userId);
	if (!user) {
		throw new NotFoundError('User not found');
	}

	// Validate email if provided
	if (email && email !== user.email) {
		if (!validateEmail(email)) {
			throw new ValidationError('Invalid email format');
		}

		// Check if email already exists
		const existingUser = await User.findOne({ email: sanitizeEmail(email) });
		if (existingUser && existingUser._id.toString() !== userId) {
			throw new ConflictError('Email already exists');
		}
	}

	// Validate name if provided
	if (name && !validateName(name)) {
		throw new ValidationError('Invalid name format');
	}

	// Validate faculty-specific fields if user is faculty
	if (user.role === 'faculty') {
		if (department && !['CSE', 'CSE-AIML', 'CSE-DS'].includes(department)) {
			throw new ValidationError('Invalid department for faculty');
		}

		if (facultyId && facultyId !== user.facultyId) {
			// Check if faculty ID already exists
			const existingFaculty = await User.findOne({ facultyId: facultyId.trim() });
			if (existingFaculty && existingFaculty._id.toString() !== userId) {
				throw new ConflictError('Faculty ID already exists');
			}
		}
	}

	// Update user fields
	if (name) user.name = name.trim();
	if (email) user.email = sanitizeEmail(email);
	if (user.role === 'faculty') {
		if (department) user.department = department;
		if (facultyId) user.facultyId = facultyId.trim();
	}

	// Update optional fields (these don't exist in the current schema but can be added)
	if (bio !== undefined) user.bio = bio;
	if (location !== undefined) user.location = location;
	if (website !== undefined) user.website = website;

	await user.save();

	console.log(`✅ Profile updated for user: ${user.email}`);

	res.status(200).json({
// Check authentication status
		success: true,
		message: "Profile updated successfully",
		user: {
			id: user._id,
			email: user.email,
			name: user.name,
			role: user.role,
			department: user.department,
			facultyId: user.facultyId,
			bio: user.bio,
			location: user.location,
			website: user.website,
			avatar: user.avatar,
			isVerified: user.isVerified,
			lastLogin: user.lastLogin,
			createdAt: user.createdAt,
		},
	});
});
