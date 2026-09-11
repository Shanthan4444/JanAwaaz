import { apiClient } from './client.js';

export const issuesApi = {
  createIssue: async (data) => {
    const payload = {
      title: data.title,
      description: data.description,
      category: data.category,
      department: data.department,
      severity: data.severity || 'HIGH',
      priority: data.priority || 85,
      location: {
        latitude: data.location?.latitude || 28.5355,
        longitude: data.location?.longitude || 77.3910,
        area: data.location?.area || 'Sector 14',
        landmark: data.location?.landmark || ''
      },
      evidence: Array.isArray(data.evidence)
        ? data.evidence.map((url) => (typeof url === 'string' ? { type: 'image', url } : url))
        : [{ type: 'image', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80' }],
      reporter: data.reporter || {
        userId: 'demo-citizen-001',
        name: 'Citizen',
        mobile: ''
      }
    };

    return await apiClient.post('/issues', payload);
  },

  previewAnalyze: async (draftData) => {
    return await apiClient.post('/issues/preview-analyze', draftData);
  },

  validateVoice: async (voiceText) => {
    return await apiClient.post('/issues/validate-voice', { voiceText });
  },

  validatePhoto: async (photoData) => {
    return await apiClient.post('/issues/validate-photo', photoData);
  },

  getIssue: async (issueId) => {
    return await apiClient.get(`/issues/${issueId}`);
  },

  getIssues: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await apiClient.get(`/issues${queryString}`);
  }
};
