import { Router } from 'express';
import { issueController } from '../controllers/issueController.js';
import { validateCreateIssue } from '../validators/createIssueValidator.js';

const router = Router();

// POST /api/issues - Create a new citizen issue with AI Civic Intelligence analysis
router.post('/', validateCreateIssue, issueController.createIssue);

// POST /api/issues/preview-analyze - Unauthenticated AI analysis preview for report drafts
router.post('/preview-analyze', issueController.previewAnalyze);

// POST /api/issues/validate-voice - Voice description AI validation endpoint
router.post('/validate-voice', issueController.validateVoice);

// POST /api/issues/validate-photo - Multimodal Photo evidence AI validation endpoint
router.post('/validate-photo', issueController.validatePhoto);

// POST /api/issues/:issueId/analyze - On-demand AI re-analysis for existing issue
router.post('/:issueId/analyze', issueController.reanalyzeIssue);

// GET /api/issues/:issueId - Retrieve issue by public issueId (e.g. JAN-2026-1042)
router.get('/:issueId', issueController.getIssueById);

// GET /api/issues - List active issues
router.get('/', issueController.getIssues);

export default router;
