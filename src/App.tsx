// React & Router
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Hooks & Utils
import { useAuth } from './hooks/useAuth';
import './utils/toast';

// Components
import Alert from './components/Alert';
import Header from './components/Header';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';
import SellerLayout from './components/SellerLayout';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CategoriesPage from './pages/CategoriesPage';
import SellersPage from './pages/SellersPage';
import SellerRequestPage from './pages/SellerRequestPage';
import SellerDetailPage from './pages/SellerDetailPage';

// User Pages
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ProfilePage from './pages/ProfilePage';
import BalancePage from './pages/BalancePage';
import BalanceLoadPage from './pages/BalanceLoadPage';
import NotificationsPage from './pages/NotificationsPage';
import TransactionsPage from './pages/TransactionsPage';
import ChatPage from './pages/ChatPage';
import ChatsPage from './pages/ChatsPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminBalanceRequestsPage from './pages/admin/AdminBalanceRequestsPage';
import AdminPaymentMethodsPage from './pages/admin/AdminPaymentMethodsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminPendingSellersPage from './pages/admin/AdminPendingSellersPage';
import AdminPendingProductsPage from './pages/admin/AdminPendingProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminWithdrawalsPage from './pages/admin/AdminWithdrawalsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

// Seller Pages
import SellerDashboardPage from './pages/seller/SellerDashboardPage';
import SellerAnalyticsPage from './pages/seller/SellerAnalyticsPage';
import SellerEarningsPage from './pages/seller/SellerEarningsPage';
import SellerCustomersPage from './pages/seller/SellerCustomersPage';
import SellerReportsPage from './pages/seller/SellerReportsPage';
import SellerSettingsPage from './pages/seller/SellerSettingsPage';
import SellerProductsPage from './pages/seller/SellerProductsPage';
import SellerAddProductPage from './pages/seller/SellerAddProductPage';
import SellerEditProductPage from './pages/seller/SellerEditProductPage';
import SellerPremiumPage from './pages/seller/SellerPremiumPage';
import SellerOrdersPage from './pages/seller/SellerOrdersPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Loading durumunda loading göster
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

  // Authentication kontrolü
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role kontrolü
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Layout with Header and Footer
const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

// Global alert context
export const AlertContext = React.createContext<{
  showAlert: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}>({
  showAlert: () => {}
});

function App() {
  const [alert, setAlert] = React.useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  } | null>(null);

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes with Header/Footer */}
            <Route path="/" element={
              <PublicLayout>
                <HomePage />
              </PublicLayout>
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/products" element={
              <PublicLayout>
                <ProductsPage />
              </PublicLayout>
            } />
            <Route path="/products/:id" element={
              <PublicLayout>
                <ProductDetailPage />
              </PublicLayout>
            } />
            <Route path="/categories" element={
              <PublicLayout>
                <CategoriesPage />
              </PublicLayout>
            } />
            <Route path="/sellers" element={
              <PublicLayout>
                <SellersPage />
              </PublicLayout>
            } />
            <Route path="/seller-request" element={
              <PublicLayout>
                <SellerRequestPage />
              </PublicLayout>
            } />
            <Route path="/seller/:sellerId" element={
              <PublicLayout>
                <SellerDetailPage />
              </PublicLayout>
            } />

            {/* User Routes with Header/Footer */}
            <Route path="/cart" element={
              <ProtectedRoute>
                <PublicLayout>
                  <CartPage />
                </PublicLayout>
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <PublicLayout>
                  <CheckoutPage />
                </PublicLayout>
              </ProtectedRoute>
            } />
            <Route path="/checkout/success" element={
              <ProtectedRoute>
                <PublicLayout>
                  <CheckoutSuccessPage />
                </PublicLayout>
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <PublicLayout>
                  <OrdersPage />
                </PublicLayout>
              </ProtectedRoute>
            } />
            <Route path="/order/:id" element={
              <ProtectedRoute>
                <PublicLayout>
                  <OrderDetailPage />
                </PublicLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <PublicLayout>
                  <ProfilePage />
                </PublicLayout>
              </ProtectedRoute>
            } />
            <Route path="/balance" element={
              <ProtectedRoute>
                <PublicLayout>
                  <BalancePage />
                </PublicLayout>
              </ProtectedRoute>
            } />
            <Route path="/balance/load" element={
              <ProtectedRoute>
                <PublicLayout>
                  <BalanceLoadPage />
                </PublicLayout>
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <PublicLayout>
                  <NotificationsPage />
                </PublicLayout>
              </ProtectedRoute>
            } />
            <Route path="/transactions" element={
              <ProtectedRoute>
                <PublicLayout>
                  <TransactionsPage />
                </PublicLayout>
              </ProtectedRoute>
            } />
            <Route path="/chats" element={
              <ProtectedRoute>
                <PublicLayout>
                  <ChatsPage onChatSelect={(chatId) => {
                    window.location.href = `/chat/${chatId}`;
                  }} />
                </PublicLayout>
              </ProtectedRoute>
            } />
            <Route path="/chat/:chatId" element={
              <ProtectedRoute>
                <PublicLayout>
                  <ChatPage />
                </PublicLayout>
              </ProtectedRoute>
            } />

            {/* Admin Routes - No Header/Footer */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="balance-requests" element={<AdminBalanceRequestsPage />} />
              <Route path="payment-methods" element={<AdminPaymentMethodsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="users/pending-sellers" element={<AdminPendingSellersPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="products/pending" element={<AdminPendingProductsPage />} />
              <Route path="withdrawals" element={<AdminWithdrawalsPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
            </Route>

            {/* Seller Routes - No Header/Footer */}
            <Route path="/seller" element={
              <ProtectedRoute allowedRoles={['SELLER']}>
                <SellerLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/seller/dashboard" replace />} />
              <Route path="dashboard" element={<SellerDashboardPage />} />
              <Route path="analytics" element={<SellerAnalyticsPage />} />
              <Route path="earnings" element={<SellerEarningsPage />} />
              <Route path="customers" element={<SellerCustomersPage />} />
              <Route path="reports" element={<SellerReportsPage />} />
              <Route path="settings" element={<SellerSettingsPage />} />
              <Route path="products" element={<SellerProductsPage />} />
              <Route path="products/new" element={<SellerAddProductPage />} />
              <Route path="premium" element={<SellerPremiumPage />} />
              <Route path="products/edit/:productId" element={<SellerEditProductPage />} />
              <Route path="orders" element={<SellerOrdersPage />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Global Alert */}
          {alert && (
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          )}
        </div>
      </Router>
    </AlertContext.Provider>
  );
}

export default App;