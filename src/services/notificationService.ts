import { apiClient } from './api';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface NotificationCounts {
  total: number;
  unread: number;
}

class NotificationService {
  // Get all notifications
  async getAllNotifications(): Promise<Notification[]> {
    return apiClient.get<Notification[]>('/api/notifications');
  }

  // Get unread notifications
  async getUnreadNotifications(): Promise<Notification[]> {
    return apiClient.get<Notification[]>('/api/notifications/unread');
  }

  // Get notification counts
  async getNotificationCounts(): Promise<NotificationCounts> {
    return apiClient.get<NotificationCounts>('/api/notifications/count');
  }

  // Mark notification as read
  async markAsRead(notificationId: number): Promise<{ message: string }> {
    const response = await apiClient.put<string>(`/api/notifications/${notificationId}/read`);
    return { message: response };
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<{ message: string }> {
    const response = await apiClient.put<string>('/api/notifications/mark-all-read');
    return { message: response };
  }

  // Delete notification
  async deleteNotification(notificationId: number): Promise<{ message: string }> {
    const response = await apiClient.delete<string>(`/api/notifications/${notificationId}`);
    return { message: response };
  }

  // Delete all read notifications
  async deleteReadNotifications(): Promise<{ message: string }> {
    const response = await apiClient.delete<string>('/api/notifications/read');
    return { message: response };
  }
}

export default new NotificationService(); 