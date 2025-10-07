import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Key from '../models/key.model.js';

dotenv.config();

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('MONGO_URI not found in environment');
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(uri, { });
    console.log('Connected to MongoDB');

    const results = await Key.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\nDepartment counts:');
    for (const r of results) {
      console.log(`${r._id || 'UNSET'}: ${r.count}`);
    }

    const total = await Key.countDocuments();
    console.log('\nTotal keys in collection:', total);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    await mongoose.connection.close();
    process.exit(1);
  }
};

run();
