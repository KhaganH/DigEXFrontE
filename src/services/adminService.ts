import { apiClient } from './api';

// User interfaces
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  balance: number;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
  storeName?: string;
  storeDescription?: string;
  phoneNumber?: string;
  sellerRequestPending: boolean;
  online: boolean;
  lastSeenAt?: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  sellersCount: number;
  adminsCount: number;
  pendingSellerRequests: number;
  onlineUsers: number;
  newUsersThisMonth: number;
}

export interface BalanceRequest {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
  };
  amount: number;
  paymentMethod: {
    id: number;
    bankName: string;
    cardNumber: string;
    cardHolderName: string;
    isActive: boolean;
  };
  receiptImagePath: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  processedAt?: string;
  approvedBy?: {
    id: number;
    username: string;
  };
  adminNotes?: string;
}

export interface PaymentMethod {
  id: number;
  bankName: string;
  cardNumber: string;
  cardHolderName: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface BalanceRequestStats {
  pendingCount: number;
  monthlyApproved: number;
  monthlyAmount: number;
  totalAmount: number;
}

export interface PaymentMethodStats {
  activeMethodsCount: number;
  pendingRequestsCount: number;
  totalMethodsCount: number;
}

// Pending Seller interfaces
export interface PendingSeller {
  id: number;
  email: string;
  username: string;
  storeName: string;
  storeDescription: string;
  phoneNumber: string;
  category: string;
  experience: string;
  website: string;
  socialMedia: string;
  motivation: string;
  sellerRequestPending: boolean;
  createdAt: string;
  role: string;
  isActive: boolean;
  balance: number;
}

// Balance Requests API
export const getBalanceRequests = async (status?: string): Promise<BalanceRequest[]> => {
  const params = status ? `?status=${status}` : '';
  const response = await apiClient.get<BalanceRequest[]>(`/api/admin/c2c/balance-requests${params}`);
  return response;
};

export const getBalanceRequestStats = async (): Promise<BalanceRequestStats> => {
  const response = await apiClient.get<BalanceRequestStats>('/api/admin/c2c/balance-requests/stats');
  return response;
};

export const approveBalanceRequest = async (id: number, adminNotes?: string): Promise<void> => {
  const formData = new FormData();
  if (adminNotes) {
    formData.append('adminNotes', adminNotes);
  }
  await apiClient.post(`/api/admin/c2c/balance-requests/${id}/approve`, formData);
};

export const rejectBalanceRequest = async (id: number, adminNotes?: string): Promise<void> => {
  const formData = new FormData();
  if (adminNotes) {
    formData.append('rejectionReason', adminNotes);
  }
  await apiClient.post(`/api/admin/c2c/balance-requests/${id}/reject`, formData);
};

// Payment Methods API
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await apiClient.get<PaymentMethod[]>('/api/admin/c2c/payment-methods');
  return response;
};

export const getPaymentMethodStats = async (): Promise<PaymentMethodStats> => {
  const response = await apiClient.get<PaymentMethodStats>('/api/admin/c2c/payment-methods/stats');
  return response;
};

export const addPaymentMethod = async (data: {
  bankName: string;
  cardNumber: string;
  cardHolderName: string;
  description?: string;
}): Promise<PaymentMethod> => {
  const formData = new FormData();
  formData.append('bankName', data.bankName);
  formData.append('cardNumber', data.cardNumber);
  formData.append('cardHolderName', data.cardHolderName);
  if (data.description) {
    formData.append('description', data.description);
  }
  
  const response = await apiClient.post<PaymentMethod>('/api/admin/c2c/payment-methods', formData);
  return response;
};

export const togglePaymentMethodStatus = async (id: number): Promise<void> => {
  await apiClient.put(`/api/admin/c2c/payment-methods/${id}/toggle`);
};

