import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController.js';
import { requireAuth, requireRole } from '../../middleware/authMiddleware.js';

const router = Router();

// Protect all analytics endpoints with authentication and AUTHORITY role authorization
router.use(requireAuth);
router.use(requireRole('AUTHORITY'));

// GET /api/authority/analytics/overview
router.get('/overview', analyticsController.getOverview);

// GET /api/authority/analytics/trends
router.get('/trends', analyticsController.getTrends);

// GET /api/authority/analytics/categories
router.get('/categories', analyticsController.getCategories);

// GET /api/authority/analytics/departments
router.get('/departments', analyticsController.getDepartments);

// GET /api/authority/analytics/resolution
router.get('/resolution', analyticsController.getResolution);

// GET /api/authority/analytics/reopened
router.get('/reopened', analyticsController.getReopened);

// GET /api/authority/analytics/community
router.get('/community', analyticsController.getCommunity);

// GET /api/authority/analytics/hotspots
router.get('/hotspots', analyticsController.getHotspots);

// GET /api/authority/analytics/insights
router.get('/insights', analyticsController.getInsights);

export default router;
