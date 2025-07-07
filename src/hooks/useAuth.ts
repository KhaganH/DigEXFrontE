import { useState, useEffect } from 'react';
import { authService, User } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const currentUser = authService.getCurrentUser();
      const isAuth = authService.isAuthenticated();
      
      setUser(currentUser);
      setIsAuthenticated(isAuth);
      setIsLoading(false);
    };

    initAuth();
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
    login,
    register,
    logout,
  };
};