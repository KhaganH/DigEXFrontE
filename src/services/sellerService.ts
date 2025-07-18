import { apiClient } from './api';
import { Seller } from './productService';

export interface SellerStats {
  totalSales: number;
  totalProducts: number;
  totalEarnings: number;
  rating: number;
  reviewCount: number;
}

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  pendingProducts: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalEarnings: number;
  monthlyEarnings: number;
  totalCustomers: number;
  averageRating: number;
}

export interface RecentOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  productName: string;
  amount: number;
  status: string;
  createdAt: string;
  productCount: number;
}

export interface TopProduct {
  id: number;
  name: string;
  sales: number;
  revenue: number;
  imageUrl?: string;
}

export interface SellerProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  isActive: boolean;
  isApproved: boolean;
  isPremium: boolean;
  categoryId: number;
  categoryName: string;
  category?: {
    id: number;
    name: string;
  };
  salesCount: number;
  createdAt: string;
}

export interface SellerOrder {
  id: number;
  orderNumber: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  totalAmount: number;
  quantity: number;
  status: string;
  deliveryType: string;
  productImage?: string;
  createdAt: string;
  updatedAt?: string;
  deliveryInfo?: string;
  stockCode?: string;
  stockData?: string;
  manualInstructions?: string;
  trackingNumber?: string;
  deliveryMethod?: string;
  shippingAddress?: string;
  notes?: string;
}

export interface SellerEarning {
  id: number;
  orderId: number;
  productName: string;
  amount: number;
  commission: number;
  netAmount: number;
  date: string;
}

export interface Transaction {
  id: number;
  type: string;
  description: string;
  amount: number;
  date: string;
  status: string;
}

export interface Withdrawal {
  id: number;
  method: string;
  accountInfo: string;
  amount: number;
  date: string;
  status: string;
}

export interface EarningsData {
  totalEarnings: number;
  pendingEarnings: number;
  availableBalance: number;
  monthlyEarnings: number;
  transactions: Transaction[];
  withdrawalHistory: Withdrawal[];
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  isActive: boolean;
  status?: 'active' | 'inactive';
}

