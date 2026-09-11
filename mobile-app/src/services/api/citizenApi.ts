import { apiClient } from './apiClient';

export const citizenApi = {
  getProfile: async () => {
    const res = await apiClient.get('/citizen/profile');
    return (res as any).data || res;
  },

  getIssues: async (filters: { status?: string } = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const res = await apiClient.get(`/citizen/issues${queryString}`);
    return (res as any).data || res;
  },

  getIssue: async (issueId: string) => {
    const res = await apiClient.get(`/citizen/issues/${issueId}`);
    return (res as any).data || res;
  },

  verifyIssue: async (issueId: string, payload: { reason?: string } = {}) => {
    const res = await apiClient.post(`/citizen/issues/${issueId}/verify`, payload);
    return (res as any).data || res;
  },

  reopenIssue: async (issueId: string, payload: { reason: string }) => {
    const res = await apiClient.post(`/citizen/issues/${issueId}/reopen`, payload);
    return (res as any).data || res;
  }
};
