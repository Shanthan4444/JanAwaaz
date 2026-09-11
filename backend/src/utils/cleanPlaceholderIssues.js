import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Issue } from '../models/Issue.js';

dotenv.config();

async function cleanPlaceholders() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jansetu';
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB.');

    // Find and delete issues with unsplash image URLs
    const res = await Issue.deleteMany({
      'evidence.url': { $regex: /unsplash\.com/i }
    });

    console.log(`[CLEANUP SUCCESS] Deleted ${res.deletedCount} placeholder issues with unsplash images from MongoDB.`);
  } catch (err) {
    console.error('Cleanup failed:', err);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }
}

cleanPlaceholders();
