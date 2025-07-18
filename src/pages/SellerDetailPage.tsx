import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Package, DollarSign, ShoppingCart, Eye, Calendar, MapPin, Phone, Mail, Award, Shield, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { getSellerDetails } from '../services/sellerService';
import { productService } from '../services/productService';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { AlertContext } from '../App';
import CloudinaryImage from '../components/CloudinaryImage';

interface Seller {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  storeName?: string;
  storeDescription?: string;
  createdAt: string;
  role: string;
  isVerified?: boolean;
  rating?: number;
  totalSales?: number;
  totalProducts?: number;
}

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  category?: {
    id: number;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
  salesCount?: number;
}

const SellerDetailPage: React.FC = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { showAlert } = useContext(AlertContext);

  useEffect(() => {
    if (sellerId) {
      fetchSellerData();
    }
  }, [sellerId]);

  const fetchSellerData = async () => {
    try {
      setIsLoading(true);
      
      const [sellerData, productsData] = await Promise.all([
        getSellerDetails(parseInt(sellerId!)),
        productService.getProductsBySeller(parseInt(sellerId!))
      ]);

      setSeller(sellerData);
      setProducts(productsData);
    } catch (error) {
      console.error('Satıcı məlumatları yüklenirken hata:', error);
      showAlert('error', 'Satıcı məlumatları yüklənərkən xəta baş verdi!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (productId: number) => {
    if (!user) {
      showAlert('warning', 'Səbətə məhsul əlavə etmək üçün daxil olmalısınız!');
      return;
    }

    if (addingToCart === productId) {
      return;
    }

    try {
      setAddingToCart(productId);
      await addToCart(productId, 1);
      showAlert('success', 'Məhsul səbətə əlavə edildi!');
    } catch (error: any) {
      let errorMessage = error.message || 'Məhsul səbətə əlavə edilərkən xəta baş verdi!';
      showAlert('error', errorMessage);
    } finally {
      setAddingToCart(null);
    }
  };

  const getFilteredAndSortedProducts = () => {
    let filtered = products;

    // Kategori filtresi
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category?.id?.toString() === selectedCategory
      );
    }

    // Sıralama
    switch (sortBy) {
      case 'price_low':
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        filtered = [...filtered].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
        break;
      case 'newest':
      default:
        filtered = [...filtered].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return filtered;
  };

  const getCategories = () => {
    const categoryMap = new Map();
    products.forEach(product => {
      if (product.category) {
        categoryMap.set(product.category.id, product.category);
      }
    });
    return Array.from(categoryMap.values());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Yüklənir...</p>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Satıcı tapılmadı!</p>
          <Link to="/" className="text-blue-600 hover:underline mt-2 inline-block">
            Ana səhifəyə qayıt
          </Link>
        </div>
      </div>
    );
  }

  const filteredProducts = getFilteredAndSortedProducts();
  const categories = getCategories();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ana səhifəyə qayıt
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Seller Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
          
          <div className="relative px-6 pb-6">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* Avatar */}
              <div className="relative -mt-16">
                <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {seller.firstName?.charAt(0) || seller.username.charAt(0).toUpperCase()}
                  </div>
                </div>
                {seller.isVerified && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              {/* Seller Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {seller.storeName || seller.username}
                    </h1>
                    <p className="text-gray-600 mb-2">
                      {seller.firstName && seller.lastName 
                        ? `${seller.firstName} ${seller.lastName}`
                        : seller.username
                      }
                    </p>
                    {seller.storeDescription && (
                      <p className="text-gray-700 max-w-2xl">{seller.storeDescription}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-semibold">{seller.rating || 4.8}</span>
                    </div>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600">
                      {new Date(seller.createdAt).toLocaleDateString('az-AZ')} tarixindən üzv
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{products.length}</div>
                    <div className="text-sm text-gray-600">Məhsul</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      ₼{seller.totalSales?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-gray-600">Ümumi Satış</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {seller.rating || 4.8}
                    </div>
                    <div className="text-sm text-gray-600">Reytinq</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {seller.isVerified ? 'Təsdiqlənmiş' : 'Yeni'}
                    </div>
                    <div className="text-sm text-gray-600">Status</div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 mt-6">
                  {seller.phoneNumber && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{seller.phoneNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{seller.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Bütün kateqoriyalar</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sıralama</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Ən yeni</option>
                <option value="price_low">Qiymət (aşağıdan yuxarı)</option>
                <option value="price_high">Qiymət (yuxarıdan aşağı)</option>
                <option value="popular">Ən populyar</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Məhsullar ({filteredProducts.length})
          </h2>
          
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Bu kateqoriyada məhsul tapılmadı</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative h-48 bg-gray-100">
                    {product.imageUrl ? (
                      <CloudinaryImage 
                        src={product.imageUrl} 
                        className="w-full h-full object-cover"
                        alt={product.title}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-12 h-12" />
                      </div>
                    )}
                    {product.category && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                        {product.category.name}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xl font-bold text-blue-600">
                        ₼{product.price.toFixed(2)}
                      </div>
                      {product.salesCount && product.salesCount > 0 && (
                        <div className="text-sm text-gray-500">
                          {product.salesCount} satış
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={addingToCart === product.id}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {addingToCart === product.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ShoppingCart className="w-4 h-4" />
                      )}
                      Səbətə əlavə et
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDetailPage; 