import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';
import { 
  getPendingProducts, 
  getPendingProductsStats, 
  approveProduct, 
  rejectProduct,
  Product 
} from '../../services/adminService';

// Helper function to get seller display name
const getSellerDisplayName = (product: any) => {
  console.log('🔍 [PENDING] getSellerDisplayName called with product:', product);
  
  // Try main seller field first
  let seller = product?.seller;
  
  // If no seller, try alternative fields
  if (!seller) {
    seller = product?.createdBy || product?.owner || product?.user;
    console.log('🔍 [PENDING] Trying alternative seller field:', seller);
  }
  
  console.log('🔍 [PENDING] Final seller object:', seller);
  console.log('🔍 [PENDING] seller type:', typeof seller);
  console.log('🔍 [PENDING] seller keys:', seller ? Object.keys(seller) : 'no seller');
  
  if (!seller) {
    console.log('🔍 [PENDING] No seller object found, returning Bilinməyən');
    return 'Bilinməyən';
  }
  
  // Try different possible field names from API
  if (seller.name) {
    console.log('🔍 [PENDING] Found seller.name:', seller.name);
    return seller.name;
  }
  if (seller.firstName && seller.lastName) {
    console.log('🔍 [PENDING] Found firstName + lastName:', seller.firstName, seller.lastName);
    return `${seller.firstName} ${seller.lastName}`;
  }
  if (seller.fullName) {
    console.log('🔍 [PENDING] Found seller.fullName:', seller.fullName);
    return seller.fullName;
  }
  if (seller.displayName) {
    console.log('🔍 [PENDING] Found seller.displayName:', seller.displayName);
    return seller.displayName;
  }
  if (seller.username) {
    console.log('🔍 [PENDING] Found seller.username:', seller.username);
    return seller.username;
  }
  
  console.log('🔍 [PENDING] Unknown seller structure:', seller);
  console.log('🔍 [PENDING] Available fields:', Object.keys(seller));
  return 'Bilinməyən';
};

interface PendingProductsStats {
  totalPending: number;
  pendingToday: number;
  pendingThisWeek: number;
  averageApprovalTime: number;
}

