import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalCategories: number;
  totalSellers: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
  monthlySales: string;
  totalCommissions: string;
  totalPremiumRevenue: string;
  pendingDeletionCount: number;
}

interface RecentTransaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
  username?: string;
  user?: {
    username: string;
  };
}

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalSellers: 0,
    completedOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    refundedOrders: 0,
    monthlySales: '0',
    totalCommissions: '0',
    totalPremiumRevenue: '0',
    pendingDeletionCount: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Dashboard data yükleniyor mövcud endpoint\'lərdən...');
        
        // Mövcud backend endpoint'lərdən məlumat alırıq
        const [
          usersResponse,
          transactionsResponse,
          totalCommissionsResponse,
          productsResponse,
          categoriesResponse,
          ordersResponse
        ] = await Promise.all([
          apiClient.get<any[]>('/api/users'), // UserController
          apiClient.get<RecentTransaction[]>('/api/balance/admin/recent-transactions?limit=10'), // BalanceController
          apiClient.get<number>('/api/balance/admin/total-commissions'), // BalanceController
          apiClient.get<any[]>('/api/admin/products'), // ProductController - all products
          apiClient.get<any[]>('/api/public/categories'), // PublicApiController
          apiClient.get<any[]>('/api/orders').catch(() => []) // OrderController - user orders (fallback)
        ]);

        console.log('👥 Users Response:', usersResponse);
        console.log('💳 Transactions Response:', transactionsResponse);
        console.log('💰 Total Commissions:', totalCommissionsResponse);
        console.log('📦 Products Response:', productsResponse);
        console.log('🏷️ Categories Response:', categoriesResponse);
        console.log('📋 Orders Response:', ordersResponse);

        // Statistikləri hesablayırıq
        const totalUsers = usersResponse.length;
        const totalSellers = usersResponse.filter((user: any) => user.role === 'SELLER').length;
        const totalProducts = productsResponse.length;
        const totalCategories = categoriesResponse.length;
        
        // Orders statistikləri (mövcud məlumatlardan)
        const totalOrders = ordersResponse.length;
        const completedOrders = ordersResponse.filter((order: any) => order.status === 'COMPLETED').length;
        const pendingOrders = ordersResponse.filter((order: any) => order.status === 'PENDING').length;

        const calculatedStats: DashboardStats = {
          totalUsers,
          totalProducts,
          totalCategories,
          totalSellers,
          completedOrders,
          pendingOrders,
          cancelledOrders: ordersResponse.filter((order: any) => order.status === 'CANCELLED').length,
          refundedOrders: 0,
          monthlySales: '0', // Bu məlumat mövcud endpoint'də yoxdur
          totalCommissions: totalCommissionsResponse.toString(),
          totalPremiumRevenue: '0',
          pendingDeletionCount: 0 // Bu məlumat mövcud endpoint'də yoxdur
        };

        setStats(calculatedStats);
          setRecentTransactions(transactionsResponse);
        
        console.log('✅ Dashboard data yükləndi:', { calculatedStats, transactionsCount: transactionsResponse.length });
        
      } catch (error: any) {
        console.error('❌ Dashboard data yükleme hatası:', error);
        setError('Məlumatlar yüklənərkən xəta baş verdi');
        if (error.response) {
          console.error('❌ Error response:', error.response.data);
          console.error('❌ Error status:', error.response.status);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return '💰';
      case 'COMMISSION': return '💼';
      case 'WITHDRAWAL': return '💸';
      case 'PREMIUM': return '⭐';
      default: return '💳';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return '#10b981';
      case 'COMMISSION': return '#3b82f6';
      case 'WITHDRAWAL': return '#ef4444';
      case 'PREMIUM': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Ana panel yüklənir...</p>
        </div>
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
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Yenidən Yüklə
        </button>
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
          border-radius: 16px;
          margin-bottom: 2rem;
          position: relative;
          overflow: hidden;
        }

        .welcome-section::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        .welcome-content {
          position: relative;
          z-index: 1;
        }

        .welcome-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .welcome-subtitle {
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .stat-content {
          flex: 1;
        }

        .stat-title {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
          font-weight: 500;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .stat-trend {
          font-size: 0.75rem;
          color: #10b981;
          font-weight: 600;
        }

        .section-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .quick-action {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 8px;
          text-decoration: none;
          color: #374151;
          transition: all 0.2s ease;
          border: 1px solid #e5e7eb;
        }

        .quick-action:hover {
          background: #f1f5f9;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .quick-action-icon {
          width: 40px;
          height: 40px;
          background: #3b82f6;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          color: white;
        }

        .quick-action-title {
          font-weight: 500;
          font-size: 0.875rem;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          color: white;
          flex-shrink: 0;
        }

        .activity-content {
          flex: 1;
        }

        .activity-message {
          font-weight: 500;
          color: #1f2937;
          margin-bottom: 0.25rem;
          font-size: 0.875rem;
        }

        .activity-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .activity-amount {
          font-weight: 600;
          color: #10b981;
        }

        .activity-amount.negative {
          color: #ef4444;
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 0 0.5rem;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .dashboard-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .quick-actions {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }
          
          .welcome-title {
            font-size: 1.5rem;
          }
          
          .welcome-subtitle {
            font-size: 1rem;
          }
          
          .stat-value {
            font-size: 1.25rem;
          }
        }
      `}</style>

      <div className="dashboard-container">
          {/* Welcome Section */}
          <div className="welcome-section">
            <div className="welcome-content">
              <h1 className="welcome-title">
                🎉 Xoş gəlmisiniz!
              </h1>
              <p className="welcome-subtitle">
                DigiEx Admin Panel - {new Date().toLocaleDateString('az-AZ', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card users">
              <div className="stat-icon" style={{ backgroundColor: '#3b82f6' }}>
                👥
              </div>
              <div className="stat-content">
                <div className="stat-title">Ümumi İstifadəçi</div>
                <div className="stat-value">{(stats?.totalUsers || 0).toLocaleString('az-AZ')}</div>
                <div className="stat-trend">↗ +12%</div>
              </div>
            </div>

            <div className="stat-card products">
              <div className="stat-icon" style={{ backgroundColor: '#10b981' }}>
                📦
              </div>
              <div className="stat-content">
                <div className="stat-title">Ümumi Məhsul</div>
                <div className="stat-value">{(stats?.totalProducts || 0).toLocaleString('az-AZ')}</div>
                <div className="stat-trend">↗ +8%</div>
              </div>
            </div>

            <div className="stat-card orders">
              <div className="stat-icon" style={{ backgroundColor: '#f59e0b' }}>
                🛍️
              </div>
              <div className="stat-content">
                <div className="stat-title">Tamamlanan Sifarişlər</div>
                <div className="stat-value">{(stats?.completedOrders || 0).toLocaleString('az-AZ')}</div>
                <div className="stat-trend">↗ +15%</div>
              </div>
            </div>

            <div className="stat-card revenue">
              <div className="stat-icon" style={{ backgroundColor: '#8b5cf6' }}>
                💰
              </div>
              <div className="stat-content">
                <div className="stat-title">Aylıq Satış</div>
                <div className="stat-value">{parseFloat(stats?.monthlySales || '0').toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AZN</div>
                <div className="stat-trend">↗ +22%</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#ef4444' }}>
                📈
              </div>
              <div className="stat-content">
                <div className="stat-title">Gözləyən Sifarişlər</div>
                <div className="stat-value">{(stats?.pendingOrders || 0).toLocaleString('az-AZ')}</div>
                <div className="stat-trend">↗ +5%</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#06b6d4' }}>
                💼
              </div>
              <div className="stat-content">
                <div className="stat-title">Ümumi Komissiya</div>
                <div className="stat-value">{parseFloat(stats?.totalCommissions || '0').toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AZN</div>
                <div className="stat-trend">↗ +18%</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="section-card">
            <h3 className="section-title">⚡ Tez Əməliyyatlar</h3>
            <div className="quick-actions">
              <a href="/admin/users" className="quick-action">
                <div className="quick-action-icon">👥</div>
                <div className="quick-action-title">İstifadəçiləri İdarə Et</div>
              </a>
              <a href="/admin/products" className="quick-action">
                <div className="quick-action-icon">📦</div>
                <div className="quick-action-title">Məhsulları İdarə Et</div>
              </a>
              <a href="/admin/orders" className="quick-action">
                <div className="quick-action-icon">🛍️</div>
                <div className="quick-action-title">Sifarişləri İdarə Et</div>
              </a>
              <a href="/admin/categories" className="quick-action">
                <div className="quick-action-icon">🏷️</div>
                <div className="quick-action-title">Kateqoriyaları İdarə Et</div>
              </a>
              <a href="/admin/balance-requests" className="quick-action">
                <div className="quick-action-icon">💰</div>
                <div className="quick-action-title">Bakiyə Tələbləri</div>
              </a>
              <a href="/admin/withdrawals" className="quick-action">
                <div className="quick-action-icon">💸</div>
                <div className="quick-action-title">Çıxarma Tələbləri</div>
              </a>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="dashboard-grid">
            {/* Recent Transactions */}
            <div className="section-card">
              <h3 className="section-title">💳 Son Əməliyyatlar</h3>
              <div className="activity-list">
                {Array.isArray(recentTransactions) && recentTransactions.length > 0 ? (
                  recentTransactions.map(transaction => (
                    <div key={transaction.id} className="activity-item">
                      <div 
                        className="activity-icon"
                        style={{ backgroundColor: getTransactionColor(transaction.type) }}
                      >
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div className="activity-content">
                        <div className="activity-message">{transaction.description}</div>
                        <div className="activity-details">
                          <span>@{transaction.username || transaction.user?.username} • {formatDate(transaction.createdAt)}</span>
                          <span className={`activity-amount ${transaction.amount < 0 ? 'negative' : ''}`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)} AZN
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '2rem', 
                    color: '#64748b',
                    fontSize: '0.9rem'
                  }}>
                    📊 Henüz işlem bulunmuyor
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="section-card">
              <h3 className="section-title">📊 Tez Statistikalar</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Aktiv Satıcılar</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
                    {stats?.totalSellers || 0}
                  </div>
                </div>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Silinmə Tələbləri</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>
                    {stats?.pendingDeletionCount || 0}
                  </div>
                </div>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Kateqoriyalar</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
                    {stats?.totalCategories || 0}
                  </div>
                </div>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#64748b' }}>İptal Edilən Sifarişlər</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>
                    {stats?.cancelledOrders || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </>
  );
};

export default AdminDashboardPage; 