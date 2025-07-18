import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { balanceService, Transaction, BalanceStats } from '../services/balanceService';
import Alert from '../components/Alert';

const BalancePage: React.FC = () => {
  const { user, balance } = useAuth();
  const [stats, setStats] = useState<BalanceStats>({
    currentBalance: 0,
    totalDeposits: 0,
    totalPurchases: 0,
    totalWithdrawals: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQuickPayModal, setShowQuickPayModal] = useState(false);
  const [showAzericardModal, setShowAzericardModal] = useState(false);
  const [quickAmount, setQuickAmount] = useState<number>(25);
  const [paymentDescription, setPaymentDescription] = useState('Hızlı balans yükləməsi');
  const [processing, setProcessing] = useState(false);
  const [transactionFilter, setTransactionFilter] = useState<string>('all');

  useEffect(() => {
    fetchBalanceData();
  }, []);

  const fetchBalanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsResponse, transactionsResponse] = await Promise.all([
        balanceService.getBalanceStats(),
        balanceService.getTransactions()
      ]);
      
      setStats(statsResponse);
      setRecentTransactions(transactionsResponse.slice(0, 10));
    } catch (err: any) {
      setError(err.message || 'Bakiye bilgileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('az-AZ', {
      style: 'currency',
      currency: 'AZN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getTransactionTypeText = (type: string): string => {
    switch (type) {
      case 'DEPOSIT': return 'Balans Yükləmə';
      case 'WITHDRAWAL': return 'Çəkim';
      case 'PURCHASE': return 'Alış';
      case 'SALE': return 'Satış';
      case 'REFUND': return 'Geri qaytarma';
      case 'COMMISSION': return 'Komissiya';
      default: return type;
    }
  };

  const getTransactionBadgeColor = (type: string): string => {
    switch (type) {
      case 'DEPOSIT': return 'bg-green-100 text-green-800';
      case 'PURCHASE': return 'bg-red-100 text-red-800';
      case 'SALE': return 'bg-blue-100 text-blue-800';
      case 'REFUND': return 'bg-yellow-100 text-yellow-800';
      case 'COMMISSION': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionAmountColor = (amount: number): string => {
    return amount >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const quickAmountOptions = [10, 25, 50, 100, 250, 500];

  const handleQuickPayment = async (provider: 'pulpal' | 'azericard') => {
    if (!quickAmount || quickAmount < 1 || quickAmount > 10000) {
      alert('Zəhmət olmasa 1 ilə 10,000 AZN arasında məbləğ daxil edin.');
      return;
    }

    try {
      setProcessing(true);
      
      const response = provider === 'pulpal' 
        ? await balanceService.createPulPalPayment(quickAmount, paymentDescription)
        : await balanceService.createAzericardPayment(quickAmount, paymentDescription);

      if (response.paymentUrl) {
        window.location.href = response.paymentUrl;
      } else {
        alert(response.message || 'Ödəmə URL\'i yaradıla bilmədi.');
      }
    } catch (err: any) {
      alert(err.message || 'Ödəmə əməliyyatında xəta baş verdi.');
    } finally {
      setProcessing(false);
    }
  };

  const filteredTransactions = recentTransactions.filter(transaction => {
    if (transactionFilter === 'all') return true;
    return transaction.type === transactionFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Bakiye bilgileri yüklənir...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Balans İdarəetməsi
              </h1>
              <p className="text-gray-600">Balansınızı idarə edin və əməliyyat tarixçəsini görün</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/balance/load" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Balans Yüklə
              </Link>
              <button 
                onClick={() => setShowQuickPayModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                PulPal ile Yüklə
              </button>
              <button 
                onClick={() => setShowAzericardModal(true)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Azericard ile Yüklə
              </button>
              <button 
                onClick={fetchBalanceData}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Yenilə
              </button>
            </div>
          </div>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Current Balance */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex justify-between items-start">
              <div>
                <h6 className="text-blue-100 text-sm uppercase tracking-wide mb-2">Cari Balans</h6>
                <h2 className="text-3xl font-bold mb-1">{formatCurrency(balance || 0).replace('AZN', '').trim()}</h2>
                <small className="text-blue-100">AZN</small>
              </div>
              <div className="opacity-30">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Deposits */}
          <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex justify-between items-start">
              <div>
                <h6 className="text-green-100 text-sm uppercase tracking-wide mb-2">Toplam Yükləmələr</h6>
                <h2 className="text-3xl font-bold mb-1">{formatCurrency(stats.totalDeposits).replace('AZN', '').trim()}</h2>
                <small className="text-green-100">AZN</small>
              </div>
              <div className="opacity-30">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Purchases */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex justify-between items-start">
              <div>
                <h6 className="text-yellow-100 text-sm uppercase tracking-wide mb-2">Toplam Alışlar</h6>
                <h2 className="text-3xl font-bold mb-1">{formatCurrency(stats.totalPurchases).replace('AZN', '').trim()}</h2>
                <small className="text-yellow-100">AZN</small>
              </div>
              <div className="opacity-30">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 3H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Withdrawals */}
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex justify-between items-start">
              <div>
                <h6 className="text-cyan-100 text-sm uppercase tracking-wide mb-2">Toplam Çəkmələr</h6>
                <h2 className="text-3xl font-bold mb-1">{formatCurrency(stats.totalWithdrawals).replace('AZN', '').trim()}</h2>
                <small className="text-cyan-100">AZN</small>
              </div>
              <div className="opacity-30">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Son Əməliyyatlar
                </h2>
              </div>
              <div className="flex gap-2">
                <Link to="/transactions" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Hamısını Gör
                </Link>
                <div className="relative">
                  <select 
                    value={transactionFilter} 
                    onChange={(e) => setTransactionFilter(e.target.value)}
                    className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg px-3 py-2 text-sm transition-colors appearance-none pr-8"
                  >
                    <option value="all">Hamısı</option>
                    <option value="DEPOSIT">Yükləmələr</option>
                    <option value="PURCHASE">Alışlar</option>
                    <option value="SALE">Satışlar</option>
                  </select>
                  <svg className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {filteredTransactions.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarix</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Növ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Təsvir</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Məbləğ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balans</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(transaction.createdAt).toLocaleDateString('az-AZ')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(transaction.createdAt).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getTransactionBadgeColor(transaction.type)}`}>
                          {getTransactionTypeText(transaction.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <span className={getTransactionAmountColor(transaction.amount)}>
                          {transaction.amount >= 0 ? '+' : ''}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {formatCurrency(transaction.balanceAfter)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Hələ əməliyyat yoxdur</h3>
                <p className="text-gray-500 mb-4">İlk balans yükləməsi üçün yuxarıdakı düyməni sıxın</p>
                <Link to="/balance/load" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  İlk Yükləməni Et
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* PulPal Quick Payment Modal */}
        {showQuickPayModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  PulPal ile Hızlı Ödeme
                </h3>
                <button onClick={() => setShowQuickPayModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Yükləmək istədiyiniz məbləğ (AZN)</label>
                  <input
                    type="number"
                    value={quickAmount}
                    onChange={(e) => setQuickAmount(Number(e.target.value))}
                    min="1"
                    max="10000"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="25.00"
                  />
                  <p className="text-sm text-gray-500 mt-1">Minimum: 1 AZN, Maksimum: 10,000 AZN</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hızlı seçimlər:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {quickAmountOptions.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setQuickAmount(amount)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          quickAmount === amount
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {amount} AZN
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Təsvir (istəyə bağlı)</label>
                  <input
                    type="text"
                    value={paymentDescription}
                    onChange={(e) => setPaymentDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Hızlı balans yükləməsi"
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowQuickPayModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={() => handleQuickPayment('pulpal')}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {processing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      PulPal'a Yönlendir
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Azericard Quick Payment Modal */}
        {showAzericardModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 text-cyan-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Azericard ile Hızlı Ödeme
                </h3>
                <button onClick={() => setShowAzericardModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Yükləmək istədiyiniz məbləğ (AZN)</label>
                  <input
                    type="number"
                    value={quickAmount}
                    onChange={(e) => setQuickAmount(Number(e.target.value))}
                    min="1"
                    max="10000"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="25.00"
                  />
                  <p className="text-sm text-gray-500 mt-1">Minimum: 1 AZN, Maksimum: 10,000 AZN</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hızlı seçimlər:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {quickAmountOptions.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setQuickAmount(amount)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          quickAmount === amount
                            ? 'bg-cyan-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {amount} AZN
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Təsvir (istəyə bağlı)</label>
                  <input
                    type="text"
                    value={paymentDescription}
                    onChange={(e) => setPaymentDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Azericard balans yükləməsi"
                    maxLength={100}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h6 className="font-medium text-blue-800 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Test Kartları:
                  </h6>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div><strong>Visa:</strong> 4127208100975761 | <strong>MM/YY:</strong> 04/30 | <strong>CVV:</strong> 139</div>
                    <div><strong>Mastercard:</strong> 5522099313088791 | <strong>MM/YY:</strong> 04/30 | <strong>CVV:</strong> 303</div>
                    <div><strong>SMS OTP:</strong> 1111</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAzericardModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={() => handleQuickPayment('azericard')}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {processing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Azericard'a Yönlendir
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BalancePage; 