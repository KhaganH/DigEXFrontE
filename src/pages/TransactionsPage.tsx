import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { balanceService, Transaction } from '../services/balanceService';
import Alert from '../components/Alert';

interface TransactionStats {
  totalDeposits: number;
  totalSpent: number;
  totalEarned: number;
  currentBalance: number;
}

interface TransactionFilters {
  type: string;
  startDate: string;
  endDate: string;
}

const TransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats>({
    totalDeposits: 0,
    totalSpent: 0,
    totalEarned: 0,
    currentBalance: 0
  });
  const [filters, setFilters] = useState<TransactionFilters>({
    type: '',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, [filters, pagination.currentPage]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await balanceService.getPageableTransactions(
        pagination.currentPage,
        pagination.pageSize,
        filters.type
      );
      
      let filteredTransactions = response.content;
      
      // Date filtering
      if (filters.startDate || filters.endDate) {
        filteredTransactions = filteredTransactions.filter(transaction => {
          const transactionDate = new Date(transaction.createdAt);
          const start = filters.startDate ? new Date(filters.startDate) : null;
          const end = filters.endDate ? new Date(filters.endDate) : null;
          
          if (start && transactionDate < start) return false;
          if (end && transactionDate > end) return false;
          return true;
        });
      }
      
      setTransactions(filteredTransactions);
      setPagination(prev => ({
        ...prev,
        totalPages: response.totalPages,
        totalElements: response.totalElements
      }));
    } catch (err) {
      setError('Əməliyyatlar yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Use the real balance stats API
      const statsData = await balanceService.getBalanceStats();
      
      setStats({
        totalDeposits: statsData.totalDeposits,
        totalSpent: statsData.totalPurchases,
        totalEarned: 0, // This would come from sales/earnings API
        currentBalance: statsData.currentBalance
      });
    } catch (err) {
      console.error('Stats yüklənərkən xəta:', err);
    }
  };

  const handleFilterChange = (field: keyof TransactionFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, currentPage: 0 })); // Reset to first page
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const clearFilters = () => {
    setFilters({ type: '', startDate: '', endDate: '' });
    setPagination(prev => ({ ...prev, currentPage: 0 }));
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('az-AZ'),
      time: date.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return 'Yükləmə';
      case 'PURCHASE': return 'Alış';
      case 'SALE': return 'Satış';
      case 'COMMISSION': return 'Komissiya';
      case 'REFUND': return 'Geri qaytarma';
      case 'WITHDRAWAL': return 'Çıxarış';
      case 'ADMIN_DEPOSIT': return 'Admin Yükləmə';
      case 'ADMIN_DEDUCT': return 'Admin Azaltma';
      default: return 'Əməliyyat';
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return 'bg-green-100 text-green-800';
      case 'PURCHASE': return 'bg-red-100 text-red-800';
      case 'SALE': return 'bg-blue-100 text-blue-800';
      case 'COMMISSION': return 'bg-yellow-100 text-yellow-800';
      case 'REFUND': return 'bg-indigo-100 text-indigo-800';
      case 'WITHDRAWAL': return 'bg-gray-100 text-gray-800';
      case 'ADMIN_DEPOSIT': return 'bg-green-100 text-green-800';
      case 'ADMIN_DEDUCT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Alert Messages */}
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Əməliyyat Tarixçəsi</h1>
            <p className="text-gray-600 mt-1">Bütün maliyyə əməliyyatlarınızı buradan izləyə bilərsiniz</p>
          </div>
          <button 
            onClick={() => window.location.href = '/balance'}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-wallet"></i>
            Balansa Qayıt
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-500 text-white rounded-lg p-6 text-center">
            <i className="fas fa-arrow-down text-3xl mb-3"></i>
            <div className="text-2xl font-bold">{stats.totalDeposits.toFixed(2)}</div>
            <div className="text-sm opacity-90">AZN Yükləmə</div>
          </div>
          <div className="bg-red-500 text-white rounded-lg p-6 text-center">
            <i className="fas fa-arrow-up text-3xl mb-3"></i>
            <div className="text-2xl font-bold">{stats.totalSpent.toFixed(2)}</div>
            <div className="text-sm opacity-90">AZN Xərclənən</div>
          </div>
          <div className="bg-blue-500 text-white rounded-lg p-6 text-center">
            <i className="fas fa-chart-line text-3xl mb-3"></i>
            <div className="text-2xl font-bold">{stats.totalEarned.toFixed(2)}</div>
            <div className="text-sm opacity-90">AZN Qazanılan</div>
          </div>
          <div className="bg-yellow-500 text-white rounded-lg p-6 text-center">
            <i className="fas fa-wallet text-3xl mb-3"></i>
            <div className="text-2xl font-bold">{stats.currentBalance.toFixed(2)}</div>
            <div className="text-sm opacity-90">AZN Cari Balans</div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h6 className="font-semibold flex items-center gap-2">
              <i className="fas fa-filter"></i>
              Filterlər
            </h6>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Əməliyyat Növü
                </label>
                <select
                  id="type"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Bütün növlər</option>
                  <option value="DEPOSIT">Balans Yükləmə</option>
                  <option value="PURCHASE">Alış</option>
                  <option value="SALE">Satış</option>
                  <option value="COMMISSION">Komissiya</option>
                  <option value="REFUND">Geri qaytarma</option>
                  <option value="WITHDRAWAL">Çıxarış</option>
                </select>
              </div>
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Başlanğıc tarix
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Bitiş tarixi
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={clearFilters}
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fas fa-search"></i>
                  Axtar
                </button>
                <button
                  onClick={clearFilters}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h6 className="font-semibold">Əməliyyatlar</h6>
            <button
              onClick={handlePrint}
              className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm flex items-center gap-1"
            >
              <i className="fas fa-print"></i>
              Çap Et
            </button>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12">
                <i className="fas fa-spinner animate-spin text-2xl text-purple-600 mb-4"></i>
                <p className="text-gray-500">Yüklənir...</p>
              </div>
            ) : transactions.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarix</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Növ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Təsvir</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Məbləğ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balans Sonrası</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => {
                    const dateTime = formatDate(transaction.createdAt);
                    return (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-900">{dateTime.date}</div>
                            <div className="text-sm text-gray-500">{dateTime.time}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTransactionTypeColor(transaction.type)}`}>
                            {getTransactionTypeLabel(transaction.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900">{transaction.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`font-bold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toFixed(2)}
                            <span className="text-sm text-gray-500 ml-1">AZN</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-gray-900 font-medium">
                            {transaction.balanceAfter.toFixed(2)}
                            <span className="text-sm text-gray-500 ml-1">AZN</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <i className="fas fa-receipt text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Əməliyyat tapılmadı</h3>
                <p className="text-gray-500">Seçdiyiniz filterlərə uyğun əməliyyat mövcud deyil.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex justify-center">
                <nav className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 0}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  
                  {Array.from({ length: pagination.totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        i === pagination.currentPage
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages - 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage; 