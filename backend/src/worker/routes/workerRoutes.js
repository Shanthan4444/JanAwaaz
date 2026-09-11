import { Router } from 'express';
import { workerController } from '../controllers/workerController.js';
import { requireAuth, requireRole } from '../../middleware/authMiddleware.js';

const router = Router();

// Protect all worker routes with authentication and WORKER role authorization
router.use(requireAuth);
router.use(requireRole('WORKER'));

// GET /api/worker/profile
router.get('/profile', workerController.getProfile);

// GET /api/worker/tasks
router.get('/tasks', workerController.getTasks);

// GET /api/worker/tasks/:issueId
router.get('/tasks/:issueId', workerController.getTaskById);

// POST /api/worker/tasks/:issueId/accept (Worker direct claim/accept)
router.post('/tasks/:issueId/accept', workerController.acceptTask);

// POST /api/worker/tasks/:issueId/reject (Worker direct rejection with reason)
router.post('/tasks/:issueId/reject', workerController.rejectTask);

// POST /api/worker/tasks/:issueId/start (Alias for accept)
router.post('/tasks/:issueId/start', workerController.startTask);

// POST /api/worker/tasks/:issueId/update
router.post('/tasks/:issueId/update', workerController.postUpdate);

// POST /api/worker/tasks/:issueId/resolve
router.post('/tasks/:issueId/resolve', workerController.resolveTask);

export default router;
