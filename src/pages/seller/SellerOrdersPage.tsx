import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { sellerService, SellerOrder } from '../../services/sellerService';
import { useNavigate } from 'react-router-dom';
import CloudinaryImage from '../../components/CloudinaryImage';
import { Package } from 'lucide-react';

const SellerOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<SellerOrder | null>(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState({
    message: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching seller orders...');
      
      const response = await sellerService.getOrders();
      console.log('📦 Orders response:', response);
      setOrders(response);
    } catch (err) {
      console.error('Sifarişlər yüklənərkən xəta:', err);
      setError('Sifarişlər yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      await sellerService.updateOrderStatus(orderId, newStatus);
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      ));
      setSelectedOrder(null);
    } catch (err) {
      console.error('Status yenilənərkən xəta:', err);
    }
  };

  const handleDeliverySubmit = async (orderId: number) => {
    try {
      if (!deliveryForm.message.trim()) {
        alert('Teslimat məlumatları yazmanız lazımdır');
        return;
      }

      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      // Use the correct delivery endpoint
      await sellerService.deliverManualOrder(orderId, deliveryForm.message);

      // Update local state to DELIVERED status
      const updatedOrder = {
        ...order,
        status: 'DELIVERED',
        deliveryInfo: deliveryForm.message,
        updatedAt: new Date().toISOString()
      };
      
      setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
      
      // Close all modals and reset form
      setShowDeliveryModal(false);
      setSelectedOrder(null);
      setDeliveryForm({ message: '' });
      
      alert('Məhsul uğurla təslim edildi!');
    } catch (err) {
      console.error('Teslimat xətası:', err);
      alert('Teslimat zamanı xəta baş verdi: ' + (err as any).message);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('az-AZ', {
      style: 'currency',
      currency: 'AZN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'SHIPPED': return 'bg-blue-100 text-blue-800';
      case 'DELIVERED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Tamamlandı';
      case 'PENDING': return 'Gözləyir';
      case 'CANCELLED': return 'Ləğv edildi';
      case 'SHIPPED': return 'Göndərildi';
      case 'DELIVERED': return 'Teslim Edildi';
      default: return status;
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'PENDING': return 'COMPLETED';
      case 'SHIPPED': return 'COMPLETED';
      default: return null;
    }
  };

  const getDeliveryTypeText = (deliveryType?: string) => {
    switch (deliveryType) {
      case 'manual': return 'Manuel';
      case 'stock': return 'Avtomatik';
      default: return 'Bilinmir';
    }
  };

  const getDeliveryTypeColor = (deliveryType?: string) => {
    switch (deliveryType) {
      case 'manual': return 'bg-blue-100 text-blue-800';
      case 'stock': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    shipped: orders.filter(o => o.status === 'SHIPPED').length,
    completed: orders.filter(o => o.status === 'COMPLETED').length,
    cancelled: orders.filter(o => o.status === 'CANCELLED').length,
    totalRevenue: orders
      .filter(o => o.status === 'COMPLETED')
      .reduce((sum, o) => sum + o.totalAmount, 0)
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
          <h1 className="text-2xl font-bold text-gray-900">Sifarişlər</h1>
          <p className="text-gray-600 mt-1">Müştəri sifarişlərini idarə edin</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-500">Ümumi</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-sm text-gray-500">Gözləyir</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.shipped}</p>
          <p className="text-sm text-gray-500">Göndərildi</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-sm text-gray-500">Tamamlandı</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
          <p className="text-sm text-gray-500">Ləğv</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-lg font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
          <p className="text-sm text-gray-500">Ümumi Gəlir</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Hamısı
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                filter === 'PENDING' 
                  ? 'bg-yellow-100 text-yellow-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Gözləyir
            </button>
            <button
              onClick={() => setFilter('SHIPPED')}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                filter === 'SHIPPED' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Göndərildi
            </button>
            <button
              onClick={() => setFilter('COMPLETED')}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                filter === 'COMPLETED' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tamamlandı
            </button>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Sifariş axtar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sifariş
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Məhsul
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Müştəri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Məbləğ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teslimat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Əməliyyatlar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{order.orderNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg overflow-hidden mr-3">
                          <CloudinaryImage
                            src={order.productImage || ''}
                            alt={order.productName}
                            className="w-full h-full object-cover"
                            size="small"
                            fallbackIcon={<Package className="w-6 h-6 text-gray-400" />}
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.productName}</div>
                          <div className="text-sm text-gray-500">{order.quantity} ədəd</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.customerEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(order.totalAmount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDeliveryTypeColor(order.deliveryType)}`}>
                        {getDeliveryTypeText(order.deliveryType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/order/${order.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Detallar
                        </button>
                        {order.status === 'PENDING' && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDeliveryModal(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            Teslim Et
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sifariş tapılmadı</h3>
          <p className="text-gray-500">
            {searchTerm || filter !== 'all' 
              ? 'Axtarış kriteriyalarınıza uyğun sifariş tapılmadı'
              : 'Hələ heç bir sifariş yoxdur'
            }
          </p>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && !showDeliveryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Sifariş Detalları #{selectedOrder.orderNumber}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Məhsul</h4>
                  <p className="text-gray-600">{selectedOrder.productName}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Məbləğ</h4>
                  <p className="text-gray-600">{formatCurrency(selectedOrder.totalAmount)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Müştəri</h4>
                  <p className="text-gray-600">{selectedOrder.customerName}</p>
                  <p className="text-gray-500 text-sm">{selectedOrder.customerEmail}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Status</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Teslimat Türü</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDeliveryTypeColor(selectedOrder.deliveryType)}`}>
                    {getDeliveryTypeText(selectedOrder.deliveryType)}
                  </span>
                </div>
              </div>
              
              {selectedOrder.stockCode && (
                <div>
                  <h4 className="font-medium text-gray-900">Stok Kodu</h4>
                  <p className="text-gray-600 font-mono bg-gray-100 p-2 rounded">{selectedOrder.stockCode}</p>
                </div>
              )}
              
              {selectedOrder.stockData && (
                <div>
                  <h4 className="font-medium text-gray-900">Stok Məlumatları</h4>
                  <p className="text-gray-600 font-mono bg-gray-100 p-2 rounded">{selectedOrder.stockData}</p>
                </div>
              )}
              
              {selectedOrder.manualInstructions && (
                <div>
                  <h4 className="font-medium text-gray-900">Manuel Təlimatlar</h4>
                  <p className="text-gray-600 bg-blue-50 p-2 rounded">{selectedOrder.manualInstructions}</p>
                </div>
              )}
              
              {selectedOrder.trackingNumber && (
                <div>
                  <h4 className="font-medium text-gray-900">Tracking Nömrəsi</h4>
                  <p className="text-gray-600">{selectedOrder.trackingNumber}</p>
                </div>
              )}
              
              {selectedOrder.deliveryMethod && (
                <div>
                  <h4 className="font-medium text-gray-900">Çatdırılma Üsulu</h4>
                  <p className="text-gray-600">{selectedOrder.deliveryMethod}</p>
                </div>
              )}
              
              {selectedOrder.shippingAddress && (
                <div>
                  <h4 className="font-medium text-gray-900">Çatdırılma Ünvanı</h4>
                  <p className="text-gray-600">{selectedOrder.shippingAddress}</p>
                </div>
              )}
              
              {selectedOrder.notes && (
                <div>
                  <h4 className="font-medium text-gray-900">Qeydlər</h4>
                  <p className="text-gray-600">{selectedOrder.notes}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Yaradılma Tarixi</h4>
                  <p className="text-gray-600">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Son Yeniləmə</h4>
                  <p className="text-gray-600">{selectedOrder.updatedAt ? formatDate(selectedOrder.updatedAt) : 'Yenilənməyib'}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Bağla
              </button>
              {selectedOrder.status === 'PENDING' && (
                <button
                  onClick={() => {
                    setShowDeliveryModal(true);
                    // Don't close selected order modal here
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Teslim Et
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delivery Modal */}
      {showDeliveryModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Sifarişi Teslim Et #{selectedOrder.orderNumber}
              </h3>
              <button
                onClick={() => {
                  setShowDeliveryModal(false);
                  setDeliveryForm({ message: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Teslimat Məlumatları</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Müştəriyə təslim etmə məlumatlarını yazın
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teslimat Məlumatları
                </label>
                <textarea
                  value={deliveryForm.message}
                  onChange={(e) => setDeliveryForm({ message: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Stok kodları, hesab məlumatları və ya əlavə təlimatlar yazın..."
                  required
                />
                <small className="text-gray-500 mt-1">
                  Bu məlumat müştəriyə göstəriləcək və chat olaraq göndəriləcək
                </small>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeliveryModal(false);
                  setDeliveryForm({ message: '' });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Ləğv Et
              </button>
              <button
                onClick={() => handleDeliverySubmit(selectedOrder.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                disabled={!deliveryForm.message.trim()}
              >
                Teslim Et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrdersPage; 