import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiClient } from '../../services/api';

interface Product {
  id: number;
  name: string;
  price: number;
  category: {
    id: number;
    name: string;
  };
  images: string[];
  description: string;
  stock: number;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_DELETION';
}

interface DeletionRequest {
  id: number;
  product: Product;
  seller: {
    id: number;
    username: string;
    email: string;
  };
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestDate: string;
  processedDate?: string;
  processedBy?: {
    id: number;
    username: string;
  };
  adminNotes?: string;
  deletionType: 'SELLER_REQUEST' | 'ADMIN_DECISION' | 'POLICY_VIOLATION' | 'OUT_OF_STOCK';
}

interface DeletionStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  monthlyRequests: number;
}

const AdminDeletionRequestsPage: React.FC = () => {
  const [deletionRequests, setDeletionRequests] = useState<DeletionRequest[]>([]);
  const [stats, setStats] = useState<DeletionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<DeletionRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [requestsResponse, statsResponse] = await Promise.all([
        apiClient.get<DeletionRequest[]>('/api/admin/deletion-requests'),
        apiClient.get<DeletionStats>('/api/admin/deletion-requests/stats')
      ]);

      setDeletionRequests(requestsResponse);
      setStats(statsResponse);
    } catch (err) {
      console.error('Data fetch error:', err);
      setError('Məlumatlar yüklənərkən xəta baş verdi');
      
      // Fallback to mock data
      const mockRequests: DeletionRequest[] = [
        {
          id: 1,
          product: {
            id: 101,
            name: 'iPhone 13 Pro',
            price: 3800.00,
            category: { id: 1, name: 'Elektronika' },
            images: ['https://via.placeholder.com/150x150?text=iPhone+13'],
            description: 'Apple iPhone 13 Pro, 256GB, Qızılı',
            stock: 0,
            status: 'PENDING_DELETION'
          },
          seller: {
            id: 2,
            username: 'fatma_aliyeva',
            email: 'fatma@mail.az'
          },
          reason: 'Məhsul stokda tükənib və yenidən satışa çıxarılmayacaq',
          status: 'PENDING',
          requestDate: '2024-01-21T10:30:00Z',
          deletionType: 'OUT_OF_STOCK'
        },
        {
          id: 2,
          product: {
            id: 102,
            name: 'Samsung Galaxy S22',
            price: 2900.00,
            category: { id: 1, name: 'Elektronika' },
            images: ['https://via.placeholder.com/150x150?text=Galaxy+S22'],
            description: 'Samsung Galaxy S22, 128GB, Ağ',
            stock: 3,
            status: 'ACTIVE'
          },
          seller: {
            id: 3,
            username: 'ali_mammadov',
            email: 'ali@mail.az'
          },
          reason: 'Məhsul artıq satışda olmayan modeldir',
          status: 'APPROVED',
          requestDate: '2024-01-20T14:15:00Z',
          processedDate: '2024-01-20T16:30:00Z',
          processedBy: {
            id: 1,
            username: 'admin_user'
          },
          adminNotes: 'Təsdiqləndi - köhnə model',
          deletionType: 'SELLER_REQUEST'
        },
        {
          id: 3,
          product: {
            id: 103,
            name: 'MacBook Air M2',
            price: 4200.00,
            category: { id: 1, name: 'Elektronika' },
            images: ['https://via.placeholder.com/150x150?text=MacBook+Air'],
            description: 'Apple MacBook Air M2, 13.6", 256GB SSD',
            stock: 2,
            status: 'ACTIVE'
          },
          seller: {
            id: 4,
            username: 'tech_store',
            email: 'info@techstore.az'
          },
          reason: 'Məhsul təsviri düzgün deyil və müştəri şikayətləri var',
          status: 'REJECTED',
          requestDate: '2024-01-19T11:45:00Z',
          processedDate: '2024-01-19T13:20:00Z',
          processedBy: {
            id: 1,
            username: 'admin_user'
          },
          adminNotes: 'Rədd edildi - məhsul təsvirini düzəltmək kifayətdir',
          deletionType: 'POLICY_VIOLATION'
        }
      ];

      const mockStats: DeletionStats = {
        totalRequests: 45,
        pendingRequests: 8,
        approvedRequests: 25,
        rejectedRequests: 12,
        monthlyRequests: 15
      };

      setDeletionRequests(mockRequests);
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDeletion = async (requestId: number) => {
    try {
      await apiClient.post(`/api/admin/deletion-requests/${requestId}/approve`, {
        adminNotes: adminNotes || undefined
      });
      await fetchData();
      setShowModal(false);
      setSelectedRequest(null);
      setAdminNotes('');
    } catch (err) {
      console.error('Approve deletion error:', err);
      alert('Silmə təsdiqləmə xətası');
    }
  };

  const handleRejectDeletion = async (requestId: number) => {
    try {
      await apiClient.post(`/api/admin/deletion-requests/${requestId}/reject`, {
        adminNotes: adminNotes || 'Rədd edildi'
      });
      await fetchData();
      setShowModal(false);
      setSelectedRequest(null);
      setAdminNotes('');
    } catch (err) {
      console.error('Reject deletion error:', err);
      alert('Silmə rədd etmə xətası');
    }
  };

  const filteredRequests = deletionRequests.filter(request => {
    const matchesSearch = request.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.seller.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.deletionType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SELLER_REQUEST': return '#3b82f6';
      case 'ADMIN_DECISION': return '#8b5cf6';
      case 'POLICY_VIOLATION': return '#ef4444';
      case 'OUT_OF_STOCK': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'SELLER_REQUEST': return 'Satıcı Tələbi';
      case 'ADMIN_DECISION': return 'Admin Qərarı';
      case 'POLICY_VIOLATION': return 'Qaydaların Pozulması';
      case 'OUT_OF_STOCK': return 'Stok Bitmə';
      default: return type;
    }
  };

  if (loading) {
    return (
      <AdminLayout activePage="deletion-requests" title="Silmə Tələbləri">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Silmə tələbləri yüklənir...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout activePage="deletion-requests" title="Silmə Tələbləri">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h3>Xəta baş verdi</h3>
          <p>{error}</p>
          <button onClick={fetchData}>Yenidən Yüklə</button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <style>{`
        .deletion-requests-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          text-align: center;
          position: relative;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          border-radius: 12px 12px 0 0;
        }

        .stat-card.pending::before { background: #f59e0b; }
        .stat-card.approved::before { background: #10b981; }
        .stat-card.rejected::before { background: #ef4444; }
        .stat-card.total::before { background: #6b7280; }
        .stat-card.monthly::before { background: #3b82f6; }

        .stat-number {
          font-size: 32px;
          font-weight: bold;
          margin: 10px 0;
        }

        .stat-label {
          color: #6b7280;
          font-size: 14px;
        }

        .controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .filter-group {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .filter-select, .search-input {
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: white;
        }

        .search-input {
          min-width: 200px;
        }

        .table-container {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .table {
          width: 100%;
          border-collapse: collapse;
        }

        .table th,
        .table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }

        .table th {
          background: #f9fafb;
          font-weight: 600;
          color: #374151;
        }

        .table tr:hover {
          background: #f9fafb;
        }

        .product-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .product-image {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid #e5e7eb;
        }

        .product-details {
          flex: 1;
        }

        .product-name {
          font-weight: 500;
          color: #374151;
        }

        .product-price {
          font-size: 12px;
          color: #6b7280;
        }

        .product-category {
          font-size: 12px;
          color: #8b5cf6;
        }

        .seller-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .seller-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 12px;
        }

        .seller-name {
          font-weight: 500;
          color: #374151;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          color: white;
        }

        .type-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          color: white;
          margin-bottom: 4px;
        }

        .reason-text {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.4;
          max-width: 200px;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .action-button {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .view-button {
          background: #3b82f6;
          color: white;
        }

        .view-button:hover {
          background: #2563eb;
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

        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 30px;
          border-radius: 12px;
          width: 90%;
          max-width: 700px;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-title {
          font-size: 20px;
          font-weight: 600;
          color: #374151;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
        }

        .close-button:hover {
          color: #374151;
        }

        .modal-body {
          margin-bottom: 20px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .detail-label {
          font-weight: 500;
          color: #374151;
        }

        .detail-value {
          color: #6b7280;
          text-align: right;
          max-width: 60%;
        }

        .product-details-modal {
          display: flex;
          gap: 15px;
          padding: 15px;
          background: #f9fafb;
          border-radius: 8px;
          margin: 15px 0;
        }

        .product-image-modal {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid #e5e7eb;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #374151;
        }

        .form-textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 14px;
          resize: vertical;
          min-height: 80px;
        }

        .form-textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .loading-container,
        .error-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 400px;
          text-align: center;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
        }

        .empty-state-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
      `}</style>

      <AdminLayout activePage="deletion-requests" title="Silmə Tələbləri">
        <div className="deletion-requests-container">
          {/* Stats Cards */}
          {stats && (
            <div className="stats-grid">
              <div className="stat-card pending">
                <div className="stat-number" style={{ color: '#f59e0b' }}>
                  {stats.pendingRequests}
                </div>
                <div className="stat-label">Gözləyən</div>
              </div>
              <div className="stat-card approved">
                <div className="stat-number" style={{ color: '#10b981' }}>
                  {stats.approvedRequests}
                </div>
                <div className="stat-label">Təsdiqlənən</div>
              </div>
              <div className="stat-card rejected">
                <div className="stat-number" style={{ color: '#ef4444' }}>
                  {stats.rejectedRequests}
                </div>
                <div className="stat-label">Rədd Edilən</div>
              </div>
              <div className="stat-card total">
                <div className="stat-number" style={{ color: '#6b7280' }}>
                  {stats.totalRequests}
                </div>
                <div className="stat-label">Toplam</div>
              </div>
              <div className="stat-card monthly">
                <div className="stat-number" style={{ color: '#3b82f6' }}>
                  {stats.monthlyRequests}
                </div>
                <div className="stat-label">Bu Ay</div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="controls">
            <div className="filter-group">
              <label htmlFor="searchTerm">Axtarış:</label>
              <input
                type="text"
                id="searchTerm"
                className="search-input"
                placeholder="Məhsul, satıcı və ya səbəb..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <label htmlFor="statusFilter">Vəziyyət:</label>
              <select
                id="statusFilter"
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Hamısı</option>
                <option value="PENDING">Gözləyir</option>
                <option value="APPROVED">Təsdiqlənib</option>
                <option value="REJECTED">Rədd edilib</option>
              </select>
              <label htmlFor="typeFilter">Tələb Tipi:</label>
              <select
                id="typeFilter"
                className="filter-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">Hamısı</option>
                <option value="SELLER_REQUEST">Satıcı Tələbi</option>
                <option value="ADMIN_DECISION">Admin Qərarı</option>
                <option value="POLICY_VIOLATION">Qaydaların Pozulması</option>
                <option value="OUT_OF_STOCK">Stok Bitmə</option>
              </select>
            </div>
          </div>

          {/* Deletion Requests Table */}
          <div className="table-container">
            {filteredRequests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🗑️</div>
                <h3>Silmə tələbi tapılmadı</h3>
                <p>Seçilmiş filtrə uyğun silmə tələbi mövcud deyil</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Məhsul</th>
                    <th>Satıcı</th>
                    <th>Tələb Tipi</th>
                    <th>Səbəb</th>
                    <th>Vəziyyət</th>
                    <th>Tələb Tarixi</th>
                    <th>Əməliyyatlar</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <div className="product-info">
                          <img
                            src={request.product.images[0] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRTJFOEYwIi8+CjxwYXRoIGQ9Ik0yNSAzMEwyNSAyMEgyNUwyNSAzMFoiIHN0cm9rZT0iIzY0NzQ4QiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHBhdGggZD0iTTE1IDMwSDE5TDI1IDI2TDMxIDMwSDM1VjM1SDE5VjMwWiIgc3Ryb2tlPSIjNjQ3NDhCIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+'}
                            alt={request.product.name}
                            className="product-image"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRTJFOEYwIi8+CjxwYXRoIGQ9Ik0yNSAzMEwyNSAyMEgyNUwyNSAzMFoiIHN0cm9rZT0iIzY0NzQ4QiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHBhdGggZD0iTTE1IDMwSDE5TDI1IDI2TDMxIDMwSDM1VjM1SDE5VjMwWiIgc3Ryb2tlPSIjNjQ3NDhCIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';
                            }}
                          />
                          <div className="product-details">
                            <div className="product-name">{request.product.name}</div>
                            <div className="product-price">
                              {request.product.price.toLocaleString('az-AZ', { style: 'currency', currency: 'AZN' })}
                            </div>
                            <div className="product-category">{request.product.category.name}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="seller-info">
                          <div className="seller-avatar">
                            {request.seller.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="seller-name">{request.seller.username}</div>
                        </div>
                      </td>
                      <td>
                        <div
                          className="type-badge"
                          style={{ backgroundColor: getTypeColor(request.deletionType) }}
                        >
                          {getTypeText(request.deletionType)}
                        </div>
                      </td>
                      <td>
                        <div className="reason-text">{request.reason}</div>
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(request.status) }}
                        >
                          {getStatusText(request.status)}
                        </span>
                      </td>
                      <td>{formatDate(request.requestDate)}</td>
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
                                onClick={() => handleApproveDeletion(request.id)}
                              >
                                Təsdiqlə
                              </button>
                              <button
                                className="action-button reject-button"
                                onClick={() => handleRejectDeletion(request.id)}
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
        </div>

        {/* Request Details Modal */}
        {showModal && selectedRequest && (
          <div className="modal" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Silmə Tələbi Detalları</h3>
                <button className="close-button" onClick={() => setShowModal(false)}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="detail-row">
                  <span className="detail-label">Tələb ID:</span>
                  <span className="detail-value">#{selectedRequest.id}</span>
                </div>
                
                <div className="product-details-modal">
                  <img
                    src={selectedRequest.product.images[0] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRTJFOEYwIi8+CjxwYXRoIGQ9Ik00MCA1MEw0MCAzMEg0MEw0MCA1MFoiIHN0cm9rZT0iIzY0NzQ4QiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHBhdGggZD0iTTI0IDUwSDI4TDQwIDQyTDUyIDUwSDU2VjU1SDI4VjUwWiIgc3Ryb2tlPSIjNjQ3NDhCIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+'}
                    alt={selectedRequest.product.name}
                    className="product-image-modal"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRTJFOEYwIi8+CjxwYXRoIGQ9Ik00MCA1MEw0MCAzMEg0MEw0MCA1MFoiIHN0cm9rZT0iIzY0NzQ4QiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHBhdGggZD0iTTI0IDUwSDI4TDQwIDQyTDUyIDUwSDU2VjU1SDI4VjUwWiIgc3Ryb2tlPSIjNjQ3NDhCIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>
                      {selectedRequest.product.name}
                    </div>
                    <div style={{ color: '#6b7280', marginBottom: '4px' }}>
                      Qiymət: {selectedRequest.product.price.toLocaleString('az-AZ', { style: 'currency', currency: 'AZN' })}
                    </div>
                    <div style={{ color: '#6b7280', marginBottom: '4px' }}>
                      Kateqoriya: {selectedRequest.product.category.name}
                    </div>
                    <div style={{ color: '#6b7280', marginBottom: '4px' }}>
                      Stok: {selectedRequest.product.stock}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '12px', lineHeight: '1.4' }}>
                      {selectedRequest.product.description}
                    </div>
                  </div>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Satıcı:</span>
                  <span className="detail-value">{selectedRequest.seller.username}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Satıcı Email:</span>
                  <span className="detail-value">{selectedRequest.seller.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Tələb Tipi:</span>
                  <span className="detail-value">
                    <span
                      className="type-badge"
                      style={{ backgroundColor: getTypeColor(selectedRequest.deletionType) }}
                    >
                      {getTypeText(selectedRequest.deletionType)}
                    </span>
                  </span>
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
                  <span className="detail-label">Silmə Səbəbi:</span>
                  <span className="detail-value">{selectedRequest.reason}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Tələb Tarixi:</span>
                  <span className="detail-value">{formatDate(selectedRequest.requestDate)}</span>
                </div>
                {selectedRequest.processedDate && (
                  <div className="detail-row">
                    <span className="detail-label">Proses Tarixi:</span>
                    <span className="detail-value">{formatDate(selectedRequest.processedDate)}</span>
                  </div>
                )}
                {selectedRequest.processedBy && (
                  <div className="detail-row">
                    <span className="detail-label">Proses Edən:</span>
                    <span className="detail-value">{selectedRequest.processedBy.username}</span>
                  </div>
                )}
                {selectedRequest.adminNotes && (
                  <div className="detail-row">
                    <span className="detail-label">Admin Qeydləri:</span>
                    <span className="detail-value">{selectedRequest.adminNotes}</span>
                  </div>
                )}
                
                {selectedRequest.status === 'PENDING' && (
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
                {selectedRequest.status === 'PENDING' && (
                  <>
                    <button
                      className="action-button approve-button"
                      onClick={() => handleApproveDeletion(selectedRequest.id)}
                    >
                      Təsdiqlə
                    </button>
                    <button
                      className="action-button reject-button"
                      onClick={() => handleRejectDeletion(selectedRequest.id)}
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
      </AdminLayout>
    </>
  );
};

export default AdminDeletionRequestsPage; 