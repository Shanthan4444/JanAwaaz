import { authorityService } from '../services/authorityService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export const authorityController = {
  getDashboard: async (req, res, next) => {
    try {
      const data = await authorityService.getDashboard(req.user);
      return successResponse(res, data, 200);
    } catch (error) {
      next(error);
    }
  },

  getIssues: async (req, res, next) => {
    try {
      const issues = await authorityService.getIssues(req.user, req.query);
      return successResponse(res, issues, 200);
    } catch (error) {
      next(error);
    }
  },

  getIssueById: async (req, res, next) => {
    try {
      const { issueId } = req.params;
      const issue = await authorityService.getIssueById(req.user, issueId);

      if (!issue) {
        return errorResponse(res, `Issue '${issueId}' not found.`, 'NOT_FOUND', 404);
      }

      return successResponse(res, issue, 200);
    } catch (error) {
      next(error);
    }
  },

  verifyIssue: async (req, res, next) => {
    try {
      const { issueId } = req.params;
      const updated = await authorityService.verifyIssue(req.user, issueId);
      console.log(`[AUTHORITY API] Issue ${issueId} verified by Officer ${req.user.name}`);
      return successResponse(res, updated, 200);
    } catch (error) {
      next(error);
    }
  },

  updateDecision: async (req, res, next) => {
    try {
      const { issueId } = req.params;
      const updated = await authorityService.updateDecision(req.user, issueId, req.body);
      console.log(`[AUTHORITY API] Decision override recorded for ${issueId} by Officer ${req.user.name}`);
      return successResponse(res, updated, 200);
    } catch (error) {
      next(error);
    }
  },

  assignWorker: async (req, res, next) => {
    try {
      const { issueId } = req.params;
      const { workerId } = req.body || {};

      if (!workerId) {
        return errorResponse(res, 'workerId is required for assignment.', 'VALIDATION_ERROR', 400);
      }

      const updated = await authorityService.assignWorker(req.user, issueId, workerId);
      console.log(`[AUTHORITY API] Worker ${workerId} assigned to issue ${issueId} by Officer ${req.user.name}`);
      return successResponse(res, updated, 200);
    } catch (error) {
      next(error);
    }
  },

  getWorkers: async (req, res, next) => {
    try {
      const workers = await authorityService.getWorkers(req.user);
      return successResponse(res, workers, 200);
    } catch (error) {
      next(error);
    }
  },

  hireWorker: async (req, res, next) => {
    try {
      const newWorker = await authorityService.hireWorker(req.user || {}, req.body);
      return successResponse(res, newWorker, 201, 'Field worker created successfully.');
    } catch (error) {
      next(error);
    }
  },

  getMapIssues: async (req, res, next) => {
    try {
      const mapIssues = await authorityService.getMapIssues(req.user);
      return successResponse(res, mapIssues, 200);
    } catch (error) {
      next(error);
    }
  }
};
