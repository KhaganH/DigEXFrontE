import { apiClient } from './api';
import { User } from './authService';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  balance: number;
  role: string;
  storeName?: string;
  storeDescription?: string;
  createdAt: string;
}

export interface UpdateProfileRequest {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  storeName?: string;
  storeDescription?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface NotificationSettings {
  orderConfirmation: boolean;
  orderDelivery: boolean;
  newProducts: boolean;
  discounts: boolean;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  createdAt: string;
}

class UserService {
  async getProfile(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/api/user/profile');
  }

  async getUserProfile(userId: number): Promise<UserProfile> {
    return apiClient.get<UserProfile>(`/api/users/${userId}`);
  }

  async updateProfile(userId: number, data: UpdateProfileRequest): Promise<UserProfile> {
    return apiClient.put<UserProfile>(`/api/users/${userId}`, data);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post('/api/user/change-password', {
      currentPassword,
      newPassword
    });
  }

  async updateNotificationSettings(settings: NotificationSettings): Promise<{ success: boolean; message: string }> {
    return apiClient.post('/api/user/notification-settings', settings);
  }

  async getNotifications(): Promise<Notification[]> {
    return apiClient.get<Notification[]>('/api/user/notifications');
  }

  async getUnreadNotificationCount(): Promise<number> {
    const notifications = await this.getNotifications();
    return notifications.filter(n => !n.isRead).length;
  }

  async requestSellerStatus(): Promise<{ success: boolean; message: string }> {
    return apiClient.post('/api/user/seller-request');
  }
}

export const userService = new UserService();