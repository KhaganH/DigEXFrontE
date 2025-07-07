import React, { useState, useEffect } from 'react';
import { ShoppingCart, ArrowLeft, Grid3X3, Trash2, Plus, Minus, ShoppingBag, CreditCard, Shield, Zap, RotateCcw, Headphones, Award, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { CartItem, cartService } from '../services/cartService';
import Alert from '../components/Alert';

const CartPage: React.FC = () => {
  const { user } = useAuth();
  const { cartItems, cartCount, updateCartCount } = useCart();
  const [localCartItems, setLocalCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [userBalance, setUserBalance] = useState(0);
  const [canCheckout, setCanCheckout] = useState(false);
  const [hasSufficientBalance, setHasSufficientBalance] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      fetchCartData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchCartData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🛒 CartPage: Fetching cart data...');
      console.log('🛒 CartPage: Current user:', user ? { id: user.id, username: user.username } : null);
      
      const data = await cartService.getCartItems();
      console.log('🛒 CartPage: Received data:', data);
      
      // Safety checks for API response
      if (data && typeof data === 'object') {
        setLocalCartItems(Array.isArray(data.cartItems) ? data.cartItems : []);
        setCartTotal(typeof data.cartTotal === 'number' ? data.cartTotal : 0);
        setUserBalance(typeof data.userBalance === 'number' ? data.userBalance : 0);
        setCanCheckout(Boolean(data.canCheckout));
        setHasSufficientBalance(Boolean(data.hasSufficientBalance));
      } else {
        console.error('❌ CartPage: Invalid API response:', data);
        setError('Səbət məlumatları alınarkən xəta baş verdi');
        setLocalCartItems([]);
        setCartTotal(0);
        setUserBalance(0);
        setCanCheckout(false);
        setHasSufficientBalance(false);
      }
    } catch (error: any) {
      console.error('❌ CartPage: Error fetching cart:', error);
      setError(error.message || 'Səbət yüklənərkən xəta baş verdi');
      setLocalCartItems([]);
      setCartTotal(0);
      setUserBalance(0);
      setCanCheckout(false);
      setHasSufficientBalance(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      setIsLoading(true);
      await cartService.updateCartItem(cartItemId, newQuantity);
      showAlert('success', 'Miqdar yeniləndi');
      await fetchCartData();
      updateCartCount();
    } catch (error: any) {
      showAlert('error', error.message || 'Miqdar yenilənərkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    if (!window.confirm('Bu məhsulu səbətdən silmək istədiyinizə əminsiniz?')) {
      return;
    }

    try {
      setIsLoading(true);
      const result = await cartService.removeFromCart(cartItemId);
      if (result.success) {
        showAlert('success', result.message);
        await fetchCartData();
        updateCartCount();
      } else {
        showAlert('error', result.message);
      }
    } catch (error: any) {
      showAlert('error', error.message || 'Məhsul silinərkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Səbəti tamamilə təmizləmək istədiyinizə əminsiniz?')) {
      return;
    }

    try {
      setIsLoading(true);
      const result = await cartService.clearCart();
      if (result.success) {
        showAlert('success', result.message);
        await fetchCartData();
        updateCartCount();
      } else {
        showAlert('error', result.message);
      }
    } catch (error: any) {
      showAlert('error', error.message || 'Səbət təmizlənərkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (localCartItems.length === 0) {
      showAlert('error', 'Səbət boşdur');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('🛒 Starting checkout process...');
      
      const result = await cartService.proceedToCheckout();
      
      if (result.success) {
        console.log('✅ Checkout successful, navigating to success page...');
        showAlert('success', result.message || 'Sipariş uğurla verildi!');
        // Balans güncellemeleri için kısa bekle
        setTimeout(() => {
          window.location.href = '/checkout/success';
        }, 1000);
      } else {
        console.error('❌ Checkout failed:', result.message);
        showAlert('error', result.message || 'Sipariş verərkən xəta baş verdi');
      }
    } catch (error: any) {
      console.error('❌ Checkout error:', error);
      showAlert('error', error.message || 'Sipariş verərkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Giriş Gerekli</h1>
          <p className="text-gray-600 mb-4">Səbəti görüntüləmək üçün giriş yapmalısınız</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white py-12">
        <div className="container mx-auto px-4">
          <nav className="mb-6">
            <ol className="flex space-x-2 text-sm">
              <li><a href="/" className="text-white/70 hover:text-white">Ana səhifə</a></li>
              <li>/</li>
              <li className="text-white">Səbət</li>
            </ol>
          </nav>
          
          <div className="flex items-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mr-6 border border-white/20">
              <ShoppingCart className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Mənim Səbətim</h1>
              <p className="text-white/80">Seçdiyiniz məhsulları nəzərdən keçirin və sifarişi tamamlayın</p>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">
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
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Empty Cart */}
        {localCartItems.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="bg-gray-100 rounded-full p-8 inline-block mb-6">
              <ShoppingCart className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Səbətiniz boşdur</h3>
            <p className="text-gray-600 mb-8 text-lg">Alış-verişə başlamaq üçün məhsullara baxın</p>
            <div className="flex justify-center space-x-4">
              <a href="/products" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Məhsullara bax
              </a>
              <a href="/categories" className="border border-blue-600 text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center">
                <Grid3X3 className="w-5 h-5 mr-2" />
                Kateqoriyalar
              </a>
            </div>
          </div>
        )}

        {/* Cart Items */}
        {localCartItems.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-white border-b border-gray-200 p-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center">
                      <ShoppingBag className="w-6 h-6 text-blue-600 mr-3" />
                      Məhsullar ({localCartItems.length})
                    </h2>
                    <button
                      onClick={handleClearCart}
                      className="text-red-600 hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Səbəti təmizlə
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {localCartItems.map((item) => (
                    <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product.imageUrl ? (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{item.product.title}</h3>
                          <p className="text-sm text-gray-500 mb-2">
                            Satıcı: {item.product.sellerUsername}
                          </p>
                          <div className="flex items-center space-x-2">
                            {item.product.stock > 5 && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                <CheckCircle className="w-3 h-3 inline mr-1" />
                                Stokda var
                              </span>
                            )}
                            {item.product.stock <= 5 && item.product.stock > 0 && (
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                <AlertTriangle className="w-3 h-3 inline mr-1" />
                                Son {item.product.stock} ədəd
                              </span>
                            )}
                            {item.product.stock <= 0 && (
                              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                <XCircle className="w-3 h-3 inline mr-1" />
                                Stokda yoxdur
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">
                            {item.priceAtTime} AZN
                          </div>
                          {item.priceAtTime !== item.product.price && (
                            <div className="text-sm text-gray-500">
                              İndi: {item.product.price} AZN
                            </div>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Total & Remove */}
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600 mb-2">
                            {item.totalPrice} AZN
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Continue Shopping */}
              <div className="mt-6 flex space-x-4">
                <a href="/products" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Alış-verişə davam et
                </a>
                <a href="/categories" className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center">
                  <Grid3X3 className="w-5 h-5 mr-2" />
                  Kateqoriyalar
                </a>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Order Summary */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="bg-blue-600 text-white p-6">
                    <h3 className="text-xl font-bold flex items-center">
                      <CreditCard className="w-6 h-6 mr-3" />
                      Sifarişin xülasəsi
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Məhsul sayı:</span>
                        <span className="font-semibold">{localCartItems.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ümumi məbləğ:</span>
                        <span className="text-xl font-bold text-blue-600">{cartTotal} AZN</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Çatdırılma:</span>
                        <span className="text-green-600 font-semibold flex items-center">
                          <Zap className="w-4 h-4 mr-1" />
                          Ani
                        </span>
                      </div>
                    </div>

                    <hr className="my-6" />

                    {/* Balance Info */}
                    <div className="mb-6">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Balansınız:</span>
                        <span className={`text-xl font-bold ${hasSufficientBalance ? 'text-green-600' : 'text-red-600'}`}>
                          {userBalance} AZN
                        </span>
                      </div>
                      
                      {!hasSufficientBalance && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center">
                            <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                            <span className="text-sm text-yellow-800">Balansınız kifayət etmir</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={handleCheckout}
                        disabled={!canCheckout || !hasSufficientBalance || isLoading}
                        className={`w-full py-3 rounded-xl font-semibold transition-colors flex items-center justify-center ${
                          canCheckout && hasSufficientBalance && !isLoading
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <CreditCard className="w-5 h-5 mr-2" />
                        {isLoading ? 'Sipariş verilir...' :
                         canCheckout && hasSufficientBalance ? 'Siparişi Tamamla' : 
                         !canCheckout ? 'Stokda yoxdur' : 'Balans kifayət etmir'}
                      </button>
                      
                      {!hasSufficientBalance && (
                        <a href="/balance" className="w-full bg-yellow-600 text-white py-3 rounded-xl font-semibold hover:bg-yellow-700 transition-colors flex items-center justify-center">
                          <Award className="w-5 h-5 mr-2" />
                          Balans yüklə
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                  <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h4 className="font-bold mb-2">Təhlükəsiz Ödəniş</h4>
                  <p className="text-sm text-gray-600">Bütün ödənişlər 256-bit SSL şifrələmə ilə qorunur</p>
                </div>

                {/* Features */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Zap className="w-5 h-5 text-yellow-500 mr-3" />
                      <div>
                        <div className="font-semibold">Ani Çatdırılma</div>
                        <div className="text-sm text-gray-600">Rəqəmsal məhsullar dərhal çatdırılır</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <RotateCcw className="w-5 h-5 text-blue-500 mr-3" />
                      <div>
                        <div className="font-semibold">7 Gün Zəmanət</div>
                        <div className="text-sm text-gray-600">Problem olduqda geri qaytarma</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Headphones className="w-5 h-5 text-purple-500 mr-3" />
                      <div>
                        <div className="font-semibold">24/7 Dəstək</div>
                        <div className="text-sm text-gray-600">Həmişə yardım üçün hazırıq</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CartPage; 