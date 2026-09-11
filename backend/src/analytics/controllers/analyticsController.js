import { analyticsService } from '../services/analyticsService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export const analyticsController = {
  getOverview: async (req, res, next) => {
    try {
      const data = await analyticsService.getOverview(req.user, req.query);
      return successResponse(res, data, 200);
    } catch (error) {
      next(error);
    }
  },

  getTrends: async (req, res, next) => {
    try {
      const data = await analyticsService.getIssueTrends(req.user, req.query);
      return successResponse(res, data, 200);
    } catch (error) {
      next(error);
    }
  },

  getCategories: async (req, res, next) => {
    try {
      const data = await analyticsService.getCategoryBreakdown(req.user, req.query);
      return successResponse(res, data, 200);
    } catch (error) {
      next(error);
    }
  },

  getDepartments: async (req, res, next) => {
    try {
      const data = await analyticsService.getDepartmentPerformance(req.user, req.query);
      return successResponse(res, data, 200);
    } catch (error) {
      next(error);
    }
  },

  getResolution: async (req, res, next) => {
    try {
      const data = await analyticsService.getResolutionMetrics(req.user, req.query);
      return successResponse(res, data, 200);
    } catch (error) {
      next(error);
    }
  },

  getReopened: async (req, res, next) => {
    try {
      const overview = await analyticsService.getOverview(req.user, req.query);
      const categories = await analyticsService.getCategoryBreakdown(req.user, req.query);
      return successResponse(
        res,
        {
          reopenRate: overview.metrics.reopenRate,
          reopenedIssues: overview.metrics.reopenedIssues,
          byCategory: categories.map((c) => ({ category: c.category, reopened: c.reopened, total: c.total, rate: c.reopenRate || 0 }))
        },
        200
      );
    } catch (error) {
      next(error);
    }
  },

  getCommunity: async (req, res, next) => {
    try {
      const overview = await analyticsService.getOverview(req.user, req.query);
      const hotspots = await analyticsService.getHotspots(req.user, req.query);
      return successResponse(
        res,
        {
          totalSupporters: overview.metrics.totalSupporters,
          totalVolunteers: overview.metrics.totalVolunteers,
          topVolunteerAreas: hotspots.map((h) => ({ area: h.area, volunteers: h.volunteerCount, supporters: h.supportCount }))
        },
        200
      );
    } catch (error) {
      next(error);
    }
  },

  getHotspots: async (req, res, next) => {
    try {
      const data = await analyticsService.getHotspots(req.user, req.query);
      return successResponse(res, data, 200);
    } catch (error) {
      next(error);
    }
  },

  getInsights: async (req, res, next) => {
    try {
      const data = await analyticsService.getCivicInsights(req.user, req.query);
      return successResponse(res, data, 200);
    } catch (error) {
      next(error);
    }
  }
};
