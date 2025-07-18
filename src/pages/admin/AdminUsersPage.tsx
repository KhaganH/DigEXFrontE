import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUser, deleteUser, User, adminAddBalance, adminDeductBalance, toggleUserStatus } from '../../services/adminService';

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState(0);
  const [balanceOperation, setBalanceOperation] = useState<'add' | 'set'>('add');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      setUsers(response);
    } catch (err) {
      setError('Kullanıcı listesi yüklenirken xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const updateUserData = async (userId: number, updates: Partial<User>) => {
    try {
      await updateUser(userId, updates);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      ));
      setShowEditModal(false);
      setEditingUser(null);
    } catch (err) {
      setError('Kullanıcı güncellenirken xəta baş verdi');
    }
  };

  const updateUserBalance = async (userId: number, amount: number, operation: 'add' | 'set') => {
    try {
      if (operation === 'add') {
        await adminAddBalance(userId, amount, 'Admin tərəfindən balans əlavə edilməsi');
      } else {
        const currentUser = users.find(u => u.id === userId);
        if (currentUser && currentUser.balance > 0) {
          await adminDeductBalance(userId, currentUser.balance, 'Admin tərəfindən balans sıfırlanması');
        }
        if (amount > 0) {
          await adminAddBalance(userId, amount, 'Admin tərəfindən yeni balans təyin edilməsi');
        }
      }
      
      await fetchUsers();
      setShowBalanceModal(false);
      setBalanceAmount(0);
      alert('Bakiye uğurla güncelləndi!');
    } catch (err) {
      console.error('Balance update error:', err);
      setError('Bakiye güncellenirken xəta baş verdi');
      alert('Bakiye güncellenirken xəta baş verdi');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleBalanceEdit = (user: User) => {
    setEditingUser(user);
    setBalanceAmount(user.balance);
    setShowBalanceModal(true);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUserData(editingUser.id, editingUser);
    }
  };

  const handleBalanceUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUserBalance(editingUser.id, balanceAmount, balanceOperation);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.phoneNumber && user.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[sortBy as keyof User];
    const bValue = b[sortBy as keyof User];
    
    if (aValue === undefined || bValue === undefined) return 0;
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const totalBalance = users.reduce((sum, user) => sum + user.balance, 0);
  const averageBalance = users.length > 0 ? totalBalance / users.length : 0;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'rgb(239, 68, 68)';
      case 'SELLER': return 'rgb(245, 158, 11)';
      case 'USER': return 'rgb(59, 130, 246)';
      default: return 'rgb(107, 114, 128)';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bi-shield-check';
      case 'SELLER': return 'bi-shop';
      case 'USER': return 'bi-person';
      default: return 'bi-person';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('az-AZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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
    <div className="users-dashboard">
      <style>{`
        .users-dashboard {
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

        .stat-value {
          font-size: 2rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .controls-section {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .controls-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1rem;
          align-items: end;
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

        .users-table-container {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .table-header {
          background: #f8fafc;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .table-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table th {
          background: #f8fafc;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
        }

        .users-table td {
          padding: 1rem;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
        }

        .users-table tr:hover {
          background: #f9fafb;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-details h4 {
          margin: 0;
          font-weight: 600;
          color: #1f2937;
        }

        .user-details p {
          margin: 0;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          color: white;
        }

        .balance-amount {
          font-weight: 600;
          color: #059669;
        }

        .balance-amount.negative {
          color: #dc2626;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        .btn-secondary {
          background: #6b7280;
          color: white;
        }

        .btn-secondary:hover {
          background: #4b5563;
        }

        .btn-success {
          background: #10b981;
          color: white;
        }

        .btn-success:hover {
          background: #059669;
        }

        .btn-warning {
          background: #f59e0b;
          color: white;
        }

        .btn-warning:hover {
          background: #d97706;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
        }

        .btn-danger:hover {
          background: #dc2626;
        }

        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
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
          max-width: 500px;
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

        .modal-close {
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

        .modal-close:hover {
          background: #f3f4f6;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .modal-footer {
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
        }

        .loading-spinner {
          text-align: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-message {
          text-align: center;
          color: #dc2626;
        }

        .retry-btn {
          margin-top: 1rem;
          padding: 0.75rem 1.5rem;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .retry-btn:hover {
          background: #b91c1c;
        }

        @media (max-width: 768px) {
          .controls-grid {
            grid-template-columns: 1fr;
          }
          
          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }
          
          .users-table {
            font-size: 0.875rem;
          }
          
          .users-table th,
          .users-table td {
            padding: 0.75rem 0.5rem;
          }
        }
      `}</style>

      <div className="dashboard-header">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          👥 İstifadəçi İdarəetməsi
        </h1>
        <p className="text-gray-600">
          Bütün istifadəçiləri idarə edin, rolları dəyişdirin və balansları tənzimləyin
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{users.length}</div>
          <div className="stat-label">Ümumi İstifadəçi</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{users.filter(u => u.role === 'SELLER').length}</div>
          <div className="stat-label">Satıcı</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{users.filter(u => u.role === 'USER').length}</div>
          <div className="stat-label">Alıcı</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatBalance(totalBalance)}</div>
          <div className="stat-label">Ümumi Balans</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatBalance(averageBalance)}</div>
          <div className="stat-label">Orta Balans</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{users.filter(u => u.role === 'ADMIN').length}</div>
          <div className="stat-label">Admin</div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="controls-grid">
          <div className="form-group">
            <label className="form-label">Axtar</label>
            <input
              type="text"
              className="form-input"
              placeholder="İstifadəçi adı, email və ya telefon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Rol Filtrlə</label>
            <select
              className="form-select"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="ALL">Bütün Rollar</option>
              <option value="USER">İstifadəçi</option>
              <option value="SELLER">Satıcı</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Sırala</label>
            <select
              className="form-select"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
            >
              <option value="createdAt-desc">Ən Yeni</option>
              <option value="createdAt-asc">Ən Köhnə</option>
              <option value="username-asc">Ad A-Z</option>
              <option value="username-desc">Ad Z-A</option>
              <option value="balance-desc">Balans (Yüksək)</option>
              <option value="balance-asc">Balans (Aşağı)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <div className="table-header">
          <h2 className="table-title">
            İstifadəçi Siyahısı ({sortedUsers.length})
          </h2>
        </div>
        
        {sortedUsers.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            <i className="bi bi-search" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
            <p>Heç bir istifadəçi tapılmadı</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="users-table">
              <thead>
                <tr>
                  <th>İstifadəçi</th>
                                      <th>Rol</th>
                    <th>Balans</th>
                    <th>Qeydiyyat Tarixi</th>
                    <th>Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                          <h4>{user.username}</h4>
                          <p>{user.email}</p>
                          {user.phoneNumber && (
                            <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                              📞 {user.phoneNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td>
                      <span 
                        className="role-badge"
                        style={{ backgroundColor: getRoleColor(user.role) }}
                      >
                        <i className={`bi ${getRoleIcon(user.role)}`}></i>
                        {user.role === 'USER' ? 'İstifadəçi' : 
                         user.role === 'SELLER' ? 'Satıcı' : 
                         user.role === 'ADMIN' ? 'Admin' : user.role}
                      </span>
                    </td>
                    
                    <td>
                      <span className={`balance-amount ${user.balance < 0 ? 'negative' : ''}`}>
                        {formatBalance(user.balance)}
                      </span>
                    </td>
                    
                    <td>
                      <div style={{ fontSize: '0.875rem' }}>
                        <div>{formatDate(user.createdAt)}</div>
                        <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                          ID: {user.id}
                        </div>
                      </div>
                                          </td>
                      
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleEditUser(user)}
                            title="Redaktə et"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleBalanceEdit(user)}
                            title="Balansı idarə et"
                          >
                            <i className="bi bi-cash"></i>
                          </button>
                          
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Detalları gör"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                        </div>
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-pencil me-2"></i>
                İstifadəçi Redaktəsi
              </h5>
              <button
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
            <form onSubmit={handleUpdateUser}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">İstifadəçi Adı</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Telefon</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingUser.phoneNumber || ''}
                    onChange={(e) => setEditingUser({...editingUser, phoneNumber: e.target.value})}
                    placeholder="Telefon nömrəsi (istəyə bağlı)"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Rol</label>
                  <select
                    className="form-select"
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                    required
                  >
                    <option value="USER">İstifadəçi</option>
                    <option value="SELLER">Satıcı</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  <i className="bi bi-x me-2"></i>
                  İmtina
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <i className="bi bi-check-lg me-2"></i>
                  Yadda saxla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Balance Modal */}
      {showBalanceModal && editingUser && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-cash me-2"></i>
                Balans İdarəetməsi
              </h5>
              <button
                className="modal-close"
                onClick={() => setShowBalanceModal(false)}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
            <form onSubmit={handleBalanceUpdate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">İstifadəçi</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingUser.username}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Hazırkı Balans</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formatBalance(editingUser.balance)}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Əməliyyat</label>
                  <select
                    className="form-select"
                    value={balanceOperation}
                    onChange={(e) => setBalanceOperation(e.target.value as 'add' | 'set')}
                  >
                    <option value="add">Balans əlavə et</option>
                    <option value="set">Balansı təyin et</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    {balanceOperation === 'add' ? 'Əlavə ediləcək məbləğ' : 'Yeni balans'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                {balanceOperation === 'add' && (
                  <div className="form-group">
                    <label className="form-label">Yeni balans</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formatBalance(editingUser.balance + balanceAmount)}
                      disabled
                    />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowBalanceModal(false)}
                >
                  <i className="bi bi-x me-2"></i>
                  İmtina
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <i className="bi bi-check-lg me-2"></i>
                  Yadda saxla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
