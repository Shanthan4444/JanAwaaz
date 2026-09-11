import { citizenService } from '../services/citizenService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export const citizenController = {
  getProfile: async (req, res, next) => {
    try {
      const profile = await citizenService.getCitizenProfile(req.user);
      return successResponse(res, profile, 200);
    } catch (error) {
      next(error);
    }
  },

  getIssues: async (req, res, next) => {
    try {
      const issues = await citizenService.getCitizenIssues(req.user, req.query);
      return successResponse(res, issues, 200);
    } catch (error) {
      next(error);
    }
  },

  getIssueById: async (req, res, next) => {
    try {
      const { issueId } = req.params;
      const issue = await citizenService.getCitizenIssueById(req.user, issueId);
      return successResponse(res, issue, 200);
    } catch (error) {
      if (error.status) {
        return errorResponse(res, error.message, 'CITIZEN_ISSUE_ERROR', error.status);
      }
      next(error);
    }
  },

  verifyIssue: async (req, res, next) => {
    try {
      const { issueId } = req.params;
      const updatedIssue = await citizenService.verifyIssue(req.user, issueId, req.body);
      console.log(`[CITIZEN API] Issue '${issueId}' verified FIXED and CLOSED by citizen '${req.user.name}'`);
      return successResponse(res, updatedIssue, 200);
    } catch (error) {
      if (error.status) {
        return errorResponse(res, error.message, 'VERIFY_ISSUE_ERROR', error.status);
      }
      next(error);
    }
  },

  reopenIssue: async (req, res, next) => {
    try {
      const { issueId } = req.params;
      const updatedIssue = await citizenService.reopenIssue(req.user, issueId, req.body);
      console.log(`[CITIZEN API] Issue '${issueId}' REOPENED by citizen '${req.user.name}'`);
      return successResponse(res, updatedIssue, 200);
    } catch (error) {
      if (error.status) {
        return errorResponse(res, error.message, 'REOPEN_ISSUE_ERROR', error.status);
      }
      next(error);
    }
  }
};
