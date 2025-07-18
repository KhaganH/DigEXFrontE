import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { apiClient } from '../../services/api';
import CloudinaryUpload from '../../components/CloudinaryUpload';
import { CloudinaryUploadResponse } from '../../services/cloudinaryService';
import { categoryService } from '../../services/categoryService';
import { CLOUDINARY_CONFIG } from '../../constants';

interface Category {
  id: number;
  name: string;
}

interface ProductForm {
  title: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  cloudinaryImages: CloudinaryUploadResponse[];
  deliveryType: 'manual' | 'stock';
  stockCodes: string;
  manualInstructions: string;
  maxUsageCount: number;
  stockType: 'single' | 'reusable';
  code: string;
  fileUrl: string;
}

const SellerAddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [formData, setFormData] = useState<ProductForm>({
    title: '',
    description: '',
    price: 0,
    stock: 1,
    categoryId: 0,
    cloudinaryImages: [],
    deliveryType: 'manual',
    stockCodes: '',
    manualInstructions: '',
    maxUsageCount: 5,
    stockType: 'single',
    code: '',
    fileUrl: ''
  });

  // Authentication check
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      if (user?.role !== 'SELLER') {
        navigate('/');
        return;
      }

      fetchCategories();
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response);
    } catch (err) {
      setError('Kategoriler yüklənərkən xəta baş verdi');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Stok kodları için duplikasyon kontrolü
    if (name === 'stockCodes') {
      const lines = value.split('\n').filter(line => line.trim());
      const uniqueLines = [...new Set(lines)];
      
      if (lines.length !== uniqueLines.length) {
        setError('⚠️ Eyni stok kodu birdən çox dəfə yazılıb! Zəhmət olmasa təkrarlanan kodları silin.');
      } else {
        setError(null);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleCloudinaryUploadSuccess = (result: CloudinaryUploadResponse) => {
    setFormData(prev => ({
      ...prev,
      cloudinaryImages: [...prev.cloudinaryImages, result]
    }));
    setError(null);
  };

  const handleCloudinaryUploadError = (error: string) => {
    setError(error);
  };

  const removeCloudinaryImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      cloudinaryImages: prev.cloudinaryImages.filter((_, index) => index !== indexToRemove)
    }));
  };

  const getStockCount = () => {
    if (formData.deliveryType !== 'stock') return { codes: 0, totalSales: 0 };
    
    const codes = formData.stockCodes.trim().split('\n').filter(line => line.trim());
    const validCodes = codes.filter(line => line.trim().length > 0);
    
    let totalSales = validCodes.length;
    if (formData.stockType === 'reusable') {
      totalSales = validCodes.length * formData.maxUsageCount;
    }
    
    return {
      codes: validCodes.length,
      totalSales
    };
  };

  const validateStockCodes = () => {
    if (formData.deliveryType !== 'stock') return { valid: true, message: '' };
    
    const codes = formData.stockCodes.trim().split('\n').filter(line => line.trim());
    const validCodes = codes.filter(line => line.trim().length > 0);
    
    if (validCodes.length === 0) {
      return { valid: false, message: 'Ən azı bir stok kodu daxil etməlisiniz' };
    }
    
    const uniqueCodes = new Set(validCodes);
    if (validCodes.length !== uniqueCodes.size) {
      return { valid: false, message: 'Təkrarlanan stok kodları mövcuddur' };
    }
    
    if (validCodes.length > 1000) {
      return { valid: false, message: 'Maksimum 1000 stok kodu əlavə edə bilərsiniz' };
    }
    
    return { valid: true, message: '' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.description || formData.price <= 0 || formData.categoryId === 0) {
      setError('Bütün məcburi sahələri doldurun');
      return;
    }

    if (formData.price < 0.01) {
      setError('Qiymət minimum 0.01 AZN olmalıdır');
      return;
    }

    if (!termsAccepted) {
      setError('Satış şərtlərini qəbul etməlisiniz');
      return;
    }

    // Delivery type specific validation
    if (formData.deliveryType === 'manual') {
      if (formData.stock < 0) {
        setError('Manuel teslimat üçün stok miqdarını daxil etməlisiniz (minimum 0)');
        return;
      }
      if (formData.stock > 9999) {
        setError('Maksimum stok miqdarı 9999 olmalıdır');
        return;
      }
    } else if (formData.deliveryType === 'stock') {
      const stockValidation = validateStockCodes();
      if (!stockValidation.valid) {
        setError(stockValidation.message);
        return;
      }
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const productData = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        categoryId: formData.categoryId,
        code: formData.code || formData.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        deliveryType: formData.deliveryType,
        stockType: formData.deliveryType === 'stock' ? formData.stockType : 'manual',
        manualInstructions: formData.manualInstructions,
        fileUrl: formData.fileUrl,
        // Cloudinary image data
        imageUrl: formData.cloudinaryImages[0]?.url || '',
        imagePublicId: formData.cloudinaryImages[0]?.publicId || '',
        // Additional images if any
        additionalImages: formData.cloudinaryImages.slice(1).map(img => ({
          url: img.url,
          publicId: img.publicId
        })),
        // Stock information - always send both fields for backend compatibility
        stock: formData.deliveryType === 'manual' ? formData.stock : getStockCount().codes,
        manualStock: formData.deliveryType === 'manual' ? formData.stock : 0,
        // Stock codes for stock delivery type
        ...(formData.deliveryType === 'stock' ? {
          stockCodes: formData.stockCodes,
          stockType: formData.stockType,
          ...(formData.stockType === 'reusable' ? { maxUsageCount: formData.maxUsageCount } : {})
        } : {})
      };

      console.log('🚀 Sending product data:', productData);

      const response = await apiClient.post('/api/seller/products/create-cloudinary', productData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Response received:', response);

      // Check if response indicates success (even if status is not perfectly 200)
      if (response && ((response as any).success !== false)) {
        setSuccess('Məhsul uğurla əlavə edildi! Admin tərəfindən təsdiqləndikcən satışa çıxacaq.');
        // Redirect to products page after 3 seconds
        setTimeout(() => {
          navigate('/seller/products');
        }, 3000);
      } else {
        setError((response as any)?.message || 'Məhsul əlavə edilərkən xəta baş verdi');
      }
    } catch (err: any) {
      console.error('❌ Error creating product:', err);
      
      // Check if the error actually indicates success (common with Spring Boot)
      if (err.response?.status === 200 || err.response?.status === 201) {
        setSuccess('Məhsul uğurla əlavə edildi! Admin tərəfindən təsdiqləndikcən satışa çıxacaq.');
        setTimeout(() => {
          navigate('/seller/products');
        }, 3000);
      } else {
        setError(err.response?.data?.message || err.message || 'Məhsul əlavə edilərkən xəta baş verdi');
      }
    } finally {
      setLoading(false);
    }
  };

  // Loading state
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

  // Not authenticated
  if (!isAuthenticated || user?.role !== 'SELLER') {
    return null;
  }

  const stockCount = getStockCount();
  const stockValidation = validateStockCodes();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center">
              <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Yeni Məhsul Əlavə Et
            </h2>
            <p className="text-gray-600 mt-1">Rəqəmsal məhsulunuzu platformaya əlavə edin və satışa başlayın</p>
          </div>
          <Link to="/seller/products" className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Geri Qayıt
          </Link>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Məhsul Məlumatları
                </h3>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Product Title */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Məhsul Adı *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Məsələn: Steam 50$ Gift Card"
                      required
                      maxLength={200}
                    />
                    <small className="text-gray-500">Məhsulunuzun aydın və cəlbedici adını daxil edin (maksimum 200 karakter)</small>
                    <div className="text-right text-sm text-gray-500 mt-1">{formData.title.length}/200</div>
                  </div>

                  {/* Product Description */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Məhsul Təsviri *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Məhsulunuzun ətraflı təsvirini yazın..."
                      required
                      maxLength={2000}
                    />
                    <small className="text-gray-500">Alıcıların məhsulunuzu daha yaxşı başa düşməsi üçün ətraflı məlumat verin (maksimum 2000 karakter)</small>
                    <div className="text-right text-sm text-gray-500 mt-1">{formData.description.length}/2000</div>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Qiymət (AZN) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">₼</span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0.01"
                        max="9999.99"
                        className="w-full pl-8 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <small className="text-gray-500">Minimum qiymət: 0.01 AZN</small>
                  </div>

                  {/* Delivery Type */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      Teslimat Türü *
                    </label>
                    
                    <select
                      name="deliveryType"
                      value={formData.deliveryType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="manual">Manuel Teslimat (Satıcı teslim edir)</option>
                      <option value="stock">Stok Teslimat (Avtomatik teslim)</option>
                    </select>
                    <small className="text-gray-500">Manuel teslimatda stok miktarı belirlersiniz, stok teslimatda kodları yazarsınız</small>

                    {/* Manual Delivery Area */}
                    {formData.deliveryType === 'manual' && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center mb-3">
                          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <strong className="text-blue-800">Manuel Teslimat:</strong>
                          <span className="text-blue-700 ml-1">Sipariş gəldikdə sizə bildiriş gələcək. Satıcı panelindən siparişi teslim etməlisiniz.</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Stok Miqdarı *</label>
                            <input
                              type="number"
                              name="stock"
                              value={formData.stock}
                              onChange={handleInputChange}
                              min="0"
                              max="9999"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="20"
                              required
                            />
                            <small className="text-gray-500">Neçə dənə satmaq istəyirsiniz?</small>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <label className="block text-sm font-bold text-gray-700 mb-2">Alıcıya Təlimat (İsteğe bağlı)</label>
                          <textarea
                            name="manualInstructions"
                            value={formData.manualInstructions}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Alıcıya təlimat yazın - necə əlaqə saxlamalı, hansı məlumatları göndərməli və s."
                          />
                          <small className="text-gray-500">Bu təlimatlar sipariş zamanı alıcıya göstəriləcək</small>
                        </div>
                      </div>
                    )}

                    {/* Stock Delivery Area */}
                    {formData.deliveryType === 'stock' && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center mb-3">
                          <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <strong className="text-green-800">Stok Teslimat:</strong>
                          <span className="text-green-700 ml-1">Hər sətirdə bir stok kodu yazın. Alıcı məhsulu aldıqda avtomatik teslim ediləcək.</span>
                        </div>
                        
                        {/* Stock Type Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Stok Növü</label>
                            <select
                              name="stockType"
                              value={formData.stockType}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                              <option value="single">Tək İstifadəlik (Steam key, lisenziya)</option>
                              <option value="reusable">Paylaşımlı (Family Sharing hesab)</option>
                            </select>
                          </div>
                          {formData.stockType === 'reusable' && (
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2">Maksimum İstifadə Sayı</label>
                              <input
                                type="number"
                                name="maxUsageCount"
                                value={formData.maxUsageCount}
                                onChange={handleInputChange}
                                min="2"
                                max="50"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="5"
                              />
                              <small className="text-gray-500">Neçə nəfər bu hesabı istifadə edə bilər?</small>
                            </div>
                          )}
                        </div>
                        
                        {/* Stock Codes Input */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-bold text-gray-700">Stok Kodları</label>
                            <small className="text-gray-500">
                              Əlavə edilən: {stockCount.codes} kod
                              {formData.stockType === 'reusable' && stockCount.codes > 0 && (
                                <span className="text-green-600"> ({stockCount.totalSales} satış)</span>
                              )}
                            </small>
                          </div>
                          
                          <textarea
                            name="stockCodes"
                            value={formData.stockCodes}
                            onChange={handleInputChange}
                            rows={8}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 transition-colors ${
                              stockValidation.valid 
                                ? 'border-gray-300 focus:ring-green-500 focus:border-green-500' 
                                : 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            }`}
                            placeholder={
                              formData.stockType === 'reusable' 
                                ? "Hər sətirdə bir hesab:\nusername1:password1\nusername2:password2\n..." 
                                : "Hər sətirdə bir stok kodu:\nGAME-KEY-001\nGAME-KEY-002\nGAME-KEY-003\n..."
                            }
                          />
                          
                          {/* Stock Validation Alert */}
                          {formData.stockCodes.trim() && (
                            <div className={`mt-3 p-3 rounded-lg ${
                              stockValidation.valid 
                                ? 'bg-green-50 border border-green-200' 
                                : 'bg-red-50 border border-red-200'
                            }`}>
                              <div className="flex items-center">
                                {stockValidation.valid ? (
                                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                                <span className={`text-sm ${stockValidation.valid ? 'text-green-700' : 'text-red-700'}`}>
                                  {stockValidation.valid 
                                    ? `Hazır: ${stockCount.codes} ${formData.stockType === 'reusable' ? `paylaşımlı kod (${stockCount.totalSales} satış kapasitesi)` : 'tək istifadəlik kod'}.`
                                    : stockValidation.message
                                  }
                                </span>
                              </div>
                            </div>
                          )}
                          
                          <small className="text-gray-500">
                            Hər sətirdə bir kod yazın. Steam açarları, hesab məlumatları (username:password) və ya digər məhsul kodları
                          </small>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Code */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Məhsul Təsviri/Açar (İsteğe bağlı)
                    </label>
                    <textarea
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Məhsul haqqında əlavə məlumat, xüsusiyyətlər və ya ümumi təsvir..."
                      maxLength={1000}
                    />
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-blue-800">
                          <strong>Qeyd:</strong> Bu sahə məhsul haqqında ümumi məlumat üçündür. Stok kodları yuxarıdakı xüsusi sahədə əlavə edilir.
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500 mt-1">{formData.code.length}/1000</div>
                  </div>

                  {/* File URL */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Məhsul Faylı (İsteğe bağlı)
                    </label>
                    <input
                      type="url"
                      name="fileUrl"
                      value={formData.fileUrl}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/file.zip"
                      maxLength={500}
                    />
                    <small className="text-gray-500">Yükləmə linki, ZIP fayl və ya digər rəqəmsal məhsul linkini daxil edin (maksimum 500 karakter)</small>
                    <div className="text-right text-sm text-gray-500 mt-1">{formData.fileUrl.length}/500</div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Məhsul Şəkli (İsteğe bağlı)
                    </label>
                                         <CloudinaryUpload
                       onUploadSuccess={handleCloudinaryUploadSuccess}
                       onUploadError={handleCloudinaryUploadError}
                       folder="products"
                     />
                    <small className="text-gray-500">JPG, PNG, GIF formatlarında şəkil yükləyin (maksimum 5MB)</small>
                    
                    {/* Image Preview */}
                    {formData.cloudinaryImages.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4">
                        {formData.cloudinaryImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={image.url} 
                              alt={`Şəkil ${index + 1}`} 
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeCloudinaryImage(index)}
                              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Kateqoriya *
                    </label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    >
                      <option value={0}>Kateqoriya seçin...</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <small className="text-gray-500">Məhsulunuzun uyğun kateqoriyasını seçin</small>
                  </div>

                  {/* Terms */}
                  <div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        required
                      />
                      <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                        <Link to="/terms" target="_blank" className="text-blue-600 hover:text-blue-800">Satış şərtləri</Link> və{' '}
                        <Link to="/privacy" target="_blank" className="text-blue-600 hover:text-blue-800">məxfilik siyasətini</Link> qəbul edirəm *
                      </label>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center text-lg font-medium"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Məhsul əlavə edilir...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Məhsulu Əlavə Et
                        </>
                      )}
                    </button>
                    <Link
                      to="/seller/products"
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-colors flex items-center justify-center text-lg font-medium"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Ləğv Et
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Help Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg overflow-hidden sticky top-8">
              <div className="px-6 py-4 border-b border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Yardım və Məsləhətlər
                </h3>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="font-bold text-blue-900 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Stok Kodu Sistemi
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">İki növ stok sistemi mövcuddur:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>Tək İstifadəlik:</strong> Steam açarları, lisenziya kodları</li>
                    <li>• <strong>Paylaşımlı:</strong> Family Sharing hesabları (1 hesab → çoxlu alıcı)</li>
                    <li>• Paylaşımlı hesablar maksimum 50 nəfərə satıla bilər</li>
                    <li>• Hər sətirdə yalnız bir kod/hesab</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-green-900 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Paylaşımlı Hesab Nümunəsi
                  </h4>
                  <div className="bg-white p-3 rounded-lg border text-sm font-mono">
                    steamuser1:password123<br/>
                    steamuser2:password456<br/>
                    epicgamer:mypass789
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    ↑ Bu 3 hesab, hər biri 5 nəfərə satılırsa = 15 satış
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-purple-900 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Təhlükəsizlik
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Stok kodları şifrələnərək saxlanılır</li>
                    <li>• Yalnız satış zamanı alıcıya göstərilir</li>
                    <li>• Hər kod yalnız bir dəfə istifadə edilir</li>
                    <li>• İstifadə olunmuş kodlar silinmir, qeyd edilir</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-yellow-900 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Keyfiyyət Məsləhətləri
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Aydın və cəlbedici başlıq yazın</li>
                    <li>• Ətraflı məhsul təsviri əlavə edin</li>
                    <li>• Yüksək keyfiyyətli şəkil yükləyin</li>
                    <li>• Doğru kateqoriya seçin</li>
                    <li>• Rəqabətcil qiymət təyin edin</li>
                  </ul>
                </div>

                <div className="bg-blue-100 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-blue-800">
                      <strong>Qeyd:</strong> Məhsulunuz əlavə edildikdən sonra admin tərəfindən təsdiqlənməlidir.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerAddProductPage; 