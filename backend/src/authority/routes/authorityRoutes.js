import { Router } from 'express';
import { authorityController } from '../controllers/authorityController.js';
import { requireAuth, requireRole } from '../../middleware/authMiddleware.js';

const router = Router();

// Apply Authentication & Role Authorization Middleware to ALL Authority routes
router.use(requireAuth);
router.use(requireRole(['AUTHORITY']));

// Dashboard Metrics & Priority Queue
router.get('/dashboard', authorityController.getDashboard);

// Issue List & Search
router.get('/issues', authorityController.getIssues);

// Sector Heatmap Map Issues
router.get('/map/issues', authorityController.getMapIssues);

// Worker Selection List & Worker Hiring
router.get('/workers', authorityController.getWorkers);
router.post('/workers', authorityController.hireWorker);

// Single Issue Detail
router.get('/issues/:issueId', authorityController.getIssueById);

// Issue Verification Action (REPORTED -> VERIFIED)
router.post('/issues/:issueId/verify', authorityController.verifyIssue);

// Decision Override Action (Category / Department / Priority / Severity)
router.post('/issues/:issueId/decision', authorityController.updateDecision);

// Worker Assignment Action (VERIFIED -> ASSIGNED)
router.post('/issues/:issueId/assign', authorityController.assignWorker);

export default router;
