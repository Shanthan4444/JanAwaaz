import { Router } from 'express';
import { communityController } from '../controllers/communityController.js';
import { requireAuth } from '../../middleware/authMiddleware.js';

const router = Router();

// Public Community Feed Routes
router.get('/issues', communityController.getCommunityIssues);
router.get('/issues/:issueId', communityController.getPublicIssueById);

// Community Support Routes
router.post('/issues/:issueId/support', requireAuth, communityController.supportIssue);
router.delete('/issues/:issueId/support', requireAuth, communityController.removeSupport);
router.get('/issues/:issueId/support', communityController.getSupportStatus);

// Community Volunteer Routes
router.post('/issues/:issueId/volunteer', requireAuth, communityController.volunteerForIssue);
router.delete('/issues/:issueId/volunteer', requireAuth, communityController.cancelVolunteer);
router.get('/issues/:issueId/volunteers', communityController.getVolunteerStatus);
router.get('/issues/:issueId/volunteers/list', communityController.getVolunteersList);

export default router;
