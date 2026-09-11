import { apiClient } from './client.js';

export const workerApi = {
  getProfile: async () => {
    return await apiClient.get('/worker/profile');
  },

  getTasks: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.priority) queryParams.append('priority', filters.priority);
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return await apiClient.get(`/worker/tasks${queryString}`);
  },

  getTask: async (issueId) => {
    return await apiClient.get(`/worker/tasks/${issueId}`);
  },

  acceptTask: async (issueId) => {
    return await apiClient.post(`/worker/tasks/${issueId}/accept`, {});
  },

  rejectTask: async (issueId, reason) => {
    return await apiClient.post(`/worker/tasks/${issueId}/reject`, { reason });
  },

  startTask: async (issueId) => {
    return await apiClient.post(`/worker/tasks/${issueId}/accept`, {});
  },

  postUpdate: async (issueId, message) => {
    return await apiClient.post(`/worker/tasks/${issueId}/update`, { message });
  },

  resolveTask: async (issueId, { resolutionNote, resolutionEvidence }) => {
    return await apiClient.post(`/worker/tasks/${issueId}/resolve`, {
      resolutionNote,
      resolutionEvidence
    });
  }
};
