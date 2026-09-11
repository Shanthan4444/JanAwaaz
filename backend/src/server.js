import dotenv from 'dotenv';
import app from './app.js';
import { connectDatabase } from './config/database.js';
import { startAutoReassignDaemon } from './services/autoReassignDaemon.js';

dotenv.config();

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`[SERVER] JanAwaaz backend listening immediately on port ${PORT}`);
});

connectDatabase()
  .then(() => {
    console.log('[DB] MongoDB connected and ready.');
    startAutoReassignDaemon();
  })
  .catch((err) => {
    console.error(`[DB ERROR] Connection failed: ${err.message}`);
  });
