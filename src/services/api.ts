// API Base Configuration
const API_BASE_URL = 'http://localhost:1111';

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
    
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };
    
    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add Content-Type only if not already specified
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    
    const config: RequestInit = {
      ...options,
      headers,
    };
    
    // DEBUG: Log request details AFTER config is built
    console.log('🔍 API Request URL:', url);
    console.log('🔍 API Request Token:', token ? `${token.substring(0, 50)}...` : 'NO TOKEN');
    console.log('🔍 API Request Method:', options.method || 'GET');
    console.log('🔍 API Request Headers (Final):', JSON.stringify(config.headers, null, 2));
    console.log('🔍 API Request Body:', options.body ? String(options.body).substring(0, 200) + '...' : 'NO BODY');

    try {
      const response = await fetch(url, config);
      
      // DEBUG: Log response
      console.log('📡 API Response:', {
        url,
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('content-type')
      });
      
      // Handle unauthorized
      if (response.status === 401) {
        console.log('❌ 401 Unauthorized - Clearing tokens');
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
        console.error('❌ API Error Response:', errorText);
        
        // Check if it's HTML (login page or error page)
        if (errorText.includes('<!DOCTYPE') || errorText.includes('<html>')) {
          // This usually means we're getting a login page instead of API response
          console.warn('⚠️ Received HTML instead of JSON - likely authentication issue');
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
            console.error('❌ JSON Parse Error:', e);
            console.log('📄 Failed response text:', responseText.substring(0, 500));
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
      console.error('💥 API Request failed:', error);
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