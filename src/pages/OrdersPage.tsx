import React, { useState, useEffect } from 'react';
import { 
  Package, ShoppingCart, Eye, CheckCircle, Clock, Truck, XCircle, AlertTriangle, 
  User, Calendar, DollarSign, Hash
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Order, orderService } from '../services/orderService';
import Alert from '../components/Alert';

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      console.log('📦 OrdersPage: Fetching orders...');
      const userOrders = await orderService.getUserOrders();
      console.log('📦 OrdersPage: Received orders:', userOrders);
      
      // Check if result is HTML (error response)
      if (typeof userOrders === 'string' && (userOrders as string).includes('<!DOCTYPE')) {
        console.warn('⚠️ Backend returned HTML instead of orders, using fallback');
        setOrders([]);
      } else if (Array.isArray(userOrders)) {
        setOrders(userOrders);
      } else {
        console.error('❌ OrdersPage: Invalid orders response:', userOrders);
        setOrders([]);
      }
    } catch (error: any) {
      console.error('❌ OrdersPage: Error fetching orders:', error);
      setError(error.message || 'Siparişlər yüklənərkən xəta baş verdi');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelivery = async (orderId: number) => {
    if (!window.confirm('Məhsulu aldığınızı təsdiqləmək istədiyinizə əminsiniz?\n\nTəsdiqlədikdən sonra satıcıya ödəniş ediləcək.')) {
      return;
    }

    try {
      const message = await orderService.confirmDelivery(orderId);
      setAlert({ type: 'success', message });
      await fetchOrders(); // Refresh orders
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'Təsdiqləməkdə xəta baş verdi' });
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      PENDING: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: Clock, 
        text: 'Gözləyir' 
      },
      DELIVERED: { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: Truck, 
        text: 'Teslim edildi' 
      },
      COMPLETED: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircle, 
        text: 'Tamamlandı' 
      },
      CANCELLED: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: XCircle, 
        text: 'İptal edildi' 
      },
      DISPUTED: { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        icon: AlertTriangle, 
        text: 'İtiraz' 
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('az-AZ'),
      time: date.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Giriş Gerekli</h1>
          <p className="text-gray-600 mb-4">Siparişləri görüntüləmək üçün giriş yapmalısınız</p>
          <a href="/login" className="btn btn-primary">Giriş Yap</a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex space-x-2 text-sm text-gray-600">
            <li><a href="/" className="hover:text-blue-600">Ana səhifə</a></li>
            <li>/</li>
            <li className="text-gray-900">Sifarişlərim</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Package className="w-8 h-8 text-blue-600 mr-3" />
            Sifarişlərim
          </h1>
          <a 
            href="/cart" 
            className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Səbətə dön
          </a>
        </div>

        {/* Alert */}
        {alert && (
          <div className="mb-6">
            <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* No Orders */}
        {!error && orders.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Package className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-700 mb-4">Hələ sifarişiniz yoxdur</h3>
            <p className="text-gray-600 mb-8 text-lg">Alış-verişə başlamaq üçün məhsullara baxın</p>
            <a 
              href="/products" 
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Məhsullara bax
            </a>
          </div>
        )}

        {/* Orders List */}
        {orders.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-white border-b border-gray-200 p-6">
              <h2 className="text-xl font-bold flex items-center">
                <Package className="w-6 h-6 text-blue-600 mr-3" />
                Sifarişlərim ({orders.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Sipariş</th>
                    <th className="px-6 py-4 text-left font-semibold">Məhsul</th>
                    <th className="px-6 py-4 text-left font-semibold">Satıcı</th>
                    <th className="px-6 py-4 text-left font-semibold">Məbləğ</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                    <th className="px-6 py-4 text-left font-semibold">Tarix</th>
                    <th className="px-6 py-4 text-left font-semibold">Əməliyyatlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => {
                    const createdDate = formatDate(order.createdAt);
                    
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-bold">
                              {order.orderNumber}
                            </code>
                            <div className="text-sm text-gray-500 mt-1 flex items-center">
                              <Hash className="w-3 h-3 mr-1" />
                              ID: {order.id}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-6 h-6 text-gray-400" />
                                </div>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 text-sm">{order.productTitle}</h3>
                              <p className="text-sm text-gray-500">Miqdar: {order.quantity}</p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm">{order.sellerUsername}</span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div>
                            <span className="font-bold text-blue-600 text-lg">{order.totalAmount} AZN</span>
                            <div className="text-sm text-gray-500">
                              Vahid: {order.unitPrice} AZN
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          {getStatusBadge(order.status)}
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium">{createdDate.date}</div>
                            <div className="text-gray-500">{createdDate.time}</div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <a
                              href={`/order/${order.id}`}
                              className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                              title="Detaylar"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                            
                            {order.status === 'DELIVERED' && (
                              <button
                                onClick={() => handleConfirmDelivery(order.id)}
                                className="bg-green-50 text-green-600 p-2 rounded-lg hover:bg-green-100 transition-colors"
                                title="Teslim alındığını təsdiqləmək"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage; 