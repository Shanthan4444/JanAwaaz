import { apiClient } from './client.js';

export const communityApi = {
  getIssues: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.sort) queryParams.append('sort', filters.sort);
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return await apiClient.get(`/community/issues${queryString}`);
  },

  getIssue: async (issueId) => {
    return await apiClient.get(`/community/issues/${issueId}`);
  },

  supportIssue: async (issueId) => {
    return await apiClient.post(`/community/issues/${issueId}/support`, {});
  },

  removeSupport: async (issueId) => {
    return await apiClient.delete(`/community/issues/${issueId}/support`);
  },

  getSupportStatus: async (issueId) => {
    return await apiClient.get(`/community/issues/${issueId}/support`);
  },

  volunteer: async (issueId) => {
    return await apiClient.post(`/community/issues/${issueId}/volunteer`, {});
  },

  cancelVolunteer: async (issueId) => {
    return await apiClient.delete(`/community/issues/${issueId}/volunteers`);
  },

  getVolunteerStatus: async (issueId) => {
    return await apiClient.get(`/community/issues/${issueId}/volunteers`);
  }
};
