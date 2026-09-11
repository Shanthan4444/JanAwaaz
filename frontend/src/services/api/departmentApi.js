import { apiClient } from './client.js';

export const departmentApi = {
  // Login Department Admin
  login: async (username, password) => {
    return apiClient.post('/department/login', { username, password });
  },

  // Get Issues Filtered strictly for logged-in Department
  getIssues: async (params = {}) => {
    return apiClient.get('/department/issues', { params });
  },

  // Get Workers in Department
  getWorkers: async () => {
    return apiClient.get('/department/workers');
  },

  // Add Worker to Department
  addWorker: async (workerData) => {
    return apiClient.post('/department/workers', workerData);
  },

  // Update Worker Status (AVAILABLE, BUSY, OFFLINE, INACTIVE)
  updateWorkerStatus: async (workerId, status) => {
    return apiClient.put(`/department/workers/${workerId}/status`, { status });
  }
};
