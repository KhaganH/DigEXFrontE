import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../services/api';

const SellerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [balanceLoading, setBalanceLoading] = useState(true);

  const fetchBalance = async () => {
    try {
      setBalanceLoading(true);
      const response = await apiClient.get<number>('/api/balance/balance');
      setBalance(response);
    } catch (error) {
      console.error('❌ Error fetching balance:', error);
      setBalance(0);
    } finally {
      setBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBalance();
    }
  }, [user]);

  // Listen for balance updates
  useEffect(() => {
    const handleBalanceUpdate = () => {
      fetchBalance();
    };

    window.addEventListener('balanceUpdated', handleBalanceUpdate);
    return () => {
      window.removeEventListener('balanceUpdated', handleBalanceUpdate);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/seller/dashboard',
      name: 'Dashboard',
      icon: '🏠',
      description: 'Ana səhifə və statistikalar'
    },
    {
      path: '/seller/products',
      name: 'Məhsullar',
      icon: '📦',
      description: 'Məhsullarınızı idarə edin'
    },
    {
      path: '/seller/products/new',
      name: 'Yeni Məhsul',
      icon: '➕',
      description: 'Yeni məhsul əlavə edin'
    },
    {
      path: '/seller/premium',
      name: 'Premium Məhsullar',
      icon: '⭐',
      description: 'Məhsullarınızı premium edin'
    },
    {
      path: '/seller/orders',
      name: 'Sifarişlər',
      icon: '🛒',
      description: 'Sifarişləri idarə edin'
    },
    {
      path: '/seller/analytics',
      name: 'Analitika',
      icon: '📊',
      description: 'Satış statistikaları'
    },
    {
      path: '/seller/earnings',
      name: 'Qazanc',
      icon: '💰',
      description: 'Qazanc və ödənişlər'
    },
    {
      path: '/seller/customers',
      name: 'Müştərilər',
      icon: '👥',
      description: 'Müştəri siyahısı'
    },
    {
      path: '/seller/reports',
      name: 'Hesabatlar',
      icon: '📄',
      description: 'Detallı hesabatlar'
    },
    {
      path: '/seller/settings',
      name: 'Tənzimləmələr',
      icon: '⚙️',
      description: 'Mağaza tənzimləmələri'
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getCurrentPageTitle = () => {
    const currentItem = menuItems.find(item => isActive(item.path));
    return currentItem ? currentItem.name : 'Dashboard';
  };

  return (
    <>
      <style>{`
        .seller-layout {
          min-height: 100vh;
          background-color: #f9fafb;
        }

        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 40;
        }

        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 256px;
          background-color: white;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          z-index: 50;
          transform: translateX(-100%);
          transition: transform 0.3s ease-in-out;
        }

        .sidebar.open {
          transform: translateX(0);
        }

        .sidebar-content {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon {
          width: 2.5rem;
          height: 2.5rem;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.125rem;
        }

        .logo-text h1 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .logo-text p {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        .sidebar-toggle {
          display: none;
          padding: 0.5rem;
          border-radius: 0.375rem;
          color: #6b7280;
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sidebar-toggle:hover {
          color: #374151;
          background-color: #f3f4f6;
        }

        .user-info {
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .user-avatar {
          width: 3rem;
          height: 3rem;
          background: linear-gradient(135deg, #34d399 0%, #3b82f6 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 1.125rem;
          flex-shrink: 0;
        }

        .user-details {
          flex: 1;
          min-width: 0;
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: #111827;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-email {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role {
          display: inline-flex;
          align-items: center;
          padding: 0.125rem 0.5rem;
          margin-top: 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
          background-color: #dcfce7;
          color: #166534;
        }

        .user-balance {
          font-size: 0.75rem;
          color: #059669;
          font-weight: 600;
          background-color: #ecfdf5;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          text-align: center;
          margin-top: 0.25rem;
          border: 1px solid #a7f3d0;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .user-balance:hover {
          background-color: #d1fae5;
          border-color: #6ee7b7;
        }

        .balance-loading {
          color: #6b7280;
          font-style: italic;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
        }

        .nav-item {
          margin-bottom: 0.5rem;
        }

        .nav-button {
          width: 100%;
          display: flex;
          align-items: center;
          padding: 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 0.5rem;
          border: none;
          background: none;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          border-right: 2px solid transparent;
        }

        .nav-button:hover {
          background-color: #f3f4f6;
          color: #111827;
        }

        .nav-button.active {
          background-color: #eff6ff;
          color: #1d4ed8;
          border-right-color: #1d4ed8;
        }

        .nav-icon {
          margin-right: 0.75rem;
          font-size: 1.125rem;
          transition: color 0.2s ease;
        }

        .nav-button.active .nav-icon {
          color: #3b82f6;
        }

        .nav-content {
          flex: 1;
        }

        .nav-title {
          font-weight: 500;
          margin-bottom: 0.125rem;
        }

        .nav-description {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0;
        }

        .nav-button.active .nav-description {
          color: #3b82f6;
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .logout-button {
          width: 100%;
          display: flex;
          align-items: center;
          padding: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 0.5rem;
          border: none;
          background: none;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .logout-button:hover {
          background-color: #f3f4f6;
          color: #111827;
        }

        .main-content {
          margin-left: 0;
          min-height: 100vh;
        }

        .top-bar {
          position: sticky;
          top: 0;
          z-index: 30;
          background-color: white;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          border-bottom: 1px solid #e5e7eb;
        }

        .top-bar-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
        }

        .top-bar-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .mobile-toggle {
          display: block;
          padding: 0.5rem;
          border-radius: 0.375rem;
          color: #6b7280;
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mobile-toggle:hover {
          color: #374151;
          background-color: #f3f4f6;
        }

        .page-title h2 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .page-title p {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        .top-bar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .last-login {
          display: none;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .page-content {
          padding: 1.5rem;
        }

        @media (min-width: 1024px) {
          .sidebar {
            transform: translateX(0);
          }
          
          .main-content {
            margin-left: 256px;
          }
          
          .mobile-toggle {
            display: none;
          }
          
          .sidebar-toggle {
            display: none;
          }
        }

        @media (min-width: 768px) {
          .last-login {
            display: flex;
          }
        }
      `}</style>

      <div className="seller-layout">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-content">
            {/* Header */}
            <div className="sidebar-header">
              <div className="sidebar-logo">
                <div className="logo-icon">S</div>
                <div className="logo-text">
                  <h1>Satıcı Paneli</h1>
                  <p>DiGex</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="sidebar-toggle"
              >
                ✕
              </button>
            </div>

            {/* User Info */}
            <div className="user-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="user-avatar">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                  <p className="user-name">{user?.username}</p>
                  <p className="user-email">{user?.email}</p>
                  <div className="user-role">Satıcı</div>
                  {balanceLoading ? (
                    <div className="user-balance balance-loading">
                      Yüklənir...
                    </div>
                  ) : (
                    <div 
                      className="user-balance"
                      title="Balansınızı görmək üçün kliklə edin"
                      onClick={() => navigate('/balance')}
                    >
                      💰 {balance.toFixed(2)} ₼
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
              {menuItems.map((item) => (
                <div key={item.path} className="nav-item">
                  <button
                    onClick={() => {
                      navigate(item.path);
                      setSidebarOpen(false);
                    }}
                    className={`nav-button ${isActive(item.path) ? 'active' : ''}`}
                  >
                    <div className="nav-icon">{item.icon}</div>
                    <div className="nav-content">
                      <div className="nav-title">{item.name}</div>
                      <div className="nav-description">{item.description}</div>
                    </div>
                  </button>
                </div>
              ))}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
              <button
                onClick={() => navigate('/')}
                className="logout-button"
                style={{ marginBottom: '0.5rem' }}
              >
                <span className="nav-icon">🏠</span>
                <span className="nav-title">Ana Səhifə</span>
              </button>
              <button
                onClick={handleLogout}
                className="logout-button"
              >
                <span className="nav-icon">🚪</span>
                <span className="nav-title">Çıxış</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="main-content">
          {/* Top bar */}
          <div className="top-bar">
            <div className="top-bar-content">
              <div className="top-bar-left">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="mobile-toggle"
                >
                  ☰
                </button>
                <div className="page-title">
                  <h2>{getCurrentPageTitle()}</h2>
                  <p>{menuItems.find(item => isActive(item.path))?.description || 'Satıcı paneli'}</p>
                </div>
              </div>
              
              <div className="top-bar-right">
                <div className="last-login">
                  <span>Son giriş:</span>
                  <span style={{ fontWeight: '500' }}>
                    {new Date().toLocaleDateString('az-AZ')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="page-content">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default SellerLayout; 