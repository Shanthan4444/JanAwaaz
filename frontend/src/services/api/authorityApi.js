import { apiClient } from './client.js';

export const authorityApi = {
  getDashboard: async () => {
    return await apiClient.get('/authority/dashboard');
  },

  getIssues: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await apiClient.get(`/authority/issues${queryString}`);
  },

  getIssue: async (issueId) => {
    return await apiClient.get(`/authority/issues/${issueId}`);
  },

  verifyIssue: async (issueId) => {
    return await apiClient.post(`/authority/issues/${issueId}/verify`, {});
  },

  updateDecision: async (issueId, decisionData) => {
    return await apiClient.post(`/authority/issues/${issueId}/decision`, decisionData);
  },

  assignWorker: async (issueId, workerId) => {
    return await apiClient.post(`/authority/issues/${issueId}/assign`, { workerId });
  },

  getWorkers: async () => {
    return await apiClient.get('/authority/workers');
  },

  hireWorker: async (workerData) => {
    return await apiClient.post('/authority/workers', workerData);
  },

  getMapIssues: async () => {
    return await apiClient.get('/authority/map/issues');
  }
};
