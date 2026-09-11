import express from 'express';
import { departmentController } from '../controllers/departmentController.js';
import { requireAuth } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Public Dept Login
router.post('/login', departmentController.login);

// Protected Dept Routes (Requires JWT token)
router.use(requireAuth);
router.get('/issues', departmentController.getDepartmentIssues);
router.get('/workers', departmentController.getDepartmentWorkers);
router.post('/workers', departmentController.addWorker);
router.put('/workers/:workerId/status', departmentController.updateWorkerStatus);

export default router;
