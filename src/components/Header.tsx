import React, { useState, useEffect } from 'react';
import { 
  User, Menu, X, Search, ShoppingCart, MessageCircle, Bell, 
  Wallet, Phone, Mail, Shield, Home, Grid3X3, Users, Info,
  ChevronDown, Settings, Package, BarChart3, LogOut
} from 'lucide-react';
import { userService } from '../services/userService';

interface HeaderProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  onNavigate?: (page: 'home' | 'login' | 'register' | 'cart' | 'checkout' | 'checkout-success' | 'orders') => void;
  onLogout?: () => void;
  user?: {
    id: number;
    username: string;
    email: string;
    balance: number;
    role: 'USER' | 'SELLER' | 'ADMIN';
    cartCount: number;
    notificationCount: number;
  } | null;
}

const Header: React.FC<HeaderProps> = ({ 
  isMenuOpen, 
  setIsMenuOpen, 
  user, 
  onNavigate, 
  onLogout 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      console.log('🔔 Fetching notifications temporarily disabled');
      // Temporary disable until backend API is ready
      // const userNotifications = await userService.getNotifications();
      // setNotifications(userNotifications.slice(0, 5)); // Show only latest 5
      // setNotificationCount(userNotifications.filter(n => !n.isRead).length);
      
      // Mock data for now
      setNotifications([]);
      setNotificationCount(0);
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      setNotifications([]);
      setNotificationCount(0);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleNavigation = (page: 'home' | 'login' | 'register' | 'cart' | 'checkout' | 'checkout-success' | 'orders') => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-blue-600 text-white py-2 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                <span>Dəstək: +994 12 345 67 89</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                <span>info@digex.az</span>
              </div>
            </div>
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              <span>100% Təhlükəsiz Ödənişlər</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Brand */}
            <div className="flex items-center">
              <button onClick={() => handleNavigation('home')} className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DiGex
                </span>
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <button onClick={() => handleNavigation('home')} className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors font-medium">
                <Home className="w-4 h-4" />
                <span>Ana Səhifə</span>
              </button>
              <a href="/products" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors font-medium">
                <Grid3X3 className="w-4 h-4" />
                <span>Məhsullar</span>
              </a>
              <a href="/sellers" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors font-medium">
                <Users className="w-4 h-4" />
                <span>Satıcılar</span>
              </a>
              <a href="/about" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors font-medium">
                <Info className="w-4 h-4" />
                <span>Haqqında</span>
              </a>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Məhsul axtarın..."
                  className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Right Menu */}
            <div className="flex items-center space-x-4">
              {!user ? (
                // Guest Users
                <div className="hidden md:flex items-center space-x-3">
                  <button
                    onClick={() => handleNavigation('login')}
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                  >
                    Daxil Ol
                  </button>
                  <button
                    onClick={() => handleNavigation('register')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Qeydiyyat Ol
                  </button>
                </div>
              ) : (
                // Authenticated Users
                <div className="flex items-center space-x-4">
                  {/* Balance */}
                  <a
                    href="/balance"
                    className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg hover:shadow-md transition-all"
                  >
                    <Wallet className="w-4 h-4 text-green-600" />
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Balans</span>
                      <span className="font-bold text-sm text-gray-800">
                        {user.balance.toFixed(2)} AZN
                      </span>
                    </div>
                  </a>

                  {/* Cart */}
                  <button 
                    onClick={() => handleNavigation('cart')}
                    className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    {user.cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {user.cartCount}
                      </span>
                    )}
                  </button>

                  {/* Chat */}
                  <a href="/chats" className="p-2 text-gray-700 hover:text-blue-600 transition-colors">
                    <MessageCircle className="w-6 h-6" />
                  </a>

                  {/* Notifications */}
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="p-2 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <Bell className="w-6 h-6" />
                      {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {notificationCount}
                        </span>
                      )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                        <div className="p-4 border-b border-gray-200">
                          <div className="flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Bildirişlər</h3>
                            <span className="text-sm text-gray-500">{notificationCount} yeni</span>
                          </div>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map((notification) => (
                              <div key={notification.id} className="p-4 hover:bg-gray-50 border-b border-gray-100">
                                <div className="flex items-start space-x-3">
                                  <div className={`w-2 h-2 rounded-full mt-2 ${
                                    notification.isRead ? 'bg-gray-300' : 'bg-blue-500'
                                  }`}></div>
                                  <div>
                                    <p className="font-medium text-gray-800">{notification.title}</p>
                                    <p className="text-sm text-gray-600">{notification.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {new Date(notification.createdAt).toLocaleDateString('az-AZ')}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-gray-500">
                              Bildiriş yoxdur
                            </div>
                          )}
                        </div>
                        <div className="p-3 border-t border-gray-200">
                          <a href="/notifications" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Hamısını gör →
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="hidden lg:block text-left">
                        <p className="font-medium text-gray-800 text-sm">{user.username}</p>
                        <p className="text-xs text-gray-500">Xoş gəlmisiniz</p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>

                    {/* User Dropdown */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                        {/* User Info Header */}
                        <div className="p-4 border-b border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{user.username}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Basic Options */}
                        <div className="py-2">
                          <a href="/profile" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors">
                            <User className="w-4 h-4 text-blue-600" />
                            <span>Profil</span>
                          </a>
                          <button onClick={() => handleNavigation('orders')} className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left">
                            <Package className="w-4 h-4 text-green-600" />
                            <span>Sifarişlərim</span>
                          </button>
                        </div>

                        {/* Role-based sections */}
                        {user.role === 'SELLER' && (
                          <>
                            <div className="border-t border-gray-200 py-2">
                              <div className="px-4 py-2">
                                <p className="text-xs font-bold text-gray-500 uppercase">Satıcı Paneli</p>
                              </div>
                              <a href="/seller/dashboard" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors">
                                <BarChart3 className="w-4 h-4 text-yellow-600" />
                                <span>Satıcı Paneli</span>
                              </a>
                              <a href="/seller/products" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors">
                                <Package className="w-4 h-4 text-yellow-600" />
                                <span>Məhsullarım</span>
                              </a>
                            </div>
                          </>
                        )}

                        {user.role === 'ADMIN' && (
                          <>
                            <div className="border-t border-gray-200 py-2">
                              <div className="px-4 py-2">
                                <p className="text-xs font-bold text-gray-500 uppercase">Admin Paneli</p>
                              </div>
                              <a href="/admin" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors">
                                <Shield className="w-4 h-4 text-red-600" />
                                <span>Admin Paneli</span>
                              </a>
                              <a href="/admin/users" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors">
                                <Users className="w-4 h-4 text-red-600" />
                                <span>İstifadəçi İdarəsi</span>
                              </a>
                            </div>
                          </>
                        )}

                        {/* Bottom Options */}
                        <div className="border-t border-gray-200 py-2">
                          <a href="/settings" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors">
                            <Settings className="w-4 h-4 text-gray-600" />
                            <span>Tənzimləmələr</span>
                          </a>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-red-50 transition-colors text-red-600"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Çıxış</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Məhsul axtarın..."
                    className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </form>

              {/* Mobile Menu Items */}
              <nav className="space-y-2">
                <button onClick={() => handleNavigation('home')} className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-600 w-full text-left">
                  <Home className="w-4 h-4" />
                  <span>Ana Səhifə</span>
                </button>
                <a href="/products" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-600">
                  <Grid3X3 className="w-4 h-4" />
                  <span>Məhsullar</span>
                </a>
                <a href="/sellers" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-600">
                  <Users className="w-4 h-4" />
                  <span>Satıcılar</span>
                </a>
                <a href="/about" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-600">
                  <Info className="w-4 h-4" />
                  <span>Haqqında</span>
                </a>

                {!user && (
                  <div className="pt-4 space-y-2">
                    <button onClick={() => handleNavigation('login')} className="block w-full text-center py-2 border border-blue-600 text-blue-600 rounded-lg">
                      Daxil Ol
                    </button>
                    <button onClick={() => handleNavigation('register')} className="block w-full text-center py-2 bg-blue-600 text-white rounded-lg">
                      Qeydiyyat Ol
                    </button>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Header;