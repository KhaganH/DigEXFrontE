import React, { useState, useEffect, useContext } from 'react';
import { Search, ShoppingCart, Crown, Grid3X3, Eye, Plus as CartPlus, CloudLightning as Lightning, Shield, Headphones, Award, Star, Package, TowerControl as Controller, Film, Code, CheckCircle, XCircle, ArrowRight, UserPlus, Shovel as Shop, Loader2 } from 'lucide-react';
import { productService, Product, Category, Seller } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { sellerService } from '../services/sellerService';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { AlertContext } from '../App';

const HomePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [premiumProducts, setPremiumProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { showAlert } = useContext(AlertContext);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(allProducts);
    } else {
      setFilteredProducts(
        allProducts.filter(product => 
          product.category?.id?.toString() === selectedCategory
        )
      );
    }
  }, [selectedCategory, allProducts]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all data in parallel
      const [
        premiumResponse,
        allProductsResponse,
        categoriesResponse,
        sellersResponse
      ] = await Promise.all([
        productService.getPremiumProducts(),
        productService.getProducts({ size: 20 }),
        categoryService.getCategories(),
        sellerService.getSellers()
      ]);

      setPremiumProducts(premiumResponse);
      setAllProducts(allProductsResponse.content);
      setFilteredProducts(allProductsResponse.content);
      setCategories(categoriesResponse.filter(cat => cat.isActive));
      setSellers(sellersResponse.filter(seller => seller.isVerified).slice(0, 4));
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
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
      
      // Debug: Check auth state before making the request
      console.log('🛒 Adding to cart - Auth state:', {
        user: user ? { id: user.id, username: user.username } : null,
        isAuthenticated
      });
      
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

  const scrollToProducts = () => {
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="hero-section relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='%23ffffff' fill-opacity='0.05'%3e%3cpath d='m40 40c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm-40 0c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20z'/%3e%3c/g%3e%3c/svg%3e")`
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh] py-20">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-8">
                <Lightning className="w-4 h-4" />
                <span className="text-sm font-semibold">Azərbaycanın #1 Rəqəmsal Bazarı</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Rəqəmsal Məhsulların
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  Ən Böyük Bazarı
                </span>
              </h1>
              
              <p className="text-xl opacity-90 mb-8 leading-relaxed">
                İstənilən rəqəmsal məhsulu DiGex-də tapın! Oyunlardan proqram təminatına qədər hər şey burada.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-12">
                <button 
                  onClick={scrollToProducts}
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center gap-2 hover:scale-105"
                >
                  <Search className="w-5 h-5" />
                  Məhsulları Kəşf Et
                </button>
                <a 
                  href="/sellers" 
                  className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center gap-2"
                >
                  <Shop className="w-5 h-5" />
                  Satıcılar
                </a>
              </div>
              
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300 mb-2">{allProducts.length}+</div>
                  <div className="text-sm opacity-80">Məhsul</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300 mb-2">{sellers.length}+</div>
                  <div className="text-sm opacity-80">Satıcı</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300 mb-2">24/7</div>
                  <div className="text-sm opacity-80">Dəstək</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative h-96 flex items-center justify-center">
                {/* Floating Cards */}
                <div className="absolute top-8 left-8 bg-white rounded-xl p-4 shadow-xl flex items-center gap-3 animate-float">
                  <Controller className="w-6 h-6 text-blue-600" />
                  <span className="font-semibold text-gray-800">Oyunlar</span>
                </div>
                
                <div className="absolute top-16 right-8 bg-white rounded-xl p-4 shadow-xl flex items-center gap-3 animate-float-delayed">
                  <Film className="w-6 h-6 text-purple-600" />
                  <span className="font-semibold text-gray-800">Media</span>
                </div>
                
                <div className="absolute bottom-16 left-16 bg-white rounded-xl p-4 shadow-xl flex items-center gap-3 animate-float-delayed-2">
                  <Code className="w-6 h-6 text-green-600" />
                  <span className="font-semibold text-gray-800">Proqramlar</span>
                </div>
                
                {/* Center Icon */}
                <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 animate-pulse">
                  <ShoppingCart className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Products */}
      {premiumProducts.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-semibold mb-4">
                <Crown className="w-4 h-4" />
                Premium Kolleksiya
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Ən Seçilən Premium Məhsullar</h2>
              <p className="text-xl text-gray-600">Yüksək keyfiyyət və etibarlılıq zəmanəti ilə</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {premiumProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
                  <div className="relative">
                    <div className="absolute top-4 right-4 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center z-10">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div className="h-48 overflow-hidden">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Package className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <a 
                        href={`/products/${product.id}`}
                        className="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Bax
                      </a>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="text-blue-600 text-sm font-semibold mb-2">{product.category.name}</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{product.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-2xl font-bold text-blue-600">{product.price} AZN</div>
                      <div>
                        {product.stock > 0 ? (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                            <CheckCircle className="w-4 h-4 inline mr-1" />
                            Stokda
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                            <XCircle className="w-4 h-4 inline mr-1" />
                            Bitib
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {product.stock > 0 ? (
                      <button 
                        onClick={() => handleAddToCart(product.id)}
                        disabled={addingToCart === product.id}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        {addingToCart === product.id ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Əlavə edilir...
                          </>
                        ) : (
                          <>
                            <CartPlus className="w-5 h-5" />
                            Səbətə əlavə et
                          </>
                        )}
                      </button>
                    ) : (
                      <a 
                        href={`/products/${product.id}`}
                        className="w-full bg-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="w-5 h-5" />
                        Məhsula bax
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <a 
                href="/products?premium=true"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
                Bütün Premium Məhsullar
              </a>
            </div>
          </div>
        </section>
      )}

      {/* All Products */}
      {allProducts.length > 0 && (
        <section id="products" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full font-semibold mb-4">
                <Grid3X3 className="w-4 h-4" />
                Bütün Məhsullar
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Geniş Məhsul Çeşidi</h2>
              <p className="text-xl text-gray-600">{allProducts.length} məhsul sizinlə</p>
            </div>
            
            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200'
                }`}
              >
                <Grid3X3 className="w-4 h-4 inline mr-2" />
                Hamısı
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id.toString())}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                    selectedCategory === category.id.toString()
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            {/* Products Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                  <div className="relative">
                    {product.isPremium && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold z-10">
                        <Crown className="w-3 h-3 inline mr-1" />
                        Premium
                      </div>
                    )}
                    <div className="h-40 overflow-hidden">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
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
          </div>
        </section>
      )}

      {/* Sellers Section */}
      {sellers.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full font-semibold mb-4">
                <Shop className="w-4 h-4" />
                Etibarlı Satıcılar
              </div>
              <h2 className="text-4xl font-bold mb-4">Təcrübəli Satıcılarımız</h2>
              <p className="text-xl opacity-90">Keyfiyyətli xidmət və sürətli çatdırılma</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sellers.map((seller) => (
                <div key={seller.id} className="bg-white text-gray-800 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {seller.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                      <CheckCircle className="w-3 h-3 inline mr-1" />
                      Təsdiqlənmiş
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-1">{seller.username}</h3>
                  {seller.storeName && (
                    <p className="text-blue-600 font-semibold mb-2">{seller.storeName}</p>
                  )}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{seller.storeDescription}</p>
                  
                  <div className="flex justify-between items-center mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-semibold">{seller.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4 text-gray-500" />
                      <span>{seller.productCount} məhsul</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <a 
                      href={`/seller/${seller.id}`}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center text-sm"
                    >
                      Profil
                    </a>
                    <a 
                      href={`/products?seller=${seller.id}`}
                      className="flex-1 border border-blue-600 text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-center text-sm"
                    >
                      Məhsullar
                    </a>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <a 
                href="/sellers"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
                Bütün Satıcılar
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Niyə DiGex?</h2>
            <p className="text-xl text-gray-600">Bizim üstünlüklərimiz</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                <Lightning className="w-10 h-10 text-blue-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Ani Çatdırılma</h3>
              <p className="text-gray-600">Ödənişdən dərhal sonra məhsulunuz hazırdır</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-600 transition-colors duration-300">
                <Shield className="w-10 h-10 text-green-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">100% Təhlükəsiz</h3>
              <p className="text-gray-600">SSL şifrələməsi ilə qorunan ödənişlər</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-600 transition-colors duration-300">
                <Headphones className="w-10 h-10 text-purple-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">24/7 Dəstək</h3>
              <p className="text-gray-600">Həmişə yanınızda olan müştəri xidmətləri</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-yellow-600 transition-colors duration-300">
                <Award className="w-10 h-10 text-yellow-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Keyfiyyət Zəmanəti</h3>
              <p className="text-gray-600">Yalnız yoxlanmış və etibarlı məhsullar</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {!user ? (
              <>
                <h2 className="text-4xl font-bold mb-6">Rəqəmsal Alış-verişə Başlayın!</h2>
                <p className="text-xl mb-8 opacity-90">İndi qeydiyyatdan keçin və xüsusi endirimlər əldə edin!</p>
                <a 
                  href="/register"
                  className="inline-flex items-center gap-2 bg-yellow-500 text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-yellow-400 transition-colors text-lg"
                >
                  <UserPlus className="w-6 h-6" />
                  Pulsuz Qeydiyyat
                </a>
              </>
            ) : user.role === 'USER' ? (
              <>
                <h2 className="text-4xl font-bold mb-6">Satıcı Olmaq İstəyirsiniz?</h2>
                <p className="text-xl mb-8 opacity-90">Öz məhsullarınızı sataraq əlavə gəlir əldə edin!</p>
                <a 
                  href="/user/seller-request"
                  className="inline-flex items-center gap-2 bg-yellow-500 text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-yellow-400 transition-colors text-lg"
                >
                  <Shop className="w-6 h-6" />
                  Satıcı Ol
                </a>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-bold mb-6">DiGex-ə Xoş Gəlmisiniz!</h2>
                <p className="text-xl mb-8 opacity-90">Rəqəmsal məhsullar dünyasını kəşf edin!</p>
                <button 
                  onClick={scrollToProducts}
                  className="inline-flex items-center gap-2 bg-yellow-500 text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-yellow-400 transition-colors text-lg"
                >
                  <Search className="w-6 h-6" />
                  Məhsulları Gör
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float 3s ease-in-out infinite;
          animation-delay: 1s;
        }
        
        .animate-float-delayed-2 {
          animation: float 3s ease-in-out infinite;
          animation-delay: 2s;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default HomePage;