import React, { useState, useEffect } from 'react';
import { Package, User, DollarSign, Calendar, Eye, Filter, Search } from 'lucide-react';
import { getAllOrders, Order } from '../../services/adminService';

// Helper function to get user display name (same as AdminProductsPage)
const getUserDisplayName = (user: any) => {
  console.log('🔍 getUserDisplayName called with user:', user);
  
  if (!user) {
    console.log('🔍 No user object found, returning Bilinməyən');
    return 'Bilinməyən';
  }
  
  console.log('🔍 Final user object:', user);
  console.log('🔍 user type:', typeof user);
  console.log('🔍 user keys:', user ? Object.keys(user) : 'no user');
  
  // Try different possible field names from API
  if (user.name) {
    console.log('🔍 Found user.name:', user.name);
    return user.name;
  }
  if (user.firstName && user.lastName) {
    console.log('🔍 Found firstName + lastName:', user.firstName, user.lastName);
    return `${user.firstName} ${user.lastName}`;
  }
  if (user.fullName) {
    console.log('🔍 Found user.fullName:', user.fullName);
    return user.fullName;
  }
  if (user.displayName) {
    console.log('🔍 Found user.displayName:', user.displayName);
    return user.displayName;
  }
  if (user.username) {
    console.log('🔍 Found user.username:', user.username);
    return user.username;
  }
  if (user.email) {
    console.log('🔍 Found user.email:', user.email);
    return user.email;
  }
  
  console.log('🔍 Unknown user structure:', user);
  console.log('🔍 Available fields:', Object.keys(user));
  return 'Bilinməyən';
};

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const fetchedOrders = await getAllOrders();
        console.log('🔍 Fetched orders:', fetchedOrders);
        
        // Debug: İlk order'ın yapısını detaylı incele
        if (fetchedOrders && fetchedOrders.length > 0) {
          console.log('🔍 First order structure:', fetchedOrders[0]);
          console.log('🔍 First order buyer:', fetchedOrders[0].buyer);
          console.log('🔍 First order seller:', fetchedOrders[0].seller);
          console.log('🔍 First order keys:', Object.keys(fetchedOrders[0]));
          if (fetchedOrders[0].buyer) {
            console.log('🔍 Buyer keys:', Object.keys(fetchedOrders[0].buyer));
          }
          if (fetchedOrders[0].seller) {
            console.log('🔍 Seller keys:', Object.keys(fetchedOrders[0].seller));
          }
        }
        
        setOrders(fetchedOrders);
      } catch (err) {
        setError('Sifarişlər yüklənərkən xəta baş verdi');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Gözləyir';
      case 'processing':
        return 'İşlənir';
      case 'shipped':
        return 'Kargoya verildi';
      case 'delivered':
        return 'Çatdırıldı';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'Ləğv edildi';
      default:
        return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    const buyerName = getUserDisplayName(order.buyer);
    const sellerName = getUserDisplayName(order.seller);
    const productTitle = order.product?.title || (order.product as any)?.name || '';
    const orderNum = order.orderNumber || order.id?.toString() || '';
    
    const matchesSearch = 
      orderNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + ordersPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('az-AZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('az-AZ', {
      style: 'currency',
      currency: 'AZN'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Yenidən cəhd et
        </button>
      </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sifarişlər</h1>
            <p className="text-gray-600">Bütün sifarişləri görüntülə və idarə et</p>
          </div>
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">
              Ümumi {filteredOrders.length} sifariş
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Sifariş nömrəsi, alıcı, satıcı və ya məhsul axtar..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Bütün Statuslar</option>
                <option value="pending">Gözləyir</option>
                <option value="processing">İşlənir</option>
                <option value="shipped">Kargoya verildi</option>
                <option value="delivered">Çatdırıldı</option>
                <option value="completed">Tamamlandı</option>
                <option value="cancelled">Ləğv edildi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Sifariş</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Alıcı</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Satıcı</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Məhsul</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Məbləğ</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Tarix</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <Package className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">
                          #{order.orderNumber || order.id || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">
                          {getUserDisplayName(order.buyer)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">
                          {getUserDisplayName(order.seller)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-900">
                        {order.product?.title || (order.product as any)?.name || 'Bilinməyən Məhsul'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="font-medium text-gray-900">
                          {formatCurrency(order.totalAmount || 0)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">
                          {order.createdAt ? formatDate(order.createdAt) : 'Bilinməyən'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button className="text-blue-600 hover:text-blue-800 flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        Detal
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Əvvəlki
            </button>
            
            <div className="flex space-x-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    currentPage === index + 1
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sonrakı
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'Sifariş tapılmadı' : 'Hələ sifariş yoxdur'}
            </h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Axtarış kriteriyalarınızı dəyişdirərək yenidən cəhd edin'
                : 'Sifarişlər burada görüntülənəcək'
              }
            </p>
          </div>
        )}
      </div>
  );
};

export default AdminOrdersPage; 
 