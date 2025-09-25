// Configure environment variables FIRST before any other imports
import "./config/env.js";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import passport from "./config/passport.js";

import { connectDB } from "./db/connectDB.js";
import { verifyTransporter } from "./nodemailer/nodemailer.config.js";
import { globalErrorHandler } from "./utils/errorHandler.js";
import { config } from "./utils/config.js";
import { initializeScheduledJobs } from "./services/scheduledJobs.js";
import {
	helmetConfig,
	sanitizeRequest,
	requestLogger
} from "./middleware/security.js";

import authRoutes from "./routes/auth.route.js";
import dashboardRoutes from "./routes/dashboard.route.js";
import keyRoutes from "./routes/key.route.js";
import apiKeyRoutes from "./routes/apiKey.route.js";
import auditRoutes from "./routes/audit.route.js";
import notificationRoutes from "./routes/notification.route.js";
import about from "./routes/about.js"
import logbookRoutes from "./routes/logbook.route.js"
import qrRoutes from "./routes/qr.route.js"

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Trust proxy for Render deployment
app.set('trust proxy', 1);

// Security middleware
app.use(helmetConfig);
app.use(requestLogger);
app.use(sanitizeRequest);

// 🔧 Hardcoded CORS configuration
const corsOptions = {
	origin: [
		"http://localhost:3203",        // Local frontend (dev)
		"https://vnr-keys.vercel.app"   // Production frontend
	],
	credentials: true, // Allow cookies / credentials
	optionsSuccessStatus: 200,
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
	allowedHeaders: [
		'Content-Type',
		'Authorization',
		'X-Requested-With',
		'Accept',
		'Origin',
		'Access-Control-Request-Method',
		'Access-Control-Request-Headers'
	],
	exposedHeaders: ['Set-Cookie'], // Expose cookies
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Limit request size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Session middleware for Passport (only needed for OAuth flow)
app.use(session({
	secret: process.env.JWT_SECRET || 'your-session-secret',
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: process.env.NODE_ENV === 'production',
		maxAge: 24 * 60 * 60 * 1000 // 24 hours
	}
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get("/api/health", (req, res) => {
	res.json({
		success: true,
		message: "Server is running",
		timestamp: new Date().toISOString(),
		env: process.env.NODE_ENV,
		cors: {
			origin: req.headers.origin,
			allowedOrigins: [
				"http://localhost:3203",
				"https://vnr-keys.vercel.app"
			]
		}
	});
});

// Root endpoint
app.get("/", (req, res) => {
	res.json({
		success: true,
		message: "VNR Keys API Server",
		version: "1.0.0",
		endpoints: {
			about : "/api/about",
			health: "/api/health",
			auth: "/api/auth",
			dashboard: "/api/dashboard",
			keys: "/api/keys",
			apiKeys: "/api/api-keys",
			audit: "/api/audit",
			logbook: "/api/logbook"
		}
	});
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/keys", keyRoutes);
app.use("/api/api-keys", apiKeyRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/about", about);
app.use("/api/logbook", logbookRoutes);
app.use("/api/qr", qrRoutes);

// For local development - handle /be prefix routes to match Google OAuth redirect URIs
if (process.env.NODE_ENV === 'development' || process.env.ENVIRONMENT === 'local') {
	app.use("/be/api/auth", authRoutes);
	app.use("/be/api/dashboard", dashboardRoutes);
	app.use("/be/api/keys", keyRoutes);
	app.use("/be/api/api-keys", apiKeyRoutes);
	app.use("/be/api/notifications", notificationRoutes);
	app.use("/be/api/about", about);
}

// Global error handler (must be after all routes)
app.use(globalErrorHandler);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

// Configure Socket.IO with CORS
const io = new Server(server, {
	cors: {
		origin: [
			"http://localhost:3203",
			"http://localhost:5173",
			"https://vnr-keys.vercel.app"
		],
		methods: ["GET", "POST"],
		credentials: true
	}
});

// Socket.IO connection handling
io.on('connection', (socket) => {
	if (process.env.NODE_ENV === 'development') {
		console.log(`🔌 User connected: ${socket.id}`);
	}

	// Join user to their own room for personalized updates
	socket.on('join-user-room', (userId) => {
		socket.join(`user-${userId}`);
		if (process.env.NODE_ENV === 'development') {
			console.log(`👤 User ${userId} joined their room`);
		}
	});

	// Join user to role-based room for role-specific notifications
	socket.on('join-role-room', (role) => {
		if (['faculty', 'security', 'admin'].includes(role)) {
			socket.join(`${role}-room`);
			if (process.env.NODE_ENV === 'development') {
				console.log(`👥 User joined ${role} room`);
			}
		}
	});

	// Join all users to a general keys room for global updates
	socket.join('keys-updates');

	socket.on('disconnect', () => {
		if (process.env.NODE_ENV === 'development') {
			console.log(`🔌 User disconnected: ${socket.id}`);
		}
	});
});

// Make io available globally for other modules
global.io = io;

server.listen(PORT, async () => {
	await connectDB();
	await verifyTransporter();

	// Initialize scheduled jobs
	initializeScheduledJobs();

	console.log(`🚀 VNR Keys Server running on port ${PORT}`);
	console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
	console.log("🔌 Socket.IO server ready for real-time updates");

	if (config.server.nodeEnv === 'development' || config.environment === 'local') {
		console.log(`📱 Frontend URL: https://vnr-keys.vercel.app`);
		console.log(`🔗 API Health: https://vnr-keys-1.onrender.com/api/health`);
	}
});
