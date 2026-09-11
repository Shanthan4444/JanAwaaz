import { Router } from 'express';
import { citizenController } from '../controllers/citizenController.js';
import { requireAuth, requireRole } from '../../middleware/authMiddleware.js';

const router = Router();

// Protect all citizen routes with authentication and CITIZEN role authorization
router.use(requireAuth);
router.use(requireRole('CITIZEN'));

// GET /api/citizen/profile
router.get('/profile', citizenController.getProfile);

// GET /api/citizen/issues
router.get('/issues', citizenController.getIssues);

// GET /api/citizen/issues/:issueId
router.get('/issues/:issueId', citizenController.getIssueById);

// POST /api/citizen/issues/:issueId/verify
router.post('/issues/:issueId/verify', citizenController.verifyIssue);

// POST /api/citizen/issues/:issueId/reopen
router.post('/issues/:issueId/reopen', citizenController.reopenIssue);

export default router;
