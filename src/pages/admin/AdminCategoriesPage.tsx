import React, { useState, useEffect } from 'react';
import {
  getCategories,
  getCategoryStats,
  createCategory,
  updateCategory,
  toggleCategoryStatus as toggleCategoryStatusAPI,
  deleteCategory as deleteCategoryAPI,
  Category,
  CategoryStats
} from '../../services/adminService';

const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  useEffect(() => {
    fetchCategoriesData();
  }, []);

  const fetchCategoriesData = async () => {
    try {
      setLoading(true);

      // Real API data
      const [categoriesResponse, statsResponse] = await Promise.all([
        getCategories(),
        getCategoryStats()
      ]);

      setCategories(categoriesResponse);
      setCategoryStats(statsResponse);

      console.log('🔍 Categories API Response:', categoriesResponse);
      console.log('🔍 Category Stats API Response:', statsResponse);

    } catch (error) {
      console.error('Kateqoriya məlumatları yüklənmədi:', error);
    
      // Set empty data instead of mock data
      setCategories([]);
      setCategoryStats({
        totalCategories: 0,
        activeCategories: 0,
        totalProductsInCategories: 0,
        topCategoryName: 'N/A',
        topCategoryProductCount: 0,
        averageProductsPerCategory: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && category.isActive) ||
                         (filterStatus === 'inactive' && !category.isActive);
    return matchesSearch && matchesStatus;
  });

  const toggleCategoryStatus = async (categoryId: number) => {
    try {
      await toggleCategoryStatusAPI(categoryId);
      fetchCategoriesData(); // Refresh data after status change
    } catch (error) {
      console.error('Kateqoriya statusu dəyişdirmək mümkün olmadı:', error);
    }
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setModalMode('add');
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setModalMode('edit');
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (window.confirm('Bu kateqoriyanı silmək istədiyinizə əminsiniz?')) {
      try {
        await deleteCategoryAPI(categoryId);
        fetchCategoriesData(); // Refresh data after deletion
      } catch (error) {
        console.error('Kateqoriya silmək mümkün olmadı:', error);
      }
    }
  };

  const handleSaveCategory = async (categoryData: Partial<Category>) => {
    try {
      if (modalMode === 'add') {
        await createCategory({
          name: categoryData.name || '',
          description: categoryData.description || '',
          parentId: categoryData.parentId,
          icon: categoryData.icon,
          color: categoryData.color
        });
      } else if (selectedCategory) {
        await updateCategory(selectedCategory.id, categoryData);
      }
      fetchCategoriesData(); // Refresh data after save
    } catch (error) {
      console.error('Kateqoriya yadda saxlanılmadı:', error);
    } finally {
      setShowCategoryModal(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMainCategories = () => {
    // Since we don't have parent-child structure yet, all categories are main categories
    return filteredCategories;
  };

  const getSubCategories = (parentId: number) => {
    // Since we don't have parent-child structure yet, return empty array
    return [];
  };

  const statsData = categoryStats || {
    totalCategories: 0,
    activeCategories: 0,
    totalProductsInCategories: 0,
    topCategoryName: 'N/A',
    topCategoryProductCount: 0,
    averageProductsPerCategory: 0
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Kateqoriyalar yüklənir...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .categories-dashboard {
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

        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .categories-header {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .categories-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .add-category-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .add-category-btn:hover {
          background: #2563eb;
        }

        .categories-controls {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .controls-row {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .search-input {
          flex: 1;
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

        .filter-select {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.875rem;
          background: white;
          min-width: 150px;
          transition: border-color 0.2s;
        }

        .filter-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .category-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: all 0.2s;
          border-left: 4px solid var(--category-color, #6b7280);
        }

        .category-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .category-header {
          margin-bottom: 1rem;
        }

        .category-icon-title {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .category-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
        }

        .category-info {
          flex: 1;
        }

        .category-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .category-parent {
          font-size: 0.75rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .category-product-count {
          font-size: 0.875rem;
          color: #059669;
          font-weight: 500;
        }

        .category-description {
          color: #6b7280;
          font-size: 0.875rem;
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .category-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .category-status {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .category-status.active {
          background: #dcfce7;
          color: #166534;
        }

        .category-status.inactive {
          background: #fef2f2;
          color: #dc2626;
        }

        .category-date {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .category-actions-row {
          display: flex;
          gap: 0.5rem;
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
          background: #dcfce7;
          color: #166534;
        }

        .toggle-btn.inactive {
          background: #fef2f2;
          color: #dc2626;
        }

        .action-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          flex: 1;
        }

        .action-btn.primary {
          background: #3b82f6;
          color: white;
        }

        .action-btn.primary:hover {
          background: #2563eb;
        }

        .action-btn.danger {
          background: #ef4444;
          color: white;
        }

        .action-btn.danger:hover {
          background: #dc2626;
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

        .category-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6b7280;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: background-color 0.2s;
        }

        .close-btn:hover {
          background: #f3f4f6;
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

        .form-input, .form-select, .form-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.875rem;
          transition: border-color 0.2s;
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .modal-actions {
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }

        .btn-cancel {
          padding: 0.75rem 1.5rem;
          background: #6b7280;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-cancel:hover {
          background: #4b5563;
        }

        .btn-save {
          padding: 0.75rem 1.5rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-save:hover {
          background: #2563eb;
        }

        .loading-container {
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

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }
          
          .categories-grid {
            grid-template-columns: 1fr;
          }
          
          .controls-row {
            flex-direction: column;
            align-items: stretch;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="categories-dashboard">
        <div className="dashboard-header">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📂 Kateqoriya İdarəetməsi
          </h1>
          <p className="text-gray-600">
            Məhsul kateqoriyalarını idarə edin və təşkil edin
          </p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{statsData.totalCategories}</div>
            <div className="stat-label">Ümumi Kateqoriya</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: '#10b981' }}>
              {statsData.activeCategories}
            </div>
            <div className="stat-label">Aktiv Kateqoriya</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {statsData.totalProductsInCategories}
            </div>
            <div className="stat-label">Ümumi Məhsul</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {statsData.averageProductsPerCategory.toFixed(1)}
            </div>
            <div className="stat-label">Orta Məhsul/Kateqoriya</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ fontSize: '1.5rem' }}>
              {statsData.topCategoryName}
            </div>
            <div className="stat-label">Ən Populyar Kateqoriya</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {statsData.topCategoryProductCount}
            </div>
            <div className="stat-label">Ən Çox Məhsul</div>
          </div>
        </div>

        {/* Header */}
        <div className="categories-header">
          <h2 className="categories-title">
            📂 Kateqoriyalar
          </h2>
          <button className="add-category-btn" onClick={handleAddCategory}>
            <span>+</span>
            Yeni Kateqoriya
          </button>
        </div>

        {/* Controls */}
        <div className="categories-controls">
          <div className="controls-row">
            <input
              type="text"
              className="search-input"
              placeholder="🔍 Kateqoriya axtar (ad, təsvir)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Bütün Statuslar</option>
              <option value="active">Aktiv</option>
              <option value="inactive">Qeyri-aktiv</option>
            </select>
          </div>
        </div>

        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">😔</div>
            <h3>Kateqoriya tapılmadı</h3>
            <p>Axtarış kriteriyalarınıza uyğun kateqoriya tapılmadı.</p>
          </div>
        ) : (
          <div className="categories-grid">
            {filteredCategories.map((category) => (
              <div 
                key={category.id} 
                className="category-card"
                style={{ '--category-color': category.color } as React.CSSProperties}
              >
                <div className="category-header">
                  <div className="category-icon-title">
                    <div 
                      className="category-icon"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.icon}
                    </div>
                    <div className="category-info">
                      <div className="category-name">{category.name}</div>
                      {category.parentName && (
                        <div className="category-parent">Alt kateqoriya: {category.parentName}</div>
                      )}
                      <div className="category-product-count">
                        {category.productCount} məhsul
                      </div>
                    </div>
                  </div>
                </div>

                <div className="category-description">
                  {category.description}
                </div>

                <div className="category-meta">
                  <span className={`category-status ${category.isActive ? 'active' : 'inactive'}`}>
                    {category.isActive ? 'Aktiv' : 'Qeyri-aktiv'}
                  </span>
                  <div className="category-date">
                    {formatDate(category.updatedAt)}
                  </div>
                </div>

                <div className="category-actions-row">
                  <button
                    className={`toggle-btn ${category.isActive ? 'active' : 'inactive'}`}
                    onClick={() => toggleCategoryStatus(category.id)}
                    title={category.isActive ? 'Qeyri-aktiv et' : 'Aktiv et'}
                  >
                    {category.isActive ? '🔓' : '🔒'}
                  </button>
                  <button
                    className="action-btn primary"
                    onClick={() => handleEditCategory(category)}
                  >
                    ✏️ Düzəliş
                  </button>
                  <button
                    className="action-btn danger"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    🗑️ Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Category Modal */}
        {showCategoryModal && (
          <div className="category-modal" onClick={() => setShowCategoryModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">
                  {modalMode === 'add' ? 'Yeni Kateqoriya' : 'Kateqoriya Düzəliş'}
                </h3>
                <button className="close-btn" onClick={() => setShowCategoryModal(false)}>
                  ×
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const categoryData = {
                    name: formData.get('name') as string,
                    description: formData.get('description') as string,
                    parentId: formData.get('parentId') ? parseInt(formData.get('parentId') as string) : undefined,
                    icon: formData.get('icon') as string,
                    color: formData.get('color') as string,
                  };
                  handleSaveCategory(categoryData);
                }}
              >
                <div className="form-group">
                  <label className="form-label">Kateqoriya Adı *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    defaultValue={selectedCategory?.name || ''}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Təsvir</label>
                  <textarea
                    name="description"
                    className="form-textarea"
                    defaultValue={selectedCategory?.description || ''}
                    placeholder="Kateqoriya haqqında qısa təsvir..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Əsas Kateqoriya</label>
                  <select
                    name="parentId"
                    className="form-select"
                    defaultValue={selectedCategory?.parentId || ''}
                  >
                    <option value="">Əsas kateqoriya</option>
                    {getMainCategories().map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">İkon</label>
                    <input
                      type="text"
                      name="icon"
                      className="form-input"
                      defaultValue={selectedCategory?.icon || '📦'}
                      placeholder="📦"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rəng</label>
                    <input
                      type="color"
                      name="color"
                      className="form-input"
                      defaultValue={selectedCategory?.color || '#6b7280'}
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowCategoryModal(false)}>
                    Ləğv et
                  </button>
                  <button type="submit" className="btn-save">
                    {modalMode === 'add' ? 'Əlavə et' : 'Yadda saxla'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminCategoriesPage; 