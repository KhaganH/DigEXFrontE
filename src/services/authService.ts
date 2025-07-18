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
      // Handle error silently
    }
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // JWT token'ın expire olup olmadığını kontrol et
  private isTokenExpired(token: string): boolean {
    try {
      // JWT token'ın payload kısmını decode et
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const decoded = JSON.parse(jsonPayload);
      const currentTime = Date.now() / 1000; // Unix timestamp in seconds
      
      return decoded.exp < currentTime;
    } catch (error) {
      return true; // Eğer decode edilemiyorsa expired say
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      return false;
    }

    // Token expire olmuş mu kontrol et
    if (this.isTokenExpired(token)) {
      this.logout(); // Expired token'ı temizle
      return false;
    }

    return true;
  }

  getToken(): string | null {
    const token = localStorage.getItem('authToken');
    
    // Token var ama expire olmuşsa null döndür
    if (token && this.isTokenExpired(token)) {
      this.logout();
      return null;
    }
    
    return token;
  }


}

export const authService = new AuthService();