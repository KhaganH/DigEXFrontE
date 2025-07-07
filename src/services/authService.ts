import { apiClient } from './api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  expiresIn: number;
  user: User;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'USER' | 'SELLER' | 'ADMIN';
  balance: number;
  storeName?: string;
  storeDescription?: string;
  createdAt: string;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/public/login', credentials);
    
    // Store token and user data
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  }

  async register(userData: RegisterRequest): Promise<User> {
    const response = await apiClient.post<User>('/api/public/register', userData);
    
    return response;
  }

  async logout(): Promise<void> {
    try {
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Debug helper to check token validity
  debugTokenInfo(): void {
    const token = this.getToken();
    const user = this.getCurrentUser();
    
    console.log('🔍 Auth Debug Info:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'NO TOKEN',
      isAuthenticated: this.isAuthenticated(),
      user: user ? { id: user.id, username: user.username, role: user.role } : null
    });
  }
}

export const authService = new AuthService();