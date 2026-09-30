import apiClient from './apiClient';

let unreadCountPromise = null;
let lastUnreadCount = 0;
let lastFetchTime = 0;

export const notificationApi = {
  // Get list of notifications for the authenticated user
  getMyNotifications: async () => {
    const res = await apiClient.get('/api/notifications');
    return res.data || [];
  },

  // Get unread notifications count (with in-flight deduplication & 20s memoization)
  getUnreadCount: async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFetchTime < 20000) {
      return lastUnreadCount;
    }
    if (unreadCountPromise) {
      return unreadCountPromise;
    }

    unreadCountPromise = apiClient.get('/api/notifications/unread-count')
      .then(res => {
        lastUnreadCount = res.data?.unreadCount || 0;
        lastFetchTime = Date.now();
        return lastUnreadCount;
      })
      .catch(() => lastUnreadCount)
      .finally(() => {
        unreadCountPromise = null;
      });

    return unreadCountPromise;
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
