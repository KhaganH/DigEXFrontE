import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const menuItems = [
    {
      id: 'dashboard',
      icon: '📊',
      label: 'Ana Panel',
      href: '/admin/dashboard'
    },
    {
      id: 'users',
      icon: '👥',
      label: 'İstifadəçilər',
      href: '/admin/users',
      children: [
        { id: 'all-users', label: 'Bütün İstifadəçilər', href: '/admin/users' },
        { id: 'pending-sellers', label: 'Təsdiq Gözləyən Satıcılar', href: '/admin/users/pending-sellers' }
      ]
    },
    {
      id: 'products',
      icon: '📦',
      label: 'Məhsullar',
      href: '/admin/products',
      children: [
        { id: 'all-products', label: 'Bütün Məhsullar', href: '/admin/products' },
        { id: 'pending-products', label: 'Təsdiq Gözləyən Məhsullar', href: '/admin/products/pending' }
      ]
    },
    {
      id: 'orders',
      icon: '🛍️',
      label: 'Sifarişlər',
      href: '/admin/orders'
    },
    {
      id: 'categories',
      icon: '🏷️',
      label: 'Kateqoriyalar',
      href: '/admin/categories'
    },
    {
      id: 'balance-requests',
      icon: '💰',
      label: 'Bakiyə Tələbləri',
      href: '/admin/balance-requests'
    },
    {
      id: 'withdrawals',
      icon: '💸',
      label: 'Çıxarma Tələbləri',
      href: '/admin/withdrawals'
    },
    {
      id: 'payment-methods',
      icon: '💳',
      label: 'Ödəmə Üsulları',
      href: '/admin/payment-methods'
    },
    {
      id: 'reports',
      icon: '📈',
      label: 'Hesabatlar',
      href: '/admin/reports'
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getCurrentPageTitle = () => {
    const currentItem = menuItems.find(item => isActive(item.href));
    return currentItem ? currentItem.label : 'Admin Panel';
  };

  return (
    <>
      <style>{`
        .admin-layout {
          min-height: 100vh;
          background-color: #f3f4f6;
        }

        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 256px;
          background-color: #111827;
          z-index: 50;
          transform: translateX(0);
          transition: transform 0.3s ease-in-out;
        }

        .sidebar.collapsed {
          transform: translateX(-100%);
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
          border-bottom: 1px solid #374151;
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
          color: white;
          margin: 0;
        }

        .logo-text p {
          font-size: 0.875rem;
          color: #9ca3af;
          margin: 0;
        }

        .sidebar-toggle {
          display: none;
          padding: 0.5rem;
          border-radius: 0.375rem;
          color: #9ca3af;
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sidebar-toggle:hover {
          color: #d1d5db;
          background-color: #374151;
        }

        .user-info {
          padding: 1.5rem;
          border-bottom: 1px solid #374151;
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
          color: white;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-email {
          font-size: 0.75rem;
          color: #9ca3af;
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
          background-color: #fef2f2;
          color: #dc2626;
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
          color: #d1d5db;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .nav-button:hover {
          background-color: #374151;
          color: white;
        }

        .nav-button.active {
          background-color: #2563eb;
          color: white;
        }

        .nav-icon {
          margin-right: 0.75rem;
          font-size: 1.125rem;
        }

        .nav-label {
          flex: 1;
        }

        .nav-children {
          margin-left: 1.5rem;
          margin-top: 0.5rem;
        }

        .nav-child-button {
          width: 100%;
          display: flex;
          align-items: center;
          padding: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 0.5rem;
          border: none;
          background: none;
          color: #9ca3af;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .nav-child-button:hover {
          background-color: #374151;
          color: white;
        }

        .nav-child-button.active {
          background-color: #3b82f6;
          color: white;
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid #374151;
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
          color: #d1d5db;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .logout-button:hover {
          background-color: #374151;
          color: white;
        }

        .main-content {
          margin-left: 256px;
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
          display: none;
          padding: 0.5rem;
          border-radius: 0.375rem;
          color: #9ca3af;
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mobile-toggle:hover {
          color: #6b7280;
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

        @media (max-width: 1024px) {
          .sidebar {
            transform: translateX(-100%);
          }
          
          .sidebar.open {
            transform: translateX(0);
          }
          
          .main-content {
            margin-left: 0;
          }
          
          .mobile-toggle {
            display: block;
          }
          
          .sidebar-toggle {
            display: block;
          }
        }

        @media (min-width: 768px) {
          .last-login {
            display: flex;
          }
        }
      `}</style>

      <div className="admin-layout">
        {/* Sidebar */}
        <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-content">
            {/* Header */}
            <div className="sidebar-header">
              <div className="sidebar-logo">
                <div className="logo-icon">A</div>
                <div className="logo-text">
                  <h1>Admin Panel</h1>
                  <p>DiGex</p>
                </div>
              </div>
              <button
                onClick={toggleSidebar}
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
                  <div className="user-role">Admin</div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
              {menuItems.map((item) => (
                <div key={item.id} className="nav-item">
                  <button
                    onClick={() => navigate(item.href)}
                    className={`nav-button ${isActive(item.href) ? 'active' : ''}`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </button>
                  
                  {item.children && isActive(item.href) && (
                    <div className="nav-children">
                      {item.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => navigate(child.href)}
                          className={`nav-child-button ${location.pathname === child.href ? 'active' : ''}`}
                        >
                          <span className="nav-label">{child.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
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
                <span className="nav-label">Ana Səhifə</span>
              </button>
              <button
                onClick={handleLogout}
                className="logout-button"
              >
                <span className="nav-icon">🚪</span>
                <span className="nav-label">Çıxış</span>
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
                  onClick={toggleSidebar}
                  className="mobile-toggle"
                >
                  ☰
                </button>
                <div className="page-title">
                  <h2>{getCurrentPageTitle()}</h2>
                  <p>Admin paneli idarəetməsi</p>
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

export default AdminLayout; 