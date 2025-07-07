import { apiClient } from './api';
import { Seller } from './productService';

export interface SellerStats {
  totalSales: number;
  totalProducts: number;
  totalEarnings: number;
  rating: number;
  reviewCount: number;
}

class SellerService {
  async getSellers(): Promise<Seller[]> {
    // Backend'de seller endpoint'i yok, geçici olarak boş array dönüyoruz
    return Promise.resolve([]);
  }

  async getSeller(id: number): Promise<Seller> {
    // Backend'de seller endpoint'i yok, geçici olarak boş obje dönüyoruz
    return Promise.resolve({
      id: id,
      username: '',
      storeName: '',
      storeDescription: '',
      rating: 0,
      productCount: 0,
      isVerified: false
    });
  }

  async getSellerStats(id: number): Promise<SellerStats> {
    // Backend'de seller endpoint'i yok, geçici olarak boş stats dönüyoruz
    return Promise.resolve({
      totalSales: 0,
      totalProducts: 0,
      totalEarnings: 0,
      rating: 0,
      reviewCount: 0
    });
  }
}

export const sellerService = new SellerService();