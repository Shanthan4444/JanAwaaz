import { communityService } from '../services/communityService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export const communityController = {
  getCommunityIssues: async (req, res, next) => {
    try {
      const issues = await communityService.getCommunityIssues(req.query);
      return successResponse(res, issues, 200);
    } catch (error) {
      next(error);
    }
  },

  getPublicIssueById: async (req, res, next) => {
    try {
      const { issueId } = req.params;
      const issue = await communityService.getPublicIssueById(issueId);

      if (!issue) {
        return errorResponse(res, `Public issue '${issueId}' not found.`, 'NOT_FOUND', 404);
      }

      return successResponse(res, issue, 200);
    } catch (error) {
      next(error);
    }
  },

  supportIssue: async (req, res, next) => {
    try {
      const { issueId } = req.params;
      const result = await communityService.supportIssue(req.user, issueId);
      return successResponse(res, result, 200);
    } catch (error) {
      if (error.status) {
        return errorResponse(res, error.message, 'SUPPORT_ERROR', error.status);
      }
      next(error);
    }
  },

  removeSupport: async (req, res, next) => {
    try {
      const { issueId } = req.params;
      const result = await communityService.removeSupport(req.user, issueId);
      return successResponse(res, result, 200);
    } catch (error) {
      if (error.status) {
        return errorResponse(res, error.message, 'REMOVE_SUPPORT_ERROR', error.status);
      }
      next(error);
    }
  },

  getSupportStatus: async (req, res, next) => {
    try {
      const { issueId } = req.params;
      const result = await communityService.getSupportStatus(req.user, issueId);
      return successResponse(res, result, 200);
    } catch (error) {
      next(error);
    }
  },

  volunteerForIssue: async (req, res, next) => {
    try {
      const { issueId } = req.params;
      const result = await communityService.volunteerForIssue(req.user, issueId);
      return successResponse(res, result, 200);
    } catch (error) {
      if (error.status) {
        return errorResponse(res, error.message, 'VOLUNTEER_ERROR', error.status);
      }
      next(error);
    }
  },

  cancelVolunteer: async (req, res, next) => {
    try {
      const { issueId } = req.params;
      const result = await communityService.cancelVolunteer(req.user, issueId);
      return successResponse(res, result, 200);
    } catch (error) {
      if (error.status) {
        return errorResponse(res, error.message, 'CANCEL_VOLUNTEER_ERROR', error.status);
      }
      next(error);
    }
  },

  getVolunteerStatus: async (req, res, next) => {
    try {
      const { issueId } = req.params;
      const result = await communityService.getVolunteerStatus(req.user, issueId);
      return successResponse(res, result, 200);
    } catch (error) {
      next(error);
    }
  },

  getVolunteersList: async (req, res, next) => {
    try {
      const { issueId } = req.params;
      const result = await communityService.getVolunteersList(issueId);
      return successResponse(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
};
