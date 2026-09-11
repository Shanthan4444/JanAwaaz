import { notificationService } from '../services/notificationService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export const notificationController = {
  getNotifications: async (req, res, next) => {
    try {
      const recipientId = req.user.id;
      const data = await notificationService.getNotifications(recipientId, req.query);
      return successResponse(res, data, 200);
    } catch (error) {
      next(error);
    }
  },

  getUnreadCount: async (req, res, next) => {
    try {
      const recipientId = req.user.id;
      const data = await notificationService.getUnreadCount(recipientId);
      return successResponse(res, data, 200);
    } catch (error) {
      next(error);
    }
  },

  markAsRead: async (req, res, next) => {
    try {
      const { id } = req.params;
      const recipientId = req.user.id;
      const updated = await notificationService.markAsRead(id, recipientId);
      return successResponse(res, updated, 200);
    } catch (error) {
      if (error.status) {
        return errorResponse(res, error.message, 'NOT_FOUND', error.status);
      }
      next(error);
    }
  },

  markAllAsRead: async (req, res, next) => {
    try {
      const recipientId = req.user.id;
      const result = await notificationService.markAllAsRead(recipientId);
      return successResponse(res, result, 200);
    } catch (error) {
      next(error);
    }
  },

  deleteNotification: async (req, res, next) => {
    try {
      const { id } = req.params;
      const recipientId = req.user.id;
      const result = await notificationService.deleteNotification(id, recipientId);
      return successResponse(res, result, 200);
    } catch (error) {
      if (error.status) {
        return errorResponse(res, error.message, 'NOT_FOUND', error.status);
      }
      next(error);
    }
  }
};
