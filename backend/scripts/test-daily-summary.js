import { createDailySummaryNotifications } from '../services/notificationService.js';
import mongoose from 'mongoose';
import { connectDB } from '../db/connectDB.js';
import dotenv from 'dotenv';
dotenv.config();

async function testDailySummary() {
  try {
    console.log('🔵 Starting daily summary test...');
    
    // Wait for database connection
    console.log('📡 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected successfully');

    // Generate and send summary notifications
    const result = await createDailySummaryNotifications();

    console.log('✅ Daily summary test completed successfully');
    console.log('Results:', {
      totalNotifications: result.totalNotifications,
      totalUnreturnedKeys: result.totalUnreturnedKeys,
      securityRecipients: result.securityRecipients,
      adminRecipients: result.adminRecipients
    });

  } catch (error) {
    console.error('❌ Error in daily summary test:', error);
    if (error.name === 'MongooseError') {
      console.error('💡 Database connection error. Please check:');
      console.error('1. MongoDB is running');
      console.error('2. Database URL is correct in .env file');
      console.error('3. Network connectivity to database');
    }
  } finally {
    try {
      console.log('👋 Closing database connection...');
      await mongoose.connection.close();
      console.log('✅ Database connection closed');
    } catch (err) {
      console.error('❌ Error closing database connection:', err);
    }
    process.exit(0);
  }
}

// Add error handlers for uncaught exceptions
process.on('unhandledRejection', (error) => {
  console.error('🔥 Unhandled Promise Rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('🔥 Uncaught Exception:', error);
  process.exit(1);
});

// Run the test
console.log('🚀 Starting test script...');
testDailySummary();
