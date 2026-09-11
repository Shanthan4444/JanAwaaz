import { apiClient } from './apiClient';

export const notificationsApi = {
  getNotifications: async (filters: { unreadOnly?: boolean; page?: number; limit?: number } = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.unreadOnly) queryParams.append('unreadOnly', 'true');
    if (filters.page) queryParams.append('page', String(filters.page));
    if (filters.limit) queryParams.append('limit', String(filters.limit));
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const res = await apiClient.get(`/notifications${queryString}`);
    return (res as any).data || res;
  },

  getUnreadCount: async () => {
    const res = await apiClient.get('/notifications/unread-count');
    return (res as any).data || res;
  },

  markAsRead: async (notificationId: string) => {
    const res = await apiClient.patch(`/notifications/${notificationId}/read`, {});
    return (res as any).data || res;
  },

  markAllAsRead: async () => {
    const res = await apiClient.patch('/notifications/read-all', {});
    return (res as any).data || res;
  },

  deleteNotification: async (notificationId: string) => {
    const res = await apiClient.delete(`/notifications/${notificationId}`);
    return (res as any).data || res;
  }
};
