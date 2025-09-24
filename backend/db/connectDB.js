import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        // Check if MONGO_URI is defined
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        // Only log URI in development mode for security
        if (process.env.NODE_ENV === 'development') {
            console.log("🔄 Connecting to MongoDB...");
        }

        // Configure Mongoose
        mongoose.set('strictQuery', true);

        // Connect with improved options
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 15000, // Timeout after 15 seconds
            socketTimeoutMS: 30000, // Close sockets after 30 seconds
            family: 4 // Use IPv4, skip trying IPv6
        });

        // Add connection event listeners
        mongoose.connection.on('connected', () => {
            console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        });

        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('❗ MongoDB disconnected');
        });

        // Handle process termination
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('MongoDB connection closed through app termination');
                process.exit(0);
            } catch (err) {
                console.error('Error closing MongoDB connection:', err);
                process.exit(1);
            }
        });

        return conn;

    } catch (error) {
        console.error("❌ Error connecting to MongoDB:");
        console.error('Error details:', error.message);
        if (error.name === 'MongooseError') {
            console.error('💡 Please check:');
            console.error('1. MongoDB is running');
            console.error('2. Database URL is correct in .env file');
            console.error('3. Network connectivity to database');
            console.error('4. Database user has correct permissions');
        }
        throw error; // Let the caller handle the error
    }
};
