import { apiClient } from './apiClient';

export const communityApi = {
  getIssues: async (filters: { status?: string; category?: string; sort?: string } = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.sort) queryParams.append('sort', filters.sort);
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const res = await apiClient.get(`/community/issues${queryString}`);
    return (res as any).data || res;
  },

  getIssue: async (issueId: string) => {
    const res = await apiClient.get(`/community/issues/${issueId}`);
    return (res as any).data || res;
  },

  supportIssue: async (issueId: string) => {
    const res = await apiClient.post(`/community/issues/${issueId}/support`, {});
    return (res as any).data || res;
  },

  removeSupport: async (issueId: string) => {
    const res = await apiClient.delete(`/community/issues/${issueId}/support`);
    return (res as any).data || res;
  },

  getSupportStatus: async (issueId: string) => {
    const res = await apiClient.get(`/community/issues/${issueId}/support`);
    return (res as any).data || res;
  },

  volunteer: async (issueId: string) => {
    const res = await apiClient.post(`/community/issues/${issueId}/volunteer`, {});
    return (res as any).data || res;
  },

  cancelVolunteer: async (issueId: string) => {
    const res = await apiClient.delete(`/community/issues/${issueId}/volunteer`);
    return (res as any).data || res;
  },

  getVolunteerStatus: async (issueId: string) => {
    const res = await apiClient.get(`/community/issues/${issueId}/volunteers`);
    return (res as any).data || res;
  }
};
