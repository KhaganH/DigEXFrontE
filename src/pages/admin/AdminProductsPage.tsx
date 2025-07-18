import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';
import { 
  getProducts, 
  getProductStats, 
  getCategories, 
  approveProduct, 
  rejectProduct, 
  toggleProductFeatured,
  updateProduct,
  deleteProduct,
  Product,
  ProductStats,
  Category
} from '../../services/adminService';

// Helper function to get seller display name
const getSellerDisplayName = (product: any) => {
  console.log('🔍 getSellerDisplayName called with product:', product);
  
  // Try main seller field first
  let seller = product?.seller;
  
  // If no seller, try alternative fields
  if (!seller) {
    seller = product?.createdBy || product?.owner || product?.user;
    console.log('🔍 Trying alternative seller field:', seller);
  }
  
  console.log('🔍 Final seller object:', seller);
  console.log('🔍 seller type:', typeof seller);
  console.log('🔍 seller keys:', seller ? Object.keys(seller) : 'no seller');
  
  if (!seller) {
    console.log('🔍 No seller object found, returning Bilinməyən');
    return 'Bilinməyən';
  }

  // Try different possible field names from API
  if (seller.name) {
    console.log('🔍 Found seller.name:', seller.name);
    return seller.name;
  }
  if (seller.firstName && seller.lastName) {
    console.log('🔍 Found firstName + lastName:', seller.firstName, seller.lastName);
    return `${seller.firstName} ${seller.lastName}`;
  }
  if (seller.fullName) {
    console.log('🔍 Found seller.fullName:', seller.fullName);
    return seller.fullName;
  }
  if (seller.displayName) {
    console.log('🔍 Found seller.displayName:', seller.displayName);
    return seller.displayName;
  }
  if (seller.username) {
    console.log('🔍 Found seller.username:', seller.username);
    return seller.username;
  }
  
  console.log('🔍 Unknown seller structure:', seller);
  console.log('🔍 Available fields:', Object.keys(seller));
  return 'Bilinməyən';
};

const AdminProductsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productStats, setProductStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [
        productsResponse,
        categoriesResponse,
        statsResponse
      ] = await Promise.all([
        getProducts(),
        getCategories(),
        getProductStats()
      ]);

      setProducts(productsResponse);
      setCategories(categoriesResponse);
      setProductStats(statsResponse);
      
      // Debug: Check actual API response structure
      console.log('🔍 API Response Structure:');
      console.log('Products:', productsResponse);
      console.log('Categories:', categoriesResponse);
      console.log('Stats:', statsResponse);
      
      // Debug seller structure specifically
      if (productsResponse && productsResponse.length > 0) {
        console.log('🔍 First product seller structure:', productsResponse[0].seller);
        console.log('🔍 First product full object:', productsResponse[0]);
        console.log('🔍 ALL PRODUCTS SELLER DATA:');
        productsResponse.forEach((product, index) => {
          if (index < 5) { // İlk 5 ürün için
            console.log(`Product ${index + 1}:`, {
              id: product.id,
              title: product.title,
              name: product.name,
              seller: product.seller,
              sellerType: typeof product.seller,
              sellerKeys: product.seller ? Object.keys(product.seller) : 'no seller'
            });
          }
        });
      }
    } catch (err) {
      console.error('Data fetch error:', err);
      setError('Məlumatlar yüklənərkən xəta baş verdi');
      
      // Set empty arrays instead of mock data
      setProducts([]);
      setCategories([]);
      setProductStats({
        totalProducts: 0,
        activeProducts: 0,
        pendingApprovals: 0,
        featuredProducts: 0,
        outOfStock: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProduct = async (productId: number) => {
    try {
      await approveProduct(productId);
      await fetchData();
    } catch (err) {
      console.error('Approve product error:', err);
      alert('Məhsul təsdiqləmə xətası');
    }
  };

  const handleRejectProduct = async (productId: number) => {
    try {
      await rejectProduct(productId);
      await fetchData();
    } catch (err) {
      console.error('Reject product error:', err);
      alert('Məhsul rədd etmə xətası');
    }
  };

  const handleToggleFeatured = async (productId: number) => {
    try {
      await toggleProductFeatured(productId);
      await fetchData();
    } catch (err) {
      console.error('Toggle featured error:', err);
      alert('Məhsul xüsusi vəziyyəti dəyişdirilə bilmədi');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleUpdateProduct = async (productData: Partial<Product>) => {
    if (!editingProduct) return;
    
    try {
      await updateProduct(editingProduct.id, productData);
      await fetchData(); // Refresh data
      setShowEditModal(false);
      setEditingProduct(null);
      alert('Məhsul uğurla yeniləndi!');
    } catch (err) {
      console.error('Edit product error:', err);
      alert('Məhsul yenilənərkən xəta baş verdi');
    }
  };

  const handleDeleteProduct = async (productId: number, productTitle: string) => {
    const confirmDelete = window.confirm(`"${productTitle}" məhsulunu silmək istəyirsiniz? Bu əməliyyat geri alına bilməz.`);
    
    if (!confirmDelete) return;
    
    try {
      await deleteProduct(productId);
      await fetchData(); // Refresh data
      alert('Məhsul uğurla silindi!');
    } catch (err) {
      console.error('Delete product error:', err);
      alert('Məhsul silinərkən xəta baş verdi');
    }
  };

  const filteredProducts = products.filter((product, index) => {
    const productName = product.title || product.name || '';
    const sellerName = getSellerDisplayName(product);
    
    // Debug seller information (only first 3 products)
    if (index < 3) {
      console.log(`🔍 Filtering product ${index + 1}:`, {
        productName,
        sellerName,
        searchTerm,
        categoryFilter,
        productCategory: product.category?.name
      });
    }
    
    const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || product.category?.name === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('az-AZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#10b981';
      case 'PENDING': return '#f59e0b';
      case 'REJECTED': return '#ef4444';
      case 'INACTIVE': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Aktiv';
      case 'PENDING': return 'Gözləyir';
      case 'REJECTED': return 'Rədd edildi';
      case 'INACTIVE': return 'Deaktiv';
      default: return status;
    }
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return '#ef4444';
    if (stock < 10) return '#f59e0b';
    return '#10b981';
  };

  const getStockText = (stock: number) => {
    if (stock === 0) return 'Stok yoxdur';
    if (stock < 10) return 'Az stok';
    return 'Stokda var';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Məhsullar yüklənir...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">❌</div>
        <h3>Xəta baş verdi</h3>
        <p>{error}</p>
        <button onClick={fetchData}>Yenidən Yüklə</button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .products-dashboard {
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

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .controls-section {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .controls-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1rem;
          align-items: end;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
        }

        .form-input, .form-select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.875rem;
          transition: border-color 0.2s;
        }

        .form-input:focus, .form-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .tab-buttons {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }

        .tab-button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          background: #f3f4f6;
          color: #6b7280;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .tab-button.active {
          background: #3b82f6;
          color: white;
        }

        .products-table-container {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .table-header {
          background: #f8fafc;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .table-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .products-table {
          width: 100%;
          border-collapse: collapse;
        }

        .products-table th {
          background: #f8fafc;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
        }

        .products-table td {
          padding: 1rem;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
        }

        .products-table tr:hover {
          background: #f9fafb;
        }

        .product-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .product-image {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          object-fit: cover;
        }

        .product-details {
          flex: 1;
        }

        .product-title {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .product-description {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .product-seller {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .price-info {
          text-align: right;
        }

        .current-price {
          font-weight: 600;
          color: #059669;
          font-size: 1.125rem;
        }

        .category-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #e0e7ff;
          color: #3730a3;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .stock-info {
          text-align: center;
        }

        .stock-number {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .stock-status {
          font-size: 0.75rem;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          color: white;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .stats-mini {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .rating-display {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
        }

        .rating-stars {
          color: #f59e0b;
        }

        .rating-text {
          color: #6b7280;
        }

        .action-buttons {
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
        }

        .action-btn.success {
          background: #10b981;
          color: white;
        }

        .action-btn.success:hover {
          background: #059669;
        }

        .action-btn.danger {
          background: #ef4444;
          color: white;
        }

        .action-btn.danger:hover {
          background: #dc2626;
        }

        .toggle-btn {
          padding: 0.5rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .toggle-btn.active {
          background: #fef3c7;
          color: #d97706;
        }

        .toggle-btn.inactive {
          background: #f3f4f6;
          color: #6b7280;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        .empty-state-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .loading-container, .error-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          flex-direction: column;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .controls-grid {
            grid-template-columns: 1fr;
          }
          
          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }
          
          .products-table {
            font-size: 0.875rem;
          }
          
          .products-table th,
          .products-table td {
            padding: 0.75rem 0.5rem;
          }
        }
      `}</style>

      <div className="products-dashboard">
        <div className="dashboard-header">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📦 Məhsul İdarəetməsi
          </h1>
          <p className="text-gray-600">
            Bütün məhsulları idarə edin, təsdiqləyin və redaktə edin
          </p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{productStats?.totalProducts || 0}</div>
            <div className="stat-label">Ümumi Məhsul</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{productStats?.activeProducts || 0}</div>
            <div className="stat-label">Aktiv Məhsul</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{productStats?.pendingApprovals || 0}</div>
            <div className="stat-label">Təsdiq Gözləyən</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{productStats?.featuredProducts || 0}</div>
            <div className="stat-label">Seçilmiş Məhsul</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{productStats?.outOfStock || 0}</div>
            <div className="stat-label">Stok Yoxdur</div>
          </div>
        </div>

        {/* Controls */}
        <div className="controls-section">
          <div className="controls-grid">
            <div className="form-group">
              <label className="form-label">Axtar</label>
              <input
                type="text"
                className="form-input"
                placeholder="Məhsul adı, satıcı..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Kateqoriya</label>
              <select
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">Bütün Kateqoriyalar</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            📋 Bütün Məhsullar ({filteredProducts.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            ⏳ Təsdiq Gözləyən ({filteredProducts.filter(p => p.status === 'PENDING').length})
          </button>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'all' ? (
            <>
              {/* All Products */}
              <div className="products-table-container">
                <div className="table-header">
                  <h2 className="table-title">
                    Bütün Məhsullar ({filteredProducts.length})
                  </h2>
                </div>
                
                {filteredProducts.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">📦</div>
                    <h3>Heç bir məhsul tapılmadı</h3>
                    <p>Axtarış və ya filtr kriteriyalarınıza uyğun məhsul mövcud deyil.</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="products-table">
                      <thead>
                        <tr>
                          <th>Məhsul</th>
                          <th>Qiymət</th>
                          <th>Kateqoriya</th>
                          <th>Stok</th>
                          <th>Status</th>
                          <th>Statistikalar</th>
                          <th>Reytinq</th>
                          <th>Tarix</th>
                          <th>Əməliyyatlar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product) => (
                          <tr key={product.id}>
                            <td>
                              <div className="product-info">
                                <img
                                  src={product.images?.[0] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRTJFOEYwIi8+CjxwYXRoIGQ9Ik0yMCAyNUwyMCAxNUgyMEwyMCAyNVoiIHN0cm9rZT0iIzY0NzQ4QiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHBhdGggZD0iTTEyIDI1SDE2TDIwIDIxTDI0IDI1SDI4VjMwSDE2VjI1WiIgc3Ryb2tlPSIjNjQ3NDhCIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+'}
                                  alt={product.title || product.name || ''}
                                  className="product-image"
                                  onError={(e) => {
                                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRTJFOEYwIi8+CjxwYXRoIGQ9Ik0yMCAyNUwyMCAxNUgyMEwyMCAyNVoiIHN0cm9rZT0iIzY0NzQ4QiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHBhdGggZD0iTTEyIDI1SDE2TDIwIDIxTDI0IDI1SDI4VjMwSDE2VjI1WiIgc3Ryb2tlPSIjNjQ3NDhCIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';
                                  }}
                                />
                                <div className="product-details">
                                  <div className="product-title">{product.title || product.name || 'İsim tapılmadı'}</div>
                                  <div className="product-description">{product.description}</div>
                                  <div className="product-seller">@{
                                    getSellerDisplayName(product)
                                  }</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="price-info">
                                <div className="current-price">{product.price.toFixed(2)} AZN</div>
                              </div>
                            </td>
                            <td>
                              <span className="category-badge">{product.category?.name || 'Bilinməyən'}</span>
                            </td>
                            <td>
                              <div className="stock-info">
                                <div className="stock-number">{product.stock}</div>
                                <div 
                                  className="stock-status"
                                  style={{ color: getStockColor(product.stock) }}
                                >
                                  {getStockText(product.stock)}
                                </div>
                              </div>
                            </td>
                            <td>
                              <span 
                                className="status-badge"
                                style={{ backgroundColor: getStatusColor(product.status) }}
                              >
                                {getStatusText(product.status)}
                              </span>
                            </td>
                            <td>
                              <div className="stats-mini">
                                <div className="stat-item">
                                  <span>👁️</span>
                                  <span>0</span>
                                </div>
                                <div className="stat-item">
                                  <span>🛒</span>
                                  <span>0</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="rating-display">
                                <span className="rating-stars">⭐</span>
                                <span>0.0</span>
                                <span className="rating-text">(0)</span>
                              </div>
                            </td>
                            <td>
                              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                <div>{formatDate(product.createdAt)}</div>
                                <div style={{ fontSize: '0.75rem' }}>
                                  Yeniləndi: {formatDate(product.updatedAt)}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button
                                  className={`toggle-btn ${product.status === 'ACTIVE' ? 'active' : 'inactive'}`}
                                  onClick={() => handleToggleFeatured(product.id)}
                                  title={product.status === 'ACTIVE' ? 'Seçilmişdən çıxart' : 'Seçilmiş et'}
                                >
                                  {product.featured ? '⭐' : '☆'}
                                </button>
                                <button className="action-btn" onClick={() => handleEditProduct(product)}>
                                  ✏️ Düzəliş
                                </button>
                                <button 
                                  className="action-btn danger"
                                  onClick={() => handleDeleteProduct(product.id, product.title || product.name || 'Məhsul')}
                                  title="Məhsulu sil"
                                >
                                  🗑️ Sil
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Pending Products */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' }}>
                  🔍 Təsdiq Gözləyən Məhsul Tələbləri
                </h3>
                {filteredProducts.filter(p => p.status === 'PENDING').length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">✅</div>
                    <h3>Gözləyən məhsul yoxdur</h3>
                    <p>Hal-hazırda təsdiq gözləyən məhsul tələbləri yoxdur.</p>
                  </div>
                ) : (
                  <div className="products-table-container">
                    <table className="products-table">
                      <thead>
                        <tr>
                          <th>Məhsul</th>
                          <th>Qiymət</th>
                          <th>Kateqoriya</th>
                          <th>Stok</th>
                          <th>Satıcı</th>
                          <th>Göndərmə Tarixi</th>
                          <th>Əməliyyatlar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.filter(p => p.status === 'PENDING').map((product) => (
                          <tr key={product.id}>
                            <td>
                              <div className="product-info">
                                <img
                                  src={product.images?.[0] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRTJFOEYwIi8+CjxwYXRoIGQ9Ik0yMCAyNUwyMCAxNUgyMEwyMCAyNVoiIHN0cm9rZT0iIzY0NzQ4QiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHBhdGggZD0iTTEyIDI1SDE2TDIwIDIxTDI0IDI1SDI4VjMwSDE2VjI1WiIgc3Ryb2tlPSIjNjQ3NDhCIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+'}
                                  alt={product.title || product.name || ''}
                                  className="product-image"
                                  onError={(e) => {
                                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRTJFOEYwIi8+CjxwYXRoIGQ9Ik0yMCAyNUwyMCAxNUgyMEwyMCAyNVoiIHN0cm9rZT0iIzY0NzQ4QiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHBhdGggZD0iTTEyIDI1SDE2TDIwIDIxTDI0IDI1SDI4VjMwSDE2VjI1WiIgc3Ryb2tlPSIjNjQ3NDhCIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';
                                  }}
                                />
                                <div className="product-details">
                                  <div className="product-title">{product.title || product.name || 'İsim tapılmadı'}</div>
                                  <div className="product-description">{product.description}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="current-price">{product.price.toFixed(2)} AZN</div>
                            </td>
                            <td>
                              <span className="category-badge">{product.category?.name || 'Bilinməyən'}</span>
                            </td>
                            <td>
                              <div className="stock-number">{product.stock}</div>
                            </td>
                            <td>
                              <div className="product-seller">@{
                                getSellerDisplayName(product)
                              }</div>
                            </td>
                            <td>
                              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                {formatDate(product.createdAt)}
                              </div>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button
                                  className="action-btn success"
                                  onClick={() => handleApproveProduct(product.id)}
                                >
                                  ✅ Təsdiq Et
                                </button>
                                <button
                                  className="action-btn danger"
                                  onClick={() => handleRejectProduct(product.id)}
                                >
                                  ❌ Rədd Et
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminProductsPage;
