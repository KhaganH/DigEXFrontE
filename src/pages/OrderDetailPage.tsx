import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Package, User, Calendar, DollarSign, MessageCircle, 
  CheckCircle, Clock, Truck, XCircle, AlertTriangle, ShoppingBag,
  FileText, CreditCard
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Order, orderService } from '../services/orderService';
import Alert from '../components/Alert';
import CloudinaryImage from '../components/CloudinaryImage';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orderId = parseInt(id || '0');
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      const orderData = await orderService.getOrderById(orderId);
      // Debug logs - can be removed later
      console.log('🔍 Order Details Data:', orderData);
      console.log('🚚 Delivery Content:', orderData.deliveredContent);
      console.log('📁 Delivery File URL:', orderData.deliveredFileUrl);
      console.log('📝 Order Notes:', orderData.orderNotes);
      console.log('📊 Order Status:', orderData.status);
      setOrder(orderData);
    } catch (error: any) {
      setError(error.message || 'Sipariş məlumatları yüklənərkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!window.confirm('Məhsulu aldığınızı təsdiqləmək istədiyinizə əminsiniz?\n\nTəsdiqlədikdən sonra satıcıya ödəniş ediləcək.')) {
      return;
    }

    try {
      setIsConfirming(true);
      const message = await orderService.confirmDelivery(orderId);
      setAlert({ type: 'success', message });
      await fetchOrderDetails(); // Refresh order data
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'Təsdiqləməkdə xəta baş verdi' });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleChat = () => {
    window.history.pushState({}, '', `/chat/order/${orderId}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
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

    const config = statusConfig[status] || {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: Clock,
      text: status || 'Bilinməyən'
    };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        <Icon className="w-4 h-4 mr-2" />
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Giriş Gerekli</h1>
          <p className="text-gray-600 mb-4">Sipariş məlumatlarını görüntüləmək üçün giriş yapmalısınız</p>
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

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Xəta</h1>
          <p className="text-gray-600 mb-4">{error || 'Sipariş tapılmadı'}</p>
          <button 
            onClick={() => navigate('/orders')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Geri dön
          </button>
        </div>
      </div>
    );
  }

  const isBuyer = order.buyerId === user.id;
  const isSeller = order.sellerId === user.id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Siparişlərə qayıt
        </button>

        {/* Alert */}
        {alert && (
          <div className="mb-6">
            <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2">
            {/* Order Info Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
              <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center">
                  <ShoppingBag className="w-6 h-6 text-blue-600 mr-3" />
                  Sipariş Məlumatları
                </h2>
                {getStatusBadge(order.status)}
              </div>

              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Order Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <FileText className="w-5 h-5 text-gray-600 mr-2" />
                      Sipariş Məlumatları
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sipariş Nömrəsi:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-bold">
                          {order.orderNumber}
                        </code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sipariş Tarixi:</span>
                        <span className="font-medium">{formatDate(order.createdAt)}</span>
                      </div>
                      {order.deliveredAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Teslim Tarixi:</span>
                          <span className="font-medium">{formatDate(order.deliveredAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <CreditCard className="w-5 h-5 text-gray-600 mr-2" />
                      Ödəmə Məlumatları
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Məhsul Qiyməti:</span>
                        <span className="font-bold text-blue-600">{order.totalAmount} AZN</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Platform Komisyonu:</span>
                        <span className="font-medium">{order.commissionAmount} AZN</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Satıcıya Verilən:</span>
                        <span className="font-bold text-green-600">{order.sellerAmount} AZN</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Info Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
              <div className="bg-white border-b border-gray-200 p-6">
                <h3 className="text-lg font-semibold flex items-center">
                  <Package className="w-5 h-5 text-blue-600 mr-2" />
                  Məhsul Məlumatları
                </h3>
              </div>

              <div className="p-6">
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <CloudinaryImage
                      src={order.productImageUrl || ''}
                      alt={order.productTitle}
                      className="w-full h-full object-cover"
                      size="small"
                      fallbackIcon={<Package className="w-8 h-8 text-gray-400" />}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{order.productTitle}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Miqdar:</span>
                        <span className="ml-2 font-semibold">{order.quantity}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Vahid Qiyməti:</span>
                        <span className="ml-2 font-semibold">{order.unitPrice} AZN</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            {(order.deliveredContent || order.status === 'DELIVERED' || order.status === 'COMPLETED') && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-white border-b border-gray-200 p-6">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Truck className="w-5 h-5 text-blue-600 mr-2" />
                    Təslim Məlumatları
                  </h3>
                </div>
                <div className="p-6">
                  {order.deliveredContent ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800">{order.deliveredContent}</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-600">
                        {order.status === 'DELIVERED' ? 
                          'Məhsul teslim edildi. Təslim məlumatları əlavə edilməyib.' :
                          order.status === 'COMPLETED' ?
                          'Sipariş tamamlandı.' :
                          'Təslim məlumatları hələ əlavə edilməyib.'
                        }
                      </p>
                    </div>
                  )}
                  
                  {/* Delivery file if exists */}
                  {order.deliveredFileUrl && (
                    <div className="mt-4">
                      <a 
                        href={order.deliveredFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Təslim Faylını Yüklə
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Notes */}
            {order.orderNotes && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-white border-b border-gray-200 p-6">
                  <h3 className="text-lg font-semibold flex items-center">
                    <FileText className="w-5 h-5 text-blue-600 mr-2" />
                    Sipariş Qeydləri
                  </h3>
                </div>
                <div className="p-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">{order.orderNotes}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Actions Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
              <div className="bg-white border-b border-gray-200 p-6">
                <h3 className="text-lg font-semibold">Əməliyyatlar</h3>
              </div>
              <div className="p-6 space-y-4">
                {/* Chat Button */}
                <button
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  onClick={handleChat}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {isBuyer ? 'Satıcı ilə Söhbət' : 'Alıcı ilə Söhbət'}
                </button>

                {/* Buyer Actions */}
                {isBuyer && order.status === 'DELIVERED' && (
                  <div>
                    <button
                      onClick={handleConfirmDelivery}
                      disabled={isConfirming}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isConfirming ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <CheckCircle className="w-5 h-5 mr-2" />
                      )}
                      Təslimatı Təsdiqlə
                    </button>
                    <p className="text-sm text-gray-600 mt-2">
                      Məhsulu aldığınızı təsdiqləyin və satıcıya ödəniş edilsin
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Users Info Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-white border-b border-gray-200 p-6">
                <h3 className="text-lg font-semibold flex items-center">
                  <User className="w-5 h-5 text-blue-600 mr-2" />
                  Tərəflər
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Alıcı</h4>
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="font-medium">{order.buyerUsername}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Satıcı</h4>
                    <div className="flex items-center">
                      <ShoppingBag className="w-5 h-5 text-green-600 mr-2" />
                      <div>
                        <span className="font-medium block">{order.sellerUsername}</span>
                        {order.sellerStoreName && (
                          <span className="text-sm text-gray-500">{order.sellerStoreName}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage; 
 
 
 
 