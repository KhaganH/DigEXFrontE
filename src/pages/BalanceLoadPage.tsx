import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Alert from '../components/Alert';
import CloudinaryUpload from '../components/CloudinaryUpload';
import balanceLoadService, { PaymentMethod, BalanceRequest } from '../services/balanceLoadService';
import { CloudinaryUploadResponse } from '../services/cloudinaryService';
import { CLOUDINARY_CONFIG } from '../constants';

const BalanceLoadPage: React.FC = () => {
  const { user, balance, isAuthenticated, isLoading: authLoading } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptCloudinaryData, setReceiptCloudinaryData] = useState<CloudinaryUploadResponse | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // C2C sistem limitləri
  const [dailyLimits, setDailyLimits] = useState({
    maxAmount: 1000,
    maxRequests: 5,
    usedAmount: 0,
    usedRequests: 0
  });

  // API'den gelen data
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [userRequests, setUserRequests] = useState<BalanceRequest[]>([]);

  // API'den verileri yükle
  useEffect(() => {
    const fetchData = async () => {
      // Sadece authenticate olmuş kullanıcılar için veri yükle
      if (!isAuthenticated) {
        return;
      }

      try {
        setLoading(true);
        
        // Ödəmə üsullarını və istifadəçi tələblərini paralel yüklə
        const [paymentMethodsData, userRequestsData] = await Promise.all([
          balanceLoadService.getPaymentMethods(),
          balanceLoadService.getRecentBalanceRequests()
        ]);
        
        // Ensure we have arrays
        const paymentMethods = Array.isArray(paymentMethodsData) ? paymentMethodsData : [];
        const userRequests = Array.isArray(userRequestsData) ? userRequestsData : [];
        
        setPaymentMethods(paymentMethods);
        setUserRequests(userRequests);
        
        // Günlük limitləri hesabla
        calculateDailyLimits(userRequests);
        
      } catch (err) {
        setError('Məlumatlar yüklənərkən xəta baş verdi');
        console.error('Error loading data:', err);
        
        // Set default empty arrays to prevent map errors
        setPaymentMethods([]);
        setUserRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  // Günlük limitləri hesabla
  const calculateDailyLimits = (requests: BalanceRequest[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysRequests = requests.filter(request => {
      const requestDate = new Date(request.createdAt);
      requestDate.setHours(0, 0, 0, 0);
      return requestDate.getTime() === today.getTime();
    });
    
    const usedAmount = todaysRequests
      .filter(r => r.status === 'PENDING' || r.status === 'APPROVED')
      .reduce((sum, r) => sum + r.amount, 0);
    
    const usedRequests = todaysRequests
      .filter(r => r.status === 'PENDING')
      .length;
    
    setDailyLimits({
      maxAmount: 1000,
      maxRequests: 5,
      usedAmount,
      usedRequests
    });
  };

  const handleCloudinaryUploadSuccess = (result: CloudinaryUploadResponse) => {
    setReceiptCloudinaryData(result);
    setError(null);
  };

  const handleCloudinaryUploadError = (error: string) => {
    setError(error);
    setReceiptCloudinaryData(null);
  };

  const clearImage = () => {
    setReceiptFile(null);
    setReceiptCloudinaryData(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const requestAmount = parseFloat(amount);
    
    // C2C validasiyaları
    if (!amount || requestAmount < 5 || requestAmount > 5000) {
      setError('Məbləğ 5-5000 AZN arasında olmalıdır');
      return;
    }
    
    if (!selectedPaymentMethod) {
      setError('Ödəmə üsulunu seçin');
      return;
    }
    
    if (!receiptCloudinaryData) {
      setError('Dekont şəklini yükləyin');
      return;
    }
    
    if (!termsAccepted) {
      setError('Şərtlər və qaydaları qəbul etməlisiniz');
      return;
    }
    
    // Günlük limitləri yoxla
    if (dailyLimits.usedRequests >= dailyLimits.maxRequests) {
      setError(`Günlük maksimum ${dailyLimits.maxRequests} tələb göndərə bilərsiniz. Sabah yenidən cəhd edin.`);
      return;
    }
    
    if (dailyLimits.usedAmount + requestAmount > dailyLimits.maxAmount) {
      const remaining = dailyLimits.maxAmount - dailyLimits.usedAmount;
      setError(`Günlük limit aşılır. Maksimum ${remaining.toFixed(2)} AZN əlavə edə bilərsiniz.`);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Submit data
      if (!receiptCloudinaryData?.url || !receiptCloudinaryData?.publicId) {
        setError('Dekont yükləmə məlumatı tapılmadı');
        return;
      }
      
      // API'ye tələb göndər - Cloudinary version
      const response = await balanceLoadService.submitBalanceRequestWithCloudinary(
        requestAmount,
        selectedPaymentMethod,
        receiptCloudinaryData.url!,
        receiptCloudinaryData.publicId!
      );
      
      setSuccess(response.message);
      
      // Form reset
      setAmount('');
      setSelectedPaymentMethod(null);
      setReceiptFile(null);
      setReceiptCloudinaryData(null);
      setPreviewUrl(null);
      setTermsAccepted(false);
      clearImage();
      
      // Yeni tələbi siyahıya əlavə et və limitləri yenilə
      const updatedRequests = await balanceLoadService.getRecentBalanceRequests();
      setUserRequests(updatedRequests);
      calculateDailyLimits(updatedRequests);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Tələb göndərilərkən xəta baş verdi';
      setError(errorMessage);
      
      // Əgər limit xətası varsa, məlumatları yenilə
      if (errorMessage.includes('limit') || errorMessage.includes('maksimum')) {
        const updatedRequests = await balanceLoadService.getRecentBalanceRequests();
        setUserRequests(updatedRequests);
        calculateDailyLimits(updatedRequests);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('az-AZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Gözləyir</span>;
      case 'APPROVED':
        return <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Təsdiqlənib</span>;
      case 'REJECTED':
        return <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Rədd Edilib</span>;
      default:
        return <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Naməlum</span>;
    }
  };

  // Auth loading durumunda loading göster
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yüklənir...</p>
        </div>
      </div>
    );
  }

  // Auth olmayan kullanıcıları login'e yönlendir
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Giriş yapılması gerekiyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Alert Messages */}
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-600 flex items-center justify-center gap-3">
            <i className="fas fa-wallet text-3xl"></i>
            Bakiyə Yüklə
          </h1>
          <p className="text-gray-600 mt-2">C2C sistemi ilə güvənli şəkildə bakiyə yükləyin</p>
        </div>

        {/* Current Balance */}
        <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-6 text-center mb-6">
          <h5 className="text-gray-600 text-lg mb-2">Mövcud Bakiyəniz</h5>
          <div className="text-4xl font-bold text-purple-600">
            {balance.toFixed(2)} <span className="text-lg font-medium text-gray-500">AZN</span>
          </div>
        </div>

        {paymentMethods.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="bg-purple-600 text-white px-6 py-4 rounded-t-lg">
              <h5 className="text-xl font-semibold flex items-center gap-2">
                <i className="fas fa-credit-card"></i>
                Bakiyə Yükləmə Formu
              </h5>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                {/* Amount Input */}
                <div className="mb-6">
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Yükləmək İstədiyiniz Məbləğ (AZN)
                  </label>
                  <div className="max-w-md">
                    <input
                      type="number"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      onBlur={(e) => {
                        // Floating point precision düzeltmesi
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          setAmount(val.toFixed(2));
                        }
                      }}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="0.00"
                      step="1"
                      min="5"
                      max="5000"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">Minimum: 5 AZN, Maksimum: 5000 AZN</p>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Ödəmə Üsulunu Seçin
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="relative">
                        <input
                          type="radio"
                          id={`method_${method.id}`}
                          name="paymentMethod"
                          value={method.id}
                          checked={selectedPaymentMethod === method.id}
                          onChange={() => setSelectedPaymentMethod(method.id)}
                          className="sr-only"
                          required
                        />
                        <label
                          htmlFor={`method_${method.id}`}
                          className={`block w-full p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            selectedPaymentMethod === method.id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-purple-600">
                              <i className="fas fa-credit-card text-2xl"></i>
                            </div>
                            <div>
                              <h6 className="font-semibold text-gray-900">{method.bankName || method.methodName}</h6>
                              <p className="font-mono font-bold text-purple-600 text-lg tracking-wider">
                                {method.cardNumber}
                              </p>
                              <small className="text-gray-500">{method.cardHolderName}</small>
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enhanced Payment Instructions */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-6">
                  <h6 className="font-semibold text-green-800 flex items-center gap-2 mb-4">
                    <i className="fas fa-shield-alt"></i>
                    Güvənli C2C Ödəmə Təlimatları
                  </h6>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h6 className="font-semibold text-gray-800 mb-3">📱 Ödəmə Addımları:</h6>
                      <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        <li><strong>Kartı seçin:</strong> Yuxarıdakı aktiv kartlardan birini seçin</li>
                        <li><strong>Bank aplikasiyasını açın:</strong> Mobil bank və ya internet bank</li>
                        <li><strong>Pul köçürməsini seçin:</strong> Kart-kart və ya P2P köçürməsi</li>
                        <li><strong>Məbləği daxil edin:</strong> {amount || 'X'} AZN</li>
                        <li><strong>Açıqlama yazın:</strong> <code className="bg-gray-200 px-2 py-1 rounded text-sm">{user?.username}</code></li>
                        <li><strong>Ödəməni təsdiqləyin</strong> və dekont çəkin</li>
                      </ol>
                    </div>
                    <div>
                      <h6 className="font-semibold text-gray-800 mb-3">⚠️ Vacib Qeydlər:</h6>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li>Mütləq açıqlama hissəsinə istifadəçi adınızı yazın</li>
                        <li>Dekont şəkli aydın və oxunaqlı olmalıdır</li>
                        <li>Ödəmə məbləği daxil etdiyiniz məbləğlə tam uyğun gəlməlidir</li>
                        <li>Təsdiq prosesi 1-24 saat arası çəkə bilər</li>
                        <li>Problemlə qarşılaşsanız dəstək xidməti ilə əlaqə saxlayın</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <i className="fas fa-exclamation-triangle text-yellow-600 mt-1"></i>
                      <div>
                        <strong className="text-yellow-800">Diqqət:</strong>
                        <p className="text-yellow-700 mt-1">
                          Ödəmə edərkən mütləq açıqlama hissəsinə istifadəçi adınızı yazın: 
                          <span className="font-bold text-indigo-600 ml-1 px-2 py-1 bg-white rounded">{user?.username}</span>
                          <br />Bu olmadan tələbiniz avtomatik olaraq rədd edilə bilər.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Receipt Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-cloud-upload mr-2"></i>
                    Ödəmə Dekontunu Yükləyin
                  </label>
                  
                  <CloudinaryUpload
                    onUploadSuccess={handleCloudinaryUploadSuccess}
                    onUploadError={handleCloudinaryUploadError}
                    folder={CLOUDINARY_CONFIG.FOLDER.RECEIPTS}
                    placeholder="Dekont şəklini seçin və ya bura sürükləyin"
                    acceptedTypes={['image/jpeg', 'image/jpg', 'image/png']}
                    maxSizeInMB={5}
                    showPreview={true}
                    previewSize="medium"
                  />
                  
                  <p className="text-sm text-gray-500 mt-2">
                    JPG, PNG formatında. Maksimum həcm: 5MB. Dekont aydın və oxunaqlı olmalıdır.
                  </p>
                  
                  {/* Image Preview */}
                  {previewUrl && (
                    <div className="mt-4 text-center">
                      <div className="inline-block relative">
                        <img 
                          src={previewUrl} 
                          alt="Dekont önizləmə" 
                          className="max-h-48 rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={clearImage}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                          <i className="fas fa-times text-xs"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="mb-6">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="termsAccepted"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      required
                    />
                    <label htmlFor="termsAccepted" className="text-sm">
                      <strong>Şərtlər və qaydalarla razıyam</strong>
                      <div className="text-gray-500 mt-1">
                        • Yüklədiyiniz şəklin düzgün və oxunaqlı olduğunu təsdiq edirəm<br/>
                        • Ödəmə məlumatlarının doğru olduğunu təsdiq edirəm<br/>
                        • Təsdiq prosesi 24 saat ərzində tamamlanacaq
                      </div>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner animate-spin"></i>
                      Göndərilir...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Bakiyə Yükləmə Tələbi Göndər
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* No Payment Methods */
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm border border-yellow-200 p-8">
              <i className="fas fa-exclamation-triangle text-yellow-500 text-6xl mb-4"></i>
              <h4 className="text-xl font-semibold text-yellow-700 mb-2">Ödəmə Üsulu Mövcud Deyil</h4>
              <p className="text-gray-600 mb-4">Hal-hazırda aktiv ödəmə üsulu mövcud deyil. Zəhmət olmasa daha sonra yenidən cəhd edin.</p>
              <button 
                onClick={() => window.history.back()}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Geri Qayıt
              </button>
            </div>
          </div>
        )}

        {/* C2C Limit Məlumatları */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg p-6 mb-6">
          <h5 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <i className="fas fa-chart-bar"></i>
            C2C Günlük Limitlər
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-sm opacity-90">Günlük Məbləğ Limiti</div>
              <div className="text-2xl font-bold">
                {dailyLimits.usedAmount.toFixed(2)} / {dailyLimits.maxAmount} AZN
              </div>
              <div className="w-full bg-white bg-opacity-30 rounded-full h-2 mt-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-300"
                  style={{ width: `${Math.min((dailyLimits.usedAmount / dailyLimits.maxAmount) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-sm opacity-90">Günlük Tələb Limiti</div>
              <div className="text-2xl font-bold">
                {dailyLimits.usedRequests} / {dailyLimits.maxRequests} Tələb
              </div>
              <div className="w-full bg-white bg-opacity-30 rounded-full h-2 mt-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-300"
                  style={{ width: `${Math.min((dailyLimits.usedRequests / dailyLimits.maxRequests) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm opacity-90">
            <i className="fas fa-info-circle mr-2"></i>
            Limitlər hər gün saat 00:00-da sıfırlanır. C2C sistemi 24/7 fəaliyyətdədir.
          </div>
        </div>

        {/* User Requests */}
        {userRequests.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h5 className="text-lg font-semibold flex items-center gap-2">
                <i className="fas fa-history"></i>
                Son Tələblərim
              </h5>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarix</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Məbləğ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(request.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.amount.toFixed(2)} AZN
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.paymentMethod.bankName || request.paymentMethod.methodName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BalanceLoadPage; 