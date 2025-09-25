import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Key from '../models/key.model.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

async function migrateDepartmentNames() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find all keys with old department name
        const keysToUpdate = await Key.find({
            department: 'CSE-(CYS,DS) and AI&DS'
        });

        console.log(`Found ${keysToUpdate.length} keys to update`);

        // Update each key
        for (const key of keysToUpdate) {
            // Default to CSE_AIDS, but you may want to manually review these
            key.department = 'CSE_AIDS';
            await key.save();
            console.log(`Updated key ${key.keyNumber} from CSE-(CYS,DS) and AI&DS to CSE_AIDS`);
        }

        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Error during migration:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

migrateDepartmentNames().catch(console.error);