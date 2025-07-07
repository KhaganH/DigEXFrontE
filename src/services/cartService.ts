import { apiClient } from './api';
import { Product } from './productService';

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
      
      return result;
    } catch (error: any) {
      console.error('❌ CartService.addToCart error:', error);
      
      // Handle specific backend errors
      let errorMessage = error.message || 'Məhsul səbətə əlavə edilərkən xəta baş verdi';
      
      if (errorMessage.includes('Öz məhsulunuzu ala bilməzsiniz')) {
        errorMessage = 'Öz məhsulunuzu satın ala bilməzsiniz!';
      } else if (errorMessage.includes('Insufficient stock')) {
        errorMessage = 'Kifayət qədər stok yoxdur!';
      } else if (errorMessage.includes('Product not found')) {
        errorMessage = 'Məhsul tapılmadı!';
      } else if (errorMessage.includes('User not found')) {
        errorMessage = 'İstifadəçi tapılmadı!';
      }
      
      throw new Error(errorMessage);
    }
  }

  async getCartItems(): Promise<CartSummary> {
    try {
      console.log('🛒 CartService: Fetching cart items from /api/cart');
      const result = await apiClient.get<CartSummary>('/api/cart');
      console.log('🛒 CartService: Received cart data:', result);
      
      // Backend now sends clean, properly formatted responses
      return {
        cartItems: Array.isArray(result.cartItems) ? result.cartItems : [],
        cartTotal: typeof result.cartTotal === 'number' ? result.cartTotal : 0,
        canCheckout: Boolean(result.canCheckout),
        hasSufficientBalance: Boolean(result.hasSufficientBalance),
        userBalance: typeof result.userBalance === 'number' ? result.userBalance : 0
      };
    } catch (error: any) {
      console.error('❌ CartService.getCartItems error:', error);
      // Return fallback data instead of throwing
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
      return typeof result === 'number' ? result : 0;
    } catch (error: any) {
      console.error('❌ CartService.getCartCount error:', error);
      return 0; // Return fallback instead of throwing
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
      console.error('❌ CartService.updateCartItem error:', error);
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
      console.error('❌ CartService.removeFromCart error:', error);
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
      console.error('❌ CartService.clearCart error:', error);
      throw new Error(error.message || 'Səbət təmizlənərkən xəta baş verdi');
    }
  }

  async proceedToCheckout(): Promise<{ success: boolean; message: string; orderCount: number; redirectUrl?: string }> {
    try {
      console.log('🛒 Starting API checkout process...');
      
      // JWT-based API call
      const result = await apiClient.post<{ success: boolean; message: string; orderCount: number; redirectUrl?: string }>('/api/checkout', '', {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      console.log('🛒 Checkout result:', result);
      return result;
    } catch (error: any) {
      console.error('❌ CartService.proceedToCheckout error:', error);
      throw new Error(error.message || 'Sipariş verərkən xəta baş verdi');
    }
  }
}

export const cartService = new CartService();