const AdminPendingProductsPage: React.FC = () => {
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<PendingProductsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const fetchPendingProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch products and stats separately to handle errors individually
      const productsResponse = await getPendingProducts();
      
      // Filter only pending products (status === 'PENDING' or approved === false)
      const pendingOnly = productsResponse.filter(product => 
        product.status === 'PENDING' || 
        (product as any).approved === false ||
        !(product as any).approved
      );
      
      setPendingProducts(pendingOnly);
      
      console.log('🔍 Pending Products API Response Structure:');
      console.log('All Products:', productsResponse);
      console.log('Filtered Pending Products:', pendingOnly);
      
      // Debug pending products seller structure
      if (pendingOnly && pendingOnly.length > 0) {
        console.log('🔍 [PENDING] First product seller structure:', pendingOnly[0].seller);
        console.log('🔍 [PENDING] First product full object:', pendingOnly[0]);
        console.log('🔍 [PENDING] ALL PENDING PRODUCTS SELLER DATA:');
        pendingOnly.forEach((product, index) => {
          if (index < 3) { // İlk 3 pending ürün için
            console.log(`Pending Product ${index + 1}:`, {
              id: product.id,
              title: product.title,
              name: product.name,
              status: product.status,
              approved: (product as any).approved,
              seller: product.seller,
              sellerType: typeof product.seller,
              sellerKeys: product.seller ? Object.keys(product.seller) : 'no seller',
              allProductKeys: Object.keys(product)
            });
          }
        });
      }
      
      // Try to get stats, but don't fail if it's not available
      try {
        const statsResponse = await getPendingProductsStats();
        setStats(statsResponse as PendingProductsStats);
        console.log('Stats:', statsResponse);
      } catch (statsError) {
        console.error('Stats fetch failed, using defaults:', statsError);
        setStats({
          totalPending: pendingOnly.length,
          pendingToday: 0,
          pendingThisWeek: 0,
          averageApprovalTime: 0
        } as PendingProductsStats);
      }
      
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Məlumatlar yüklənərkən xəta baş verdi');
      
      // Set empty arrays instead of mock data
      setPendingProducts([]);
      setStats({
        totalPending: 0,
        pendingToday: 0,
        pendingThisWeek: 0,
        averageApprovalTime: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (productId: number) => {
    try {
      await approveProduct(productId);
      
      // Remove product from list without refetching
      setPendingProducts(prev => prev.filter(p => p.id !== productId));
      
      // Update stats count manually
      setStats(prev => prev ? {
        ...prev,
        totalPending: Math.max(0, prev.totalPending - 1)
      } : null);
      
      alert('Məhsul uğurla təsdiq edildi!');
    } catch (error) {
      console.error('Error approving product:', error);
      alert('Məhsul təsdiq edilərkən xəta baş verdi');
    }
  };

  const handleReject = async (productId: number) => {
    try {
      await rejectProduct(productId);
      
      // Remove product from list without refetching
      setPendingProducts(prev => prev.filter(p => p.id !== productId));
      
      // Update stats count manually
      setStats(prev => prev ? {
        ...prev,
        totalPending: Math.max(0, prev.totalPending - 1)
      } : null);
      
      alert('Məhsul rədd edildi.');
    } catch (error) {
      console.error('Error rejecting product:', error);
      alert('Məhsul rədd edilərkən xəta baş verdi');
    }
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const filteredProducts = pendingProducts.filter(product =>
    (product.title || product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    getSellerDisplayName(product).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('az-AZ', {
      style: 'currency',
      currency: 'AZN',
      minimumFractionDigits: 2
    }).format(price);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Bekleyen məhsullar yüklənir...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">❌</div>
        <h3>Xəta baş verdi</h3>
        <p>{error}</p>
        <button onClick={fetchPendingProducts}>Yenidən Yüklə</button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .pending-products-dashboard {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
          padding: 2rem;
        }

        .dashboard-header {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .back-button {
          background: #6b7280;
          color: white;
          border: none;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .back-button:hover {
          background: #4b5563;
        }

        .page-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-item {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
        }

        .stat-icon.pending {
          background: #f59e0b;
        }

        .stat-icon.today {
          background: #10b981;
        }

        .stat-icon.week {
          background: #3b82f6;
        }

        .stat-icon.time {
          background: #8b5cf6;
        }

        .stat-content h4 {
          margin: 0 0 0.5rem 0;
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .stat-content p {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }

        .controls-section {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .search-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.875rem;
          transition: border-color 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .products-table {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .table-header {
          display: grid;
          grid-template-columns: 80px 2fr 150px 120px 120px 100px 120px 180px;
          gap: 1rem;
          padding: 1rem;
          background: #f8fafc;
          border-bottom: 1px solid #e5e7eb;
          font-weight: 600;
          color: #374151;
        }

        .table-row {
          display: grid;
          grid-template-columns: 80px 2fr 150px 120px 120px 100px 120px 180px;
          gap: 1rem;
          padding: 1rem;
          border-bottom: 1px solid #f3f4f6;
          align-items: center;
        }

        .table-row:hover {
          background: #f9fafb;
        }

        .product-image {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          object-fit: cover;
        }

        .product-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .product-title {
          font-weight: 600;
          color: #1f2937;
          font-size: 0.875rem;
        }

        .product-description {
          color: #6b7280;
          font-size: 0.75rem;
          line-height: 1.4;
        }

        .product-seller {
          color: #3b82f6;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .product-category {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .product-price {
          font-weight: 600;
          color: #059669;
          font-size: 0.875rem;
        }

        .product-stock {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .product-date {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .actions-cell {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .approve-btn {
          background: #10b981;
          color: white;
        }

        .approve-btn:hover {
          background: #059669;
        }

        .reject-btn {
          background: #ef4444;
          color: white;
        }

        .reject-btn:hover {
          background: #dc2626;
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        .empty-state i {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: #9ca3af;
        }

        .loading-container, .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-container button {
          background: #6366f1;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          margin-top: 1rem;
        }

        @media (max-width: 1200px) {
          .table-header,
          .table-row {
            grid-template-columns: 60px 1fr 100px 100px 80px 100px 150px;
          }
          
          .product-description {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .stats-row {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }
          
          .table-header,
          .table-row {
            grid-template-columns: 1fr 120px;
            gap: 0.5rem;
          }
          
          .table-header > *:not(:first-child):not(:last-child),
          .table-row > *:not(:first-child):not(:last-child) {
            display: none;
          }
        }
      `}</style>

      <div className="pending-products-dashboard">
        <div className="dashboard-header">
          <div className="page-header">
            <div className="header-left">
              <button
                onClick={() => window.location.href = '/admin/products'}
                className="back-button"
              >
                <i className="bi bi-arrow-left"></i>
                Geri
              </button>
              <h1 className="page-title">Bekleyen Məhsullar</h1>
            </div>
          </div>
        </div>

        {stats && (
          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-icon pending">
                <i className="bi bi-clock"></i>
              </div>
              <div className="stat-content">
                <h4>Ümumi Bekleyən</h4>
                <p>{stats.totalPending}</p>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon today">
                <i className="bi bi-calendar-day"></i>
              </div>
              <div className="stat-content">
                <h4>Bu Gün</h4>
                <p>{stats.pendingToday}</p>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon week">
                <i className="bi bi-calendar-week"></i>
              </div>
              <div className="stat-content">
                <h4>Bu Həftə</h4>
                <p>{stats.pendingThisWeek}</p>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon time">
                <i className="bi bi-stopwatch"></i>
              </div>
              <div className="stat-content">
                <h4>Orta Təsdiq</h4>
                <p>{stats.averageApprovalTime}s</p>
              </div>
            </div>
          </div>
        )}

        <div className="controls-section">
          <input
            type="text"
            placeholder="Məhsul və ya satıcı axtarın..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-inbox"></i>
            <h3>Bekleyen məhsul yoxdur</h3>
            <p>Hazırda təsdiq gözləyən məhsul yoxdur.</p>
          </div>
        ) : (
          <div className="products-table">
            <div className="table-header">
              <div>Şəkil</div>
              <div>Məhsul Məlumatları</div>
              <div>Satıcı Məlumatları</div>
              <div>Kateqoriya</div>
              <div>Qiymət</div>
              <div>Stok/Çatdırılma</div>
              <div>Göndərildi</div>
              <div>Əməliyyatlar</div>
            </div>
            
            {filteredProducts.map((product) => (
              <div key={product.id} className="table-row">
                <img
                  src={product.images?.[0] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRTJFOEYwIi8+CjxwYXRoIGQ9Ik0yMCAyNUwyMCAxNUgyMEwyMCAyNVoiIHN0cm9rZT0iIzY0NzQ4QiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHBhdGggZD0iTTEyIDI1SDE2TDIwIDIxTDI0IDI1SDI4VjMwSDE2VjI1WiIgc3Ryb2tlPSIjNjQ3NDhCIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+'}
                  alt={product.title || product.name || ''}
                  className="product-image"
                />
                <div className="product-details">
                  <div className="product-title">{product.title || product.name || 'İsim tapılmadı'}</div>
                  <div className="product-description">{product.description}</div>
                  {(product as any).deliveryType && (
                    <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '4px' }}>
                      <strong>Çatdırılma:</strong> {(product as any).deliveryType === 'manual' ? 'Manual' : 'Stok Kodları'}
                    </div>
                  )}
                  {(product as any).manualInstructions && (
                    <div style={{ fontSize: '0.75rem', color: '#7c3aed', marginTop: '2px' }}>
                      <strong>Təlimatlar:</strong> {(product as any).manualInstructions.substring(0, 50)}...
                    </div>
                  )}
                  {(product as any).stockType && (
                    <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '2px' }}>
                      <strong>Stok Tipi:</strong> {(product as any).stockType}
                    </div>
                  )}
                </div>
                <div className="product-seller">
                  <div style={{ fontWeight: 600, color: '#1f2937' }}>@{getSellerDisplayName(product)}</div>
                  {(product.seller as any)?.email && (
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>{(product.seller as any).email}</div>
                  )}
                  {(product as any).createdBy?.username && (
                    <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '2px' }}>
                      Yaradıcı: {(product as any).createdBy.username}
                    </div>
                  )}
                </div>
                <div className="product-category">{product.category?.name || 'Bilinməyən'}</div>
                <div className="product-price">{formatPrice(product.price)}</div>
                <div className="product-stock">
                  <div style={{ fontWeight: 600 }}>{product.stock} ədəd</div>
                  {(product as any).deliveryType === 'stock' && (
                    <div style={{ fontSize: '0.75rem', color: '#7c3aed' }}>Stok Kodları</div>
                  )}
                  {(product as any).deliveryType === 'manual' && (
                    <div style={{ fontSize: '0.75rem', color: '#059669' }}>Manual Çatdırılma</div>
                  )}
                  {(product as any).maxUsageCount && (product as any).maxUsageCount > 1 && (
                    <div style={{ fontSize: '0.75rem', color: '#dc2626' }}>
                      Max: {(product as any).maxUsageCount} istifadə
                    </div>
                  )}
                </div>
                <div className="product-date">{formatDate(product.createdAt)}</div>
                
                <div className="actions-cell">
                  <button
                    onClick={() => handleViewDetails(product)}
                    className="action-btn"
                    style={{ background: '#3b82f6', color: 'white' }}
                  >
                    <i className="bi bi-eye"></i>
                    Detay
                  </button>
                  <button
                    onClick={() => handleApprove(product.id)}
                    className="action-btn approve-btn"
                    disabled={isLoading}
                  >
                    <i className="bi bi-check"></i>
                    Təsdiq
                  </button>
                  <button
                    onClick={() => handleReject(product.id)}
                    className="action-btn reject-btn"
                    disabled={isLoading}
                  >
                    <i className="bi bi-x"></i>
                    Rədd
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {showDetailModal && selectedProduct && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDetailModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Məhsul Təfərrüatları</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="bi bi-x-lg text-xl"></i>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Image */}
              <div className="space-y-4">
                <img
                  src={selectedProduct.images?.[0] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRTJFOEYwIi8+CjxwYXRoIGQ9Ik0xMDAgMTI1TDEwMCA3NUgxMDBMMTAwIDEyNVoiIHN0cm9rZT0iIzY0NzQ4QiIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHBhdGggZD0iTTYwIDEyNUg4MEwxMDAgMTA1TDEyMCAxMjVIMTQwVjE1MEg4MFYxMjVaIiBzdHJva2U9IiM2NDc0OEIiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K'}
                  alt={selectedProduct.title || selectedProduct.name || ''}
                  className="w-full h-64 object-cover rounded-lg border"
                />
                
                {/* Additional Images */}
                {selectedProduct.images && selectedProduct.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {selectedProduct.images.slice(1, 5).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${selectedProduct.title} ${index + 2}`}
                        className="w-full h-16 object-cover rounded border"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedProduct.title || selectedProduct.name || 'İsim tapılmadı'}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedProduct.description || 'Təsvir mövcud deyil'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Qiymət</span>
                    <p className="text-lg font-semibold text-green-600">{formatPrice(selectedProduct.price)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Stok</span>
                    <p className="text-lg font-semibold">{selectedProduct.stock} ədəd</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Kateqoriya</span>
                    <p className="font-medium">{selectedProduct.category?.name || 'Bilinməyən'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status</span>
                    <p className="font-medium text-yellow-600">{selectedProduct.status}</p>
                  </div>
                </div>

                {/* Seller Information */}
                <div className="border-t pt-4">
                  <h5 className="font-semibold text-gray-900 mb-2">Satıcı Məlumatları</h5>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">İstifadəçi adı:</span>
                      <p className="font-medium">@{getSellerDisplayName(selectedProduct)}</p>
                    </div>
                    {(selectedProduct.seller as any)?.email && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Email:</span>
                        <p className="font-medium">{(selectedProduct.seller as any).email}</p>
                      </div>
                    )}
                    {(selectedProduct as any).createdBy?.username && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Yaradıcı:</span>
                        <p className="font-medium">{(selectedProduct as any).createdBy.username}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Information */}
                {((selectedProduct as any).deliveryType || (selectedProduct as any).manualInstructions || (selectedProduct as any).stockType) && (
                  <div className="border-t pt-4">
                    <h5 className="font-semibold text-gray-900 mb-2">Çatdırılma Məlumatları</h5>
                    <div className="space-y-2">
                      {(selectedProduct as any).deliveryType && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Çatdırılma Növü:</span>
                          <p className="font-medium">
                            {(selectedProduct as any).deliveryType === 'manual' ? 'Manual Çatdırılma' : 'Stok Kodları'}
                          </p>
                        </div>
                      )}
                      {(selectedProduct as any).stockType && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Stok Tipi:</span>
                          <p className="font-medium">{(selectedProduct as any).stockType}</p>
                        </div>
                      )}
                      {(selectedProduct as any).maxUsageCount && (selectedProduct as any).maxUsageCount > 1 && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Maksimum İstifadə:</span>
                          <p className="font-medium">{(selectedProduct as any).maxUsageCount} dəfə</p>
                        </div>
                      )}
                      {(selectedProduct as any).manualInstructions && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Manual Təlimatlar:</span>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg mt-1">
                            {(selectedProduct as any).manualInstructions}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* File Information */}
                {(selectedProduct as any).fileUrl && (
                  <div className="border-t pt-4">
                    <h5 className="font-semibold text-gray-900 mb-2">Fayllar</h5>
                    <a
                      href={(selectedProduct as any).fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <i className="bi bi-download mr-2"></i>
                      Fayl yüklə
                    </a>
                  </div>
                )}

                {/* Dates */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Yaradılma tarixi:</span>
                      <p className="text-sm">{formatDate(selectedProduct.createdAt)}</p>
                    </div>
                    {selectedProduct.updatedAt && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Son yeniləmə:</span>
                        <p className="text-sm">{formatDate(selectedProduct.updatedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Bağla
              </button>
              <button
                onClick={() => {
                  handleReject(selectedProduct.id);
                  setShowDetailModal(false);
                }}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                disabled={isLoading}
              >
                Rədd Et
              </button>
              <button
                onClick={() => {
                  handleApprove(selectedProduct.id);
                  setShowDetailModal(false);
                }}
                className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                disabled={isLoading}
              >
                Təsdiq Et
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPendingProductsPage; 
 