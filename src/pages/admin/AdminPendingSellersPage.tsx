import React, { useState, useEffect } from 'react';
import { 
  getPendingSellers, 
  approveSellerRequest, 
  rejectSellerRequest,
  User 
} from '../../services/adminService';

const AdminPendingSellersPage: React.FC = () => {
  const [pendingRequests, setPendingRequests] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Bekleyen satıcı istekleri yükleniyor...');
      
      const requests = await getPendingSellers();
      setPendingRequests(requests);
      
      // Debug: Check actual API response structure
      console.log('🔍 Pending Sellers API Response Structure:');
      console.log('Requests:', requests);
      
      console.log('✅ Bekleyen satıcı istekleri başarıyla yüklendi:', requests.length);
    } catch (err) {
      console.error('❌ Bekleyen satıcı istekleri yüklenirken hata:', err);
      setError('Bekleyen satıcı istekleri yüklenirken xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: number) => {
    try {
      setActionLoading(requestId);
      console.log('🔄 Satıcı talebi onaylanıyor...', requestId);
      
      await approveSellerRequest(requestId);
      
      // Request'i listeden kaldır
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      
      console.log('✅ Satıcı talebi başarıyla onaylandı');
      alert('İstifadəçi uğurla satıcı olaraq təsdiq edildi!');
    } catch (err) {
      console.error('❌ Satıcı talebi onaylanırken hata:', err);
      alert('Satıcı tələbi təsdiq edilərkən xəta baş verdi');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      setActionLoading(requestId);
      console.log('🔄 Satıcı talebi reddediliyor...', requestId);
      
      await rejectSellerRequest(requestId);
      
      // Request'i listeden kaldır
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      
      console.log('✅ Satıcı talebi başarıyla reddedildi');
      alert('Satıcı tələbi rədd edildi.');
    } catch (err) {
      console.error('❌ Satıcı talebi reddedilirken hata:', err);
      alert('Satıcı tələbi rədd edilərkən xəta baş verdi');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('az-AZ', {
      style: 'currency',
      currency: 'AZN',
      minimumFractionDigits: 2
    }).format(balance);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Yüklənir...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Yenidən cəhd et
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .pending-sellers-dashboard {
          background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
          min-height: 100vh;
          padding: 2rem;
        }

        .dashboard-header {
          background: linear-gradient(135deg, #f56565 0%, #c53030 100%);
          border-radius: 16px;
          padding: 1.5rem;
          color: white;
          margin-bottom: 1.5rem;
          box-shadow: 0 15px 30px rgba(245, 101, 101, 0.3);
          position: relative;
          overflow: hidden;
        }

        .dashboard-header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .header-content {
          position: relative;
          z-index: 1;
        }

        .header-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .header-subtitle {
          font-size: 1rem;
          opacity: 0.9;
          margin-bottom: 1rem;
        }

        .header-stats {
          display: flex;
          gap: 2rem;
          margin-top: 1.5rem;
        }

        .header-stat {
          text-align: center;
        }

        .header-stat-number {
          font-size: 2rem;
          font-weight: 700;
          display: block;
        }

        .header-stat-label {
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #f56565, #c53030);
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          color: white;
          background: linear-gradient(135deg, #f56565, #c53030);
          margin-bottom: 0.75rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: #718096;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .requests-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .request-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 8px 25px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          border: 2px solid transparent;
        }

        .request-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #f6ad55, #ed8936);
        }

        .request-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 25px 50px rgba(0,0,0,0.15);
          border-color: #f6ad55;
        }

        .request-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f6ad55, #ed8936);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.2rem;
          box-shadow: 0 6px 15px rgba(246, 173, 85, 0.3);
        }

        .user-details h3 {
          margin: 0;
          font-weight: 600;
          color: #2d3748;
          font-size: 1.1rem;
        }

        .user-details .user-email {
          color: #718096;
          font-size: 0.9rem;
          margin-top: 0.25rem;
        }

        .pending-badge {
          background: linear-gradient(135deg, #f6ad55, #ed8936);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-weight: 500;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 12px rgba(246, 173, 85, 0.3);
        }

        .request-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .detail-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #718096;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .detail-value {
          color: #2d3748;
          font-weight: 600;
          font-size: 1rem;
        }

        .detail-value.balance {
          color: #38a169;
        }

        .detail-value.phone {
          color: #3182ce;
        }

        .detail-value.date {
          color: #805ad5;
        }

        .request-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .action-btn {
          flex: 1;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.95rem;
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .action-btn.approve {
          background: linear-gradient(135deg, #38a169, #2f855a);
          color: white;
        }

        .action-btn.approve:hover:not(:disabled) {
          background: linear-gradient(135deg, #2f855a, #276749);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(56, 161, 105, 0.3);
        }

        .action-btn.reject {
          background: linear-gradient(135deg, #e53e3e, #c53030);
          color: white;
        }

        .action-btn.reject:hover:not(:disabled) {
          background: linear-gradient(135deg, #c53030, #9c2626);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(229, 62, 62, 0.3);
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #718096;
          background: white;
          border-radius: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          color: #38a169;
        }

        .refresh-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .refresh-btn:hover {
          background: linear-gradient(135deg, #5a67d8, #6b46c1);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
        }

        .loading-spinner {
          text-align: center;
          color: #f56565;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #fed7d7;
          border-top: 4px solid #f56565;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
        }

        .error-message {
          text-align: center;
          color: #e53e3e;
          background: white;
          padding: 2rem;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .error-message i {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .retry-btn {
          background: #f56565;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          margin-top: 1rem;
          transition: all 0.3s ease;
        }

        .retry-btn:hover {
          background: #e53e3e;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .dashboard-header {
            padding: 1.5rem;
          }
          
          .header-title {
            font-size: 2rem;
          }
          
          .header-stats {
            flex-direction: column;
            gap: 1rem;
          }
          
          .requests-container {
            grid-template-columns: 1fr;
          }
          
          .request-details {
            grid-template-columns: 1fr;
          }
          
          .request-actions {
            flex-direction: column;
          }
        }

        .seller-phone {
          color: #d97706;
          font-weight: 600;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.25rem;
        }

        .seller-phone i {
          color: #f59e0b;
        }

        .seller-details {
          padding: 1rem;
        }

        .store-info {
          margin-bottom: 1rem;
        }

        .store-name {
          color: #7c3aed;
          font-weight: 700;
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }

        .store-description {
          color: #4b5563;
          font-size: 0.9rem;
          line-height: 1.4;
          margin-bottom: 1rem;
        }

        .form-details {
          background: #f8fafc;
          border-radius: 8px;
          padding: 1rem;
          border: 1px solid #e2e8f0;
        }

        .detail-row {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .detail-row:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }

        .detail-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: #374151;
          min-width: 100px;
          font-size: 0.85rem;
        }

        .detail-label i {
          color: #6b7280;
          font-size: 0.9rem;
        }

        .detail-value {
          flex: 1;
          color: #1f2937;
          font-size: 0.85rem;
        }

        .detail-value.link a {
          color: #3b82f6;
          text-decoration: none;
          hover: underline;
        }

        .detail-value.link a:hover {
          text-decoration: underline;
        }

        .motivation-row {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .motivation-text {
          background: #ffffff;
          padding: 0.75rem;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          line-height: 1.5;
          width: 100%;
          font-size: 0.85rem;
          color: #374151;
        }

        .link {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
        }

        .link:hover {
          text-decoration: underline;
        }
      `}</style>

      <div className="pending-sellers-dashboard">
          {/* Dashboard Header */}
          <div className="dashboard-header">
            <div className="header-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 className="header-title">
                    <i className="bi bi-hourglass-split me-3"></i>
                    Təsdiq Gözləyən Satıcılar
                  </h1>
                  <p className="header-subtitle">
                    Satıcı olmaq istəyən istifadəçilərin tələblərini nəzərdən keçirin
                  </p>
                </div>
                <div>
                  <button
                    className="refresh-btn"
                    onClick={fetchPendingRequests}
                    disabled={loading}
                  >
                    <i className="bi bi-arrow-clockwise"></i>
                    Yenilə
                  </button>
                </div>
              </div>
              <div className="header-stats">
                <div className="header-stat">
                  <span className="header-stat-number">{pendingRequests.length}</span>
                  <span className="header-stat-label">Gözləyən Tələb</span>
                </div>
                <div className="header-stat">
                  <span className="header-stat-number">{pendingRequests.filter(r => r.active).length}</span>
                  <span className="header-stat-label">Aktiv İstifadəçi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Card */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-hourglass-split"></i>
              </div>
              <div className="stat-value">{pendingRequests.length}</div>
              <div className="stat-label">Gözləyən Tələb</div>
            </div>
          </div>

          {/* Requests */}
          {pendingRequests.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-check-circle-fill empty-icon"></i>
              <h3>Gözləyən tələb yoxdur</h3>
              <p>Hal-hazırda təsdiq gözləyən satıcı tələbləri yoxdur.</p>
            </div>
          ) : (
            <div className="requests-container">
              {pendingRequests.map(request => (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <div className="user-info">
                      <div className="user-avatar">
                        {request.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-details">
                        <h3>{request.username}</h3>
                        <div className="user-email">{request.email}</div>
                      </div>
                    </div>
                    <div className="pending-badge">
                      <i className="bi bi-clock"></i>
                      Gözləyir
                    </div>
                  </div>

                  <div className="request-details">
                    {request.storeName && (
                      <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                        <div className="detail-label">
                          <i className="bi bi-shop"></i>
                          Mağaza Adı
                        </div>
                        <div className="detail-value" style={{ color: '#805ad5', fontWeight: '700' }}>
                          {request.storeName}
                        </div>
                      </div>
                    )}
                    
                    {request.storeDescription && (
                      <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                        <div className="detail-label">
                          <i className="bi bi-card-text"></i>
                          Mağaza Təsviri
                        </div>
                        <div className="detail-value" style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                          {request.storeDescription}
                        </div>
                      </div>
                    )}
                    
                    <div className="detail-item">
                      <div className="detail-label">
                        <i className="bi bi-wallet2"></i>
                        Balans
                      </div>
                      <div className="detail-value balance">
                        {formatBalance(request.balance)}
                      </div>
                    </div>
                    
                    {request.phoneNumber && (
                      <div className="detail-item">
                        <div className="detail-label">
                          <i className="bi bi-telephone"></i>
                          Telefon
                        </div>
                        <div className="detail-value phone">
                          {request.phoneNumber}
                        </div>
                      </div>
                    )}
                    
                    <div className="detail-item">
                      <div className="detail-label">
                        <i className="bi bi-calendar-event"></i>
                        Qeydiyyat
                      </div>
                      <div className="detail-value date">
                        {formatDate(request.createdAt)}
                      </div>
                    </div>
                    
                    <div className="detail-item">
                      <div className="detail-label">
                        <i className="bi bi-shield-check"></i>
                        Vəziyyət
                      </div>
                      <div className="detail-value">
                        {request.active ? (
                          <span style={{ color: '#38a169' }}>Aktiv</span>
                        ) : (
                          <span style={{ color: '#e53e3e' }}>Deaktiv</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="request-actions">
                    <button
                      className="action-btn approve"
                      onClick={() => handleApproveRequest(request.id)}
                      disabled={actionLoading === request.id}
                    >
                      {actionLoading === request.id ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2"></div>
                          Təsdiq edilir...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle"></i>
                          Təsdiq Et
                        </>
                      )}
                    </button>
                    
                    <button
                      className="action-btn reject"
                      onClick={() => handleRejectRequest(request.id)}
                      disabled={actionLoading === request.id}
                    >
                      {actionLoading === request.id ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2"></div>
                          Rədd edilir...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-x-circle"></i>
                          Rədd Et
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </>
  );
};

export default AdminPendingSellersPage; 
 