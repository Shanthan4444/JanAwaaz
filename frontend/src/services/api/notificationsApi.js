import { apiClient } from './client.js';

export const notificationsApi = {
  getNotifications: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.unreadOnly) queryParams.append('unreadOnly', 'true');
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return await apiClient.get(`/notifications${queryString}`);
  },

  getUnreadCount: async () => {
    return await apiClient.get('/notifications/unread-count');
  },

  markAsRead: async (notificationId) => {
    return await apiClient.patch(`/notifications/${notificationId}/read`, {});
  },

  markAllAsRead: async () => {
    return await apiClient.patch('/notifications/read-all', {});
  },

  deleteNotification: async (notificationId) => {
    return await apiClient.delete(`/notifications/${notificationId}`);
  }
};
