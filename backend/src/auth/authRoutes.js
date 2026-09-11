import { Router } from 'express';
import { authController } from './authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/auth/authority/login
router.post('/authority/login', authController.loginAuthority);

// POST /api/auth/worker/login
router.post('/worker/login', authController.loginWorker);

// POST /api/auth/citizen/identify
router.post('/citizen/identify', authController.identifyCitizen);

// POST /api/auth/citizen/otp/request
router.post('/citizen/otp/request', authController.requestCitizenOtp);

// POST /api/auth/citizen/otp/verify
router.post('/citizen/otp/verify', authController.verifyCitizenOtp);

// GET /api/auth/me - Restore current authenticated user profile
router.get('/me', requireAuth, authController.getCurrentUser);

// POST /api/auth/logout
router.post('/logout', authController.logout);

export default router;
