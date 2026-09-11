import app from '../src/app.js';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database.js';

export default async (req, res) => {
  // If database is not connected, establish connection
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDatabase();
    } catch (err) {
      console.error(`[SERVERLESS DB CONNECT ERROR] ${err.message}`);
    }
  }
  
  // Forward request to Express app routing middleware
  return app(req, res);
};
