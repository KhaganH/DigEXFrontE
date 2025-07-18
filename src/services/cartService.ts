import { apiClient } from './api';
import { Product } from './productService';

// Toast bildirimi için global fonksiyon
declare global {
  interface Window {
    showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  }
}

export interface CartItem {
  id: number;
  user: {
    id: number;
    username: string;
  };
  product: Product;
  quantity: number;
  priceAtTime: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartSummary {
  cartItems: CartItem[];
  cartTotal: number;
  canCheckout: boolean;
  hasSufficientBalance: boolean;
  userBalance: number;
}

class CartService {
  async addToCart(productId: number, quantity: number = 1): Promise<{ success: boolean; message: string; cartCount: number }> {
    try {
      const params = new URLSearchParams();
      params.append('productId', productId.toString());
      params.append('quantity', quantity.toString());

      const result = await apiClient.post<{ success: boolean; message: string; cartCount: number }>('/api/cart/add', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      if (result && result.success) {
        return result;
      } else {
        throw new Error(result?.message || 'Failed to add item to cart');
      }
    } catch (error: any) {
      throw error;
    }
  }

  async getCartItems(): Promise<CartSummary> {
    try {
      const result = await apiClient.get<CartSummary>('/api/cart');
      
      // Backend now sends clean, properly formatted responses
      return {
        cartItems: Array.isArray(result.cartItems) ? result.cartItems : [],
        cartTotal: typeof result.cartTotal === 'number' ? result.cartTotal : 0,
        canCheckout: Boolean(result.canCheckout),
        hasSufficientBalance: Boolean(result.hasSufficientBalance),
        userBalance: typeof result.userBalance === 'number' ? result.userBalance : 0
      };
    } catch (error: any) {
      return {
        cartItems: [],
        cartTotal: 0,
        canCheckout: false,
        hasSufficientBalance: true,
        userBalance: 0
      };
    }
  }

  async getCartCount(): Promise<number> {
    try {
      const result = await apiClient.get<number>('/api/cart/count');
      
      const count = typeof result === 'object' ? (result as any).count || 0 : result || 0;
      
      return Number(count);
    } catch (error: any) {
      return 0;
    }
  }

  async updateCartItem(cartItemId: number, quantity: number): Promise<string> {
    try {
      const params = new URLSearchParams();
      params.append('cartItemId', cartItemId.toString());
      params.append('quantity', quantity.toString());

      const result = await apiClient.post<string>('/api/cart/update', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Məhsul yenilənərkən xəta baş verdi');
    }
  }

  async removeFromCart(cartItemId: number): Promise<{ success: boolean; message: string; cartCount: number }> {
    try {
      const params = new URLSearchParams();
      params.append('cartItemId', cartItemId.toString());

      const result = await apiClient.post<{ success: boolean; message: string; cartCount: number }>('/api/cart/remove', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Məhsul silinərkən xəta baş verdi');
    }
  }

  async clearCart(): Promise<{ success: boolean; message: string }> {
    try {
      const result = await apiClient.post<{ success: boolean; message: string }>('/api/cart/clear', '', {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Səbət təmizlənərkən xəta baş verdi');
    }
  }

  async proceedToCheckout(): Promise<{ success: boolean; message: string; orderCount: number; redirectUrl?: string }> {
    try {
      const result = await apiClient.post<{ success: boolean; message: string; orderCount: number; redirectUrl?: string }>('/api/checkout', '', {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Sipariş verərkən xəta baş verdi');
    }
  }
}

export const cartService = new CartService();