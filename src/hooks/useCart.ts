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
      console.log('🛒 Auth token exists:', !!localStorage.getItem('authToken'));
      setIsLoading(true);
      // Safely get cart count
      const count = await cartService.getCartCount();
      console.log('🛒 Cart count received:', count, 'type:', typeof count);
      const finalCount = typeof count === 'number' ? count : 0;
      console.log('🛒 Final cart count set to:', finalCount);
      setCartCount(finalCount);
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
      console.log('🛒 useCart: Adding to cart - productId:', productId, 'quantity:', quantity);
      const response = await cartService.addToCart(productId, quantity);
      console.log('🛒 useCart: Add to cart response:', response);
      
      if (response.success && typeof response.cartCount === 'number') {
        console.log('🛒 useCart: Updating cart count to:', response.cartCount);
      setCartCount(response.cartCount);
      } else {
        console.log('🛒 useCart: Response success is false or cartCount is invalid, refreshing cart');
        await fetchCart(); // Refresh cart count
      }
      
      return response;
    } catch (error) {
      console.error('❌ useCart: Add to cart error:', error);
      throw error;
    }
  };

  const updateCartItem = async (cartItemId: number, quantity: number) => {
    try {
      console.log('🛒 useCart: Updating cart item:', cartItemId, 'quantity:', quantity);
      const response = await cartService.updateCartItem(cartItemId, quantity);
      console.log('🛒 useCart: Update cart item response:', response);
      
      // Update both full cart data and count
      await fetchFullCart();
      
      return response;
    } catch (error) {
      console.error('❌ useCart: Update cart item error:', error);
      throw error;
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    try {
      console.log('🛒 useCart: Removing from cart:', cartItemId);
      const response = await cartService.removeFromCart(cartItemId);
      console.log('🛒 useCart: Remove from cart response:', response);
      
      if (response.success && typeof response.cartCount === 'number') {
        setCartCount(response.cartCount);
        // Also update full cart data
        await fetchFullCart();
      } else {
        await fetchCart();
      }
      
      return response;
    } catch (error) {
      console.error('❌ useCart: Remove from cart error:', error);
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