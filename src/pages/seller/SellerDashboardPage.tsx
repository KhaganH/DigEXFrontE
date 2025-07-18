import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { sellerService, DashboardStats, RecentOrder, TopProduct } from '../../services/sellerService';

const SellerDashboardPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    pendingProducts: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    totalCustomers: 0,
    averageRating: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 SellerDashboardPage useEffect - User:', user);
    console.log('🔍 Is authenticated:', isAuthenticated);
    console.log('🔍 User role:', user?.role);
    console.log('🔍 Is loading:', isLoading);
    
    // Loading durumunda bekle
    if (isLoading) {
      return;
    }
    
    // Authentication kontrolü
    if (!isAuthenticated) {
      console.log('🔒 User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'SELLER') {
      console.log('🔒 User is not a seller, redirecting to home');
      navigate('/');
      return;
    }
    
    console.log('✅ User authenticated and is seller, fetching dashboard data');
    fetchDashboardData();
  }, [user, isAuthenticated, isLoading, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching dashboard data from API...');
      
      // API'den veri çek
      const [statsData, ordersData, productsData] = await Promise.all([
        sellerService.getDashboardStats(),
        sellerService.getRecentOrders(),
        sellerService.getTopProducts()
      ]);
      
      console.log('📊 API stats response:', statsData);
      console.log('📦 API orders response:', ordersData);
      console.log('🏆 API products response:', productsData);
      
      setStats(statsData);
      setRecentOrders(ordersData);
      setTopProducts(productsData);
      
    } catch (err: any) {
      console.error('Dashboard data yüklənərkən xəta:', err);
      
      // Authentication hatası kontrolü
      if (err.response?.status === 401) {
        setError('Səhifəyə daxil olmaq üçün yenidən giriş edin');
        navigate('/login');
        return;
      }
      
      setError(err.response?.data?.message || 'Məlumatlar yüklənərkən xəta baş verdi');
      
      // Hata durumunda boş veriler
      setStats({
        totalProducts: 0,
        activeProducts: 0,
        pendingProducts: 0,
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        totalEarnings: 0,
        monthlyEarnings: 0,
        totalCustomers: 0,
        averageRating: 0
      });
      setRecentOrders([]);
      setTopProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('az-AZ', {
      style: 'currency',
      currency: 'AZN'
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('az-AZ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Tamamlandı';
      case 'PENDING': return 'Gözləyir';
      case 'CANCELLED': return 'Ləğv edildi';
      default: return status;
    }
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
    <>
      <style>{`
        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .welcome-section {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 1rem;
          padding: 2rem;
          color: white;
          margin-bottom: 2rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
        }

        .stat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .stat-icon {
          width: 3rem;
          height: 3rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .stat-trend {
          font-size: 0.75rem;
          color: #059669;
          font-weight: 500;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
        }

        .recent-orders {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
        }

        .top-products {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .section-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
        }

        .view-all-link {
          font-size: 0.875rem;
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
        }

        .view-all-link:hover {
          text-decoration: underline;
        }

        .order-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .order-item:last-child {
          border-bottom: none;
        }

        .order-info {
          flex: 1;
        }

        .order-number {
          font-size: 0.875rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .order-details {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .order-amount {
          font-size: 0.875rem;
          font-weight: 600;
          color: #059669;
        }

        .product-item {
          display: flex;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .product-item:last-child {
          border-bottom: none;
        }

        .product-image {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 0.375rem;
          object-fit: cover;
          margin-right: 0.75rem;
        }

        .product-info {
          flex: 1;
        }

        .product-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .product-stats {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .product-revenue {
          font-size: 0.875rem;
          font-weight: 600;
          color: #059669;
        }

        @media (max-width: 768px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
          
          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          }
        }
      `}</style>

      <div className="dashboard-container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1 className="text-2xl font-bold mb-2">Xoş gəlmisiniz, {user?.username}!</h1>
          <p className="text-green-100">Mağazanızın performansını izləyin və satışlarınızı artırın</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}>
                📦
              </div>
            </div>
            <div className="stat-value">{stats?.totalProducts || 0}</div>
            <div className="stat-label">Ümumi Məhsullar</div>
            <div className="stat-trend">Aktiv: {stats?.activeProducts || 0}</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                🛒
              </div>
            </div>
            <div className="stat-value">{stats?.totalOrders || 0}</div>
            <div className="stat-label">Ümumi Sifarişlər</div>
            <div className="stat-trend">Tamamlanan: {stats?.completedOrders || 0}</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                💰
              </div>
            </div>
            <div className="stat-value">{formatCurrency(stats?.totalEarnings || 0)}</div>
            <div className="stat-label">Ümumi Qazanc</div>
            <div className="stat-trend">Bu ay: {formatCurrency(stats?.monthlyEarnings || 0)}</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon" style={{ backgroundColor: '#e0e7ff', color: '#3730a3' }}>
                👥
              </div>
            </div>
            <div className="stat-value">{stats?.totalCustomers || 0}</div>
            <div className="stat-label">Müştərilər</div>
            <div className="stat-trend">Ortalama reytinq: {(stats?.averageRating || 0).toFixed(1)} ⭐</div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="content-grid">
          {/* Recent Orders */}
          <div className="recent-orders">
            <div className="section-header">
              <h2 className="section-title">Son Sifarişlər</h2>
              <a href="/seller/orders" className="view-all-link">Hamısına bax</a>
            </div>
            
            {recentOrders && recentOrders.length > 0 ? (
              <div>
                {recentOrders.map((order) => (
                  <div key={order.id} className="order-item">
                    <div className="order-info">
                      <div className="order-number">#{order.orderNumber}</div>
                      <div className="order-details">
                        {order.customerName} • {order.productName}
                      </div>
                      <div className="order-details">
                        {formatDate(order.createdAt)} • 
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>
                    <div className="order-amount">{formatCurrency(order.amount)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📦</div>
                <p className="text-gray-500">Hələ heç bir sifariş yoxdur</p>
              </div>
            )}
          </div>

          {/* Top Products */}
          <div className="top-products">
            <div className="section-header">
              <h2 className="section-title">Ən Çox Satılan</h2>
              <a href="/seller/products" className="view-all-link">Hamısına bax</a>
            </div>
            
            {topProducts && topProducts.length > 0 ? (
              <div>
                {topProducts.map((product) => (
                  <div key={product.id} className="product-item">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="product-image"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-product.jpg';
                      }}
                    />
                    <div className="product-info">
                      <div className="product-name">{product.name}</div>
                      <div className="product-stats">{product.sales} satış</div>
                    </div>
                    <div className="product-revenue">{formatCurrency(product.revenue)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🏆</div>
                <p className="text-gray-500">Hələ heç bir məhsul yoxdur</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SellerDashboardPage; 