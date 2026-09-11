import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './auth/authRoutes.js';
import issueRoutes from './issues/routes/issueRoutes.js';
import authorityRoutes from './authority/routes/authorityRoutes.js';
import workerRoutes from './worker/routes/workerRoutes.js';
import citizenRoutes from './citizen/routes/citizenRoutes.js';
import communityRoutes from './community/routes/communityRoutes.js';
import notificationRoutes from './notifications/routes/notificationRoutes.js';
import analyticsRoutes from './analytics/routes/analyticsRoutes.js';
import departmentRoutes from './department/routes/departmentRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Bulletproof CORS Configuration for Vercel & Production Deployments
app.use(
  cors({
    origin: (origin, callback) => {
      // Dynamically reflect origin to satisfy credentials: true without wildcard '*'
      callback(null, origin || true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Origin', 'Cache-Control'],
    optionsSuccessStatus: 200
  })
);

app.options('*', cors());

// Additional header safeguard for all responses
app.use((req, res, next) => {
  if (req.headers.origin) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/photos', express.static(path.join(__dirname, '../public/photos')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', product: 'JanAwaaz', timestamp: new Date().toISOString() });
});

// Domain Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/authority', authorityRoutes);
app.use('/api/authority/analytics', analyticsRoutes);
app.use('/api/department', departmentRoutes);
app.use('/api/worker', workerRoutes);
app.use('/api/citizen', citizenRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/notifications', notificationRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