export const deletePaymentMethod = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/admin/c2c/payment-methods/${id}`);
};

// Receipts interface
export interface Receipt {
  id: number;
  userId: number;
  username: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  receiptImagePath: string;
  createdAt: string;
  paymentMethod: {
    bankName: string;
    cardNumber: string;
    cardHolderName: string;
  };
}

export const getAllReceipts = async (): Promise<Receipt[]> => {
  const response = await apiClient.get<Receipt[]>('/api/admin/c2c/balance-requests/receipts');
  return response;
};

// Admin Dashboard Stats
export const getAdminStats = async () => {
  const [balanceStats, paymentStats] = await Promise.all([
    getBalanceRequestStats(),
    getPaymentMethodStats()
  ]);
  
  return {
    balanceRequests: balanceStats,
    paymentMethods: paymentStats
  };
};

// Product Management
export interface Product {
  id: number;
  title: string;
  name?: string; // Backward compatibility
  price: number;
  category: {
    id: number;
    name: string;
  };
  seller: {
    id: number;
    username: string;
    name?: string;
    firstName?: string;
    lastName?: string;
  };
  // Alternative seller field names from backend
  createdBy?: {
    id: number;
    username: string;
    name?: string;
    firstName?: string;
    lastName?: string;
  };
  owner?: {
    id: number;
    username: string;
    name?: string;
    firstName?: string;
    lastName?: string;
  };
  user?: {
    id: number;
    username: string;
    name?: string;
    firstName?: string;
    lastName?: string;
  };
  status: 'ACTIVE' | 'PENDING' | 'REJECTED' | 'DISABLED';
  stock: number;
  featured: boolean;
  images: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  pendingApprovals: number;
  featuredProducts: number;
  outOfStock: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  parentId?: number;
  parentName?: string;
  productCount: number;
  icon?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  totalProductsInCategories: number;
  topCategoryName: string;
  topCategoryProductCount: number;
  averageProductsPerCategory: number;
}

// Category API Functions
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await apiClient.get<Category[]>('/admin/api/categories');
    return response;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const getCategoryStats = async (): Promise<CategoryStats> => {
  try {
    const response = await apiClient.get<CategoryStats>('/admin/api/categories/stats');
    return response;
  } catch (error) {
    console.error('Error fetching category stats:', error);
    throw error;
  }
};

export const createCategory = async (categoryData: {
  name: string;
  description: string;
  parentId?: number;
  icon?: string;
  color?: string;
}): Promise<Category> => {
  try {
    const response = await apiClient.post<Category>('/admin/api/categories', categoryData);
    return response;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (id: number, categoryData: {
  name?: string;
  description?: string;
  parentId?: number;
  icon?: string;
  color?: string;
}): Promise<Category> => {
  try {
    const response = await apiClient.put<Category>(`/admin/api/categories/${id}`, categoryData);
    return response;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const toggleCategoryStatus = async (id: number): Promise<void> => {
  try {
    await apiClient.put(`/admin/api/categories/${id}/toggle-status`);
  } catch (error) {
    console.error('Error toggling category status:', error);
    throw error;
  }
};

export const deleteCategory = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/admin/api/categories/${id}`);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await apiClient.get<Product[]>('/admin/api/products');
    return response;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProductStats = async (): Promise<ProductStats> => {
  try {
    const response = await apiClient.get<ProductStats>('/admin/api/products/stats');
    return response;
  } catch (error) {
    console.error('Error fetching product stats:', error);
    throw error;
  }
};

export const approveProduct = async (id: number): Promise<void> => {
  try {
    await apiClient.post(`/admin/api/products/${id}/approve`);
  } catch (error) {
    console.error('Error approving product:', error);
    throw error;
  }
};

export const rejectProduct = async (id: number): Promise<void> => {
  try {
    await apiClient.post(`/admin/api/products/${id}/reject`);
  } catch (error) {
    console.error('Error rejecting product:', error);
    throw error;
  }
};

export const toggleProductFeatured = async (id: number): Promise<void> => {
  try {
    await apiClient.post(`/admin/api/products/${id}/toggle-featured`);
  } catch (error) {
    console.error('Error toggling product featured:', error);
    throw error;
  }
};

