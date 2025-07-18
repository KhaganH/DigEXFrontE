import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { sellerService, AnalyticsData } from '../../services/sellerService';

const SellerAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    monthlyGrowth: 0,
    topProducts: [],
    salesByMonth: [],
    customerStats: {
      totalCustomers: 0,
      newCustomers: 0,
      repeatCustomers: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'SELLER') {
      navigate('/');
      return;
    }
    
    fetchAnalytics();
  }, [user, isAuthenticated, isLoading, navigate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching analytics from API...');
      const analyticsData = await sellerService.getAnalytics();
      console.log('📊 Analytics API response:', analyticsData);
      
      setAnalytics(analyticsData);
    } catch (err: any) {
      console.error('Analitika yüklənərkən xəta:', err);
      
      if (err.response?.status === 401) {
        setError('Səhifəyə daxil olmaq üçün yenidən giriş edin');
        navigate('/login');
        return;
      }
      
      setError(err.response?.data?.message || 'Analitika yüklənərkən xəta baş verdi');
      
      // Hata durumunda boş veriler
      setAnalytics({
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        monthlyGrowth: 0,
        topProducts: [],
        salesByMonth: [],
        customerStats: {
          totalCustomers: 0,
          newCustomers: 0,
          repeatCustomers: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('az-AZ', {
      style: 'currency',
      currency: 'AZN'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Xəta</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analitika</h1>
          <p className="text-gray-600 mt-1">Satış statistikalarınızı izləyin</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ümumi Satış</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalSales)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-lg">📦</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ümumi Sifariş</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-lg">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ortalama Sifariş</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.averageOrderValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-lg">📈</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Aylıq Artış</p>
              <p className="text-2xl font-bold text-gray-900">+{analytics.monthlyGrowth}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Ən Çox Satılan Məhsullar</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-medium text-gray-600">
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sales} satış</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(product.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Stats */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Müştəri Statistikaları</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ümumi Müştərilər</span>
                <span className="text-sm font-medium text-gray-900">{analytics.customerStats.totalCustomers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Yeni Müştərilər</span>
                <span className="text-sm font-medium text-green-600">+{analytics.customerStats.newCustomers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Təkrar Müştərilər</span>
                <span className="text-sm font-medium text-blue-600">{analytics.customerStats.repeatCustomers}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Sales Chart */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Aylıq Satışlar</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {analytics.salesByMonth.map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{month.month}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{month.sales} sifariş</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(month.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerAnalyticsPage; 