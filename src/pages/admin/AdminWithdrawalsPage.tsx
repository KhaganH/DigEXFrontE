import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';

interface WithdrawalRequest {
  id: number;
  userId: number;
  username: string;
  amount: number;
  bankName: string;
  cardNumber: string;
  accountHolderName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  adminNotes?: string;
  approvedByUsername?: string;
  createdAt: string;
  updatedAt?: string;
  processedAt?: string;
}

interface WithdrawalStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  completedRequests: number;
  totalAmount: number;
  pendingAmount: number;
  completedAmount: number;
  totalFees: number;
}

const AdminWithdrawalsPage: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [stats, setStats] = useState<WithdrawalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [withdrawalsResponse, statsResponse] = await Promise.all([
        apiClient.get<WithdrawalRequest[]>('/admin/api/withdrawals'),
        apiClient.get<WithdrawalStats>('/admin/api/withdrawals/stats')
      ]);

      console.log('🔍 Withdrawals API Response:', withdrawalsResponse);
      setWithdrawals(withdrawalsResponse);
      setStats(statsResponse);
      
      console.log('🔍 Withdrawals loaded:', withdrawalsResponse);
      console.log('🔍 Withdrawal stats loaded:', statsResponse);
      
    } catch (err) {
      console.error('Error fetching withdrawals:', err);
      setError('Çıxarma tələbləri yüklənərkən xəta baş verdi');
      setWithdrawals([]);
      setStats({
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        completedRequests: 0,
        totalAmount: 0,
        pendingAmount: 0,
        completedAmount: 0,
        totalFees: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWithdrawal = async (withdrawalId: number) => {
    try {
      await apiClient.post(`/api/admin/withdrawals/${withdrawalId}/approve`, {
        adminNotes: adminNotes || undefined
      });
      await fetchData();
      setShowModal(false);
      setSelectedWithdrawal(null);
      setAdminNotes('');
    } catch (err) {
      console.error('Approve withdrawal error:', err);
      alert('Çıxarma təsdiqləmə xətası');
    }
  };

  const handleRejectWithdrawal = async (withdrawalId: number) => {
    try {
      await apiClient.post(`/api/admin/withdrawals/${withdrawalId}/reject`, {
        adminNotes: adminNotes || 'Rədd edildi'
      });
      await fetchData();
      setShowModal(false);
      setSelectedWithdrawal(null);
      setAdminNotes('');
    } catch (err) {
      console.error('Reject withdrawal error:', err);
      alert('Çıxarma rədd etmə xətası');
    }
  };

  const handleCompleteWithdrawal = async (withdrawalId: number, transactionId: string) => {
    try {
      await apiClient.post(`/api/admin/withdrawals/${withdrawalId}/complete`, {
        transactionId,
        adminNotes: adminNotes || undefined
      });
      await fetchData();
      setShowModal(false);
      setSelectedWithdrawal(null);
      setAdminNotes('');
    } catch (err) {
      console.error('Complete withdrawal error:', err);
      alert('Çıxarma tamamlama xətası');
    }
  };

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const matchesSearch = withdrawal.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || withdrawal.status === statusFilter;
    return matchesSearch && matchesStatus;
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
      case 'APPROVED': return '#3b82f6';
      case 'REJECTED': return '#ef4444';
      case 'COMPLETED': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Gözləyir';
      case 'APPROVED': return 'Təsdiqlənib';
      case 'REJECTED': return 'Rədd edilib';
      case 'COMPLETED': return 'Tamamlanıb';
      default: return status;
    }
  };

  const getWithdrawalMethodText = (method: WithdrawalRequest) => {
    if (method.bankName && method.cardNumber && method.cardNumber.trim() !== '') {
      return `${method.bankName} - **** ${method.cardNumber.slice(-4)}`;
    } else if (method.bankName) {
      return `${method.bankName} - ${method.accountHolderName}`;
    } else if (method.cardNumber && method.cardNumber.trim() !== '') {
      return `Kart - **** ${method.cardNumber.slice(-4)}`;
    } else {
      return 'Naməlum';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Çıxarma tələbləri yüklənir...</p>
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
        .withdrawals-dashboard {
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
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-weight: 500;
          color: #374151;
          font-size: 0.875rem;
        }

        .form-input, .form-select {
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

        .complete-button {
          background: #3b82f6;
          color: white;
        }

        .complete-button:hover {
          background: #2563eb;
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

        .form-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.875rem;
          resize: vertical;
          min-height: 100px;
          transition: border-color 0.2s;
        }

        .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

        .error-container button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 1rem;
        }

        .error-container button:hover {
          background: #2563eb;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }
          
          .controls {
            flex-direction: column;
            align-items: stretch;
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

      <div className="withdrawals-dashboard">
        <div className="dashboard-header">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            💰 Çıxarma Tələbləri
          </h1>
          <p className="text-gray-600">
            İstifadəçilərin çıxarma tələblərini idarə edin
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats?.totalRequests || 0}</div>
              <div className="stat-label">Ümumi Tələb</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{ color: '#f59e0b' }}>
                {stats?.pendingRequests || 0}
              </div>
              <div className="stat-label">Gözləyən Tələb</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{ color: '#3b82f6' }}>
                {stats?.approvedRequests || 0}
              </div>
              <div className="stat-label">Təsdiqlənən Tələb</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{ color: '#10b981' }}>
                {stats?.completedRequests || 0}
              </div>
              <div className="stat-label">Tamamlanan Tələb</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{ color: '#ef4444' }}>
                {stats?.rejectedRequests || 0}
              </div>
              <div className="stat-label">Rədd Edilən Tələb</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {stats?.totalAmount?.toLocaleString('az-AZ', { style: 'currency', currency: 'AZN' }) || '0 ₼'}
              </div>
              <div className="stat-label">Ümumi Məbləğ</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{ color: '#f59e0b' }}>
                {stats?.pendingAmount?.toLocaleString('az-AZ', { style: 'currency', currency: 'AZN' }) || '0 ₼'}
              </div>
              <div className="stat-label">Gözləyən Məbləğ</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{ color: '#10b981' }}>
                {stats?.completedAmount?.toLocaleString('az-AZ', { style: 'currency', currency: 'AZN' }) || '0 ₼'}
              </div>
              <div className="stat-label">Tamamlanan Məbləğ</div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="controls">
          <div className="form-group">
            <label className="form-label">Axtar</label>
            <input
              type="text"
              className="form-input"
              placeholder="İstifadəçi adı..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Bütün Statuslar</option>
              <option value="PENDING">Gözləyir</option>
              <option value="APPROVED">Təsdiqlənib</option>
              <option value="REJECTED">Rədd edilib</option>
              <option value="COMPLETED">Tamamlanıb</option>
            </select>
          </div>
        </div>

        {/* Withdrawals Table */}
        <div className="table-container">
          {filteredWithdrawals.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💰</div>
              <h3>Çıxarma tələbi tapılmadı</h3>
              <p>Seçilmiş filtrə uyğun çıxarma tələbi yoxdur</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>İstifadəçi</th>
                  <th>Məbləğ</th>
                  <th>Çıxarma Üsulu</th>
                  <th>Vəziyyət</th>
                  <th>Tarix</th>
                  <th>Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {filteredWithdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id}>
                    <td>#{withdrawal.id}</td>
                    <td>
                      <div>
                        <div style={{ fontWeight: '500' }}>{withdrawal.username}</div>
                      </div>
                    </td>
                    <td style={{ fontWeight: '600' }}>
                      {withdrawal.amount.toLocaleString('az-AZ', { style: 'currency', currency: 'AZN' })}
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: '500' }}>{getWithdrawalMethodText(withdrawal)}</div>
                        {withdrawal.cardNumber && withdrawal.cardNumber.trim() !== '' && (
                          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                            Kart: **** {withdrawal.cardNumber.slice(-4)}
                          </div>
                        )}
                        {withdrawal.accountHolderName && (
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            Sahib: {withdrawal.accountHolderName}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(withdrawal.status) }}
                      >
                        {getStatusText(withdrawal.status)}
                      </span>
                    </td>
                    <td>{formatDate(withdrawal.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-button view-button"
                          onClick={() => {
                            setSelectedWithdrawal(withdrawal);
                            setShowModal(true);
                          }}
                        >
                          Bax
                        </button>
                        {withdrawal.status === 'PENDING' && (
                          <>
                            <button
                              className="action-button approve-button"
                              onClick={() => handleApproveWithdrawal(withdrawal.id)}
                            >
                              Təsdiqlə
                            </button>
                            <button
                              className="action-button reject-button"
                              onClick={() => handleRejectWithdrawal(withdrawal.id)}
                            >
                              Rədd et
                            </button>
                          </>
                        )}
                        {withdrawal.status === 'APPROVED' && (
                          <button
                            className="action-button complete-button"
                            onClick={() => {
                              const transactionId = prompt('Əməliyyat ID daxil edin:');
                              if (transactionId) {
                                handleCompleteWithdrawal(withdrawal.id, transactionId);
                              }
                            }}
                          >
                            Tamamla
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Withdrawal Details Modal */}
        {showModal && selectedWithdrawal && (
          <div className="modal" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Çıxarma Tələbi Detalları</h3>
                <button className="close-button" onClick={() => setShowModal(false)}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="detail-row">
                  <span className="detail-label">Tələb ID:</span>
                  <span className="detail-value">#{selectedWithdrawal.id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">İstifadəçi:</span>
                  <span className="detail-value">{selectedWithdrawal.username}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Tələb Məbləği:</span>
                  <span className="detail-value">
                    {selectedWithdrawal.amount.toLocaleString('az-AZ', { style: 'currency', currency: 'AZN' })}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Çıxarma Üsulu:</span>
                  <span className="detail-value">
                    {getWithdrawalMethodText(selectedWithdrawal)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Hesab Sahibi:</span>
                  <span className="detail-value">{selectedWithdrawal.accountHolderName}</span>
                </div>
                {selectedWithdrawal.cardNumber && selectedWithdrawal.cardNumber.trim() !== '' && (
                  <div className="detail-row">
                    <span className="detail-label">Kart Nömrəsi:</span>
                    <span className="detail-value">**** **** **** {selectedWithdrawal.cardNumber.slice(-4)}</span>
                  </div>
                )}
                {selectedWithdrawal.bankName && (
                  <div className="detail-row">
                    <span className="detail-label">Bank:</span>
                    <span className="detail-value">{selectedWithdrawal.bankName}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-label">Vəziyyət:</span>
                  <span className="detail-value">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedWithdrawal.status) }}
                    >
                      {getStatusText(selectedWithdrawal.status)}
                    </span>
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Tələb Tarixi:</span>
                  <span className="detail-value">{formatDate(selectedWithdrawal.createdAt)}</span>
                </div>
                {selectedWithdrawal.processedAt && (
                  <div className="detail-row">
                    <span className="detail-label">Proses Tarixi:</span>
                    <span className="detail-value">{formatDate(selectedWithdrawal.processedAt)}</span>
                  </div>
                )}
                {selectedWithdrawal.updatedAt && (
                  <div className="detail-row">
                    <span className="detail-label">Son Dəyişiklik:</span>
                    <span className="detail-value">{formatDate(selectedWithdrawal.updatedAt)}</span>
                  </div>
                )}
                {selectedWithdrawal.adminNotes && (
                  <div className="detail-row">
                    <span className="detail-label">Admin Qeydləri:</span>
                    <span className="detail-value">{selectedWithdrawal.adminNotes}</span>
                  </div>
                )}
                
                {selectedWithdrawal.status === 'PENDING' && (
                  <div className="form-group">
                    <label className="form-label">Admin Qeydləri:</label>
                    <textarea
                      className="form-textarea"
                      placeholder="İstəyə bağlı qeyd əlavə edin..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                    />
                  </div>
                )}
              </div>
              <div className="modal-actions">
                {selectedWithdrawal.status === 'PENDING' && (
                  <>
                    <button
                      className="action-button approve-button"
                      onClick={() => handleApproveWithdrawal(selectedWithdrawal.id)}
                    >
                      Təsdiqlə
                    </button>
                    <button
                      className="action-button reject-button"
                      onClick={() => handleRejectWithdrawal(selectedWithdrawal.id)}
                    >
                      Rədd et
                    </button>
                  </>
                )}
                {selectedWithdrawal.status === 'APPROVED' && (
                  <button
                    className="action-button complete-button"
                    onClick={() => {
                      const transactionId = prompt('Əməliyyat ID daxil edin:');
                      if (transactionId) {
                        handleCompleteWithdrawal(selectedWithdrawal.id, transactionId);
                      }
                    }}
                  >
                    Tamamla
                  </button>
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
      </div>
    </>
  );
};

export default AdminWithdrawalsPage; 