import { apiClient } from './client.js';

export const authApi = {
  loginAuthority: async (credential, password, department) => {
    const data = await apiClient.post('/auth/authority/login', { credential, password, department });
    if (data.token) {
      localStorage.setItem('jansetu_token', data.token);
      localStorage.setItem('jansetu_role', data.user.role);
    }
    return data;
  },

  loginWorker: async (credential, password) => {
    const data = await apiClient.post('/auth/worker/login', { credential, password });
    if (data.token) {
      localStorage.setItem('jansetu_token', data.token);
      localStorage.setItem('jansetu_role', data.user.role);
    }
    return data;
  },

  identifyCitizen: async (mobile, name) => {
    const data = await apiClient.post('/auth/citizen/identify', { mobile, name });
    if (data.token) {
      localStorage.setItem('janawaaz_token', data.token);
      localStorage.setItem('janawaaz_role', data.user.role || 'CITIZEN');
      localStorage.setItem('jansetu_token', data.token);
      localStorage.setItem('jansetu_role', data.user.role || 'CITIZEN');
    }
    return data;
  },

  requestCitizenOtp: async (mobile) => {
    return await apiClient.post('/auth/citizen/otp/request', { mobile });
  },

  requestOtp: async (mobile) => {
    return await apiClient.post('/auth/citizen/otp/request', { mobile });
  },

  verifyCitizenOtp: async (mobile, otp) => {
    const data = await apiClient.post('/auth/citizen/otp/verify', { mobile, otp });
    if (data.token) {
      localStorage.setItem('jansetu_token', data.token);
      localStorage.setItem('jansetu_role', data.user.role);
    }
    return data;
  },

  verifyOtp: async (mobile, otp) => {
    const data = await apiClient.post('/auth/citizen/otp/verify', { mobile, otp });
    if (data.token) {
      localStorage.setItem('jansetu_token', data.token);
      localStorage.setItem('jansetu_role', data.user.role);
    }
    return data;
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem('jansetu_token');
    if (!token) return null;
    try {
      const data = await apiClient.get('/auth/me');
      return data.user;
    } catch (e) {
      localStorage.removeItem('jansetu_token');
      localStorage.removeItem('jansetu_role');
      return null;
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch (e) {}
    localStorage.removeItem('jansetu_token');
    localStorage.removeItem('jansetu_role');
  },

  getToken: () => localStorage.getItem('jansetu_token')
};
