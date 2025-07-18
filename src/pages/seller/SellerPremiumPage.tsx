import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/api';
import CloudinaryImage from '../../components/CloudinaryImage';
import { Package, Crown, Clock, CheckCircle, XCircle, AlertTriangle, Calendar, TrendingUp } from 'lucide-react';

interface SellerProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  isActive: boolean;
  isApproved: boolean;
  isPremium: boolean;
  premiumStartDate?: string;
  premiumExpiryDate?: string;
  createdAt: string;
  updatedAt: string;
  salesCount?: number;
  category?: {
    id: number;
    name: string;
  };
  // Alternative field names from API
  active?: boolean;
  approved?: boolean;
  premium?: boolean;
  status?: string;
  featured?: boolean;
}

interface PremiumStats {
  totalProducts: number;
  approvedProducts: number;
  premiumProducts: number;
  pendingProducts: number;
}

const SellerPremiumPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [premiumProducts, setPremiumProducts] = useState<SellerProduct[]>([]);
  const [stats, setStats] = useState<PremiumStats>({
    totalProducts: 0,
    approvedProducts: 0,
    premiumProducts: 0,
    pendingProducts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'approved' | 'premium' | 'pending'>('all');

  // Helper functions to safely get field values
  const isProductApproved = (product: any): boolean => {
    return !!(
      product.isApproved || 
      product.approved === true || 
      product.status === 'ACTIVE' || 
      product.status === 'APPROVED'
    );
  };

  const isProductPremium = (product: any): boolean => {
    return !!(
      product.isPremium || 
      product.premium === true || 
      product.featured === true
    );
  };

  const isProductActive = (product: any): boolean => {
    return product.isActive !== false && product.active !== false;
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Starting fetchProducts...');
      
      // Get all products for stats and accurate premium status
      const allProductsResponse = await apiClient.get<SellerProduct[]>('/api/seller/products');
      
      console.log('📦 Raw API Response:', allProductsResponse);
      console.log('📦 API Response Type:', typeof allProductsResponse);
      console.log('📦 API Response is Array:', Array.isArray(allProductsResponse));
      
      // Check if response is valid
      if (!allProductsResponse) {
        console.log('❌ No response from API');
        setError('API-dən cavab gəlmədi');
        return;
      }
      
      if (!Array.isArray(allProductsResponse)) {
        console.log('❌ Response is not an array:', allProductsResponse);
        setError('API cavabı düzgün formatda deyil');
        return;
      }
      
      console.log('✅ Valid API response received, product count:', allProductsResponse.length);
      
      // Debug: Check individual products for premium status
      if (allProductsResponse.length > 0) {
        console.log('🔍 Detailed Product Analysis:');
        allProductsResponse.forEach((product, index) => {
          console.log(`🔍 Product ${index + 1}:`, {
            id: product.id,
            title: product.title,
            isPremium: product.isPremium,
            isApproved: product.isApproved,
            isActive: product.isActive,
            premiumStartDate: product.premiumStartDate,
            premiumExpiryDate: product.premiumExpiryDate,
            status: (product as any).status,
            approved: (product as any).approved // Alternative field name
          });
        });
        
        // Show first product's full structure for debugging
        console.log('🔬 First Product Full Structure:', allProductsResponse[0]);
        console.log('🔍 First Product Keys:', Object.keys(allProductsResponse[0]));
        console.log('🔍 First Product Values for key fields:', {
          id: allProductsResponse[0].id,
          title: allProductsResponse[0].title,
          // Try different possible field names
          isApproved: allProductsResponse[0].isApproved,
          approved: (allProductsResponse[0] as any).approved,
          active: (allProductsResponse[0] as any).active,
          isActive: (allProductsResponse[0] as any).isActive,
          status: (allProductsResponse[0] as any).status,
          isPremium: allProductsResponse[0].isPremium,
          premium: (allProductsResponse[0] as any).premium,
          featured: (allProductsResponse[0] as any).featured,
          premiumExpiryDate: (allProductsResponse[0] as any).premiumExpiryDate,
          premiumStartDate: (allProductsResponse[0] as any).premiumStartDate
        });
      } else {
        console.log('⚠️ No products found in response');
      }
      
      // Filter products based on their current status from the single source of truth
      const allProducts = allProductsResponse || [];
      
      // Check different possible approval field names
      const approvedProducts = allProducts.filter(p => isProductApproved(p));
      
      const premiumProducts = allProducts.filter(p => {
        return isProductPremium(p) && isProductApproved(p);
      });
      
      const nonPremiumApproved = approvedProducts.filter(p => !isProductPremium(p));
      
      // Fallback: If no approved products, show all active products
      let finalApprovedProducts = approvedProducts;
      let finalNonPremiumProducts = nonPremiumApproved;
      
      if (approvedProducts.length === 0) {
        console.log('⚠️ No approved products found, showing all active products as fallback');
        const activeProducts = allProducts.filter(p => isProductActive(p));
        finalApprovedProducts = activeProducts;
        finalNonPremiumProducts = activeProducts.filter(p => !isProductPremium(p));
      }
      
      console.log('📊 Product Statistics:');
      console.log('🔍 All Products:', allProducts.length);
      console.log('🔍 Approved Products:', approvedProducts.length);
      console.log('🔍 Final Approved Products (with fallback):', finalApprovedProducts.length);
      console.log('🔍 Premium Products (approved only):', premiumProducts.length);
      console.log('🔍 Non-Premium Approved Products:', finalNonPremiumProducts.length);
      
      // Debug approved products details
      if (finalApprovedProducts.length > 0) {
        console.log('✅ Sample approved products:', finalApprovedProducts.slice(0, 3));
      }
      
      // Debug premium products details  
      if (premiumProducts.length > 0) {
        console.log('⭐ Sample premium products:', premiumProducts.slice(0, 3));
      }
      
      setProducts(finalNonPremiumProducts); // Non-premium approved products for main display
      setPremiumProducts(premiumProducts); // Premium products
      
      // Calculate stats from all products
      const totalProducts = allProducts.length;
      const approvedCount = finalApprovedProducts.length;
      const premiumCount = premiumProducts.length;
      const pendingProducts = totalProducts - approvedCount;
      
      const newStats = {
        totalProducts,
        approvedProducts: approvedCount,
        premiumProducts: premiumCount,
        pendingProducts
      };
      
      console.log('📈 Final Stats:', newStats);
      setStats(newStats);

    } catch (err) {
      console.error('❌ Error fetching products:', err);
      console.error('❌ Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
      setError(`Məhsullar yüklənərkən xəta baş verdi: ${err instanceof Error ? err.message : 'Bilinməyən xəta'}`);
      
      // Set empty arrays on error
      setProducts([]);
      setPremiumProducts([]);
      setStats({
        totalProducts: 0,
        approvedProducts: 0,
        premiumProducts: 0,
        pendingProducts: 0
      });
    } finally {
      setLoading(false);
      console.log('🏁 fetchProducts completed');
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('az-AZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Tarix məlum deyil';
    }
  };

  const getRemainingTime = (expiryDate: string) => {
    try {
      const now = new Date();
      const expiry = new Date(expiryDate);
      const diff = expiry.getTime() - now.getTime();
      
      if (diff <= 0) return { text: 'Vaxtı bitib', color: 'text-red-600', bgColor: 'bg-red-50' };
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        return { 
          text: `${days} gün ${hours} saat qalıb`, 
          color: 'text-green-600', 
          bgColor: 'bg-green-50' 
        };
      } else if (hours > 0) {
        return { 
          text: `${hours} saat ${minutes} dəqiqə qalıb`, 
          color: 'text-yellow-600', 
          bgColor: 'bg-yellow-50' 
        };
      } else {
        return { 
          text: `${minutes} dəqiqə qalıb`, 
          color: 'text-red-600', 
          bgColor: 'bg-red-50' 
        };
      }
    } catch {
      return { text: 'Xəta', color: 'text-gray-500', bgColor: 'bg-gray-50' };
    }
  };

  const makePremium = async (productId: number) => {
    try {
      setProcessingId(productId);
      setError(null);
      
      const response = await apiClient.post(`/api/seller/products/${productId}/premium`, {});
      
      setSuccess('Məhsul premium olaraq işarələndi! Bakiyədən 2.00 ₼ çıxıldı.');
      
      // Force refresh data
      console.log('🔄 Premium işleminden sonra verileri yeniliyorum...');
      await fetchProducts();
      console.log('✅ Veriler yenilendi');
      
      // Emit balance updated event
      window.dispatchEvent(new CustomEvent('balanceUpdated'));
      
      setTimeout(() => setSuccess(null), 5000);
      
    } catch (err: any) {
      console.error('❌ Error making product premium:', err);
      setError(err.response?.data?.error || 'Premium işləmi uğursuz oldu');
      setTimeout(() => setError(null), 5000);
    } finally {
      setProcessingId(null);
    }
  };

  const removePremium = async (productId: number) => {
    try {
      setProcessingId(productId);
      setError(null);
      
      await apiClient.delete(`/api/seller/products/${productId}/premium`);
      
      setSuccess('Premium statusu silindi!');
      
      // Force refresh data  
      await fetchProducts();
      
      setTimeout(() => setSuccess(null), 5000);
      
    } catch (err: any) {
      console.error('❌ Error removing premium:', err);
      setError(err.response?.data?.error || 'Premium silinməsi uğursuz oldu');
      setTimeout(() => setError(null), 5000);
    } finally {
      setProcessingId(null);
    }
  };

  const getFilteredProducts = () => {
    switch (filter) {
      case 'approved':
        return products; // Non-premium approved products
      case 'premium':
        return []; // Premium products are shown in separate section
      case 'pending':
        return []; // No pending products in this list
      default:
        return products;
    }
  };

  const getProductStatus = (product: SellerProduct) => {
    if (isProductPremium(product)) {
      return {
        text: 'Premium',
        color: 'text-purple-700',
        bgColor: 'bg-purple-100',
        icon: <Crown className="w-3 h-3" />
      };
    }
    return {
      text: 'Onaylandı',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      icon: <CheckCircle className="w-3 h-3" />
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Məhsullar yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Premium Məhsul İdarəsi</h1>
              <p className="text-gray-600">Məhsullarınızı premium edərək daha çox görünürlük əldə edin</p>
            </div>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Yenilə
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Məhsul</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Onaylanmış</p>
                <p className="text-2xl font-bold text-green-600">{stats.approvedProducts}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Premium</p>
                <p className="text-2xl font-bold text-purple-600">{stats.premiumProducts}</p>
              </div>
              <Crown className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Onay Bekleyen</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingProducts}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-400 mr-3" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'all', label: 'Bütün Məhsullar', count: stats.totalProducts },
              { key: 'approved', label: 'Onaylanmış', count: stats.approvedProducts },
              { key: 'premium', label: 'Premium', count: stats.premiumProducts },
              { key: 'pending', label: 'Onay Bekleyen', count: stats.pendingProducts }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Premium Products Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900">Aktiv Premium Məhsullar</h3>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                {premiumProducts.length}
              </span>
            </div>
            
            {premiumProducts.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Crown className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Hələ premium məhsul yoxdur</h3>
                <p className="text-gray-500 mb-4">Premium məhsullarınız burada görünəcək</p>
              </div>
            ) : (
              <div className="space-y-4">
                {premiumProducts.map((product) => {
                  const remainingTime = product.premiumExpiryDate ? getRemainingTime(product.premiumExpiryDate) : null;
                  
                  return (
                    <div key={product.id} className="border border-purple-200 rounded-lg p-4 bg-gradient-to-r from-purple-50 to-blue-50">
                      <div className="flex items-center space-x-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden bg-gray-100">
                          <CloudinaryImage
                            src={product.imageUrl || ''}
                            alt={product.title}
                            className="w-full h-full object-cover"
                            size="small"
                            fallbackIcon={<Package className="w-6 h-6 text-gray-400" />}
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 mr-4">
                              <h4 className="text-base font-medium text-gray-900 truncate">{product.title}</h4>
                              <p className="text-xs text-gray-500 line-clamp-1 mt-1">{product.description}</p>
                              
                              <div className="flex items-center space-x-3 mt-2">
                                <span className="text-base font-semibold text-gray-900">{product.price.toFixed(2)} ₼</span>
                                <span className="text-xs text-gray-500">Stok: {product.stock}</span>
                                {product.category && (
                                  <span className="text-xs text-gray-500">Kateqoriya: {product.category.name}</span>
                                )}
                                {product.salesCount !== undefined && (
                                  <span className="text-xs text-gray-500">Satış: {product.salesCount}</span>
                                )}
                              </div>
                            </div>

                            {/* Premium Badge */}
                            <div className="flex-shrink-0">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                <Crown className="w-3 h-3" />
                                <span className="ml-1">Premium</span>
                              </span>
                            </div>
                          </div>

                          {/* Premium Time Details */}
                          {remainingTime && (
                            <div className={`mt-3 p-2 rounded-lg ${remainingTime.bgColor}`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className={`text-xs font-medium ${remainingTime.color}`}>
                                    <Clock className="w-3 h-3 inline mr-1" />
                                    {remainingTime.text}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    Bitiş: {formatDateTime(product.premiumExpiryDate!)}
                                  </p>
                                  {product.premiumStartDate && (
                                    <p className="text-xs text-gray-600">
                                      Başlanğıc: {formatDateTime(product.premiumStartDate)}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">Premium Qiyməti</p>
                                  <p className="text-xs font-medium text-purple-600">2.00 ₼</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Remove Premium Button */}
                          <div className="mt-3 flex justify-end">
                            <button
                              onClick={() => removePremium(product.id)}
                              disabled={processingId === product.id}
                              className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {processingId === product.id ? 'Silinir...' : 'Premium Sil'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Regular Products Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">Premium Ediləbilir Məhsullar</h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {products.length}
              </span>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Premium ediləbilir məhsul yoxdur</h3>
                <p className="text-gray-500 mb-4">Bütün onaylanmış məhsullarınız artıq premium statusundadır</p>
                <button
                  onClick={() => navigate('/seller/products/new')}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Yeni Məhsul Əlavə Edin
                </button>
              </div>
            ) : (
            <div className="space-y-4">
              {getFilteredProducts().map((product) => {
                const status = getProductStatus(product);
                const remainingTime = product.premiumExpiryDate ? getRemainingTime(product.premiumExpiryDate) : null;
                
                return (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden bg-gray-100">
                        <CloudinaryImage
                          src={product.imageUrl || ''}
                          alt={product.title}
                          className="w-full h-full object-cover"
                          size="small"
                          fallbackIcon={<Package className="w-6 h-6 text-gray-400" />}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 mr-4">
                            <h3 className="text-base font-medium text-gray-900 truncate">{product.title}</h3>
                            <p className="text-xs text-gray-500 line-clamp-1 mt-1">{product.description}</p>
                            
                            <div className="flex items-center space-x-3 mt-2">
                              <span className="text-base font-semibold text-gray-900">{product.price.toFixed(2)} ₼</span>
                              <span className="text-xs text-gray-500">Stok: {product.stock}</span>
                              {product.category && (
                                <span className="text-xs text-gray-500">Kateqoriya: {product.category.name}</span>
                              )}
                              {product.salesCount !== undefined && (
                                <span className="text-xs text-gray-500">Satış: {product.salesCount}</span>
                              )}
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="flex-shrink-0">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                              {status.icon}
                              <span className="ml-1">{status.text}</span>
                            </span>
                          </div>
                        </div>

                        {/* Premium Details */}
                        {isProductPremium(product) && product.premiumExpiryDate && remainingTime && (
                          <div className={`mt-3 p-2 rounded-lg ${remainingTime.bgColor}`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className={`text-xs font-medium ${remainingTime.color}`}>
                                  <Clock className="w-3 h-3 inline mr-1" />
                                  {remainingTime.text}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  Bitiş: {formatDateTime(product.premiumExpiryDate)}
                                </p>
                                {product.premiumStartDate && (
                                  <p className="text-xs text-gray-600">
                                    Başlanğıc: {formatDateTime(product.premiumStartDate)}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Premium Qiyməti</p>
                                <p className="text-xs font-medium text-purple-600">2.00 ₼</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="text-xs text-gray-500">
                            Yaradılıb: {formatDateTime(product.createdAt)}
                          </div>
                          
                          <div className="flex space-x-2">
                            {isProductPremium(product) ? (
                              <button
                                onClick={() => removePremium(product.id)}
                                disabled={processingId === product.id}
                                className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {processingId === product.id ? 'Silinir...' : 'Premium Sil'}
                              </button>
                            ) : (
                              <button
                                onClick={() => makePremium(product.id)}
                                disabled={processingId === product.id}
                                className="px-3 py-1 text-xs font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {processingId === product.id ? 'Əlavə edilir...' : 'Premium Et (2.00 ₼)'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-purple-900 mb-4 flex items-center">
          <Crown className="w-5 h-5 mr-2" />
          Premium Məhsullar Haqqında
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ul className="text-sm text-purple-800 space-y-2">
            <li className="flex items-start">
              <TrendingUp className="w-4 h-4 mr-2 mt-0.5 text-purple-600" />
              Premium məhsullar axtarış nəticələrində daha yüksək sırada görünər
            </li>
            <li className="flex items-start">
              <Crown className="w-4 h-4 mr-2 mt-0.5 text-purple-600" />
              Premium məhsullar xüsusi "⭐ Premium" etiketi ilə işarələnir
            </li>
            <li className="flex items-start">
              <Calendar className="w-4 h-4 mr-2 mt-0.5 text-purple-600" />
              Premium statusu 1 gün müddətində aktiv qalır
            </li>
          </ul>
          <ul className="text-sm text-purple-800 space-y-2">
            <li className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-purple-600" />
              Yalnız onaylanmış məhsullar premium edilə bilər
            </li>
            <li className="flex items-start">
              <Package className="w-4 h-4 mr-2 mt-0.5 text-purple-600" />
              Premium qiyməti: 2.00 ₼ (1 gün müddətinə)
            </li>
            <li className="flex items-start">
              <XCircle className="w-4 h-4 mr-2 mt-0.5 text-purple-600" />
              Premium statusu istədiyiniz zaman silə bilərsiniz
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SellerPremiumPage; 