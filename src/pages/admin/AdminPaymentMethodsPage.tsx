import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { 
  getPaymentMethods, 
  getPaymentMethodStats, 
  addPaymentMethod, 
  togglePaymentMethodStatus, 
  deletePaymentMethod,
  getAllReceipts,
  approveBalanceRequest,
  rejectBalanceRequest,
  PaymentMethod,
  PaymentMethodStats,
  Receipt
} from '../../services/adminService';

const AdminPaymentMethodsPage: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [stats, setStats] = useState<PaymentMethodStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [activeTab, setActiveTab] = useState<'methods' | 'receipts'>('methods');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  // Add/Edit form state
  const [formData, setFormData] = useState({
    bankName: '',
    cardNumber: '',
    cardHolderName: '',
    description: ''
  });

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Payment methods ve stats'i paralel olarak al
      const [methodsData, statsData] = await Promise.all([
        getPaymentMethods(),
        getPaymentMethodStats()
      ]);
      
      setPaymentMethods(methodsData);
      setStats(statsData);
      
      console.log('🔍 Payment methods loaded:', methodsData);
      console.log('🔍 Payment stats loaded:', statsData);
      
      // Receipts'i ayrı olarak al, hata olursa boş array kullan
      try {
        const receiptsData = await getAllReceipts();
        setReceipts(receiptsData);
        console.log('🔍 Receipts loaded:', receiptsData);
      } catch (receiptsError) {
        console.warn('Receipts endpoint not available yet:', receiptsError);
        setReceipts([]);
      }
      
    } catch (err) {
      console.error('Error fetching payment methods:', err);
      setError('Ödəmə üsulları yüklənərkən xəta baş verdi');
      setPaymentMethods([]);
      setReceipts([]);
      setStats({
        activeMethodsCount: 0,
        pendingRequestsCount: 0,
        totalMethodsCount: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bankName || !formData.cardNumber || !formData.cardHolderName) {
      setError('Bütün sahələri doldurun');
      return;
    }
    
    try {
      setLoading(true);
      const newMethod = await addPaymentMethod(formData);
      setPaymentMethods(prev => [...prev, newMethod]);
      setShowAddModal(false);
      setFormData({ bankName: '', cardNumber: '', cardHolderName: '', description: '' });
      
      // Refresh stats
      const updatedStats = await getPaymentMethodStats();
      setStats(updatedStats);
      
    } catch (err) {
      console.error('Error adding payment method:', err);
      setError('Ödəmə üsulu əlavə edilərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (methodId: number) => {
    try {
      await togglePaymentMethodStatus(methodId);
      setPaymentMethods(prev => 
        prev.map(method => 
          method.id === methodId 
            ? { ...method, isActive: !method.isActive }
            : method
        )
      );
      
      // Refresh stats
      const updatedStats = await getPaymentMethodStats();
      setStats(updatedStats);
      
    } catch (err) {
      console.error('Error toggling payment method status:', err);
      setError('Status dəyişdirilərkən xəta baş verdi');
    }
  };

  const handleDeleteMethod = async (methodId: number) => {
    if (!window.confirm('Bu ödəmə üsulunu silmək istədiyinizə əminsiniz?')) {
      return;
    }
    
    try {
      await deletePaymentMethod(methodId);
      setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
      
      // Refresh stats
      const updatedStats = await getPaymentMethodStats();
      setStats(updatedStats);
      
    } catch (err) {
      console.error('Error deleting payment method:', err);
      setError('Ödəmə üsulu silinərkən xəta baş verdi');
    }
  };

  const handleApproveRequest = async (requestId: number) => {
    if (!window.confirm('Bu bakiyə yükləmə tələbini təsdiqləmək istədiyinizə əminsinizmi? İstifadəçinin hesabına məbləğ əlavə ediləcək.')) {
      return;
    }

    try {
      setProcessingAction(true);
      await approveBalanceRequest(requestId);
      
      // Refresh receipts
      const updatedReceipts = await getAllReceipts();
      setReceipts(updatedReceipts);
      
      // Update selected receipt if it was the one approved
      if (selectedReceipt && selectedReceipt.id === requestId) {
        const updatedReceipt = updatedReceipts.find(r => r.id === requestId);
        if (updatedReceipt) {
          setSelectedReceipt(updatedReceipt);
        }
      }
      
      // Refresh stats
      const updatedStats = await getPaymentMethodStats();
      setStats(updatedStats);
      
      alert('Tələb uğurla təsdiqləndi!');
      
    } catch (err) {
      console.error('Error approving request:', err);
      alert('Təsdiqləmə zamanı xəta baş verdi');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectRequest = async (requestId: number, reason?: string) => {
    const rejectionReason = reason || rejectReason;
    
    if (!rejectionReason.trim()) {
      alert('Rədd etmə səbəbini yazın');
      return;
    }

    try {
      setProcessingAction(true);
      await rejectBalanceRequest(requestId, rejectionReason);
      
      // Refresh receipts
      const updatedReceipts = await getAllReceipts();
      setReceipts(updatedReceipts);
      
      // Update selected receipt if it was the one rejected
      if (selectedReceipt && selectedReceipt.id === requestId) {
        const updatedReceipt = updatedReceipts.find(r => r.id === requestId);
        if (updatedReceipt) {
          setSelectedReceipt(updatedReceipt);
        }
      }
      
      // Refresh stats
      const updatedStats = await getPaymentMethodStats();
      setStats(updatedStats);
      
      setShowRejectModal(false);
      setRejectReason('');
      alert('Tələb uğurla rədd edildi!');
      
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert('Rədd etmə zamanı xəta baş verdi');
    } finally {
      setProcessingAction(false);
    }
  };

  const openRejectModal = () => {
    setShowRejectModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredPaymentMethods = paymentMethods.filter(method => {
    const matchesSearch = method.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         method.cardHolderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         method.cardNumber.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && method.isActive) ||
                         (filterStatus === 'inactive' && !method.isActive);
    return matchesSearch && matchesStatus;
  });

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = receipt.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'pending' && receipt.status === 'PENDING') ||
                         (filterStatus === 'approved' && receipt.status === 'APPROVED') ||
                         (filterStatus === 'rejected' && receipt.status === 'REJECTED');
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <AdminLayout activePage="payment-methods" title="Ödeme Yöntemleri">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="loading-spinner">Yükleniyor...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <style jsx>{`
        .payment-methods-container {
          padding: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .payment-methods-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e2e8f0;
        }

        .payment-methods-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .tab-buttons {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }

        .tab-button {
          padding: 0.75rem 1.5rem;
          border: 2px solid #e2e8f0;
          background: white;
          color: #64748b;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab-button.active {
          border-color: #3b82f6;
          background: #3b82f6;
          color: white;
        }

        .tab-button:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .tab-button.active:hover {
          color: white;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          text-align: center;
          border: 1px solid #e2e8f0;
        }

        .stat-card.active {
          border-left: 4px solid #10b981;
        }

        .stat-card.pending {
          border-left: 4px solid #f59e0b;
        }

        .stat-card.total {
          border-left: 4px solid #3b82f6;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 500;
        }

        .controls-row {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .search-input {
          flex: 1;
          min-width: 300px;
          padding: 0.75rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.875rem;
          transition: border-color 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .filter-select {
          padding: 0.75rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.875rem;
          background: white;
          min-width: 150px;
        }

        .add-method-btn {
          padding: 0.75rem 1.5rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .add-method-btn:hover {
          background: #2563eb;
        }

        .payment-methods-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .payment-method-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .payment-method-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .payment-method-card.inactive {
          opacity: 0.6;
        }

        .method-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .method-icon {
          font-size: 2rem;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          border-radius: 12px;
        }

        .method-info {
          flex: 1;
        }

        .method-name {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
        }

        .method-number {
          font-size: 0.875rem;
          color: #64748b;
          font-family: monospace;
        }

        .method-badges {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .method-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .method-badge.active {
          background: #dcfce7;
          color: #166534;
        }

        .method-badge.inactive {
          background: #fef2f2;
          color: #991b1b;
        }

        .method-actions {
          display: flex;
          gap: 0.75rem;
        }

        .action-btn {
          flex: 1;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .action-btn.primary {
          background: #3b82f6;
          color: white;
        }

        .action-btn.primary:hover {
          background: #2563eb;
        }

        .action-btn.danger {
          background: #ef4444;
          color: white;
        }

        .action-btn.danger:hover {
          background: #dc2626;
        }

        .receipts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 1.5rem;
        }

        .receipt-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .receipt-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .receipt-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .receipt-amount {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
        }

        .receipt-status {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .receipt-status.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .receipt-status.approved {
          background: #dcfce7;
          color: #166534;
        }

        .receipt-status.rejected {
          background: #fef2f2;
          color: #991b1b;
        }

        .receipt-details {
          margin-bottom: 1rem;
        }

        .receipt-detail {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .receipt-detail-label {
          color: #64748b;
          font-size: 0.875rem;
        }

        .receipt-detail-value {
          font-weight: 600;
          color: #1e293b;
        }

        .receipt-actions {
          display: flex;
          gap: 0.75rem;
        }

        .receipt-btn {
          flex: 1;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .receipt-btn.approve {
          background: #10b981;
          color: white;
        }

        .receipt-btn.approve:hover {
          background: #059669;
        }

        .receipt-btn.reject {
          background: #ef4444;
          color: white;
        }

        .receipt-btn.reject:hover {
          background: #dc2626;
        }

        .receipt-btn.view {
          background: #3b82f6;
          color: white;
        }

        .receipt-btn.view:hover {
          background: #2563eb;
        }

        .modal-overlay {
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
          padding: 2rem;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #64748b;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #374151;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.875rem;
          transition: border-color 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .form-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.875rem;
          min-height: 100px;
          resize: vertical;
          transition: border-color 0.2s;
        }

        .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .modal-btn {
          flex: 1;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .modal-btn.primary {
          background: #3b82f6;
          color: white;
        }

        .modal-btn.primary:hover {
          background: #2563eb;
        }

        .modal-btn.secondary {
          background: #6b7280;
          color: white;
        }

        .modal-btn.secondary:hover {
          background: #4b5563;
        }

        .loading-spinner {
          display: inline-block;
          width: 2rem;
          height: 2rem;
          border: 3px solid #e2e8f0;
          border-radius: 50%;
          border-top-color: #3b82f6;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-message {
          background: #fef2f2;
          color: #991b1b;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          border: 1px solid #fecaca;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #64748b;
          grid-column: 1 / -1;
        }

        .empty-state-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .payment-methods-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .controls-row {
            flex-direction: column;
            align-items: stretch;
          }

          .search-input {
            min-width: auto;
          }

          .payment-methods-grid,
          .receipts-grid {
            grid-template-columns: 1fr;
          }

          .modal-content {
            margin: 1rem;
            width: calc(100% - 2rem);
          }
        }
      `}</style>

      <AdminLayout activePage="payment-methods" title="Ödeme Yöntemleri">
        <div className="payment-methods-container">
          {/* Header */}
          <div className="payment-methods-header">
            <h2 className="payment-methods-title">
              💳 Ödeme Yöntemleri
            </h2>
            <button 
              className="add-method-btn"
              onClick={() => setShowAddModal(true)}
            >
              ➕ Yeni Yöntem
            </button>
          </div>

          {/* Tabs */}
          <div className="tab-buttons">
            <button 
              className={`tab-button ${activeTab === 'methods' ? 'active' : ''}`}
              onClick={() => setActiveTab('methods')}
            >
              💳 Ödeme Yöntemleri ({paymentMethods.length})
            </button>
            <button 
              className={`tab-button ${activeTab === 'receipts' ? 'active' : ''}`}
              onClick={() => setActiveTab('receipts')}
            >
              📄 Makbuzlar ({receipts.length})
            </button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="stats-grid">
              <div className="stat-card total">
                <div className="stat-number">{stats.totalMethodsCount}</div>
                <div className="stat-label">Toplam Yöntem</div>
              </div>
              <div className="stat-card active">
                <div className="stat-number">{stats.activeMethodsCount}</div>
                <div className="stat-label">Aktif Yöntem</div>
              </div>
              <div className="stat-card pending">
                <div className="stat-number">{stats.pendingRequestsCount}</div>
                <div className="stat-label">Bekleyen Talep</div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Controls */}
          <div className="controls-row">
            <input
              type="text"
              className="search-input"
              placeholder={`🔍 ${activeTab === 'methods' ? 'Ödeme yöntemi' : 'Makbuz'} ara...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tüm Durumlar</option>
              {activeTab === 'methods' ? (
                <>
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                </>
              ) : (
                <>
                  <option value="pending">Bekleyen</option>
                  <option value="approved">Onaylanan</option>
                  <option value="rejected">Reddedilen</option>
                </>
              )}
            </select>
          </div>

          {/* Payment Methods Tab */}
          {activeTab === 'methods' && (
            <div className="payment-methods-grid">
              {filteredPaymentMethods.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">😔</div>
                  <h3>Ödeme yöntemi bulunamadı</h3>
                  <p>Arama kriterlerinize uygun ödeme yöntemi bulunamadı.</p>
                </div>
              ) : (
                filteredPaymentMethods.map((method) => (
                  <div key={method.id} className={`payment-method-card ${!method.isActive ? 'inactive' : ''}`}>
                    <div className="method-header">
                      <div className="method-icon">
                        🏦
                      </div>
                      <div className="method-info">
                        <h3 className="method-name">{method.bankName}</h3>
                        <div className="method-number">**** **** **** {method.cardNumber.slice(-4)}</div>
                      </div>
                    </div>
                    
                    <div className="method-badges">
                      <span className={`method-badge ${method.isActive ? 'active' : 'inactive'}`}>
                        {method.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>

                    <div className="method-actions">
                      <button 
                        className="action-btn primary"
                        onClick={() => handleToggleStatus(method.id)}
                      >
                        {method.isActive ? '🔒 Pasif Yap' : '🔓 Aktif Yap'}
                      </button>
                      <button 
                        className="action-btn danger"
                        onClick={() => handleDeleteMethod(method.id)}
                      >
                        🗑️ Sil
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Receipts Tab */}
          {activeTab === 'receipts' && (
            <div className="receipts-grid">
              {filteredReceipts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">😔</div>
                  <h3>Makbuz bulunamadı</h3>
                  <p>Arama kriterlerinize uygun makbuz bulunamadı.</p>
                </div>
              ) : (
                filteredReceipts.map((receipt) => (
                  <div key={receipt.id} className="receipt-card">
                    <div className="receipt-header">
                      <div className="receipt-amount">
                        ₺{receipt.amount.toLocaleString('tr-TR')}
                      </div>
                      <span className={`receipt-status ${receipt.status.toLowerCase()}`}>
                        {receipt.status === 'PENDING' ? 'Bekliyor' : 
                         receipt.status === 'APPROVED' ? 'Onaylandı' : 'Reddedildi'}
                      </span>
                    </div>
                    
                    <div className="receipt-details">
                      <div className="receipt-detail">
                        <span className="receipt-detail-label">Kullanıcı:</span>
                        <span className="receipt-detail-value">{receipt.username}</span>
                      </div>
                      <div className="receipt-detail">
                        <span className="receipt-detail-label">Banka:</span>
                        <span className="receipt-detail-value">{receipt.paymentMethod.bankName}</span>
                      </div>
                      <div className="receipt-detail">
                        <span className="receipt-detail-label">Kart Sahibi:</span>
                        <span className="receipt-detail-value">{receipt.paymentMethod.cardHolderName}</span>
                      </div>
                      <div className="receipt-detail">
                        <span className="receipt-detail-label">Tarih:</span>
                        <span className="receipt-detail-value">{formatDate(receipt.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="receipt-actions">
                      <button 
                        className="receipt-btn view"
                        onClick={() => setSelectedReceipt(receipt)}
                      >
                        👁️ Görüntüle
                      </button>
                      {receipt.status === 'PENDING' && (
                        <>
                          <button 
                            className="receipt-btn approve"
                            onClick={() => handleApproveRequest(receipt.id)}
                            disabled={processingAction}
                          >
                            {processingAction ? '⏳' : '✅'} Onayla
                          </button>
                          <button 
                            className="receipt-btn reject"
                            onClick={openRejectModal}
                            disabled={processingAction}
                          >
                            {processingAction ? '⏳' : '❌'} Reddet
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Add Payment Method Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Yeni Ödeme Yöntemi Ekle</h3>
                <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
              </div>
              
              <form onSubmit={handleAddPaymentMethod}>
                <div className="form-group">
                  <label className="form-label">Banka Adı</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.bankName}
                    onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Kart Numarası</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Kart Sahibi</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.cardHolderName}
                    onChange={(e) => setFormData({...formData, cardHolderName: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Açıklama (Opsiyonel)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="modal-btn secondary" onClick={() => setShowAddModal(false)}>
                    İptal
                  </button>
                  <button type="submit" className="modal-btn primary">
                    Ekle
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Reddetme Sebebi</h3>
                <button className="close-btn" onClick={() => setShowRejectModal(false)}>×</button>
              </div>
              
              <div className="form-group">
                <label className="form-label">Reddetme Sebebi</label>
                <textarea
                  className="form-textarea"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reddetme sebebini yazın..."
                  required
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" className="modal-btn secondary" onClick={() => setShowRejectModal(false)}>
                  İptal
                </button>
                <button 
                  type="button" 
                  className="modal-btn primary"
                  onClick={() => handleRejectRequest(selectedReceipt?.id || 0)}
                >
                  Reddet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Image Modal */}
        {selectedReceipt && (
          <div className="modal-overlay" onClick={() => setSelectedReceipt(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Makbuz Görüntüle</h3>
                <button className="close-btn" onClick={() => setSelectedReceipt(null)}>×</button>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <img 
                  src={selectedReceipt.receiptImagePath} 
                  alt="Makbuz" 
                  style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }}
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" className="modal-btn secondary" onClick={() => setSelectedReceipt(null)}>
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default AdminPaymentMethodsPage; 