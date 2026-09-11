import { apiClient } from './client.js';

export const citizenApi = {
  getProfile: async () => {
    return await apiClient.get('/citizen/profile');
  },

  getIssues: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return await apiClient.get(`/citizen/issues${queryString}`);
  },

  getIssue: async (issueId) => {
    return await apiClient.get(`/citizen/issues/${issueId}`);
  },

  verifyIssue: async (issueId, payload = {}) => {
    return await apiClient.post(`/citizen/issues/${issueId}/verify`, payload);
  },

  reopenIssue: async (issueId, payload = {}) => {
    return await apiClient.post(`/citizen/issues/${issueId}/reopen`, payload);
  }
};