class SellerService {
  async getSellers(): Promise<Seller[]> {
    try {
      // Gerçek API endpoint'i varsa onu kullan, yoksa mock data dön
      const result = await apiClient.get<Seller[]>('/api/public/sellers');
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.log('⚠️ Sellers API not available, using mock data');
      // Mock data - tecrübeli satıcılar için
      return [
        {
          id: 1,
          username: 'TechMaster',
          storeName: 'Tech Store',
          storeDescription: 'En yeni teknoloji ürünleri və oyunlar',
          rating: 4.8,
          productCount: 25,
          isVerified: true
        },
        {
          id: 2,
          username: 'GameZone',
          storeName: 'Gaming World',
          storeDescription: 'PC və konsol oyunları, Steam açarları',
          rating: 4.9,
          productCount: 42,
          isVerified: true
        },
        {
          id: 3,
          username: 'DigitalHub',
          storeName: 'Digital Services',
          storeDescription: 'Rəqəmsal xidmətlər və lisenziyalar',
          rating: 4.7,
          productCount: 18,
          isVerified: true
        },
        {
          id: 4,
          username: 'ProSeller',
          storeName: 'Pro Market',
          storeDescription: 'Professional məhsullar və xidmətlər',
          rating: 4.6,
          productCount: 33,
          isVerified: true
        }
      ];
    }
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

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await apiClient.get('/api/seller/dashboard/stats');
      
      // Response yapısını kontrol et
      const data = response || {};
      
      return {
        totalProducts: Number((data as any).totalProducts) || 0,
        activeProducts: Number((data as any).activeProducts) || 0,
        pendingProducts: Number((data as any).pendingProducts) || 0,
        totalOrders: Number((data as any).totalOrders) || 0,
        completedOrders: Number((data as any).completedOrders) || 0,
        pendingOrders: Number((data as any).pendingOrders) || 0,
        totalEarnings: Number((data as any).totalEarnings) || 0,
        monthlyEarnings: Number((data as any).monthlyEarnings) || 0,
        totalCustomers: Number((data as any).totalCustomers) || 0,
        averageRating: Number((data as any).averageRating) || 0
      };
    } catch (error) {
      throw error;
    }
  }

  async getRecentOrders(): Promise<RecentOrder[]> {
    try {
      const response = await apiClient.get('/api/seller/orders/recent');
      
      // Response yapısını kontrol et
      const data = response || [];
      
      if (!Array.isArray(data)) {
        return [];
      }
      
      return data.map((order: any) => ({
        id: order.id || 0,
        orderNumber: order.orderNumber || `ORD-${order.id}`,
        customerName: order.customerName || 'Müştəri',
        productName: order.productName || 'Məhsul',
        amount: Number(order.amount) || 0,
        status: order.status || 'PENDING',
        createdAt: order.createdAt || new Date().toISOString(),
        productCount: 1
      }));
    } catch (error) {
      throw error;
    }
  }

  async getTopProducts(): Promise<TopProduct[]> {
    try {
      const response = await apiClient.get('/api/seller/products/top');
      
      // Response yapısını kontrol et
      const data = response || [];
      
      if (!Array.isArray(data)) {
        return [];
      }
      
      return data.map((product: any) => ({
        id: product.id || 0,
        name: product.name || 'Məhsul',
        sales: Number(product.sales) || 0,
        revenue: Number(product.revenue) || 0,
        imageUrl: product.imageUrl || '/placeholder-product.jpg'
      }));
    } catch (error) {
      throw error;
    }
  }

  // Seller Products
  async getSellerProducts(): Promise<SellerProduct[]> {
    try {
      const response = await apiClient.get('/api/seller/products');
      
      const data = response || [];
      
      if (!Array.isArray(data)) {
        return [];
      }
      
      return data.map((product: any) => ({
        id: product.id || 0,
        title: product.title || 'Məhsul',
        description: product.description || '',
        price: Number(product.price) || 0,
        stock: Number(product.stock) || 0,
        imageUrl: product.imageUrl || '/placeholder-product.jpg',
        isActive: product.isActive || false,
        isApproved: product.isApproved || false,
        isPremium: product.isPremium || false,
        categoryId: product.categoryId || 0,
        categoryName: product.categoryName || 'Kateqoriya',
        category: product.category || { id: product.categoryId || 0, name: product.categoryName || 'Kateqoriya' },
        salesCount: product.salesCount || 0,
        createdAt: product.createdAt || new Date().toISOString()
      }));
    } catch (error) {
      throw error;
    }
  }

  // Alias for getSellerProducts
  async getProducts(): Promise<SellerProduct[]> {
    return this.getSellerProducts();
  }

  // Seller Orders
  async getSellerOrders(): Promise<SellerOrder[]> {
    try {
      const response = await apiClient.get('/api/seller/orders/list');
      
      const data = response || [];
      
      if (!Array.isArray(data)) {
        return [];
      }
      
      return data.map((order: any) => ({
        id: order.id || 0,
        orderNumber: order.orderNumber || `ORD-${order.id}`,
        productName: order.productName || 'Məhsul',
        customerName: order.customerName || 'Müştəri',
        customerEmail: order.customerEmail || '',
        amount: Number(order.totalAmount || order.amount) || 0,
        totalAmount: Number(order.totalAmount || order.amount) || 0,
        quantity: Number(order.quantity) || 1,
        status: order.status || 'PENDING',
        deliveryType: order.deliveryType || 'manual',
        productImage: order.productImage || '',
        createdAt: order.createdAt || new Date().toISOString(),
        updatedAt: order.updatedAt,
        deliveryInfo: order.deliveryInfo,
        stockCode: order.stockCode,
        stockData: order.stockData,
        manualInstructions: order.manualInstructions,
        trackingNumber: order.trackingNumber,
        deliveryMethod: order.deliveryMethod,
        shippingAddress: order.shippingAddress,
        notes: order.notes
      }));
    } catch (error) {
      throw error;
    }
  }

  // Update Order Status
  async updateOrderStatus(orderId: number, status: string): Promise<boolean> {
    try {
      await apiClient.put(`/api/seller/orders/${orderId}/status`, { status });
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Analytics
  async getAnalytics(): Promise<any> {
    try {
      const response = await apiClient.get('/api/seller/analytics');
      return response || {};
    } catch (error) {
      throw error;
    }
  }

  // Toggle Product Status
  async toggleProductStatus(productId: number): Promise<boolean> {
    try {
      await apiClient.put(`/api/seller/products/${productId}/toggle-status`);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Delete Product
  async deleteProduct(productId: number): Promise<boolean> {
    try {
      await apiClient.delete(`/api/seller/products/${productId}`);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Make Product Premium
  async makeProductPremium(productId: number): Promise<boolean> {
    try {
      await apiClient.put(`/api/seller/products/${productId}/make-premium`);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Alias for getSellerOrders
  async getOrders(): Promise<SellerOrder[]> {
    return this.getSellerOrders();
  }

  // Get Earnings (EarningsData)
  async getEarnings(): Promise<EarningsData> {
    try {
      // 1. Qazanc overview'u çek
      const overviewRes: any = await apiClient.get('/api/seller/earnings/overview');
      const overview = overviewRes?.data || {};
      // 2. Son əməliyyatlar (transactions)
      const transactionsRes: any = await apiClient.get('/api/seller/earnings/transactions');
      const transactions = transactionsRes?.data || [];
      // 3. Çıxarma tarixçəsi (withdrawalHistory)
      const withdrawalHistoryRes: any = await apiClient.get('/api/seller/earnings/withdrawals');
      const withdrawalHistory = withdrawalHistoryRes?.data || [];

      return {
        totalEarnings: Number(overview?.totalEarnings) || 0,
        pendingEarnings: Number(overview?.pendingEarnings) || 0,
        availableBalance: Number(overview?.availableBalance) || 0,
        monthlyEarnings: Number(overview?.monthlyEarnings) || 0,
        transactions: Array.isArray(transactions) ? transactions.map((t: any) => ({
          id: t.id || 0,
          type: t.type || 'sale',
          description: t.description || '',
          amount: Number(t.amount) || 0,
          date: t.date || new Date().toISOString(),
          status: t.status || 'completed',
        })) : [],
        withdrawalHistory: Array.isArray(withdrawalHistory) ? withdrawalHistory.map((w: any) => ({
          id: w.id || 0,
          method: w.method || '',
          accountInfo: w.accountInfo || '',
          amount: Number(w.amount) || 0,
          date: w.date || new Date().toISOString(),
          status: w.status || 'Tamamlandı',
        })) : [],
      };
    } catch (error) {
      throw error;
    }
  }

  // Get Customers
  async getCustomers(): Promise<{ customers: Customer[]; stats: { total: number; active: number; inactive: number; totalRevenue: number } }> {
    try {
      const response: any = await apiClient.get('/api/seller/customers');
      const data = response?.data || {};
      const customersArr = Array.isArray(data.customers) ? data.customers : [];
      const statsObj = data.stats || { total: 0, active: 0, inactive: 0, totalRevenue: 0 };

      const customers: Customer[] = customersArr.map((customer: any) => ({
        id: customer.id || 0,
        name: customer.name || 'Müştəri',
        email: customer.email || '',
        totalOrders: Number(customer.totalOrders) || 0,
        totalSpent: Number(customer.totalSpent) || 0,
        lastOrderDate: customer.lastOrderDate || new Date().toISOString(),
        isActive: customer.isActive || false,
        status: customer.isActive ? 'active' : 'inactive',
      }));

      return {
        customers,
        stats: {
          total: Number(statsObj.total) || customers.length,
          active: Number(statsObj.active) || customers.filter(c => c.isActive).length,
          inactive: Number(statsObj.inactive) || customers.filter(c => !c.isActive).length,
          totalRevenue: Number(statsObj.totalRevenue) || customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get Reports
  async getReports(): Promise<any> {
    try {
      const response = await apiClient.get('/api/seller/reports');
      
      return response || {
        salesReport: [],
        productReport: [],
        customerReport: [],
        earningsReport: []
      };
    } catch (error) {
      throw error;
    }
  }

  // Get Settings
  async getSettings(): Promise<any> {
    try {
      const response = await apiClient.get('/api/seller/settings');
      
      return response || {
        notifications: {
          email: true,
          sms: false,
          push: true
        },
        store: {
          name: '',
          description: '',
          phone: '',
          address: ''
        },
        payment: {
          autoWithdraw: false,
          minWithdrawAmount: 50
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Update Settings
  async updateSettings(settings: any): Promise<boolean> {
    try {
      await apiClient.put('/api/seller/settings', settings);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Tecrübeli satıcıları getir
  async getExperiencedSellers(limit: number = 5) {
    try {
      const response = await apiClient.get(`/api/public/sellers/experienced?limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Tecrübeli satıcılar yüklenirken hata:', error);
      // Mock data döndür
      return [
        { id: 1, username: 'TechMaster', totalSales: 150, revenue: 5000 },
        { id: 2, username: 'GameZone', totalSales: 120, revenue: 4200 },
        { id: 3, username: 'DigitalHub', totalSales: 98, revenue: 3500 },
        { id: 4, username: 'ProSeller', totalSales: 85, revenue: 3000 },
        { id: 5, username: 'CodeGenius', totalSales: 75, revenue: 2800 }
      ];
    }
  }

  // Satıcı sayısını getir
  async getSellerCount() {
    try {
      const response = await apiClient.get('/api/public/sellers/count');
      return (response as any).sellerCount;
    } catch (error) {
      console.error('Satıcı sayısı yüklenirken hata:', error);
      return 0;
    }
  }

  // Manuel siparişi teslim et
  async deliverManualOrder(orderId: number, deliveryInfo: string) {
    try {
      const response = await apiClient.post(`/api/seller/orders/${orderId}/deliver`, {
        deliveryInfo: deliveryInfo
      });
      return response;
    } catch (error) {
      console.error('Manuel sipariş teslim hatası:', error);
      throw error;
    }
  }
}

export const sellerService = new SellerService();

// Satıcı detaylarını getir
export const getSellerDetails = async (sellerId: number) => {
  try {
    const response = await apiClient.get(`/public/sellers/${sellerId}`);
    return (response as any).data;
  } catch (error) {
    console.error('Satıcı detayları yüklenirken hata:', error);
    throw error;
  }
};