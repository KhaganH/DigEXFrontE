import { apiClient } from './api';

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  stock: number;
  fileUrl?: string;
  imageUrl?: string;
  code?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userId: number;
  sellerUsername: string;
  isApproved: boolean;
  isPremium: boolean;
  salesCount: number;
  category: CategoryInfo;
  availableStockCount?: number;
  usedStockCount?: number;
  totalStockCount?: number;
  premiumStartDate?: string;
  premiumExpiryDate?: string;
}

export interface CategoryInfo {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Seller {
  id: number;
  username: string;
  storeName?: string;
  storeDescription?: string;
  rating: number;
  productCount: number;
  isVerified: boolean;
}

export interface ProductSearchParams {
  search?: string;
  categoryId?: number;
  sellerId?: number;
  premium?: boolean;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export interface ProductResponse {
  content: Product[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

class ProductService {
  async getProducts(params: ProductSearchParams = {}): Promise<ProductResponse> {
    // Backend paginated response döndermediği için manual pagination yapacağız
    const products = await apiClient.get<Product[]>('/api/public/products');
    
    const page = params.page || 0;
    const size = params.size || 10;
    const startIndex = page * size;
    const endIndex = startIndex + size;
    
    // Filtering
    let filteredProducts = products;
    
    if (params.search) {
      filteredProducts = filteredProducts.filter(p => 
        p.title.toLowerCase().includes(params.search!.toLowerCase()) ||
        p.description.toLowerCase().includes(params.search!.toLowerCase())
      );
    }
    
    if (params.categoryId) {
      filteredProducts = filteredProducts.filter(p => p.category.id === params.categoryId);
    }
    
    if (params.premium !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.isPremium === params.premium);
    }
    
    if (params.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price >= params.minPrice!);
    }
    
    if (params.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price <= params.maxPrice!);
    }
    
    // Paging
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    return {
      content: paginatedProducts,
      totalElements: filteredProducts.length,
      totalPages: Math.ceil(filteredProducts.length / size),
      size: size,
      number: page
    };
  }

  async getProduct(id: number): Promise<Product> {
    return apiClient.get<Product>(`/api/public/products/${id}`);
  }

  async getPremiumProducts(): Promise<Product[]> {
    return apiClient.get<Product[]>('/api/public/products/premium');
  }

  async searchProducts(query: string): Promise<Product[]> {
    const response = await this.getProducts({ search: query });
    return response.content;
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    const response = await this.getProducts({ categoryId });
    return response.content;
  }

  async getProductsBySeller(sellerId: number): Promise<Product[]> {
    const response = await this.getProducts({ sellerId });
    return response.content;
  }
}

export const productService = new ProductService();