import React, { useEffect } from 'react';
import { CheckCircle, Package, MessageCircle, Home } from 'lucide-react';

const CheckoutSuccessPage: React.FC = () => {
  useEffect(() => {
    // Force balance update
    const forceUpdateBalance = async () => {
      try {
        const response = await fetch('/api/balance');
        const data = await response.json();
        if (data.success) {
          // Update balance in UI if needed
          console.log('Balance updated:', data.balance);
        }
      } catch (error) {
        console.debug('Balance update failed:', error);
      }
    };

    forceUpdateBalance();

    // Redirect to orders page after 5 seconds
    const timeout = setTimeout(() => {
      window.location.href = '/orders';
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="text-center py-12 px-6">
            {/* Success Icon */}
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Sipariş Tamamlandı!
            </h1>
            <p className="text-gray-600 mb-8 text-lg">
              Sifarişiniz uğurla yaradıldı. Satıcılar sizinlə əlaqə saxlayacaq.
            </p>

            {/* Action Buttons */}
            <div className="space-y-4">
              <a 
                href="/orders" 
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Package className="w-5 h-5 mr-2" />
                Siparişlerime Git
              </a>
              
              <a 
                href="/chats" 
                className="w-full border border-blue-600 text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Mesajlarım
              </a>
              
              <a 
                href="/" 
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <Home className="w-5 h-5 mr-2" />
                Ana Səhifə
              </a>
            </div>

            {/* Auto redirect info */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                5 saniyə sonra siparişlər səhifəsinə yönləndiriləcəksiniz...
              </p>
            </div>
          </div>
        </div>

        {/* Success Animation */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="relative w-full h-full">
            <div className="absolute top-10 left-10 w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="absolute top-20 right-10 w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-20 left-20 w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-10 right-20 w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage; 