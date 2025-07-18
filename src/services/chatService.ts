import { apiClient } from './api';
import { authService } from './authService';

export interface ChatMessage {
  id: number;
  content: string;
  type: string; // TEXT, IMAGE, FILE, SYSTEM
  sentAt: string;
  sender: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  } | null; // SYSTEM mesajları için null olabilir
  isRead: boolean;
  senderId?: number;
  senderUsername?: string;
}

export interface ChatDetails {
  id: number;
  orderNumber: string;
  productTitle: string;
  status: string;
  otherUser: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ChatRoom {
  id: number;
  orderNumber: string;
  productTitle: string;
  status: string;
  otherUser: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  };
  lastMessageAt: string;
  unreadCount: number;
}

export interface Chat {
  id: number;
  order: {
    id: number;
    orderNumber: string;
    product?: {
      id: number;
      title: string;
      description: string;
      price: number;
    };
  };
  buyer: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  };
  seller: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ChatListResponse {
  success: boolean;
  chats?: Chat[];
  message?: string;
}

export interface ChatMessagesResponse {
  success: boolean;
  messages?: ChatMessage[];
  unreadCount?: number;
  message?: string;
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  messageId?: number;
  sentAt?: string;
}

export const chatService = {
  async getUserChats(): Promise<{ success: boolean; chats: Chat[] }> {
    try {
      const response = await apiClient.get<{ success: boolean; chats: Chat[] }>('/api/chat/list');
      
      if (response.success && response.chats) {
        return { success: true, chats: response.chats };
      } else {
        return { success: false, chats: [] };
      }
    } catch (error) {
      return { success: false, chats: [] };
    }
  },

  async getChatRooms(): Promise<{ success: boolean; chats: ChatRoom[] }> {
    try {
      const response = await apiClient.get<{ success: boolean; chats: ChatRoom[] }>('/api/chat/rooms');
      
      if (response.success && response.chats) {
        return { success: true, chats: response.chats };
      } else {
        return { success: false, chats: [] };
      }
    } catch (error) {
      return { success: false, chats: [] };
    }
  },

  async getAllUnreadCounts(): Promise<{ [chatId: number]: number }> {
    try {
      const chatResponse = await this.getChatRooms();
      if (!chatResponse.success) {
        return {};
      }

      const unreadCounts: { [chatId: number]: number } = {};
      
      // Her chat için unread count al
      for (const chatRoom of chatResponse.chats) {
        try {
          const count = await this.getUnreadMessageCount(chatRoom.id);
          unreadCounts[chatRoom.id] = count;
        } catch (error) {
          unreadCounts[chatRoom.id] = 0;
        }
      }
      
      return unreadCounts;
    } catch (error) {
      return {};
    }
  },

  async getChatMessages(chatId: number): Promise<{ success: boolean; messages: ChatMessage[] }> {
    try {
      const response = await apiClient.get<{ success: boolean; messages: ChatMessage[] }>(`/api/chat/${chatId}/messages`);
      
      if (response.success && response.messages) {
        return response;
      } else {
        return { success: false, messages: [] };
      }
    } catch (error) {
      return { success: false, messages: [] };
    }
  },

  async sendMessage(chatId: number, content: string): Promise<{ success: boolean; message?: ChatMessage; messageId?: number }> {
    try {
      const messageData = {
        chatId,
        content,
        timestamp: new Date().toISOString()
      };

      const result = await apiClient.post<{ success: boolean; message?: ChatMessage; messageId?: number }>(`/api/chat/${chatId}/messages`, messageData);
      
      if (result.success) {
        return result;
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      throw error;
    }
  },

  async getUnreadMessageCount(chatId: number): Promise<number> {
    try {
      const response = await apiClient.get<{ success: boolean; count: number }>(`/api/chat/${chatId}/unread-count`);
      return response.success ? response.count : 0;
    } catch (error) {
      return 0;
    }
  },

  async getChatByOrderId(orderId: number): Promise<{ success: boolean; chat?: Chat }> {
    try {
      const response = await apiClient.get<{ success: boolean; chat: Chat }>(`/api/chat/order/${orderId}`);
      
      if (response.success && response.chat) {
        return { success: true, chat: response.chat };
      } else {
        return { success: false };
      }
    } catch (error) {
      return { success: false };
    }
  },

  async getChatDetails(chatId: number): Promise<{ success: boolean; chat?: ChatDetails }> {
    try {
      const response = await apiClient.get<{ success: boolean; chat: ChatDetails }>(`/api/chat/${chatId}`);
      
      if (response.success && response.chat) {
        return { success: true, chat: response.chat };
      } else {
        return { success: false };
      }
    } catch (error) {
      return { success: false };
    }
  }
}; 

 
 