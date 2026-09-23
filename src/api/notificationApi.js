import apiClient from './apiClient';

export const notificationApi = {
  // Get list of notifications for the authenticated user
  getMyNotifications: async () => {
    const res = await apiClient.get('/api/notifications');
    return res.data || [];
  },

  // Get unread notifications count
  getUnreadCount: async () => {
    const res = await apiClient.get('/api/notifications/unread-count');
    return res.data?.unreadCount || 0;
  },

  // Mark single notification as read
  markAsRead: async (notificationId) => {
    const res = await apiClient.put(`/api/notifications/${notificationId}/read`);
    return res.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const res = await apiClient.put('/api/notifications/read-all');
    return res;
  },

  // Delete a notification
  deleteNotification: async (notificationId) => {
    const res = await apiClient.delete(`/api/notifications/${notificationId}`);
    return res;
  },

  // Notify customer that advocate is waiting in consultation room
  notifyWaiting: async (requestId) => {
    const res = await apiClient.post(`/api/notifications/notify-waiting/${requestId}`);
    return res;
  }
};
