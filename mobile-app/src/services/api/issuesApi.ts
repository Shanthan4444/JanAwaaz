import { apiClient } from './apiClient';

export interface LocationData {
  latitude: number;
  longitude: number;
  area: string;
  landmark: string;
  address?: string;
}

export interface IssueData {
  title: string;
  description: string;
  category: string;
  department: string;
  severity: string;
  priority: number;
  location: LocationData;
  evidence: string[];
}

export const issuesApi = {
  createIssue: async (data: IssueData) => {
    const payload = {
      title: data.title,
      description: data.description,
      category: data.category,
      department: data.department,
      severity: data.severity || 'HIGH',
      priority: data.priority || 85,
      location: {
        latitude: data.location.latitude,
        longitude: data.location.longitude,
        area: data.location.area || 'Sector 14',
        landmark: data.location.landmark || ''
      },
      evidence: data.evidence.map((url) => {
        if (typeof url === 'string') {
          return { type: 'image', url };
        }
        return url;
      })
    };
    const res = await apiClient.post('/issues', payload);
    return (res as any).data || res;
  },

  getIssue: async (issueId: string) => {
    const res = await apiClient.get(`/issues/${issueId}`);
    return (res as any).data || res;
  },

  getIssues: async (filters: { status?: string; category?: string } = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient.get(`/issues${queryString}`);
    return (res as any).data || res;
  },

  analyzeCandidate: async (image: string, latitude: number, longitude: number) => {
    const payload = {
      title: 'Civic Report Draft',
      description: 'Image upload from mobile app',
      category: 'Other',
      location: {
        latitude,
        longitude,
        area: 'Sector 14',
        landmark: ''
      },
      evidence: [image]
    };
    const res = await apiClient.post('/issues/preview-analyze', payload);
    return (res as any).data || res;
  }
};
