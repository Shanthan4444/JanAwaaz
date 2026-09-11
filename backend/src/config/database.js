import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { seedInitialData } from '../utils/seedData.js';

// Fix Node.js DNS SRV lookup on Windows for MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (dnsErr) {
  console.warn('[DNS WARN] Could not set custom DNS servers:', dnsErr.message);
}

dotenv.config();

let mongoMemoryServer = null;

export const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/janawaaz';
  console.log(`[DB] Attempting MongoDB connection to target URI: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);

  try {
    // Attempt connection to target MONGODB_URI first
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`[DB] MongoDB connected successfully to target database.`);
    await seedInitialData();
  } catch (error) {
    console.warn(`[DB WARN] Standard MongoDB connection failed (${error.message}).`);

    if (process.env.NODE_ENV !== 'production') {
      console.log('[DB] Launching standalone development MongoDB instance as fallback...');
      try {
        mongoMemoryServer = await MongoMemoryServer.create();
        const memUri = mongoMemoryServer.getUri();
        await mongoose.connect(memUri);
        console.log(`[DB] Connected to standalone development MongoDB at ${memUri}`);
        await seedInitialData();
      } catch (memErr) {
        console.error(`[DB ERROR] Failed to connect to standalone MongoDB: ${memErr.message}`);
        process.exit(1);
      }
    } else {
      console.error(`[DB ERROR] Production database connection failed. Terminating.`);
      process.exit(1);
    }
  }
};

export const closeDatabase = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
