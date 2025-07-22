// API Base Configuration
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:1111' 
  : 'https://digexbackend-9jnlk.ondigitalocean.app';

// API Client with interceptors
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get token from localStorage and validate it
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };
    
    // Add Authorization header if token exists and is valid
    if (token) {
      // Check if token is expired
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decoded = JSON.parse(jsonPayload);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp > currentTime) {
          headers['Authorization'] = `Bearer ${token}`;
        } else {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          throw new Error('Token expired - please login again');
        }
      } catch (error) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        throw new Error('Invalid token - please login again');
      }
    }
    
    // Add Content-Type only if not already specified and not FormData
    const isFormData = options.body instanceof FormData;
    if (!headers['Content-Type'] && !isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    const config: RequestInit = {
      ...options,
      headers,
    };
    
    // DEBUG: Log request details AFTER config is built
    console.log('🔄 API Request:', {
      url,
      method: config.method || 'GET',
      headers: config.headers
    });


    try {
      const response = await fetch(url, config);
      
      // Handle unauthorized
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        // Check if we're not already on login page to prevent infinite redirects
        if (!window.location.pathname.includes('login')) {
          window.location.href = '/login';
        }
        throw new Error('Yetkilendirme hatası - yeniden giriş yapın');
      }

      if (!response.ok) {
        const errorText = await response.text();
        
        // Check if it's HTML (login page or error page)
        if (errorText.includes('<!DOCTYPE') || errorText.includes('<html>')) {
          // This usually means we're getting a login page instead of API response
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          throw new Error('Yetkilendirme səhvi - yenidən daxil olun');
        }
        
        try {
          const errorData = JSON.parse(errorText);
          // Backend often sends error responses with success: false and message
          if (errorData.success === false && errorData.message) {
            throw new Error(errorData.message);
          }
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        } catch (jsonError) {
          // If JSON parsing fails, try to extract error message from plain text
          // Backend might be sending plain text error messages
          if (errorText.includes('Öz məhsulunuzu ala bilməzsiniz')) {
            throw new Error('Öz məhsulunuzu ala bilməzsiniz');
          }
          throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
        }
      }

      // Handle different response types
      const contentType = response.headers.get('content-type');
      const responseText = await response.text();
      
      console.log('📄 Raw Response:', responseText.substring(0, 100) + '...');
      
      if (contentType && contentType.includes('application/json')) {
        if (responseText) {
          try {
            const parsed = JSON.parse(responseText);
            
            // Backend now sends clean responses, no need for sanitization
            
            return parsed;
          } catch (e) {
            // If it's just a number or string, return as is
            if (!isNaN(Number(responseText))) {
              return Number(responseText) as T;
            }
            return responseText as T;
          }
        }
      }
      
      // Try to parse as JSON anyway
      try {
        const parsed = JSON.parse(responseText);
        
        // Backend now sends clean responses, no need for sanitization
        
        return parsed;
      } catch (e) {
        // If it's just a number or string, return as is
        if (!isNaN(Number(responseText))) {
          return Number(responseText) as T;
        }
        return responseText as T;
      }
    } catch (error) {
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const optionsHeaders = options?.headers as Record<string, string> || {};
    const isFormData = optionsHeaders['Content-Type'] === 'application/x-www-form-urlencoded';
    
    return this.request<T>(endpoint, {
      method: 'POST',
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
      ...options,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }


}

export const apiClient = new ApiClient(API_BASE_URL);