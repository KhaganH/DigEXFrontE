import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { sellerService, SellerProduct } from '../../services/sellerService';

// Use SellerProduct interface from sellerService
type Product = SellerProduct;

const SellerProductsPage: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching seller products...');
      
      const response = await sellerService.getProducts();
      console.log('📦 Products response:', response);
      
      // DEBUG: isApproved değerlerini kontrol et
      if (response && response.length > 0) {
        console.log('🔍 SellerProductsPage - First product:', response[0]);
        console.log('🔍 SellerProductsPage - isApproved değerleri:', response.map(p => ({ 
          id: p.id, 
          title: p.title, 
          isApproved: p.isApproved,
          isPremium: p.isPremium,
          isActive: p.isActive
        })));
      }
      
      setProducts(response);
    } catch (err) {
      console.error('Məhsullar yüklənərkən xəta:', err);
      setError('Məhsullar yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (productId: number, currentStatus: boolean) => {
    try {
      await sellerService.toggleProductStatus(productId);
      setProducts(products.map(product => 
        product.id === productId 
          ? { ...product, isActive: !currentStatus }
          : product
      ));
    } catch (err) {
      console.error('Status dəyişdirilərkən xəta:', err);
    }
  };

  const handleDelete = async (productId: number) => {
    if (window.confirm('Bu məhsulu silmək istədiyinizə əminsiniz?')) {
      try {
        await sellerService.deleteProduct(productId);
        setProducts(products.filter(product => product.id !== productId));
      } catch (err) {
        console.error('Məhsul silinərkən xəta:', err);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('az-AZ', {
      style: 'currency',
      currency: 'AZN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('az-AZ');
  };

  const getStatusBadge = (product: Product) => {
    if (!product.isApproved) {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Gözləyir</span>;
    }
    if (!product.isActive) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Deaktiv</span>;
    }
    if (product.isPremium) {
      return <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">Premium</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Aktiv</span>;
  };

  const filteredProducts = products.filter(product => {
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && product.isActive && product.isApproved) ||
      (filter === 'pending' && !product.isApproved) ||
      (filter === 'inactive' && !product.isActive) ||
      (filter === 'premium' && product.isPremium);
    
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Xəta</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Məhsullarım</h1>
          <p className="text-gray-600 mt-1">Məhsullarınızı idarə edin və satışlarınızı artırın</p>
        </div>
        <Link
          to="/seller/products/new"
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <span className="mr-2">➕</span>
          Yeni Məhsul
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Hamısı ({products.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                filter === 'active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Aktiv ({products.filter(p => p.isActive && p.isApproved).length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                filter === 'pending' 
                  ? 'bg-yellow-100 text-yellow-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Gözləyir ({products.filter(p => !p.isApproved).length})
            </button>
            <button
              onClick={() => setFilter('premium')}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                filter === 'premium' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Premium ({products.filter(p => p.isPremium).length})
            </button>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Məhsul axtar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Product Image */}
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                <img
                  src={product.imageUrl || '/placeholder-product.jpg'}
                  alt={product.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  {getStatusBadge(product)}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 truncate">{product.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Qiymət:</span>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(product.price)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Stok:</span>
                    <span className={`text-sm font-medium ${
                      product.stock > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {product.stock} ədəd
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Satış:</span>
                    <span className="text-sm font-medium text-gray-900">{product.salesCount} ədəd</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Kateqoriya:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {product.category?.name || 'Kateqoriya yoxdur'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Tarix:</span>
                    <span className="text-sm text-gray-900">{formatDate(product.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Link
                      to={`/seller/products/edit/${product.id}`}
                      className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Düzənlə
                    </Link>
                    <button
                      onClick={() => handleStatusToggle(product.id, product.isActive)}
                      className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                        product.isActive
                          ? 'text-yellow-600 hover:text-yellow-700'
                          : 'text-green-600 hover:text-green-700'
                      }`}
                    >
                      {product.isActive ? 'Deaktiv Et' : 'Aktiv Et'}
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Məhsul tapılmadı</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filter !== 'all' 
              ? 'Axtarış kriteriyalarınıza uyğun məhsul tapılmadı'
              : 'Hələ heç bir məhsul əlavə etməmisiniz'
            }
          </p>
          <Link
            to="/seller/products/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <span className="mr-2">➕</span>
            İlk Məhsulunuzu Əlavə Edin
          </Link>
        </div>
      )}

      {/* Stats Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ümumi Statistikalar</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            <p className="text-sm text-gray-500">Ümumi Məhsul</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {products.filter(p => p.isActive && p.isApproved).length}
            </p>
            <p className="text-sm text-gray-500">Aktiv</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {products.filter(p => !p.isApproved).length}
            </p>
            <p className="text-sm text-gray-500">Gözləyir</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {products.filter(p => p.isPremium).length}
            </p>
            <p className="text-sm text-gray-500">Premium</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProductsPage; 
 