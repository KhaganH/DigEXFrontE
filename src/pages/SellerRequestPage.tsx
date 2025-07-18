import React, { useState, useContext } from 'react';
import { AlertContext } from '../App';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../services/api';

interface SellerRequestForm {
  storeName: string;
  storeDescription: string;
  phoneNumber: string;
  category: string;
  experience: string;
  website: string;
  socialMedia: string;
  motivation: string;
  termsAccepted: boolean;
  commissionAccepted: boolean;
}

const SellerRequestPage: React.FC = () => {
  const { user } = useAuth();
  const { showAlert } = useContext(AlertContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  
  const [form, setForm] = useState<SellerRequestForm>({
    storeName: '',
    storeDescription: '',
    phoneNumber: '',
    category: '',
    experience: '',
    website: '',
    socialMedia: '',
    motivation: '',
    termsAccepted: false,
    commissionAccepted: false
  });

  // Check if user can access this page
  React.useEffect(() => {
    if (!user) return;
    
    // Redirect if user is already seller or admin
    if (user.role === 'SELLER' || user.role === 'ADMIN') {
      window.location.href = '/seller/dashboard';
      return;
    }
    
    // Check for pending request
    checkPendingRequest();
  }, [user]);

  const checkPendingRequest = async () => {
    try {
      // API endpoint yoxdur, ona görə başqa yolla yoxlayaq
      setHasPendingRequest(false); // Hələlik false saxlayaq
    } catch (error) {
      console.error('Error checking pending request:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.termsAccepted || !form.commissionAccepted) {
      showAlert('error', 'Lütfən şərtləri qəbul edin');
      return;
    }
    
    if (form.storeDescription.length < 50) {
      showAlert('error', 'Mağaza təsviri ən az 50 simvol olmalıdır');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get current user info
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        showAlert('error', 'İstifadəçi məlumatları tapılmadı');
        return;
      }
      
      const user = JSON.parse(userStr);
      
      // Use the proper REST API endpoint
      const response = await fetch(`http://localhost:1111/api/users/${user.id}/request-seller?storeName=${encodeURIComponent(form.storeName)}&storeDescription=${encodeURIComponent(form.storeDescription)}&phoneNumber=${encodeURIComponent(form.phoneNumber)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        showAlert('success', 'Satıcı müraciətiniz uğurla göndərildi! Təsdiq gözlənilir.');
        setHasPendingRequest(true);
        // Reset form
        setForm({
          storeName: '',
          storeDescription: '',
          phoneNumber: '',
          category: '',
          experience: '',
          website: '',
          socialMedia: '',
          motivation: '',
          termsAccepted: false,
          commissionAccepted: false
        });
      } else {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        showAlert('error', 'Müraciət göndərilərkən xəta baş verdi');
      }
    } catch (error) {
      console.error('Error submitting seller request:', error);
      showAlert('error', 'Müraciət göndərilərkən xəta baş verdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only show for USER and ADMIN roles (allow admin to test)
  if (!user || (user.role !== 'USER' && user.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Girişə icazə yoxdur</h2>
          <p className="mt-2 text-gray-600">Bu səhifəyə giriş icazəniz yoxdur.</p>
        </div>
      </div>
    );
  }

  if (hasPendingRequest) {
    return (
      <>
        <style>{`
          .pending-request-page {
            background: linear-gradient(135deg, #fef5e7 0%, #fed7aa 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }

          .pending-card {
            background: white;
            border-radius: 24px;
            padding: 3rem;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 600px;
            width: 100%;
            position: relative;
            overflow: hidden;
          }

          .pending-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(135deg, #f6ad55, #ed8936);
          }

          .pending-icon {
            font-size: 5rem;
            color: #f6ad55;
            margin-bottom: 1.5rem;
            animation: pulse 2s infinite;
          }

          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }

          .pending-title {
            font-size: 2.5rem;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 1rem;
          }

          .pending-subtitle {
            font-size: 1.1rem;
            color: #718096;
            margin-bottom: 2rem;
            line-height: 1.6;
          }

          .pending-details {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 16px;
            padding: 2rem;
            margin-bottom: 2rem;
            border: 2px solid #fed7aa;
          }

          .pending-details h4 {
            color: #2d3748;
            margin-bottom: 1rem;
            font-size: 1.25rem;
            font-weight: 600;
          }

          .pending-details p {
            color: #4a5568;
            margin-bottom: 0.5rem;
            font-size: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .status-badge {
            background: linear-gradient(135deg, #f6ad55, #ed8936);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 50px;
            font-weight: 600;
            font-size: 1rem;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 2rem;
            box-shadow: 0 4px 12px rgba(246, 173, 85, 0.3);
          }

          .info-box {
            background: rgba(102, 126, 234, 0.1);
            border: 2px solid rgba(102, 126, 234, 0.2);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 2rem;
          }

          .info-box p {
            color: #4a5568;
            margin: 0;
            font-size: 1rem;
            font-weight: 500;
          }

          .back-btn {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 0.75rem 2rem;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1rem;
          }

          .back-btn:hover {
            background: linear-gradient(135deg, #5a67d8, #6b46c1);
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
          }

          @media (max-width: 768px) {
            .pending-card {
              padding: 2rem;
            }
            
            .pending-title {
              font-size: 2rem;
            }
            
            .pending-icon {
              font-size: 4rem;
            }
          }
        `}</style>

        <div className="pending-request-page">
          <div className="pending-card">
            <div className="pending-icon">
              <i className="bi bi-hourglass-split"></i>
            </div>
            
            <h1 className="pending-title">Tələbiniz İncelənir</h1>
            
            <p className="pending-subtitle">
              Satıcı olmaq üçün müracietiniz uğurla göndərildi və hazırda adminlər tərəfindən yoxlanılır
            </p>

            <div className="status-badge">
              <i className="bi bi-clock"></i>
              Gözləmə Vəziyyəti
            </div>

            <div className="pending-details">
              <h4>
                <i className="bi bi-list-check me-2"></i>
                Proses Addımları
              </h4>
              <p>
                <i className="bi bi-check-circle text-success"></i>
                Müraciet göndərildi
              </p>
              <p>
                <i className="bi bi-hourglass-split text-warning"></i>
                Admin yoxlaması (cari mərhələ)
              </p>
              <p>
                <i className="bi bi-circle text-muted"></i>
                Hesab uyğunluğu təsdiq edilir
              </p>
              <p>
                <i className="bi bi-circle text-muted"></i>
                Satıcı hüquqları aktivləşir
              </p>
            </div>

            <div className="info-box">
              <p>
                <i className="bi bi-info-circle me-2"></i>
                Təsdiq edildikdən sonra email vasitəsilə məlumatlandırılacaqsınız.
                Proses 24-48 saat ərzində tamamlanacaq.
              </p>
            </div>

            <button
              className="back-btn"
              onClick={() => window.location.href = '/'}
            >
              <i className="bi bi-arrow-left"></i>
              Ana Səhifəyə Qayıt
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">Satıcı Olun</h1>
          <p className="text-xl text-gray-600">DiGex platformasında satıcı olaraq gəlir əldə etməyə başlayın</p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Yüksək Gəlir</h3>
            <p className="text-gray-600">Satışlarınızdan %90 gəlir əldə edin</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Geniş Kütlə</h3>
            <p className="text-gray-600">Minlərlə aktiv alıcıya çatın</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Təhlükəsiz Platforma</h3>
            <p className="text-gray-600">Ödənişləriniz qorunur və vaxtında ödənilir</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="bg-blue-600 text-white p-6 rounded-t-lg">
            <h2 className="text-2xl font-bold">Satıcı Müraciət Formu</h2>
          </div>
          
          <div className="p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                <div>
                  <p className="font-medium text-blue-800">Diqqət:</p>
                  <p className="text-blue-700 text-sm">Müraciətiniz administrasiya tərəfindən yoxlanılacaq. Nəticə 2-3 iş günü ərzində e-poçt ilə bildiriləcəkdir.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-2">
                    Mağaza Adı *
                  </label>
                  <input
                    type="text"
                    id="storeName"
                    name="storeName"
                    value={form.storeName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mağazanızın adını daxil edin"
                  />
                  <p className="text-xs text-gray-500 mt-1">Bu ad alıcılar tərəfindən görüləcək</p>
                </div>
                
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon Nömrəsi *
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+994 55 123 45 67"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Əsas Kateqoriya
                </label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Kateqoriya seçin</option>
                  <option value="software">Proqram təminatı</option>
                  <option value="games">Oyunlar</option>
                  <option value="ebooks">E-kitablar</option>
                  <option value="music">Musiqi</option>
                  <option value="courses">Kurslar</option>
                  <option value="templates">Şablonlar</option>
                  <option value="graphics">Qrafika</option>
                  <option value="other">Digər</option>
                </select>
              </div>

              <div>
                <label htmlFor="storeDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Mağaza Təsviri *
                </label>
                <textarea
                  id="storeDescription"
                  name="storeDescription"
                  value={form.storeDescription}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mağazanız və təqdim etdiyiniz məhsullar haqqında məlumat verin..."
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 50 simvol ({form.storeDescription.length}/50)</p>
              </div>

              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                  Təcrübə
                </label>
                <select
                  id="experience"
                  name="experience"
                  value={form.experience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Təcrübə müddətinizi seçin</option>
                  <option value="beginner">Yeni başlayan</option>
                  <option value="1-2-years">1-2 il</option>
                  <option value="3-5-years">3-5 il</option>
                  <option value="5-plus-years">5+ il</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                    Veb sayt/Portfolio
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={form.website}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">İstəyə bağlı</p>
                </div>
                
                <div>
                  <label htmlFor="socialMedia" className="block text-sm font-medium text-gray-700 mb-2">
                    Sosial Media
                  </label>
                  <input
                    type="text"
                    id="socialMedia"
                    name="socialMedia"
                    value={form.socialMedia}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Instagram, Facebook hesabları"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="motivation" className="block text-sm font-medium text-gray-700 mb-2">
                  Niyə satıcı olmaq istəyirsiniz?
                </label>
                <textarea
                  id="motivation"
                  name="motivation"
                  value={form.motivation}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Motivasiyanızı qısaca izah edin..."
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="termsAccepted"
                    name="termsAccepted"
                    checked={form.termsAccepted}
                    onChange={handleInputChange}
                    required
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="termsAccepted" className="ml-2 text-sm text-gray-700">
                    <a href="/seller-terms" target="_blank" className="text-blue-600 hover:underline">
                      Satıcı şərtlərini
                    </a> oxudum və qəbul edirəm *
                  </label>
                </div>
                
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="commissionAccepted"
                    name="commissionAccepted"
                    checked={form.commissionAccepted}
                    onChange={handleInputChange}
                    required
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="commissionAccepted" className="ml-2 text-sm text-gray-700">
                    Satışlarımdan %10 komissiya kəsiləcəyini başa düşürəm və qəbul edirəm *
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Geri Qayıt
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Göndərilir...' : 'Müraciət Göndər'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Tez-tez Verilən Suallar</h3>
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2">Satıcı müraciətim nə qədər müddətdə cavablanacaq?</h4>
                <p className="text-gray-600">Müraciətiniz 2-3 iş günü ərzində administrasiya tərəfindən yoxlanılacaq və nəticə e-poçt ilə bildiriləcəkdir.</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2">Komissiya faizi nə qədərdir?</h4>
                <p className="text-gray-600">DiGex platformasında satışlarınızdan %10 komissiya kəsilir. Yəni satış qiymətinin %90-ı sizin gəliriniz olur.</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2">Gəlirlərim nə vaxt ödənilir?</h4>
                <p className="text-gray-600">Satışlarınız dərhal hesabınıza köçürülür. İstədiyiniz vaxt balansınızdan pul çəkə bilərsiniz.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerRequestPage; 
 