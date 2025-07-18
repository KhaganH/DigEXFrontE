import { apiClient } from './api';

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  fileUrl: string;
  category: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    username: string;
    storeName: string;
    avatar?: string;
  };
  isActive: boolean;
  createdAt: string;
  viewCount: number;
  salesCount: number;
  rating?: number;
  reviewCount?: number;
  isPremium?: boolean;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  user: {
    id: number;
    username: string;
    avatar?: string;
  };
  createdAt: string;
  helpful: number;
  reported: boolean;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingCounts: number[];
}

export interface Seller {
  id: number;
  username: string;
  storeName: string;
  storeDescription?: string;
  rating: number;
  productCount: number;
  isVerified: boolean;
  totalSales?: number;
  orderCount?: number;
  totalSold?: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const productService = {
  // Get all products
  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await apiClient.get('/api/public/products') as Product[];
      return response;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  // Get products with pagination
  async getProducts(params: { page?: number; size?: number; sort?: string } = {}): Promise<PaginatedResponse<Product>> {
    try {
      // Backend'de pagination desteği yok, sadece tüm ürünleri alıp frontend'de paginate yapacağız
      const allProducts = await this.getAllProducts();
      const { page = 0, size = 20 } = params;
      
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const content = allProducts.slice(startIndex, endIndex);
      
      return {
        content,
        totalPages: Math.ceil(allProducts.length / size),
        totalElements: allProducts.length,
        size,
        number: page
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: 0,
        number: 0
      };
    }
  },

  // Get product by ID
  async getProductById(id: number): Promise<Product | null> {
    try {
      const response = await apiClient.get(`/api/public/products/${id}`) as Product;
      return response;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },

  // Get premium products
  async getPremiumProducts(): Promise<Product[]> {
    try {
      const response = await apiClient.get('/api/public/products/premium') as Product[];
      return response;
    } catch (error) {
      console.error('Error fetching premium products:', error);
      return [];
    }
  },

  // Get categories
  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiClient.get('/api/public/categories') as Category[];
      return response;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Get products by seller
  async getProductsBySeller(sellerId: number): Promise<Product[]> {
    try {
      const response = await apiClient.get(`/api/public/products/user/${sellerId}`) as Product[];
      return response;
    } catch (error) {
      console.error('Error fetching seller products:', error);
      return [];
    }
  },

  // Get product reviews
  async getProductReviews(productId: number): Promise<Review[]> {
    try {
      const response = await apiClient.get(`/api/public/products/${productId}/reviews`) as Review[];
      return response;
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      return [];
    }
  },

  // Get review statistics
  async getReviewStats(productId: number): Promise<ReviewStats | null> {
    try {
      const response = await apiClient.get(`/api/public/products/${productId}/review-stats`) as ReviewStats;
      return response;
    } catch (error) {
      console.error('Error fetching review stats:', error);
      return null;
    }
  },

  // Add review
  async addReview(productId: number, rating: number, comment: string): Promise<boolean> {
    try {
      await apiClient.post(`/api/products/${productId}/reviews`, {
        rating,
        comment
      });
      return true;
    } catch (error) {
      console.error('Error adding review:', error);
      return false;
    }
  },

  // Mark review as helpful
  async markReviewHelpful(reviewId: number): Promise<boolean> {
    try {
      await apiClient.post(`/api/reviews/${reviewId}/helpful`);
      return true;
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      return false;
    }
  },

  // Add to cart
  async addToCart(productId: number, quantity: number = 1): Promise<boolean> {
    try {
      await apiClient.post('/api/cart/add', {
        productId,
        quantity
      });
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  },



  // Search products
  async searchProducts(query: string, category?: string): Promise<Product[]> {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (category) params.append('category', category);
      
      const response = await apiClient.get(`/api/public/products/search?${params.toString()}`) as Product[];
      return response;
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  },
};

export default productService;