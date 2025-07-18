import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, Menu, X, Search, ShoppingCart, MessageCircle, Bell, 
  Wallet, Phone, Mail, Shield, Home, Grid3X3, Users, Info,
  ChevronDown, Settings, Package, BarChart3, LogOut
} from 'lucide-react';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

const Header: React.FC = () => {
  const { user, logout, balance } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
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
            <div className="flex items-center space-x-3">
              <button onClick={() => navigate('/')} className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-all duration-300">
                    <div className="relative">
                      <Package className="w-7 h-7 text-white" />
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-cyan-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="flex flex-col items-start">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent tracking-wide">
                      DiGex
                    </span>
                    <span className="px-2 py-0.5 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold rounded-full shadow-sm">
                      BETA
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium -mt-0.5">
                    Digital Exchange
                  </span>
                </div>
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <button onClick={() => navigate('/')} className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors font-medium">
                <Home className="w-4 h-4" />
                <span>Ana Səhifə</span>
              </button>
              <button onClick={() => navigate('/products')} className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors font-medium">
                <Grid3X3 className="w-4 h-4" />
                <span>Məhsullar</span>
              </button>
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
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                  >
                    Daxil Ol
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Qeydiyyat Ol
                  </button>
                </div>
              ) : (
                // Authenticated Users
                <div className="flex items-center space-x-4">
                  {/* Balance */}
                  <button
                    onClick={() => navigate('/balance')}
                    className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg hover:shadow-md transition-all"
                  >
                    <Wallet className="w-4 h-4 text-green-600" />
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Balans</span>
                      <span className="font-bold text-sm text-gray-800">
                        {balance.toFixed(2)} AZN
                      </span>
                    </div>
                  </button>

                  {/* Cart */}
                  <button 
                    onClick={() => navigate('/cart')}
                    className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications */}
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <Bell className="w-6 h-6" />
                      {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {notificationCount}
                        </span>
                      )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Bildirişlər</h3>
                          {notifications.length > 0 ? (
                            <div className="space-y-3">
                              {notifications.map((notification, index) => (
                                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                    <p className="text-xs text-gray-500">{notification.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                                  </div>
                                </div>
                              ))}
                              </div>
                          ) : (
                            <p className="text-gray-500 text-center py-4">Bildiriş yoxdur</p>
                          )}
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
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="hidden md:block text-sm font-medium text-gray-700">
                        {user.username}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>

                    {/* User Dropdown */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                        <div className="py-2">
                          <button
                            onClick={() => {
                              navigate('/profile');
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <User className="w-4 h-4 mr-3" />
                            Profil
                          </button>
                          <button
                            onClick={() => {
                              navigate('/orders');
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Package className="w-4 h-4 mr-3" />
                            Sifarişlərim
                          </button>
                          <button
                            onClick={() => {
                              navigate('/chats');
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <MessageCircle className="w-4 h-4 mr-3" />
                            Söhbətlər
                          </button>
                        {user.role === 'SELLER' && (
                            <button
                              onClick={() => {
                                navigate('/seller/dashboard');
                                setShowUserMenu(false);
                              }}
                              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <BarChart3 className="w-4 h-4 mr-3" />
                              Satıcı Paneli
                            </button>
                        )}
                        {user.role === 'ADMIN' && (
                            <button
                              onClick={() => {
                                navigate('/admin/dashboard');
                                setShowUserMenu(false);
                              }}
                              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Settings className="w-4 h-4 mr-3" />
                              Admin Paneli
                            </button>
                          )}
                          <hr className="my-2" />
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            Çıxış
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
                className="lg:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4">
              <div className="space-y-4">
                  <button
                  onClick={() => {
                    navigate('/');
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span>Ana Səhifə</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/products');
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Grid3X3 className="w-4 h-4" />
                  <span>Məhsullar</span>
                </button>
                {user && (
                  <>
                    <button
                      onClick={() => {
                        navigate('/cart');
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Səbət ({cartCount})</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/orders');
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <Package className="w-4 h-4" />
                      <span>Sifarişlərim</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/balance');
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <Wallet className="w-4 h-4" />
                      <span>Balans</span>
                    </button>
                    {user.role === 'SELLER' && (
                      <button
                        onClick={() => {
                          navigate('/seller/dashboard');
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span>Satıcı Paneli</span>
                      </button>
                )}
                    {user.role === 'ADMIN' && (
                      <button
                        onClick={() => {
                          navigate('/admin/dashboard');
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Admin Paneli</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showUserMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </>
  );
};

export default Header;