export const updateProduct = async (id: number, productData: Partial<Product>): Promise<Product> => {
  try {
    const response = await apiClient.put<Product>(`/api/admin/products/${id}`, productData);
    return response;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/admin/products/${id}`);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

export const getPendingProducts = async (): Promise<Product[]> => {
  try {
    const response = await apiClient.get<Product[]>('/admin/api/products/pending');
    console.log('🔍 Pending products API response:', response);
    return response;
  } catch (error) {
    console.error('Error fetching pending products:', error);
    throw error;
  }
};

export const getPendingProductsStats = async () => {
  try {
    // Backend'de pending-stats endpoint'i yok, bu yüzden basit stats döndürüyoruz
    const pendingProducts = await getPendingProducts();
    return {
      totalPending: pendingProducts.length,
      pendingToday: 0, // Backend'de bu hesaplama yok
      pendingThisWeek: 0, // Backend'de bu hesaplama yok
      averageApprovalTime: 0 // Backend'de bu hesaplama yok
    };
  } catch (error) {
    console.error('Error fetching pending products stats:', error);
    
    // If API fails, return default stats to prevent crashes
    return {
      totalPending: 0,
      pendingToday: 0,
      pendingThisWeek: 0,
      averageApprovalTime: 0
    };
  }
};

// Pending Sellers API Functions - Using UserController endpoints
export const getPendingSellers = async (): Promise<User[]> => {
  try {
    const response = await apiClient.get<User[]>('/api/users/pending-seller-requests');
    return response;
  } catch (error) {
    console.error('Error fetching pending sellers:', error);
    throw error;
  }
};

// Orders interfaces və functions
export interface Order {
  id: number;
  orderNumber: string;
  buyer: {
    id: number;
    username: string;
    email: string;
  };
  seller: {
    id: number;
    username: string;
    email: string;
  };
  product: {
    id: number;
    title: string;
    price: number;
    imageUrl?: string;
  };
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  commissionAmount: number;
  sellerAmount: number;
  status: 'PENDING' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  deliveryInfo?: string;
  stockCode?: string;
  createdAt: string;
  updatedAt?: string;
  deliveredAt?: string;
  completedAt?: string;
}

export interface OrderStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  monthlyRevenue: string;
}

// Transactions interfaces
export interface Transaction {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
  };
  type: 'DEPOSIT' | 'PURCHASE' | 'SALE' | 'COMMISSION' | 'WITHDRAWAL' | 'ADMIN_DEPOSIT' | 'ADMIN_DEDUCT';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  status: string;
  createdAt: string;
  order?: {
    id: number;
    orderNumber: string;
  };
}

export interface TransactionStats {
  totalDeposits: string;
  totalCommissions: string;
  totalTransactions: number;
  monthlyTransactions: number;
}

// Admin Orders API functions - Mövcud backend endpoint'lərindən istifadə edirik
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    console.log('🔄 Fetching all orders from API...');
    // Backend'də admin üçün ayrıca endpoint yoxdur, buyer və seller orders birləşdiririk
    const response = await apiClient.get<Order[]>('/api/orders');
    console.log('✅ Orders fetched successfully:', response);
    return response;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const getOrderStats = async (): Promise<OrderStats> => {
  try {
    console.log('🔄 Fetching order stats...');
    // Dashboard stats-dan order məlumatlarını alırıq
    const dashboardStats = await apiClient.get<any>('/admin/api/dashboard/stats');
    
    const stats: OrderStats = {
      totalOrders: (dashboardStats.completedOrders || 0) + (dashboardStats.pendingOrders || 0) + (dashboardStats.cancelledOrders || 0),
      completedOrders: dashboardStats.completedOrders || 0,
      pendingOrders: dashboardStats.pendingOrders || 0,
      cancelledOrders: dashboardStats.cancelledOrders || 0,
      monthlyRevenue: dashboardStats.monthlySales || '0'
    };
    
    console.log('✅ Order stats fetched successfully:', stats);
    return stats;
  } catch (error) {
    console.error('Error fetching order stats:', error);
    throw error;
  }
};

// Admin Transactions API functions - Mövcud backend endpoint'lərindən istifadə edirik
export const getAllTransactions = async (): Promise<Transaction[]> => {
  try {
    console.log('🔄 Fetching all transactions from API...');
    const response = await apiClient.get<Transaction[]>('/api/balance/admin/all-transactions');
    console.log('✅ Transactions fetched successfully:', response);
    return response;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export const getRecentTransactions = async (limit: number = 20): Promise<Transaction[]> => {
  try {
    console.log('🔄 Fetching recent transactions from API...');
    const response = await apiClient.get<Transaction[]>(`/api/balance/admin/recent-transactions?limit=${limit}`);
    console.log('✅ Recent transactions fetched successfully:', response);
    return response;
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    throw error;
  }
};

export const getTransactionStats = async (): Promise<TransactionStats> => {
  try {
    console.log('🔄 Fetching transaction stats...');
    // Mövcud endpoint'lərdən məlumatları topluyuruq
    const [totalCommissions, dashboardStats] = await Promise.all([
      apiClient.get<number>('/api/balance/admin/total-commissions'),
      apiClient.get<any>('/admin/api/dashboard/stats')
    ]);
    
    const stats: TransactionStats = {
      totalDeposits: dashboardStats.totalCommissions?.toString() || '0',
      totalCommissions: totalCommissions.toString(),
      totalTransactions: 0, // Backend'də bu məlumat yoxdur
      monthlyTransactions: 0 // Backend'də bu məlumat yoxdur
    };
    
    console.log('✅ Transaction stats fetched successfully:', stats);
    return stats;
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    throw error;
  }
};

// User functions
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await apiClient.get<User[]>('/api/users');
    return response;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserById = async (id: number): Promise<User> => {
  try {
    const response = await apiClient.get<User>(`/api/users/${id}`);
    return response;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const updateUser = async (id: number, userData: Partial<User>): Promise<User> => {
  try {
    const response = await apiClient.put<User>(`/api/users/${id}`, userData);
    return response;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/users/${id}`);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const requestSellerStatus = async (
  id: number, 
  storeName: string, 
  storeDescription: string, 
  phoneNumber: string
): Promise<User> => {
  try {
    const queryParams = new URLSearchParams({
      storeName,
      storeDescription,
      phoneNumber
    });
    const response = await apiClient.post<User>(`/api/users/${id}/request-seller?${queryParams}`);
    return response;
  } catch (error) {
    console.error('Error requesting seller status:', error);
    throw error;
  }
};

export const approveSellerStatus = async (id: number): Promise<User> => {
  try {
    const response = await apiClient.post<User>(`/api/users/${id}/approve-seller`);
    return response;
  } catch (error) {
    console.error('Error approving seller:', error);
    throw error;
  }
};

export const rejectSellerStatus = async (id: number): Promise<User> => {
  try {
    const response = await apiClient.post<User>(`/api/users/${id}/reject-seller`);
    return response;
  } catch (error) {
    console.error('Error rejecting seller:', error);
    throw error;
  }
};

// Pending sellers functions (using UserController endpoints)
export const getPendingSellerRequests = async (): Promise<User[]> => {
  try {
    const response = await apiClient.get<User[]>('/api/users/pending-seller-requests');
    return response;
  } catch (error) {
    console.error('Error fetching pending seller requests:', error);
    throw error;
  }
};

export const approveSellerRequest = async (id: number): Promise<void> => {
  try {
    await apiClient.post(`/api/users/${id}/approve-seller`);
  } catch (error) {
    console.error('Error approving seller request:', error);
    throw error;
  }
};

export const rejectSellerRequest = async (id: number): Promise<void> => {
  try {
    await apiClient.post(`/api/users/${id}/reject-seller`);
  } catch (error) {
    console.error('Error rejecting seller request:', error);
    throw error;
  }
};

export const getUserStats = async (): Promise<UserStats> => {
  try {
    const users = await getAllUsers();
    
    const stats: UserStats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.active).length,
      inactiveUsers: users.filter(u => !u.active).length,
      sellersCount: users.filter(u => u.role === 'SELLER').length,
      adminsCount: users.filter(u => u.role === 'ADMIN').length,
      pendingSellerRequests: users.filter(u => u.sellerRequestPending).length,
      onlineUsers: users.filter(u => u.online).length,
      newUsersThisMonth: users.filter(u => {
        const createdAt = new Date(u.createdAt);
        const now = new Date();
        return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
      }).length
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};

// Admin balance operations
export const adminAddBalance = async (userId: number, amount: number, description: string): Promise<void> => {
  try {
    const params = new URLSearchParams({
      amount: amount.toString(),
      description: description
    });
    await apiClient.post(`/api/balance/admin/deposit/${userId}?${params}`);
  } catch (error) {
    console.error('Error adding balance:', error);
    throw error;
  }
};

export const adminDeductBalance = async (userId: number, amount: number, description: string): Promise<void> => {
  try {
    const params = new URLSearchParams({
      amount: amount.toString(),
      description: description
    });
    await apiClient.post(`/api/balance/admin/deduct/${userId}?${params}`);
  } catch (error) {
    console.error('Error deducting balance:', error);
    throw error;
  }
};

export const toggleUserStatus = async (userId: number): Promise<void> => {
  try {
    await apiClient.put(`/api/users/${userId}/toggle-status`);
  } catch (error) {
    console.error('Error toggling user status:', error);
    throw error;
  }
};

export default {
  getBalanceRequests,
  getBalanceRequestStats,
  approveBalanceRequest,
  rejectBalanceRequest,
  getPaymentMethods,
  getPaymentMethodStats,
  addPaymentMethod,
  togglePaymentMethodStatus,
  deletePaymentMethod,
  getAdminStats,
  getCategories,
  getCategoryStats,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
  getProducts,
  getProductStats,
  approveProduct,
  rejectProduct,
  toggleProductFeatured,
  updateProduct,
  deleteProduct,
  getPendingProducts,
  getPendingProductsStats,
  getPendingSellers,
  approveSellerRequest,
  rejectSellerRequest,
  getAllOrders,
  getOrderStats,
  getAllTransactions,
  getRecentTransactions,
  getTransactionStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  requestSellerStatus,
  approveSellerStatus,
  rejectSellerStatus,
  getPendingSellerRequests,
  getUserStats,
  adminAddBalance,
  adminDeductBalance,
  toggleUserStatus
};