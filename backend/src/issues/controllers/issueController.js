import { issueService } from '../services/issueService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export const issueController = {
  createIssue: async (req, res, next) => {
    try {
      const issue = await issueService.createIssue(req.body, req.user);
      console.log(`[API] Issue created successfully with AI Analysis: ${issue.issueId}`);
      return successResponse(res, issue, 201);
    } catch (error) {
      next(error);
    }
  },

  previewAnalyze: async (req, res, next) => {
    try {
      const { aiService } = await import('../../ai/aiService.js');
      const analysisResult = await aiService.analyzeIssue(req.body || {});
      console.log(`[API] Preview AI Analysis completed for draft: ${analysisResult.summary}`);
      return successResponse(res, analysisResult, 200);
    } catch (error) {
      next(error);
    }
  },

  validateVoice: async (req, res, next) => {
    try {
      const { aiService } = await import('../../ai/aiService.js');
      const { voiceText } = req.body || {};
      const validationResult = await aiService.validateVoiceDescription(voiceText || '');
      console.log(`[API] Voice Validation completed: status=${validationResult.validationStatus}`);
      return successResponse(res, validationResult, 200);
    } catch (error) {
      next(error);
    }
  },

  validatePhoto: async (req, res, next) => {
    try {
      const { aiService } = await import('../../ai/aiService.js');
      const validationResult = await aiService.validatePhotoEvidence(req.body || {});
      console.log(`[API] Photo Validation completed: status=${validationResult.validationStatus}`);
      return successResponse(res, validationResult, 200);
    } catch (error) {
      next(error);
    }
  },

  getIssueById: async (req, res, next) => {
    try {
      const { issueId } = req.params;
      const issue = await issueService.getIssueById(issueId);

      if (!issue) {
        return errorResponse(res, `Issue with ID '${issueId}' was not found.`, 'NOT_FOUND', 404);
      }

      return successResponse(res, issue, 200);
    } catch (error) {
      next(error);
    }
  },

  getIssues: async (req, res, next) => {
    try {
      const issues = await issueService.getIssues(req.query);
      return successResponse(res, issues, 200);
    } catch (error) {
      next(error);
    }
  },

  reanalyzeIssue: async (req, res, next) => {
    try {
      const { issueId } = req.params;
      const updatedIssue = await issueService.reanalyzeIssue(issueId);

      if (!updatedIssue) {
        return errorResponse(res, `Issue with ID '${issueId}' was not found for re-analysis.`, 'NOT_FOUND', 404);
      }

      return successResponse(res, updatedIssue, 200);
    } catch (error) {
      next(error);
    }
  }
};
