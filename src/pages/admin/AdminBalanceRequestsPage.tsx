import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';

interface BalanceRequest {
  id: number;
  userId: number;
  username: string;
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

interface PaymentMethod {
  id: number;
  bankName: string;
  cardNumber: string;
  cardHolderName: string;
  isActive: boolean;
  createdAt: string;
}

interface BalanceRequestStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalAmount: number;
  pendingAmount: number;
}

interface PaymentMethodStats {
  totalMethods: number;
  activeMethods: number;
  inactiveMethods: number;
}

const AdminBalanceRequestsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'methods'>('requests');
  const [balanceRequests, setBalanceRequests] = useState<BalanceRequest[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [balanceStats, setBalanceStats] = useState<BalanceRequestStats | null>(null);
  const [paymentStats, setPaymentStats] = useState<PaymentMethodStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<BalanceRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (activeTab === 'requests') {
        const [requestsResponse, statsResponse] = await Promise.all([
          apiClient.get<BalanceRequest[]>('/api/admin/c2c/balance-requests'),
          apiClient.get<BalanceRequestStats>('/api/admin/c2c/balance-requests/stats')
        ]);
        
        console.log('🔍 API Response:', requestsResponse);
        setBalanceRequests(requestsResponse);
        setBalanceStats(statsResponse);
      } else {
        const [methodsResponse, methodStatsResponse] = await Promise.all([
          apiClient.get<PaymentMethod[]>('/api/admin/c2c/payment-methods'),
          apiClient.get<PaymentMethodStats>('/api/admin/c2c/payment-methods/stats')
        ]);
        
        setPaymentMethods(methodsResponse);
        setPaymentStats(methodStatsResponse);
      }
    } catch (err) {
      console.error('Data fetch error:', err);
      setError('Məlumatlar yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: number) => {
    try {
      await apiClient.post(`/api/admin/c2c/balance-requests/${requestId}/approve`);
      await fetchData();
      setShowModal(false);
      setSelectedRequest(null);
    } catch (err) {
      console.error('Approve error:', err);
      alert('Təsdiqləmə zamanı xəta baş verdi');
    }
  };

  const handleRejectRequest = async (requestId: number, adminNotes?: string) => {
    try {
      await apiClient.post(`/api/admin/c2c/balance-requests/${requestId}/reject`, {
        adminNotes
      });
      await fetchData();
      setShowModal(false);
      setSelectedRequest(null);
    } catch (err) {
      console.error('Reject error:', err);
      alert('Rədd etmə zamanı xəta baş verdi');
    }
  };

  const handleTogglePaymentMethod = async (methodId: number) => {
    try {
      await apiClient.post(`/api/admin/c2c/payment-methods/${methodId}/toggle`);
      await fetchData();
    } catch (err) {
      console.error('Toggle error:', err);
      alert('Ödəniş metodunun vəziyyəti dəyişdirilə bilmədi');
    }
  };

  const handleAddPaymentMethod = async (method: Omit<PaymentMethod, 'id' | 'createdAt'>) => {
    try {
      await apiClient.post('/api/admin/c2c/payment-methods', method);
      await fetchData();
      setShowAddMethodModal(false);
    } catch (err) {
      console.error('Add method error:', err);
      alert('Ödəniş metodu əlavə edilə bilmədi');
    }
  };

  const filteredRequests = balanceRequests.filter(request => {
    if (statusFilter === 'all') return true;
    return request.status === statusFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#f59e0b';
      case 'APPROVED': return '#10b981';
      case 'REJECTED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Gözləyir';
      case 'APPROVED': return 'Təsdiqlənib';
      case 'REJECTED': return 'Rədd edilib';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Məlumatlar yüklənir...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">❌</div>
        <h3>Xəta baş verdi</h3>
        <p>{error}</p>
        <button onClick={fetchData}>Yenidən Yüklə</button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .balance-requests-dashboard {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
          padding: 2rem;
        }

        .dashboard-header {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .tab-buttons {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }

        .tab-button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          background: #f3f4f6;
          color: #6b7280;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .tab-button.active {
          background: #3b82f6;
          color: white;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .controls {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
        }

        .form-input, .form-select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.875rem;
          transition: border-color 0.2s;
        }

        .form-input:focus, .form-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .add-button {
          padding: 0.75rem 1.5rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-button:hover {
          background: #2563eb;
        }

        .table-container {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .table {
          width: 100%;
          border-collapse: collapse;
        }

        .table th {
          background: #f8fafc;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
        }

        .table td {
          padding: 1rem;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
        }

        .table tr:hover {
          background: #f9fafb;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          color: white;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .action-button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-button {
          background: #6b7280;
          color: white;
        }

        .view-button:hover {
          background: #4b5563;
        }

        .approve-button {
          background: #10b981;
          color: white;
        }

        .approve-button:hover {
          background: #059669;
        }

        .reject-button {
          background: #ef4444;
          color: white;
        }

        .reject-button:hover {
          background: #dc2626;
        }

        .toggle-button {
          background: #f59e0b;
          color: white;
        }

        .toggle-button:hover {
          background: #d97706;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        .empty-state-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6b7280;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: background-color 0.2s;
        }

        .close-button:hover {
          background: #f3f4f6;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .detail-label {
          font-weight: 500;
          color: #374151;
        }

        .detail-value {
          color: #6b7280;
        }

        .receipt-image {
          max-width: 100%;
          max-height: 400px;
          height: auto;
          border-radius: 8px;
          margin-top: 0.5rem;
          border: 1px solid #e5e7eb;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: transform 0.2s;
        }

        .receipt-image:hover {
          transform: scale(1.02);
        }

        .modal-actions {
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }

        .loading-container, .error-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          flex-direction: column;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }
          
          .table {
            font-size: 0.875rem;
          }
          
          .table th,
          .table td {
            padding: 0.75rem 0.5rem;
          }
        }
      `}</style>

      <div className="balance-requests-dashboard">
        <div className="dashboard-header">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            💰 C2C Balans İdarəetməsi
          </h1>
          <p className="text-gray-600">
            Balans tələblərini və ödəniş metodlarını idarə edin
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            📋 Balans Tələbləri
          </button>
          <button
            className={`tab-button ${activeTab === 'methods' ? 'active' : ''}`}
            onClick={() => setActiveTab('methods')}
          >
            🏦 Ödəniş Metodları
          </button>
        </div>

        {/* Balance Requests Tab */}
        {activeTab === 'requests' && (
          <>
            {/* Stats Cards */}
            {balanceStats && (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{balanceStats?.totalRequests || 0}</div>
                  <div className="stat-label">Ümumi Tələb</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number" style={{ color: '#f59e0b' }}>
                    {balanceStats?.pendingRequests || 0}
                  </div>
                  <div className="stat-label">Gözləyən Tələb</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number" style={{ color: '#10b981' }}>
                    {balanceStats?.approvedRequests || 0}
                  </div>
                  <div className="stat-label">Təsdiqlənən Tələb</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number" style={{ color: '#ef4444' }}>
                    {balanceStats?.rejectedRequests || 0}
                  </div>
                  <div className="stat-label">Rədd Edilən Tələb</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    {balanceStats?.totalAmount?.toLocaleString('az-AZ', { style: 'currency', currency: 'AZN' }) || '0 ₼'}
                  </div>
                  <div className="stat-label">Ümumi Məbləğ</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number" style={{ color: '#f59e0b' }}>
                    {balanceStats?.pendingAmount?.toLocaleString('az-AZ', { style: 'currency', currency: 'AZN' }) || '0 ₼'}
                  </div>
                  <div className="stat-label">Gözləyən Məbləğ</div>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="controls">
              <div className="form-group">
                <label className="form-label">Status Filtrlə</label>
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Bütün Statuslar</option>
                  <option value="PENDING">Gözləyir</option>
                  <option value="APPROVED">Təsdiqlənib</option>
                  <option value="REJECTED">Rədd edilib</option>
                </select>
              </div>
            </div>

            {/* Balance Requests Table */}
            <div className="table-container">
              {filteredRequests.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">💰</div>
                  <h3>Balans tələbi tapılmadı</h3>
                  <p>Hələ balans tələbi yoxdur</p>
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>İstifadəçi</th>
                      <th>Məbləğ</th>
                      <th>Ödəniş Metodu</th>
                      <th>Vəziyyət</th>
                      <th>Tarix</th>
                      <th>Əməliyyatlar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr key={request.id}>
                        <td>#{request.id}</td>
                        <td>
                          <div>
                            <div style={{ fontWeight: '500' }}>{request.username || 'Bilinməyən'}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              ID: {request.userId}
                            </div>
                          </div>
                        </td>
                        <td style={{ fontWeight: '600' }}>
                          {request.amount.toLocaleString('az-AZ', { style: 'currency', currency: 'AZN' })}
                        </td>
                        <td>
                          <div>
                            <div style={{ fontWeight: '500' }}>{request.paymentMethod.bankName}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              **** {request.paymentMethod.cardNumber.slice(-4)}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(request.status) }}
                          >
                            {getStatusText(request.status)}
                          </span>
                        </td>
                        <td>{formatDate(request.createdAt)}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-button view-button"
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowModal(true);
                              }}
                            >
                              Bax
                            </button>
                            {request.status === 'PENDING' && (
                              <>
                                <button
                                  className="action-button approve-button"
                                  onClick={() => handleApproveRequest(request.id)}
                                >
                                  Təsdiqlə
                                </button>
                                <button
                                  className="action-button reject-button"
                                  onClick={() => handleRejectRequest(request.id)}
                                >
                                  Rədd et
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* Payment Methods Tab */}
        {activeTab === 'methods' && (
          <>
            {/* Stats Cards */}
            {paymentStats && (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number" style={{ color: '#6b7280' }}>
                    {paymentStats?.totalMethods || 0}
                  </div>
                  <div className="stat-label">Toplam Metod</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number" style={{ color: '#10b981' }}>
                    {paymentStats?.activeMethods || 0}
                  </div>
                  <div className="stat-label">Aktiv Metodlar</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number" style={{ color: '#ef4444' }}>
                    {paymentStats?.inactiveMethods || 0}
                  </div>
                  <div className="stat-label">Deaktiv Metodlar</div>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="controls">
              <div></div>
              <button
                className="add-button"
                onClick={() => setShowAddMethodModal(true)}
              >
                + Yeni Ödəniş Metodu
              </button>
            </div>

            {/* Payment Methods Table */}
            <div className="table-container">
              {paymentMethods.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">🏦</div>
                  <h3>Ödəniş metodu tapılmadı</h3>
                  <p>Hələ ödəniş metodu əlavə edilməyib</p>
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Bank</th>
                      <th>Kart Nömrəsi</th>
                      <th>Kart Sahibi</th>
                      <th>Vəziyyət</th>
                      <th>Yaradılma Tarixi</th>
                      <th>Əməliyyatlar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentMethods.map((method) => (
                      <tr key={method.id}>
                        <td>#{method.id}</td>
                        <td style={{ fontWeight: '500' }}>{method.bankName}</td>
                        <td>**** **** **** {method.cardNumber.slice(-4)}</td>
                        <td>{method.cardHolderName}</td>
                        <td>
                          <span
                            className="status-badge"
                            style={{ 
                              backgroundColor: method.isActive ? '#10b981' : '#ef4444' 
                            }}
                          >
                            {method.isActive ? 'Aktiv' : 'Deaktiv'}
                          </span>
                        </td>
                        <td>{formatDate(method.createdAt)}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-button toggle-button"
                              onClick={() => handleTogglePaymentMethod(method.id)}
                            >
                              {method.isActive ? 'Deaktiv et' : 'Aktiv et'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* Request Details Modal */}
        {showModal && selectedRequest && (
          <div className="modal" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Balans Tələbi Detalları</h3>
                <button className="close-button" onClick={() => setShowModal(false)}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="detail-row">
                  <span className="detail-label">Tələb ID:</span>
                  <span className="detail-value">#{selectedRequest.id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">İstifadəçi:</span>
                  <span className="detail-value">{selectedRequest.username || 'Bilinməyən'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">İstifadəçi ID:</span>
                  <span className="detail-value">{selectedRequest.userId}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Məbləğ:</span>
                  <span className="detail-value">
                    {selectedRequest.amount.toLocaleString('az-AZ', { style: 'currency', currency: 'AZN' })}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Bank:</span>
                  <span className="detail-value">{selectedRequest.paymentMethod.bankName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Kart Nömrəsi:</span>
                  <span className="detail-value">**** **** **** {selectedRequest.paymentMethod.cardNumber.slice(-4)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Kart Sahibi:</span>
                  <span className="detail-value">{selectedRequest.paymentMethod.cardHolderName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Vəziyyət:</span>
                  <span className="detail-value">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedRequest.status) }}
                    >
                      {getStatusText(selectedRequest.status)}
                    </span>
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Yaradılma Tarixi:</span>
                  <span className="detail-value">{formatDate(selectedRequest.createdAt)}</span>
                </div>
                {selectedRequest.processedAt && (
                  <div className="detail-row">
                    <span className="detail-label">Proses Tarixi:</span>
                    <span className="detail-value">{formatDate(selectedRequest.processedAt)}</span>
                  </div>
                )}
                {selectedRequest.approvedBy && (
                  <div className="detail-row">
                    <span className="detail-label">Təsdiqləyən:</span>
                    <span className="detail-value">{selectedRequest.approvedBy.username}</span>
                  </div>
                )}
                {selectedRequest.adminNotes && (
                  <div className="detail-row">
                    <span className="detail-label">Admin Qeydləri:</span>
                    <span className="detail-value">{selectedRequest.adminNotes}</span>
                  </div>
                )}
                {selectedRequest.receiptImagePath && (
                  <div>
                    <span className="detail-label">Qəbz Şəkli:</span>
                    <img 
                      src={selectedRequest.receiptImagePath.startsWith('http') 
                        ? selectedRequest.receiptImagePath 
                        : `http://localhost:1111/api/files/receipt${selectedRequest.receiptImagePath}`
                      } 
                      alt="Qəbz" 
                      className="receipt-image"
                      onClick={() => {
                        const imageUrl = selectedRequest.receiptImagePath.startsWith('http') 
                          ? selectedRequest.receiptImagePath 
                          : `http://localhost:1111/api/files/receipt${selectedRequest.receiptImagePath}`;
                        setSelectedImage(imageUrl);
                        setShowImageModal(true);
                      }}
                      onError={(e) => {
                        console.error('Dekont şəkli yüklənə bilmədi:', selectedRequest.receiptImagePath);
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextSibling?.remove();
                        const errorDiv = document.createElement('div');
                        errorDiv.style.color = '#ef4444';
                        errorDiv.style.fontSize = '0.875rem';
                        errorDiv.style.marginTop = '0.5rem';
                        errorDiv.textContent = 'Dekont şəkli yüklənə bilmədi';
                        e.currentTarget.parentNode?.appendChild(errorDiv);
                      }}
                    />
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      Şəkli böyütmək üçün klikləyin
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-actions">
                {selectedRequest.status === 'PENDING' && (
                  <>
                    <button
                      className="action-button approve-button"
                      onClick={() => handleApproveRequest(selectedRequest.id)}
                    >
                      Təsdiqlə
                    </button>
                    <button
                      className="action-button reject-button"
                      onClick={() => handleRejectRequest(selectedRequest.id)}
                    >
                      Rədd et
                    </button>
                  </>
                )}
                <button
                  className="action-button view-button"
                  onClick={() => setShowModal(false)}
                >
                  Bağla
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Payment Method Modal */}
        {showAddMethodModal && (
          <div className="modal" onClick={() => setShowAddMethodModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Yeni Ödəniş Metodu</h3>
                <button className="close-button" onClick={() => setShowAddMethodModal(false)}>
                  ×
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const method = {
                  bankName: formData.get('bankName') as string,
                  cardNumber: formData.get('cardNumber') as string,
                  cardHolderName: formData.get('cardHolderName') as string,
                  isActive: true
                };
                handleAddPaymentMethod(method);
              }}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Bank Adı:</label>
                    <input
                      type="text"
                      name="bankName"
                      className="form-input"
                      required
                      placeholder="Bank adını daxil edin"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kart Nömrəsi:</label>
                    <input
                      type="text"
                      name="cardNumber"
                      className="form-input"
                      required
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      onInput={(e) => {
                        const value = e.currentTarget.value.replace(/\D/g, '');
                        const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                        e.currentTarget.value = formatted;
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kart Sahibi:</label>
                    <input
                      type="text"
                      name="cardHolderName"
                      className="form-input"
                      required
                      placeholder="Kart sahibinin adını daxil edin"
                    />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="action-button approve-button">
                    Əlavə et
                  </button>
                  <button
                    type="button"
                    className="action-button view-button"
                    onClick={() => setShowAddMethodModal(false)}
                  >
                    Ləğv et
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Image Modal */}
        {showImageModal && (
          <div className="modal" onClick={() => setShowImageModal(false)}>
            <div className="modal-content" style={{ maxWidth: '90vw', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Dekont Şəkli</h3>
                <button className="close-button" onClick={() => setShowImageModal(false)}>
                  ×
                </button>
              </div>
              <div className="modal-body" style={{ textAlign: 'center', padding: '1rem' }}>
                <img 
                  src={selectedImage} 
                  alt="Dekont" 
                  style={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    height: 'auto',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const errorDiv = document.createElement('div');
                    errorDiv.style.color = '#ef4444';
                    errorDiv.style.padding = '2rem';
                    errorDiv.textContent = 'Dekont şəkli yüklənə bilmədi';
                    e.currentTarget.parentNode?.appendChild(errorDiv);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminBalanceRequestsPage; 