import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

export const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/janawaaz';
  console.log(`[DB] Attempting MongoDB connection to URI: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);

  try {
    await mongoose.connect(uri);
    console.log('[DB] MongoDB connected successfully.');
  } catch (error) {
    console.warn('[DB WARN] Database connection failed:', error.message);
  }
};
