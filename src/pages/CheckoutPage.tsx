import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Shield, Lock, Wallet, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { CheckoutData, checkoutService } from '../services/checkoutService';
import Alert from '../components/Alert';

const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      fetchCheckoutData();
    }
  }, [user]);

  const fetchCheckoutData = async () => {
    try {
      setIsLoading(true);
      const data = await checkoutService.getCheckoutData();
      setCheckoutData(data);
    } catch (error: any) {
      setError(error.message || 'Checkout verileri yüklənərkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!checkoutData?.canCheckout || !checkoutData?.hasSufficientBalance) {
      return;
    }

    try {
      setIsProcessing(true);
      const orders = await checkoutService.processCheckout();
      
      // Redirect to success page
      window.location.href = '/checkout/success';
    } catch (error: any) {
      setAlert({
        type: 'error',
        message: error.message || 'Checkout zamanı xəta baş verdi'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Giriş Gerekli</h1>
          <p className="text-gray-600 mb-4">Checkout yapmak üçün giriş yapmalısınız</p>
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Xəta</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <a href="/cart" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Səbətə Qayıt
          </a>
        </div>
      </div>
    );
  }

  if (!checkoutData || checkoutData.cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Səbətiniz Boşdur</h1>
          <p className="text-gray-600 mb-4">Checkout yapmaq üçün səbətinizə məhsul əlavə edin</p>
          <a href="/products" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Məhsullara Bax
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Alert */}
        {alert && (
          <div className="mb-6">
            <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
              <div className="bg-white border-b border-gray-200 p-6">
                <h2 className="text-xl font-bold flex items-center">
                  <ShoppingCart className="w-6 h-6 text-blue-600 mr-3" />
                  Sifarişinizi Təsdiqləyin
                </h2>
              </div>

              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 font-semibold">Məhsul</th>
                        <th className="text-center py-3 font-semibold">Miqdar</th>
                        <th className="text-right py-3 font-semibold">Qiymət</th>
                        <th className="text-right py-3 font-semibold">Cəmi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {checkoutData.cartItems.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="py-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {item.product.imageUrl ? (
                                  <img
                                    src={item.product.imageUrl}
                                    alt={item.product.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingCart className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{item.product.title}</h3>
                                <p className="text-sm text-gray-500">{item.product.category.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-4 font-semibold">{item.quantity}</td>
                          <td className="text-right py-4">{item.priceAtTime} AZN</td>
                          <td className="text-right py-4 font-semibold text-blue-600">{item.totalPrice} AZN</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Şərtlər və Qaydalar</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Sifarişiniz təsdiqləndiyi anda hesabınızdan ödəniş tutulacaq
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Rəqəmsal məhsullar ani çatdırılır və geri qaytarılmır
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Problemlər üçün 24/7 dəstək xidmətimizlə əlaqə saxlaya bilərsiniz
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Bütün əməliyyatlar şifrələnir və təhlükəsizdir
                </li>
              </ul>
            </div>
          </div>

          {/* Order Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-8">
              <div className="bg-white border-b border-gray-200 p-6">
                <h3 className="text-lg font-semibold">Sifariş Məlumatları</h3>
              </div>

              <div className="p-6">
                {/* Balance Info */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Balansınız:</span>
                  <span className={`font-bold text-lg ${checkoutData.hasSufficientBalance ? 'text-green-600' : 'text-red-600'}`}>
                    {checkoutData.userBalance} AZN
                  </span>
                </div>

                <hr className="my-4" />

                {/* Order Summary */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Məhsullar:</span>
                    <span>{checkoutData.cartTotal} AZN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Endirim:</span>
                    <span className="text-green-600">-0.00 AZN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Komissiya:</span>
                    <span>0.00 AZN</span>
                  </div>
                </div>

                <hr className="my-4" />

                {/* Total */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-bold">Cəmi:</span>
                  <span className="text-xl font-bold text-blue-600">{checkoutData.cartTotal} AZN</span>
                </div>

                {/* Insufficient Balance Warning */}
                {!checkoutData.hasSufficientBalance && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                      <span className="text-sm text-yellow-800">Balansınız kifayət etmir</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleCheckout}
                    disabled={!checkoutData.canCheckout || !checkoutData.hasSufficientBalance || isProcessing}
                    className={`w-full py-3 rounded-xl font-semibold transition-colors flex items-center justify-center ${
                      checkoutData.canCheckout && checkoutData.hasSufficientBalance && !isProcessing
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        İşlənir...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 mr-2" />
                        Təsdiq və Ödə
                      </>
                    )}
                  </button>

                  <a 
                    href="/cart" 
                    className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Səbətə Qayıt
                  </a>

                  {!checkoutData.hasSufficientBalance && (
                    <a 
                      href="/balance" 
                      className="w-full bg-yellow-600 text-white py-3 rounded-xl font-semibold hover:bg-yellow-700 transition-colors flex items-center justify-center"
                    >
                      <Wallet className="w-5 h-5 mr-2" />
                      Balans Yüklə
                    </a>
                  )}
                </div>

                {/* Security Badge */}
                <div className="text-center mt-6">
                  <div className="flex items-center justify-center text-gray-500">
                    <Shield className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm">Təhlükəsiz ödəniş sistemi</span>
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

export default CheckoutPage; 