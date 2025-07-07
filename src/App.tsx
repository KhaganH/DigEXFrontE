import React, { useState } from 'react';
import { Chrome, Facebook } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginForm from './components/LoginForm';
import SocialLoginButton from './components/SocialLoginButton';
import Alert from './components/Alert';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import OrdersPage from './pages/OrdersPage';
import { useAuth } from './hooks/useAuth';
import { useCart } from './hooks/useCart';

// Global alert context for all pages
export const AlertContext = React.createContext<{
  showAlert: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}>({
  showAlert: () => {}
});

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'register' | 'cart' | 'checkout' | 'checkout-success' | 'orders'>(() => {
    // Read current page from URL
    const path = window.location.pathname;
    if (path === '/cart') return 'cart';
    if (path === '/checkout') return 'checkout';
    if (path === '/checkout/success') return 'checkout-success';
    if (path === '/orders') return 'orders';
    if (path === '/login') return 'login';
    if (path === '/register') return 'register';
    return 'home';
  });
  
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  } | null>(null);

  const { user, isAuthenticated, login, logout } = useAuth();
  const { cartCount } = useCart();

  // Global alert function
  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000); // 5 saniye sonra otomatik kapat
  };

  // URL handling
  React.useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/cart') setCurrentPage('cart');
      else if (path === '/checkout') setCurrentPage('checkout');
      else if (path === '/checkout/success') setCurrentPage('checkout-success');
      else if (path === '/orders') setCurrentPage('orders');
      else if (path === '/login') setCurrentPage('login');
      else if (path === '/register') setCurrentPage('register');
      else setCurrentPage('home');
    };

    const handleNavigate = (event: CustomEvent) => {
      const { page } = event.detail;
      setCurrentPage(page);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('navigate', handleNavigate as EventListener);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('navigate', handleNavigate as EventListener);
    };
  }, []);

  const handleNavigation = (page: 'home' | 'login' | 'register' | 'cart' | 'checkout' | 'checkout-success' | 'orders') => {
    setCurrentPage(page);
    // Update URL
    const urls = {
      home: '/',
      login: '/login', 
      register: '/register',
      cart: '/cart',
      checkout: '/checkout',
      'checkout-success': '/checkout/success',
      orders: '/orders'
    };
    window.history.pushState({}, '', urls[page]);
  };

  const handleLogin = async (username: string, password: string, rememberMe: boolean) => {
    try {
      await login(username, password);
      showAlert('success', 'Başarıyla giriş yaptınız!');
      handleNavigation('home');
    } catch (error: any) {
      showAlert('error', error.message || 'Giriş yapılırken hata oluştu!');
    }
  };

  const handleSocialLogin = (provider: string) => {
    // Redirect to OAuth endpoint
    window.location.href = `http://localhost:1111/oauth2/authorization/${provider.toLowerCase()}`;
  };

  const handleLogout = async () => {
    try {
      await logout();
      showAlert('success', 'Başarıyla çıkış yaptınız!');
      handleNavigation('home');
    } catch (error: any) {
      showAlert('error', 'Çıkış yapılırken hata oluştu!');
    }
  };

  // Simple routing based on current page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'register':
        return <RegisterPage onNavigate={handleNavigation} />;
      case 'cart':
        return <CartPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'checkout-success':
        return <CheckoutSuccessPage />;
      case 'orders':
        return <OrdersPage />;
      case 'login':
        return (
          <div className="flex-1 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Hesabınıza Giriş Yapın</h1>
                    <p className="text-blue-100 mt-2">Devam etmek için giriş yapın</p>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-8">
                  {/* Social Login Options */}
                  <div className="space-y-3 mb-8">
                    <SocialLoginButton
                      provider="Google"
                      icon={Chrome}
                      className="border-gray-300 hover:border-red-500 hover:bg-red-50 text-gray-700"
                      onClick={() => handleSocialLogin('Google')}
                    />
                    <SocialLoginButton
                      provider="Facebook"
                      icon={Facebook}
                      className="border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700"
                      onClick={() => handleSocialLogin('Facebook')}
                    />
                  </div>

                  {/* Divider */}
                  <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">veya</span>
                    </div>
                  </div>

                  {/* Login Form */}
                  <LoginForm onSubmit={handleLogin} />

                  {/* Register Link */}
                  <div className="mt-8 text-center">
                    <p className="text-gray-600">
                      Hesabınız yok mu?{' '}
                      <button 
                        onClick={() => handleNavigation('register')}
                        className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
                      >
                        Kayıt Olun
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <HomePage />;
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header 
          isMenuOpen={isMenuOpen} 
          setIsMenuOpen={setIsMenuOpen} 
          user={user ? {
            ...user,
            cartCount: cartCount,
            notificationCount: 0 // Will be fetched from API
          } : null}
          onNavigate={handleNavigation}
          onLogout={handleLogout}
        />
        
        {/* Global Alert Section - Sayfanın üst kısmında sabit pozisyonda */}
        {alert && (
          <div className="fixed top-20 right-4 z-50 max-w-md">
            <Alert 
              type={alert.type} 
              message={alert.message} 
              onClose={() => setAlert(null)} 
            />
          </div>
        )}

        <main className="flex-1">
          {renderCurrentPage()}
        </main>

        <Footer />
      </div>
    </AlertContext.Provider>
  );
}

export default App;