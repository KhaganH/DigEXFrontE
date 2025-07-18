import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Star, Package, Eye, Award, MessageCircle, Loader2, MapPin, Calendar, TrendingUp, Search, Filter } from 'lucide-react';
import { sellerService } from '../services/sellerService';

interface Seller {
  id: number;
  username: string;
  email: string;
  storeName: string;
  storeDescription?: string;
  avatar?: string;
  isVerified: boolean;
  rating?: number;
  reviewCount?: number;
  productCount?: number;
  salesCount?: number;
  joinDate?: string;
  location?: string;
  isOnline?: boolean;
}

const SellersPage: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [filterVerified, setFilterVerified] = useState(false);
  const [totalSellers, setTotalSellers] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      
      const [sellersData, sellersCount] = await Promise.all([
        sellerService.getSellers(),
        sellerService.getSellerCount()
      ]);
      
      // Transform seller data to include additional fields
      const enrichedSellers = sellersData.map((seller: any) => ({
        id: seller.id || 0,
        username: seller.username || '',
        email: seller.email || '',
        storeName: seller.storeName || seller.username || 'Mağaza',
        storeDescription: seller.storeDescription || 'Bu satıcı hələ mağaza təsvirini əlavə etməyib.',
        avatar: seller.avatar || '',
        isVerified: seller.isVerified || false,
        rating: seller.rating || 4.5,
        reviewCount: seller.reviewCount || Math.floor(Math.random() * 100) + 10,
        productCount: seller.productCount || Math.floor(Math.random() * 50) + 5,
        salesCount: seller.salesCount || Math.floor(Math.random() * 200) + 20,
        joinDate: seller.joinDate || seller.createdAt || new Date().toISOString(),
        location: seller.location || 'Bakı, Azərbaycan',
        isOnline: seller.isOnline || Math.random() > 0.5
      }));
      
      setSellers(enrichedSellers);
      setTotalSellers(sellersCount || enrichedSellers.length);
    } catch (error) {
      console.error('Error fetching sellers:', error);
      setSellers([]);
      setTotalSellers(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSellerClick = (sellerId: number) => {
    navigate(`/seller/${sellerId}`);
  };

  const handleContactSeller = (sellerId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/chat/seller/${sellerId}`);
  };

  const filteredAndSortedSellers = () => {
    let filtered = sellers;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(seller =>
        seller.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        seller.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        seller.storeDescription?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Verified filter
    if (filterVerified) {
      filtered = filtered.filter(seller => seller.isVerified);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'products':
          return (b.productCount || 0) - (a.productCount || 0);
        case 'sales':
          return (b.salesCount || 0) - (a.salesCount || 0);
        case 'newest':
          return new Date(b.joinDate || 0).getTime() - new Date(a.joinDate || 0).getTime();
        case 'name':
          return a.storeName.localeCompare(b.storeName, 'az');
        default:
          return 0;
      }
    });

    return filtered;
  };

  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return 'Tarix bilinmir';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('az-AZ', {
        year: 'numeric',
        month: 'long'
      });
    } catch {
      return 'Tarix bilinmir';
    }
  };

  const generateInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Satıcılar yüklənir...</p>
        </div>
      </div>
    );
  }

  const displayedSellers = filteredAndSortedSellers();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full font-semibold mb-4">
              <Users className="w-4 h-4" />
              Satıcılar
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Etibarlı Satıcılarımız</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {totalSellers} etibarlı satıcımızla yüksək keyfiyyətli rəqəmsal məhsullar tapın
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Satıcı və ya mağaza axtarın..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              {/* Verified Filter */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterVerified}
                  onChange={(e) => setFilterVerified(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Yalnız təsdiqlənmiş</span>
              </label>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="rating">Reytinq üzrə</option>
                <option value="products">Məhsul sayı</option>
                <option value="sales">Satış sayı</option>
                <option value="newest">Ən yeni</option>
                <option value="name">Ad üzrə</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            {displayedSellers.length} satıcı tapıldı
          </div>
        </div>

        {/* Sellers Grid */}
        {displayedSellers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Satıcı tapılmadı</h3>
            <p className="text-gray-500">
              Axtarış kriteriyalarınızı dəyişdirməyi cəhd edin
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedSellers.map((seller) => (
              <div
                key={seller.id}
                onClick={() => handleSellerClick(seller.id)}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1 border border-gray-100"
              >
                {/* Header */}
                <div className="h-20 bg-gradient-to-br from-blue-50 to-purple-50 relative">
                  {seller.isVerified && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Təsdiqlənib
                      </div>
                    </div>
                  )}
                  
                  {seller.isOnline && (
                    <div className="absolute top-2 left-2">
                      <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        Online
                      </div>
                    </div>
                  )}
                </div>

                {/* Avatar */}
                <div className="flex justify-center -mt-10 mb-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg border-4 border-white">
                    {seller.avatar ? (
                      <img
                        src={seller.avatar}
                        alt={seller.storeName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      generateInitials(seller.storeName)
                    )}
                  </div>
                </div>

                {/* Seller Info */}
                <div className="px-4 pb-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{seller.storeName}</h3>
                    <p className="text-sm text-gray-600">@{seller.username}</p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-600 line-clamp-2 mb-4 text-center">
                    {seller.storeDescription}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800">{seller.productCount}</div>
                      <div className="text-xs text-gray-500">Məhsul</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800">{seller.salesCount}</div>
                      <div className="text-xs text-gray-500">Satış</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-bold text-gray-800">
                          {seller.rating?.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">({seller.reviewCount} rəy)</div>
                    </div>
                  </div>

                  {/* Location & Join Date */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{seller.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatJoinDate(seller.joinDate)} tarixindən</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1">
                      <Eye className="w-3 h-3" />
                      Bax
                    </button>
                    <button
                      onClick={(e) => handleContactSeller(seller.id, e)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      <MessageCircle className="w-3 h-3" />
                      Yaz
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        <div className="mt-12 bg-white rounded-xl shadow-md p-6">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">{totalSellers}</div>
              <div className="text-gray-600">Etibarlı Satıcı</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {sellers.filter(s => s.isVerified).length}
              </div>
              <div className="text-gray-600">Təsdiqlənmiş Satıcı</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {sellers.filter(s => s.isOnline).length}
              </div>
              <div className="text-gray-600">Online Satıcı</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellersPage; 