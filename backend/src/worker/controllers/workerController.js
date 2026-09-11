import { workerService } from '../services/workerService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export const workerController = {
  getProfile: async (req, res, next) => {
    try {
      const profile = await workerService.getWorkerProfile(req.user);
      return successResponse(res, profile, 200);
    } catch (error) {
      if (error.status) {
        return errorResponse(res, error.message, 'WORKER_PROFILE_ERROR', error.status);
      }
      next(error);
    }
  },

  getTasks: async (req, res, next) => {
    try {
      const tasks = await workerService.getWorkerTasks(req.user, req.query);
      return successResponse(res, tasks, 200);
    } catch (error) {
      next(error);
    }
  },

  getTaskById: async (req, res, next) => {
    try {
      const { issueId } = req.params;
      const task = await workerService.getWorkerTaskById(req.user, issueId);
      return successResponse(res, task, 200);
    } catch (error) {
      if (error.status) {
        return errorResponse(res, error.message, 'WORKER_TASK_ERROR', error.status);
      }
      next(error);
    }
  },

  acceptTask: async (req, res, next) => {
    try {
      const { issueId } = req.params;
      const updatedTask = await workerService.acceptTask(req.user, issueId);
      console.log(`[WORKER API] Task '${issueId}' directly ACCEPTED by worker '${req.user.name}'`);
      return successResponse(res, updatedTask, 200);
    } catch (error) {
      if (error.status) {
        return errorResponse(res, error.message, 'ACCEPT_TASK_ERROR', error.status);
      }
      next(error);
    }
  },

  rejectTask: async (req, res, next) => {
    try {
      const { issueId } = req.params;
      const { reason, rejectionReason } = req.body || {};
      const explanation = reason || rejectionReason;

      const updatedTask = await workerService.rejectTask(req.user, issueId, explanation);
      console.log(`[WORKER API] Task '${issueId}' REJECTED as NOT GENUINE by worker '${req.user.name}'. Reason: "${explanation}"`);
      return successResponse(res, updatedTask, 200);
    } catch (error) {
      if (error.status) {
        return errorResponse(res, error.message, 'REJECT_TASK_ERROR', error.status);
      }
      next(error);
    }
  },

  startTask: async (req, res, next) => {
    return workerController.acceptTask(req, res, next);
  },

  postUpdate: async (req, res, next) => {
    try {
      const { issueId } = req.params;
      const { message, note } = req.body || {};
      const updateMsg = message || note;
      const updatedTask = await workerService.postUpdate(req.user, issueId, updateMsg);
      console.log(`[WORKER API] Progress update added for '${issueId}' by worker '${req.user.name}'`);
      return successResponse(res, updatedTask, 200);
    } catch (error) {
      if (error.status) {
        return errorResponse(res, error.message, 'WORKER_UPDATE_ERROR', error.status);
      }
      next(error);
    }
  },

  resolveTask: async (req, res, next) => {
    try {
      const { issueId } = req.params;
      const updatedTask = await workerService.resolveTask(req.user, issueId, req.body);
      console.log(`[WORKER API] Task '${issueId}' marked RESOLVED by worker '${req.user.name}'`);
      return successResponse(res, updatedTask, 200);
    } catch (error) {
      if (error.status) {
        return errorResponse(res, error.message, 'RESOLVE_TASK_ERROR', error.status);
      }
      next(error);
    }
  }
};
