import { Router } from 'express';
import { notificationController } from '../controllers/notificationController.js';
import { requireAuth } from '../../middleware/authMiddleware.js';

const router = Router();

// Protect all notification routes with authentication
router.use(requireAuth);

// GET /api/notifications
router.get('/', notificationController.getNotifications);

// GET /api/notifications/unread-count
router.get('/unread-count', notificationController.getUnreadCount);

// PATCH /api/notifications/read-all
router.patch('/read-all', notificationController.markAllAsRead);

// PATCH /api/notifications/:id/read
router.patch('/:id/read', notificationController.markAsRead);

// DELETE /api/notifications/:id
router.delete('/:id', notificationController.deleteNotification);

export default router;
