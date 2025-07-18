import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';

interface ReportData {
  totalSales: number;
  totalCommissions: number;
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalWithdrawals: number;
  premiumProducts: number;
  monthlyRevenue: number;
  dailyRevenue: number;
  totalWithdrawalAmount?: number;
}

const AdminReportsPage: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get<ReportData>('/admin/api/reports/overview');
      setReportData(response);
      
      console.log('🔍 Report data loaded:', response);
      
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Hesabat məlumatları yüklənərkən xəta baş verdi');
      setReportData({
        totalSales: 0,
        totalCommissions: 0,
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalWithdrawals: 0,
        premiumProducts: 0,
        monthlyRevenue: 0,
        dailyRevenue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchReportData}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Yenidən cəhd et
        </button>
      </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Muhasebe Hesabatları</h1>
            <p className="text-gray-600">Sistemin tam maliyyə və əməliyyat hesabatları</p>
          </div>
        </div>

        {/* Stats Grid */}
        {reportData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ümumi Satış</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.totalSales ? reportData.totalSales.toLocaleString('az-AZ', { style: 'currency', currency: 'AZN' }) : '0 AZN'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">💸</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Komissiya</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.totalCommissions ? reportData.totalCommissions.toLocaleString('az-AZ', { style: 'currency', currency: 'AZN' }) : '0 AZN'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">İstifadəçilər</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.totalUsers || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Məhsullar</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.totalProducts || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <span className="text-2xl">🛍️</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sifarişlər</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.totalOrders || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <span className="text-2xl">💳</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Çıxarmalar</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.totalWithdrawals || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">⭐</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Premium Elanlar</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.premiumProducts || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aylıq Gəlir</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.monthlyRevenue ? reportData.monthlyRevenue.toLocaleString('az-AZ', { style: 'currency', currency: 'AZN' }) : '0 AZN'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder for detailed reports */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detallı Hesabatlar</h3>
          <p className="text-gray-600">
            Bu bölmədə tarix aralığına görə filtr, kullanıcı bazlı hesabatlar, 
            məhsul satış analizi və digər detallı maliyyə hesabatları əlavə ediləcək.
          </p>
        </div>
      </div>
  );
};

export default AdminReportsPage; 
 