import React, { useState, useEffect, useContext } from 'react';
import { apiClient } from '../services/api';
import { Search, Filter, Star, Eye, ShoppingCart, User, Tag, Crown, Package, CheckCircle, XCircle, Plus as CartPlus, Loader2 } from 'lucide-react';
import { productService } from '../services/productService';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { AlertContext } from '../App';
import CloudinaryImage from '../components/CloudinaryImage';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    username: string;
    storeName: string;
  };
  isActive: boolean;
  createdAt: string;
  viewCount?: number;
  salesCount?: number;
  rating?: number;
  reviewCount?: number;
  isPremium?: boolean;
}

interface Category {
  id: number;
  name: string;
  description: string;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { showAlert } = useContext(AlertContext);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productService.getAllProducts();
      setProducts(response);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await productService.getCategories();
      setCategories(response);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const filteredProducts = (products || []).filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === '' || product.category?.id.toString() === selectedCategory;
    // Geçici olarak isActive kontrolünü kaldırıyorum - backend'deki mapping sorunu var
    return matchesSearch && matchesCategory; // && product.isActive;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'popular':
        return (b.viewCount || 0) - (a.viewCount || 0);
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const handleProductClick = (productId: number) => {
    window.location.href = `/products/${productId}`;
  };

  const handleAddToCart = async (productId: number) => {
    if (!user) {
      showAlert('warning', 'Səbətə məhsul əlavə etmək üçün daxil olmalısınız!');
      return;
    }

    // Prevent multiple concurrent requests for the same product
    if (addingToCart === productId) {
      return;
    }

    try {
      setAddingToCart(productId);
      
      await addToCart(productId, 1);
      showAlert('success', 'Məhsul səbətə əlavə edildi!');
    } catch (error: any) {
      console.error('🛒 Add to cart error:', error);
      
      // Handle specific error messages
      let errorMessage = error.message || 'Məhsul səbətə əlavə edilərkən xəta baş verdi!';
      
      if (errorMessage.includes('Öz məhsulunuzu ala bilməzsiniz')) {
        errorMessage = 'Öz məhsulunuzu satın ala bilməzsiniz!';
      } else if (errorMessage.includes('Yetkilendirme')) {
        errorMessage = 'Yetkilendirme səhvi - yenidən daxil olun!';
      }
      
      showAlert('error', errorMessage);
    } finally {
      setAddingToCart(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('az-AZ', {
      style: 'currency',
      currency: 'AZN',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-4">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Məhsullar</h1>
          <p className="text-gray-600">Rəqəmsal məhsullar kataloqu</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Məhsul axtar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div className="w-full lg:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Bütün kateqoriyalar</option>
                {(categories || []).map(category => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="w-full lg:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Yeni məhsullar</option>
                <option value="price-low">Qiymət: Aşağıdan yuxarı</option>
                <option value="price-high">Qiymət: Yuxarıdan aşağı</option>
                <option value="rating">Reytinq</option>
                <option value="popular">Populyar</option>
              </select>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filtrlər
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {(sortedProducts || []).length} məhsul tapıldı
            {searchQuery && ` "${searchQuery}" üçün`}
            {selectedCategory && ` ${(categories || []).find(c => c.id.toString() === selectedCategory)?.name} kateqoriyasında`}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {(paginatedProducts || []).map(product => (
            <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="relative">
                {product.isPremium && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold z-10">
                    <Crown className="w-3 h-3 inline mr-1" />
                    Premium
                  </div>
                )}
                <div className="h-40 overflow-hidden">
                  <CloudinaryImage
                    src={product.imageUrl || ''}
                    alt={product.title}
                    className="w-full h-full group-hover:scale-110 transition-transform duration-300"
                    size="small"
                    fallbackIcon={<Package className="w-12 h-12 text-gray-400" />}
                  />
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center md:flex hidden">
                  <a 
                    href={`/products/${product.id}`}
                    className="bg-white text-gray-800 px-3 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Bax
                  </a>
                </div>
              </div>
              
              <div className="p-4">
                <div className="text-blue-600 text-xs font-semibold mb-1">{product.category?.name || 'Digər'}</div>
                <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 text-sm">{product.title}</h3>
                <p className="text-gray-600 mb-3 line-clamp-2 text-xs">{product.description}</p>
                
                <div className="flex justify-between items-center mb-3">
                  <div className="text-lg font-bold text-blue-600">{product.price} AZN</div>
                  <div>
                    {product.stock > 0 ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                        <CheckCircle className="w-3 h-3 inline mr-1" />
                        Stokda
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                        <XCircle className="w-3 h-3 inline mr-1" />
                        Bitib
                      </span>
                    )}
                  </div>
                </div>
                
                {product.stock > 0 ? (
                  <button 
                    onClick={() => handleAddToCart(product.id)}
                    disabled={addingToCart === product.id}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    {addingToCart === product.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Əlavə edilir...
                      </>
                    ) : (
                      <>
                        <CartPlus className="w-4 h-4" />
                        Səbətə əlavə et
                      </>
                    )}
                  </button>
                ) : (
                  <a 
                    href={`/products/${product.id}`}
                    className="w-full bg-gray-200 text-gray-600 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Məhsula bax
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* No Products Found */}
        {(sortedProducts || []).length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Məhsul tapılmadı</h3>
            <p className="text-gray-600">Axtarış şərtlərini dəyişdirərək yenidən cəhd edin</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 text-gray-600 rounded disabled:opacity-50"
            >
              Əvvəlki
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 text-gray-600 rounded disabled:opacity-50"
            >
              Növbəti
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage; 