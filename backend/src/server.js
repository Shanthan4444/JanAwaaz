import dotenv from 'dotenv';
import app from './app.js';
import { connectDatabase } from './config/database.js';

dotenv.config();

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`[SERVER] JanAwaaz backend listening on port ${PORT}`);
});

connectDatabase()
  .then(() => {
    console.log('[DB] MongoDB connected and ready.');
  })
  .catch((err) => {
    console.error(`[DB ERROR] Connection failed: ${err.message}`);
  });
