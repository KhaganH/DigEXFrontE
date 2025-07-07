import { apiClient } from './api';
import { User } from './authService';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  balance: number;
  role: string;
  storeName?: string;
  storeDescription?: string;
  createdAt: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  storeName?: string;
  storeDescription?: string;
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

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    return apiClient.put<UserProfile>('/api/user/profile', data);
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