import { apiClient } from './api';
import { Product } from './productService';

export interface Order {
  id: number;
  orderNumber: string;
  buyerId: number;
  buyerUsername: string;
  sellerId: number;
  sellerUsername: string;
  sellerStoreName?: string;
  productId: number;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  commissionAmount: number;
  sellerAmount: number;
  commissionRate: number;
  status: 'PENDING' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
  deliveredContent?: string;
  deliveredFileUrl?: string;
  orderNotes?: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

class OrderService {
  async getUserOrders(): Promise<Order[]> {
    try {
      const result = await apiClient.get<Order[]>('/api/orders');
      
      // Check if result is HTML (error response)
      if (typeof result === 'string' && (result as string).includes('<!DOCTYPE')) {
        console.warn('⚠️ Backend returned HTML instead of orders, using fallback');
        return [];
      }
      
      return Array.isArray(result) ? result : [];
    } catch (error: any) {
      console.error('❌ OrderService.getUserOrders error:', error);
      return []; // Return fallback instead of throwing
    }
  }

  async getSellerOrders(): Promise<Order[]> {
    try {
      const result = await apiClient.get<Order[]>('/api/seller/orders');
      
      // Check if result is HTML (error response)
      if (typeof result === 'string' && (result as string).includes('<!DOCTYPE')) {
        console.warn('⚠️ Backend returned HTML instead of seller orders, using fallback');
        return [];
      }
      
      return Array.isArray(result) ? result : [];
    } catch (error: any) {
      console.error('❌ OrderService.getSellerOrders error:', error);
      return []; // Return fallback instead of throwing
    }
  }

  async getOrderById(orderId: number): Promise<Order> {
    try {
      const result = await apiClient.get<Order>(`/api/orders/${orderId}`);
      
      // Check if result is HTML (error response)
      if (typeof result === 'string' && (result as string).includes('<!DOCTYPE')) {
        throw new Error('Backend authorization failed - please restart backend');
      }
      
      return result;
    } catch (error: any) {
      console.error('❌ OrderService.getOrderById error:', error);
      throw new Error(error.message || 'Sipariş məlumatları alınarkən xəta baş verdi');
    }
  }

  async markAsDelivered(orderId: number, deliveryInfo: string): Promise<string> {
    try {
      const params = new URLSearchParams();
      params.append('deliveryInfo', deliveryInfo);

      const result = await apiClient.post<string>(`/seller/orders/${orderId}/deliver`, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      // Check if result is HTML (error response)
      if (typeof result === 'string' && (result as string).includes('<!DOCTYPE')) {
        throw new Error('Backend authorization failed - please restart backend');
      }
      
      return result;
    } catch (error: any) {
      console.error('❌ OrderService.markAsDelivered error:', error);
      throw new Error(error.message || 'Sipariş teslim edilərkən xəta baş verdi');
    }
  }

  async confirmDelivery(orderId: number): Promise<string> {
    try {
      const result = await apiClient.post<string>(`/orders/${orderId}/confirm`, '', {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      // Check if result is HTML (error response)
      if (typeof result === 'string' && (result as string).includes('<!DOCTYPE')) {
        throw new Error('Backend authorization failed - please restart backend');
      }
      
      return result;
    } catch (error: any) {
      console.error('❌ OrderService.confirmDelivery error:', error);
      throw new Error(error.message || 'Sipariş təsdiqlənərkən xəta baş verdi');
    }
  }
}

export const orderService = new OrderService(); 