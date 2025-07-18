import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { AlertContext } from '../App';
import { productService, Product, ReviewStats } from '../services/productService';
import { useCart } from '../hooks/useCart';
import { 
  Star, 
  Eye, 
  ShoppingCart, 
  User, 
  Tag, 
  Download,
  Heart,
  Share2,
  Calendar,
  Shield,
  MessageSquare,
  Send,
  ThumbsUp,
  ThumbsDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';



interface Review {
  id: number;
  rating: number;
  comment: string;
  user: {
    id: number;
    username: string;
    avatar?: string;
  };
  createdAt: string;
  helpful: number;
  reported: boolean;
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = id ? parseInt(id) : null;
  const { user } = useAuth();
  const { showAlert } = useContext(AlertContext);
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (productId) {
      loadProduct();
      loadReviews();
      loadReviewStats();
    }
  }, [productId]);

  const loadProduct = async () => {
    if (!productId) return;
    
    try {
      const productData = await productService.getProductById(productId);
      console.log('🔍 Product data:', productData); // Debug log
      if (productData) {
        setProduct(productData);
        
        // Load related products from same seller
        if (productData.user?.id) {
          loadRelatedProducts(productData.user.id);
        }
      } else {
        showAlert('error', 'Məhsul tapılmadı');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      showAlert('error', 'Məhsul yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    if (!productId) return;
    
    try {
      const reviewsData = await productService.getProductReviews(productId);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
    }
  };

  const loadReviewStats = async () => {
    if (!productId) return;
    
    try {
      const statsData = await productService.getReviewStats(productId);
      if (statsData) {
        setReviewStats(statsData);
      }
    } catch (error) {
      console.error('Error loading review stats:', error);
      setReviewStats(null);
    }
  };

  const loadRelatedProducts = async (sellerId: number) => {
    try {
      if (!sellerId) {
        console.log('Seller ID not available, skipping related products');
        setRelatedProducts([]);
        return;
      }
      const sellerProducts = await productService.getProductsBySeller(sellerId);
      setRelatedProducts(sellerProducts.filter(p => p.id !== Number(productId)).slice(0, 6));
    } catch (error) {
      console.error('Error loading related products:', error);
      setRelatedProducts([]);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      showAlert('warning', 'Səbətə əlavə etmək üçün giriş etməlisiniz');
      return;
    }

    if (!product) return;

    try {
      await addToCart(product.id, 1);
      showAlert('success', 'Məhsul səbətə əlavə edildi');
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      let errorMessage = error.message || 'Məhsul səbətə əlavə edilərkən xəta baş verdi';
      
      if (errorMessage.includes('Öz məhsulunuzu ala bilməzsiniz')) {
        errorMessage = 'Öz məhsulunuzu satın ala bilməzsiniz!';
      }
      
      showAlert('error', errorMessage);
    }
  };



  const handleSubmitReview = async () => {
    if (!user) {
      showAlert('warning', 'Rəy yazmaq üçün giriş etməlisiniz');
      return;
    }

    if (!newReview.comment.trim()) {
      showAlert('warning', 'Rəy mətni daxil edin');
      return;
    }

    // Debug authentication
    const token = localStorage.getItem('authToken');
    console.log('🔍 Review submission debug:');
    console.log('  User:', user);
    console.log('  Token exists:', !!token);
    console.log('  Token preview:', token ? token.substring(0, 50) + '...' : 'NO TOKEN');

    setSubmittingReview(true);
    try {
      const success = await productService.addReview(productId!, newReview.rating, newReview.comment);
      
      if (success) {
        showAlert('success', 'Rəyiniz əlavə edildi');
        setNewReview({ rating: 5, comment: '' });
        setShowReviewForm(false);
        loadReviews();
        loadReviewStats();
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      let errorMessage = error.message || 'Rəy əlavə edilərkən xəta baş verdi';
      
      // If it's an auth error, suggest re-login
      if (errorMessage.includes('Giriş etməlisiniz')) {
        errorMessage = 'Giriş səhvi. Yenidən daxil olun.';
      }
      
      showAlert('error', errorMessage);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleMarkHelpful = async (reviewId: number) => {
    if (!user) {
      showAlert('warning', 'Giriş etməlisiniz');
      return;
    }

    try {
      const success = await productService.markReviewHelpful(reviewId);
      if (success) {
        loadReviews();
        showAlert('success', 'Rəy faydalı kimi qeyd edildi');
      }
    } catch (error: any) {
      console.error('Error marking review as helpful:', error);
      showAlert('error', 'Xəta baş verdi');
    }
  };

  const formatPrice = (price: number | undefined) => {
    if (!price) return '0.00 ₼';
    return new Intl.NumberFormat('az-AZ', {
      style: 'currency',
      currency: 'AZN',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatNumber = (num: number | undefined) => {
    if (!num || num === 0) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRatingChange?.(star)}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Məhsul tapılmadı</h2>
          <p className="text-gray-600">Axtardığınız məhsul mövcud deyil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Product Main Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={product.imageUrl || '/api/placeholder/500/500'}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Product Actions */}
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Heart className="w-4 h-4" />
                  Bəyən
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Share2 className="w-4 h-4" />
                  Paylaş
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{product.category?.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{formatNumber(product.viewCount || 0)} görüntüləmə</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{formatNumber(product.salesCount || 0)} satış</span>
                  </div>
                </div>
              </div>

              {/* Rating */}
              {reviewStats && reviewStats.averageRating !== undefined && (
                <div className="flex items-center gap-2">
                  {renderStars(reviewStats.averageRating)}
                  <span className="text-lg font-semibold">{reviewStats.averageRating.toFixed(1)}</span>
                  <span className="text-gray-600">({reviewStats.totalReviews || 0} rəy)</span>
                </div>
              )}

              {/* Price */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-blue-600">{formatPrice(product.price || 0)}</span>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Stok:</div>
                    <div className="font-semibold">{product.stock || 0} ədəd</div>
                  </div>
                </div>
              </div>

              {/* Seller Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {product.user?.storeName || product.user?.username || 'Bilinməyən satıcı'}
                    </h3>
                    <p className="text-sm text-gray-600">@{product.user?.username || 'anonymous'}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Səbətə Əlavə Et
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Təhlükəsiz ödəniş</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-green-600" />
                  <span>Ani endirmə</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span>Ömürboyu yenilənmə</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  <span>Dəstək xidməti</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Məhsul Təsviri</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Rəylər</h2>
            {user && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Rəy Yaz
              </button>
            )}
          </div>

          {/* Review Stats */}
          {reviewStats && reviewStats.averageRating !== undefined && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {reviewStats.averageRating.toFixed(1)}
                </div>
                {renderStars(reviewStats.averageRating)}
                <div className="text-sm text-gray-600 mt-1">
                  {reviewStats.totalReviews || 0} rəy əsasında
                </div>
              </div>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm w-8">{rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{
                          width: `${reviewStats.totalReviews > 0 && reviewStats.ratingCounts ? (reviewStats.ratingCounts[rating] / reviewStats.totalReviews) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">
                      {reviewStats.ratingCounts?.[rating] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review Form */}
          {showReviewForm && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Rəy Yazın</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reytinq
                  </label>
                  {renderStars(newReview.rating, true, (rating) => 
                    setNewReview({ ...newReview, rating })
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rəy
                  </label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Məhsul haqqında rəyinizi yazın..."
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {submittingReview ? 'Göndərilir...' : 'Rəy Göndər'}
                  </button>
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Ləğv et
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{review.user?.username || 'Anonim'}</span>
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                    </div>
                    <p className="text-gray-700 mb-2">{review.comment}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <button
                        onClick={() => handleMarkHelpful(review.id)}
                        className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        Faydalı ({review.helpful})
                      </button>
                      <button className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors">
                        <ThumbsDown className="w-4 h-4" />
                        Şikayət
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {reviews.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Hələ rəy yoxdur</h3>
              <p className="text-gray-600">Bu məhsul üçün ilk rəyi siz yazın!</p>
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Oxşar Məhsullar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct.id}
                  onClick={() => window.location.href = `/products/${relatedProduct.id}`}
                  className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <img
                    src={relatedProduct.imageUrl || '/api/placeholder/200/150'}
                    alt={relatedProduct.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {relatedProduct.title}
                  </h3>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-600">
                      {formatPrice(relatedProduct.price)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formatNumber(relatedProduct.viewCount)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage; 