import { useState, useEffect } from 'react';
import { authService, User } from '../services/authService';
import { balanceService } from '../services/balanceService';
import { eventEmitter, EVENTS } from '../utils/eventEmitter';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState<number>(0);

  const fetchBalance = async () => {
    if (isAuthenticated && user) {
      try {
        const userBalance = await balanceService.getBalance();
        setBalance(userBalance);
        
        // Emit balance updated event
        eventEmitter.emit(EVENTS.BALANCE_UPDATED, userBalance);
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      }
    }
  };

  // Check authentication status
  const checkAuthStatus = () => {
    const currentUser = authService.getCurrentUser();
    const isAuth = authService.isAuthenticated();
    
    // Eğer şu anki durum ile yeni durum farklıysa update et
    if (isAuth !== isAuthenticated) {
      setIsAuthenticated(isAuth);
      setUser(isAuth ? currentUser : null);
      
      if (!isAuth) {
        setBalance(0);
        console.log('🔒 User logged out due to expired token');
      }
    }
  };

  useEffect(() => {
    const initAuth = () => {
      const currentUser = authService.getCurrentUser();
      const isAuth = authService.isAuthenticated();
      
      console.log('🔍 useAuth initAuth - Current user:', currentUser);
      console.log('🔍 useAuth initAuth - Is authenticated:', isAuth);
      
      setUser(currentUser);
      setIsAuthenticated(isAuth);
      setIsLoading(false); // Her durumda loading'i false yap
      
      console.log('🔍 useAuth initAuth - Loading set to false');
    };

    initAuth();
  }, []);

  // Periyodik token kontrolü
  useEffect(() => {
    if (isAuthenticated) {
      // Her 30 saniyede bir token'ı kontrol et
      const tokenCheckInterval = setInterval(() => {
        checkAuthStatus();
      }, 30000);

      return () => {
        clearInterval(tokenCheckInterval);
      };
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBalance();
    } else {
      setBalance(0);
    }
  }, [isAuthenticated, user]);

  // Listen for balance update events  
  useEffect(() => {
    const handleBalanceUpdate = (newBalance: number) => {
      setBalance(newBalance);
    };

    eventEmitter.on(EVENTS.BALANCE_UPDATED, handleBalanceUpdate);

    return () => {
      eventEmitter.off(EVENTS.BALANCE_UPDATED, handleBalanceUpdate);
    };
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login({ username, password });
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      const user = await authService.register(userData);
      // Register'dan sonra login yapmaya çalışalım
      const loginResponse = await authService.login({ 
        username: userData.username, 
        password: userData.password 
      });
      setUser(loginResponse.user);
      setIsAuthenticated(true);
      return loginResponse;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    balance,
    login,
    register,
    logout,
    refreshBalance: fetchBalance,
  };
};