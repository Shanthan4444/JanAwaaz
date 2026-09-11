import { apiClient } from './client.js';

export const analyticsApi = {
  getOverview: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiClient.get(`/authority/analytics/overview${query ? `?${query}` : ''}`);
  },

  getTrends: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiClient.get(`/authority/analytics/trends${query ? `?${query}` : ''}`);
  },

  getCategories: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiClient.get(`/authority/analytics/categories${query ? `?${query}` : ''}`);
  },

  getDepartments: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiClient.get(`/authority/analytics/departments${query ? `?${query}` : ''}`);
  },

  getResolution: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiClient.get(`/authority/analytics/resolution${query ? `?${query}` : ''}`);
  },

  getReopened: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiClient.get(`/authority/analytics/reopened${query ? `?${query}` : ''}`);
  },

  getCommunity: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiClient.get(`/authority/analytics/community${query ? `?${query}` : ''}`);
  },

  getHotspots: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiClient.get(`/authority/analytics/hotspots${query ? `?${query}` : ''}`);
  },

  getInsights: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiClient.get(`/authority/analytics/insights${query ? `?${query}` : ''}`);
  }
};
