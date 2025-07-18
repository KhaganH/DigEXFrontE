import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { sellerService, EarningsData } from '../../services/sellerService';

const SellerEarningsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [earnings, setEarnings] = useState<EarningsData>({
    totalEarnings: 0,
    pendingEarnings: 0,
    availableBalance: 0,
    monthlyEarnings: 0,
    transactions: [],
    withdrawalHistory: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'SELLER') {
      navigate('/');
      return;
    }
    
    fetchEarnings();
  }, [user, isAuthenticated, isLoading, navigate]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching earnings from API...');
      const earningsData = await sellerService.getEarnings();
      console.log('💰 Earnings API response:', earningsData);
      
      setEarnings(earningsData);
    } catch (err: any) {
      console.error('Qazanc məlumatları yüklənərkən xəta:', err);
      
      if (err.response?.status === 401) {
        setError('Səhifəyə daxil olmaq üçün yenidən giriş edin');
        navigate('/login');
        return;
      }
      
      setError(err.response?.data?.message || 'Qazanc məlumatları yüklənərkən xəta baş verdi');
      
      // Hata durumunda boş veriler
      setEarnings({
        totalEarnings: 0,
        pendingEarnings: 0,
        availableBalance: 0,
        monthlyEarnings: 0,
        transactions: [],
        withdrawalHistory: []
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('az-AZ', {
      style: 'currency',
      currency: 'AZN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('az-AZ');
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'sale': return '💰';
      case 'withdrawal': return '💸';
      case 'commission': return '📊';
      default: return '📄';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'sale': return 'text-green-600';
      case 'withdrawal': return 'text-red-600';
      case 'commission': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Qazanc</h1>
          <p className="text-gray-600 mt-1">Satış qazancınızı izləyin və idarə edin</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Çıxarma Tələbi
          </button>
        </div>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-lg">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ümumi Qazanc</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(earnings.totalEarnings)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-lg">⏳</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Gözləyən Qazanc</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(earnings.pendingEarnings)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">💳</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Mövcud Bakiye</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(earnings.availableBalance)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-lg">📅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Bu Ay</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(earnings.monthlyEarnings)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions and Withdrawals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Son Əməliyyatlar</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {earnings.transactions.length > 0 ? (
                earnings.transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">{getTransactionIcon(transaction.type)}</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'withdrawal' ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount))}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status === 'completed' ? 'Tamamlandı' : 
                         transaction.status === 'pending' ? 'Gözləyir' : 'Uğursuz'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📄</div>
                  <p className="text-gray-500">Hələ heç bir əməliyyat yoxdur</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Withdrawal History */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Çıxarma Tarixçəsi</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {earnings.withdrawalHistory.length > 0 ? (
                earnings.withdrawalHistory.map((withdrawal) => (
                  <div key={withdrawal.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 text-lg">💸</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{withdrawal.method}</p>
                        <p className="text-sm text-gray-500">{withdrawal.accountInfo}</p>
                        <p className="text-sm text-gray-500">{formatDate(withdrawal.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(withdrawal.amount)}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        withdrawal.status === 'Tamamlandı' ? 'bg-green-100 text-green-800' :
                        withdrawal.status === 'Gözləyir' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {withdrawal.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">💸</div>
                  <p className="text-gray-500">Hələ heç bir çıxarma əməliyyatı yoxdur</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerEarningsPage; 