import { useState, useEffect } from 'react';
import { cartService, CartSummary } from '../services/cartService';
import { useAuth } from './useAuth';

export const useCart = () => {
  const [cartData, setCartData] = useState<CartSummary | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const fetchCart = async () => {
    if (!isAuthenticated || !user) {
      console.log('🛒 Cart fetch skipped - not authenticated or no user');
      setCartData(null);
      setCartCount(0);
      return;
    }

    try {
      console.log('🛒 Fetching cart count for user:', user.username);
      setIsLoading(true);
      // Safely get cart count
      const count = await cartService.getCartCount();
      console.log('🛒 Cart count received:', count);
      setCartCount(typeof count === 'number' ? count : 0);
    } catch (error) {
      console.error('❌ Error fetching cart:', error);
      setCartCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFullCart = async () => {
    if (!isAuthenticated || !user) {
      setCartData(null);
      setCartCount(0);
      return;
    }

    try {
      setIsLoading(true);
      const fullCartData = await cartService.getCartItems();
      setCartData(fullCartData);
      setCartCount(fullCartData.cartItems.length);
    } catch (error) {
      console.error('Error fetching full cart:', error);
      setCartData(null);
      setCartCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (productId: number, quantity: number = 1) => {
    try {
      const response = await cartService.addToCart(productId, quantity);
      setCartCount(response.cartCount);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const updateCartItem = async (cartItemId: number, quantity: number) => {
    try {
      await cartService.updateCartItem(cartItemId, quantity);
      await fetchCart(); // Refresh cart count
    } catch (error) {
      throw error;
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    try {
      const response = await cartService.removeFromCart(cartItemId);
      setCartCount(response.cartCount);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCartData(null);
      setCartCount(0);
    } catch (error) {
      throw error;
    }
  };

  const updateCartCount = async () => {
    await fetchCart();
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, user]);

  return {
    cartItems: cartData?.cartItems || [],
    cartData,
    cartCount,
    isLoading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart,
    fetchFullCart,
    updateCartCount,
  };
};