import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Grid3X3, Package, Eye, Plus as CartPlus, Loader2, ShoppingCart, Crown, Tag, Filter, Search } from 'lucide-react';
import { categoryService } from '../services/categoryService';
import { productService, Product } from '../services/productService';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import CloudinaryImage from '../components/CloudinaryImage';

interface Category {
  id: number;
  name: string;
  description?: string;
  productCount?: number;
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    fetchCategories();
    
    // Check if there's a category ID in URL params
    const categoryId = searchParams.get('category');
    if (categoryId) {
      setSelectedCategory(parseInt(categoryId));
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedCategory) {
      fetchProductsByCategory(selectedCategory);
    } else {
      setProducts([]);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await categoryService.getCategories();
      
              // Get product counts for each category
        const categoriesWithCounts = await Promise.all(
          categoriesData.map(async (category) => {
            try {
              // Get all products and filter by category on frontend for now
              const allProducts = await productService.getAllProducts();
              const categoryProducts = allProducts.filter(p => p.category?.id === category.id);
              return {
                ...category,
                productCount: categoryProducts.length
              };
            } catch (error) {
              return { ...category, productCount: 0 };
            }
          })
        );
      
      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsByCategory = async (categoryId: number) => {
    try {
      setProductsLoading(true);
      // Get all products and filter by category on frontend for now
      const allProducts = await productService.getAllProducts();
      const categoryProducts = allProducts.filter(p => p.category?.id === categoryId);
      setProducts(categoryProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategory(categoryId);
    setSearchParams({ category: categoryId.toString() });
  };

  const handleAddToCart = async (productId: number) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setAddingToCart(productId);
    try {
      await addToCart(productId, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(null);
    }
  };

  const filteredProducts = products.filter(product =>
    searchQuery === '' || 
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Kateqoriyalar yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full font-semibold mb-4">
              <Grid3X3 className="w-4 h-4" />
              Kateqoriyalar
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Məhsul Kateqoriyaları</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Axtardığınız məhsulları asanlıqla tapmaq üçün kateqoriyalar üzrə göz atın
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Kateqoriyalar</h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchParams({});
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg font-medium transition-colors ${
                    !selectedCategory
                      ? 'bg-blue-50 text-blue-600 border-2 border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <span>Bütün Kateqoriyalar</span>
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                    {categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0)}
                  </span>
                </button>
                
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-50 text-blue-600 border-2 border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <span>{category.name}</span>
                    <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                      {category.productCount || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Content */}
          <div className="lg:col-span-3">
            {!selectedCategory ? (
              /* Categories Grid */
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Kateqoriyalar</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1 border border-gray-100"
                    >
                      <div className="h-32 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Tag className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{category.name}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">
                            {category.productCount || 0} məhsul
                          </span>
                          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                            Bax →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Selected Category Products */
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {selectedCategoryData?.name}
                    </h2>
                    <p className="text-gray-600">
                      {filteredProducts.length} məhsul tapıldı
                    </p>
                  </div>
                  
                  {/* Search */}
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Məhsul axtarın..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                {productsLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Məhsullar yüklənir...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Məhsul tapılmadı</h3>
                    <p className="text-gray-500">
                      {searchQuery ? 'Axtarış kriteriyalarınızı dəyişdirməyi cəhd edin' : 'Bu kateqoriyada hələ məhsul yoxdur'}
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group"
                      >
                        {/* Premium Badge */}
                        {product.isPremium && (
                          <div className="absolute top-2 right-2 z-10">
                            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                              <Crown className="w-3 h-3 inline mr-1" />
                              Premium
                            </div>
                          </div>
                        )}

                        {/* Product Image */}
                        <div className="relative h-40 overflow-hidden bg-gray-50">
                          <CloudinaryImage
                            src={product.imageUrl || ''}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            size="small"
                            fallbackIcon={<Package className="w-8 h-8 text-gray-400" />}
                          />
                          
                          {/* View Button */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                            <button
                              onClick={() => navigate(`/products/${product.id}`)}
                              className="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform scale-0 group-hover:scale-100 flex items-center gap-2 shadow-lg"
                            >
                              <Eye className="w-4 h-4" />
                              Bax
                            </button>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-blue-600 text-xs font-semibold bg-blue-50 px-2 py-1 rounded">
                              {product.category?.name}
                            </span>
                            <span className="text-lg font-bold text-gray-900">
                              {product.price} ₼
                            </span>
                          </div>

                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
                            {product.title}
                          </h3>

                          {/* Stock Status */}
                          <div className="flex items-center justify-center mb-3">
                            {product.stock > 0 ? (
                              <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-green-700 text-xs font-medium">Stokda</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded-full">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span className="text-red-700 text-xs font-medium">Bitib</span>
                              </div>
                            )}
                          </div>

                          {/* Add to Cart Button */}
                          {product.stock > 0 ? (
                            <button
                              onClick={() => handleAddToCart(product.id)}
                              disabled={addingToCart === product.id}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {addingToCart === product.id ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Əlavə...
                                </>
                              ) : (
                                <>
                                  <CartPlus className="w-3 h-3" />
                                  Səbətə at
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              disabled
                              className="w-full bg-gray-300 text-gray-600 py-2 rounded-lg text-xs font-semibold cursor-not-allowed"
                            >
                              Stokda yoxdur
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage; 