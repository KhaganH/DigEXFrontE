import { apiClient } from './api';
import { CartItem } from './cartService';

export interface CheckoutData {
  cartItems: CartItem[];
  cartTotal: number;
  canCheckout: boolean;
  hasSufficientBalance: boolean;
  userBalance: number;
}

export interface Order {
  id: number;
  orderDate: string;
  status: string;
  totalAmount: number;
  productTitle: string;
  sellerUsername: string;
}

export interface CheckoutResponse {
  success: boolean;
  message: string;
  orderCount: number;
}

class CheckoutService {
  async getCheckoutData(): Promise<CheckoutData> {
    return apiClient.get<CheckoutData>('/api/checkout');
  }

  async processCheckout(): Promise<CheckoutResponse> {
    return apiClient.post<CheckoutResponse>('/api/checkout', '', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  async buyNow(productId: number, quantity: number = 1): Promise<void> {
    const params = new URLSearchParams();
    params.append('quantity', quantity.toString());

    return apiClient.post<void>(`/product/${productId}/buy-now`, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }
}

export const checkoutService = new CheckoutService(); 