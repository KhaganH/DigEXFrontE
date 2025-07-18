export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email?: string; // Optional çünkü backend'den gelmiyor
}

export interface Product {
  id: number;
  title: string; // Backend'de title field'ı var
  description?: string;
  price: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  product?: Product;
}

export interface Chat {
  id: number;
  buyer: User;
  seller: User;
  order: Order;
  otherUser?: User;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: number;
  content: string;
  type: string; // Backend'de string olarak geliyor
  sentAt: string;
  sender?: User | null;
  senderId?: number;
  senderUsername?: string;
  chatId?: number;
  isRead: boolean;
} 
 
 