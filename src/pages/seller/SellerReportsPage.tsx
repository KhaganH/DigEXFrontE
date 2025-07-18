import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { sellerService, ReportData } from '../../services/sellerService';

const SellerReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [reports, setReports] = useState<ReportData>({
    salesReport: {
      totalSales: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      topProducts: []
    },
    customerReport: {
      totalCustomers: 0,
      newCustomers: 0,
      repeatCustomers: 0,
      topCustomers: []
    },
    financialReport: {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      monthlyRevenue: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sales' | 'customers' | 'financial'>('sales');

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
    
    fetchReports();
  }, [user, isAuthenticated, isLoading, navigate]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching reports from API...');
      const reportsData = await sellerService.getReports();
      console.log('📊 Reports API response:', reportsData);
      
      setReports(reportsData);
    } catch (err: any) {
      console.error('Hesabat məlumatları yüklənərkən xəta:', err);
      
      if (err.response?.status === 401) {
        setError('Səhifəyə daxil olmaq üçün yenidən giriş edin');
        navigate('/login');
        return;
      }
      
      setError(err.response?.data?.message || 'Hesabat məlumatları yüklənərkən xəta baş verdi');
      
      // Hata durumunda boş veriler
      setReports({
        salesReport: {
          totalSales: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          topProducts: []
        },
        customerReport: {
          totalCustomers: 0,
          newCustomers: 0,
          repeatCustomers: 0,
          topCustomers: []
        },
        financialReport: {
          totalRevenue: 0,
          totalExpenses: 0,
          netProfit: 0,
          monthlyRevenue: []
        }
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
          <h1 className="text-2xl font-bold text-gray-900">Hesabatlar</h1>
          <p className="text-gray-600 mt-1">Satış və müştəri hesabatlarınızı izləyin</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            PDF Yüklə
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('sales')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sales'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Satış Hesabatları
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'customers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Müştəri Hesabatları
            </button>
            <button
              onClick={() => setActiveTab('financial')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'financial'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Maliyyə Hesabatları
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Sales Report */}
          {activeTab === 'sales' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-blue-900">Ümumi Satış</h3>
                  <p className="text-3xl font-bold text-blue-600">{formatCurrency(reports.salesReport.totalSales)}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-green-900">Ümumi Sifariş</h3>
                  <p className="text-3xl font-bold text-green-600">{reports.salesReport.totalOrders}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-purple-900">Ortalama Sifariş</h3>
                  <p className="text-3xl font-bold text-purple-600">{formatCurrency(reports.salesReport.averageOrderValue)}</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Ən Çox Satılan Məhsullar</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {reports.salesReport.topProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-medium text-gray-600">
                            {index + 1}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.sales} satış</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{formatCurrency(product.revenue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customer Report */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-blue-900">Ümumi Müştərilər</h3>
                  <p className="text-3xl font-bold text-blue-600">{reports.customerReport.totalCustomers}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-green-900">Yeni Müştərilər</h3>
                  <p className="text-3xl font-bold text-green-600">{reports.customerReport.newCustomers}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-purple-900">Təkrar Müştərilər</h3>
                  <p className="text-3xl font-bold text-purple-600">{reports.customerReport.repeatCustomers}</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Ən Yaxşı Müştərilər</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {reports.customerReport.topCustomers.map((customer, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-medium text-gray-600">
                            {index + 1}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                            <p className="text-sm text-gray-500">{customer.orders} sifariş</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{formatCurrency(customer.spent)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Financial Report */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-green-900">Ümumi Gəlir</h3>
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(reports.financialReport.totalRevenue)}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-red-900">Ümumi Xərclər</h3>
                  <p className="text-3xl font-bold text-red-600">{formatCurrency(reports.financialReport.totalExpenses)}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-blue-900">Xalis Mənfəət</h3>
                  <p className="text-3xl font-bold text-blue-600">{formatCurrency(reports.financialReport.netProfit)}</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Aylıq Gəlir</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {reports.financialReport.monthlyRevenue.map((month, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{month.month}</span>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{formatCurrency(month.revenue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerReportsPage; 