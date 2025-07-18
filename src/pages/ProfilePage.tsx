import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';
import { orderService, Order } from '../services/orderService';
import { balanceService } from '../services/balanceService';
import Alert from '../components/Alert';
import CloudinaryImage from '../components/CloudinaryImage';
import { Package } from 'lucide-react';

interface User {
  id: number;
  username: string;
  email: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  balance: number;
  role: string;
  createdAt: string;
}

interface ProfileFormData {
  username: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationSettings {
  orderConfirmation: boolean;
  orderDelivery: boolean;
  newProducts: boolean;
  discounts: boolean;
}

interface ProfilePageProps {
  onNavigate?: (page: 'home' | 'products' | 'seller-request' | 'orders' | 'order-detail', id?: number) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form states
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    username: '',
    email: '',
    phoneNumber: '',
    firstName: '',
    lastName: ''
  });
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    orderConfirmation: true,
    orderDelivery: true,
    newProducts: false,
    discounts: false
  });

  useEffect(() => {
    if (authUser) {
      fetchUserProfile();
      fetchUserOrders();
    }
  }, [authUser]);

  const fetchUserProfile = async () => {
    try {
      const userData = await userService.getUserProfile(authUser!.id);
      setUser(userData);
      setProfileForm({
        username: userData.username || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || ''
      });
    } catch (err) {
      setError('Profil məlumatları yüklənərkən xəta baş verdi');
    }
  };

  const fetchUserOrders = async () => {
    try {
      const ordersData = await orderService.getUserOrders();
      setOrders(ordersData);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.updateProfile(authUser!.id, profileForm);
      setSuccess('Profil uğurla yeniləndi!');
      fetchUserProfile();
    } catch (err) {
      setError('Profil yenilənərkən xəta baş verdi');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Şifrələr uyğun gəlmir');
      return;
    }
    try {
      await userService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setSuccess('Şifrə uğurla dəyişdirildi!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError('Şifrə dəyişdirilərkən xəta baş verdi');
    }
  };

  const handleNotificationUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.updateNotificationSettings(notificationSettings);
      setSuccess('Bildiriş tənzimləmələri saxlanıldı!');
    } catch (err) {
      setError('Tənzimləmələr saxlanılarkən xəta baş verdi');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

      if (!user) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Profil tapılmadı</h2>
            <button 
              onClick={() => onNavigate && onNavigate('home')} 
              className="text-purple-600 hover:text-purple-800"
            >
              Ana səhifəyə qayıt
            </button>
          </div>
        </div>
      );
    }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-purple-800 text-white py-16 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm mb-6 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 w-fit">
            <button 
              onClick={() => onNavigate && onNavigate('home')} 
              className="text-white/80 hover:text-white transition-colors"
            >
              Ana Səhifə
            </button>
            <span className="text-white/60">/</span>
            <span className="text-white">Profil</span>
          </nav>

          {/* Profile Header */}
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-white/20 to-white/10 rounded-full border-4 border-white/20 backdrop-blur-sm flex items-center justify-center">
                <i className="fas fa-user text-4xl text-white/80"></i>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
                <h1 className="text-4xl font-bold">{user.username}</h1>
                <span className="inline-flex items-center gap-2 bg-green-500/20 text-green-100 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                  <i className="fas fa-check-circle"></i>
                  Təsdiqlənmiş
                </span>
              </div>
              
              <div className="flex flex-col lg:flex-row gap-4 text-white/80 mb-6">
                <div className="flex items-center gap-2">
                  <i className="fas fa-envelope"></i>
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-calendar"></i>
                  <span>Üzv oldu: {formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center min-w-[120px]">
                <div className="text-2xl font-bold">{orders.length}</div>
                <div className="text-sm text-white/80">Sifarişlər</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 backdrop-blur-sm rounded-lg p-4 text-center min-w-[120px]">
                <div className="text-2xl font-bold">{user.balance.toFixed(2)}</div>
                <div className="text-sm text-white/80">Balans (AZN)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alerts */}
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}
      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-cog text-purple-600"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Hesab İdarəsi</h3>
                </div>
              </div>

              <nav className="space-y-2">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Şəxsi
                </div>
                
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <i className="fas fa-user"></i>
                  <div>
                    <div className="font-medium">Profil Məlumatları</div>
                    <div className="text-xs text-gray-500">Şəxsi məlumatlarınız</div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <i className="fas fa-shopping-bag"></i>
                  <div>
                    <div className="font-medium">Sifarişlərim</div>
                    <div className="text-xs text-gray-500">Bütün sifarişləriniz</div>
                  </div>
                  {orders.length > 0 && (
                    <span className="bg-purple-100 text-purple-800 text-xs rounded-full px-2 py-1 ml-auto">
                      {orders.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('balance')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'balance'
                      ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <i className="fas fa-wallet"></i>
                  <div>
                    <div className="font-medium">Balans və Ödəniş</div>
                    <div className="text-xs text-gray-500">Maliyyə əməliyyatları</div>
                  </div>
                </button>

                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-6 mb-3">
                  Təhlükəsizlik
                </div>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'security'
                      ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <i className="fas fa-shield-alt"></i>
                  <div>
                    <div className="font-medium">Təhlükəsizlik</div>
                    <div className="text-xs text-gray-500">Şifrə və qorunma</div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'notifications'
                      ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <i className="fas fa-bell"></i>
                  <div>
                    <div className="font-medium">Bildirişlər</div>
                    <div className="text-xs text-gray-500">Bildiriş tənzimləmələri</div>
                  </div>
                </button>

                {user.role === 'USER' && (
                  <>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-6 mb-3">
                      Satış
                    </div>
                    <button
                      onClick={() => onNavigate && onNavigate('seller-request')}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <i className="fas fa-store"></i>
                      <div>
                        <div className="font-medium">Satıcı Ol</div>
                        <div className="text-xs text-gray-500">Məhsul satın və gəlir əldə et</div>
                      </div>
                      <i className="fas fa-arrow-right ml-auto"></i>
                    </button>
                  </>
                )}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-user-edit text-purple-600"></i>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Şəxsi Məlumatlar</h2>
                      <p className="text-gray-600">Hesab məlumatlarınızı idarə edin</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Əsas Məlumatlar</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <i className="fas fa-user mr-2"></i>İstifadəçi adı
                          </label>
                          <input
                            type="text"
                            value={profileForm.username}
                            onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <i className="fas fa-envelope mr-2"></i>Email ünvanı
                          </label>
                          <input
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <i className="fas fa-user mr-2"></i>Ad
                          </label>
                          <input
                            type="text"
                            value={profileForm.firstName}
                            onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <i className="fas fa-user mr-2"></i>Soyad
                          </label>
                          <input
                            type="text"
                            value={profileForm.lastName}
                            onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <i className="fas fa-phone mr-2"></i>Telefon nömrəsi
                          </label>
                          <input
                            type="tel"
                            value={profileForm.phoneNumber}
                            onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <i className="fas fa-calendar text-gray-400"></i>
                            <div>
                              <div className="text-sm font-medium text-gray-700">Üzv olma tarixi</div>
                              <div className="text-sm text-gray-600">{formatDate(user.createdAt)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Hesab Məlumatları</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <i className="fas fa-shield-check text-green-500"></i>
                            <div>
                              <div className="text-sm font-medium text-gray-700">Hesab Statusu</div>
                              <div className="text-sm text-gray-600">Təsdiqlənmiş</div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <i className="fas fa-user-tag text-purple-500"></i>
                            <div>
                              <div className="text-sm font-medium text-gray-700">Rol</div>
                              <div className="text-sm text-gray-600">{user.role}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                      >
                        <i className="fas fa-check"></i>
                        Məlumatları Yenilə
                      </button>
                      <button
                        type="button"
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                        onClick={() => setProfileForm({
                          username: user.username,
                          email: user.email,
                          phoneNumber: user.phoneNumber || '',
                          firstName: user.firstName || '',
                          lastName: user.lastName || ''
                        })}
                      >
                        <i className="fas fa-times"></i>
                        Ləğv et
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-shopping-bag text-purple-600"></i>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Sifarişlərim</h2>
                      <p className="text-gray-600">Bütün sifarişlərinizin siyahısı</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-medium text-gray-900">
                                Sifariş #{order.id}
                              </div>
                              <div className="text-sm text-gray-600">
                                {formatDateTime(order.createdAt)}
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-gray-900">{order.productTitle}</div>
                              <div className="text-sm text-gray-600">
                                Satıcı: {order.sellerUsername}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-purple-600">{order.totalAmount.toFixed(2)} AZN</div>
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => onNavigate && onNavigate('order-detail', order.id)}
                                  className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
                                >
                                  <i className="fas fa-eye"></i>
                                  Bax
                                </button>
                                {order.status === 'COMPLETED' && (
                                  <button className="text-sm text-green-600 hover:text-green-800 flex items-center gap-1">
                                    <i className="fas fa-download"></i>
                                    Yüklə
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <i className="fas fa-shopping-bag text-6xl text-gray-300 mb-4"></i>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Hələ sifariş verməmisiniz</h3>
                      <p className="text-gray-600 mb-4">Məhsulları kəşf edin və ilk sifarişinizi verin</p>
                      <Link
                        to="/products"
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Məhsullara bax
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Balance Tab */}
            {activeTab === 'balance' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-wallet text-purple-600"></i>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Balans və Ödəniş</h2>
                      <p className="text-gray-600">Maliyyə hesabınızı idarə edin</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6 mb-6">
                    <div className="flex items-center gap-4">
                      <i className="fas fa-credit-card text-3xl"></i>
                      <div>
                        <div className="text-3xl font-bold">{user.balance.toFixed(2)} AZN</div>
                        <div className="text-purple-100">Cari Balans</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Link
                      to="/balance"
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                      <i className="fas fa-plus"></i>
                      Balans əlavə et
                    </Link>
                    <Link
                      to="/transactions"
                      className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                    >
                      <i className="fas fa-list"></i>
                      Əməliyyat Tarixçəsi
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-shield-alt text-purple-600"></i>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Təhlükəsizlik</h2>
                      <p className="text-gray-600">Hesabınızı qoruyun</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Şifrə Dəyişikliyi</h3>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <i className="fas fa-lock mr-2"></i>Cari şifrə
                        </label>
                        <input
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <i className="fas fa-key mr-2"></i>Yeni şifrə
                          </label>
                          <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <i className="fas fa-key mr-2"></i>Şifrəni təkrarla
                          </label>
                          <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            required
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                      >
                        <i className="fas fa-check"></i>
                        Şifrəni Dəyiş
                      </button>
                    </form>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">İki Faktorlu Təsdiqləmə</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <i className="fas fa-times-circle text-red-500"></i>
                          <span className="text-gray-700">İki faktorlu təsdiqləmə aktiv deyil</span>
                        </div>
                        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm">
                          Aktivləşdir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-bell text-purple-600"></i>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Bildirişlər</h2>
                      <p className="text-gray-600">Bildiriş tənzimləmələrinizi seçin</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <form onSubmit={handleNotificationUpdate} className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Sifariş Bildirişləri</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Sifariş Təsdiqi</div>
                            <div className="text-sm text-gray-600">Sifarişiniz təsdiqlənəndə bildiriş al</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings.orderConfirmation}
                              onChange={(e) => setNotificationSettings({
                                ...notificationSettings,
                                orderConfirmation: e.target.checked
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Çatdırılma</div>
                            <div className="text-sm text-gray-600">Sifarişiniz tamamlananda bildiriş al</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings.orderDelivery}
                              onChange={(e) => setNotificationSettings({
                                ...notificationSettings,
                                orderDelivery: e.target.checked
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Məhsul Bildirişləri</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Yeni Məhsullar</div>
                            <div className="text-sm text-gray-600">Yeni məhsullar əlavə ediləndə bildiriş al</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings.newProducts}
                              onChange={(e) => setNotificationSettings({
                                ...notificationSettings,
                                newProducts: e.target.checked
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Endirimlər</div>
                            <div className="text-sm text-gray-600">Endirim və kampanyalar haqqında bildiriş al</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings.discounts}
                              onChange={(e) => setNotificationSettings({
                                ...notificationSettings,
                                discounts: e.target.checked
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                      <i className="fas fa-check"></i>
                      Tənzimləmələri Saxla
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage; 