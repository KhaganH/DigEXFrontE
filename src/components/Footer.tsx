import React, { useState } from 'react';
import { 
  Package, Heart, MapPin, Phone, Mail, Send, 
  Facebook, Instagram, MessageCircle, Youtube, 
  Linkedin, ArrowUp, Shield, CreditCard, Award,
  CheckCircle, Home, Grid3X3, Users, Info, HelpCircle,
  FileText, Lock, Cookie, DollarSign, AlertTriangle
} from 'lucide-react';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      console.log('Newsletter signup:', email);
      setEmail('');
      // Show success message
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer className="bg-gray-900 text-white pt-12 pb-6 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    DiGex
                  </span>
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Azərbaycanın ən böyük və etibarlı rəqəmsal məhsul bazarı. 
                  Oyunlardan proqram təminatına, hədiyyə kartlarından abunəliklərə qədər 
                  hər şey burada, təhlükəsiz və sürətli!
                </p>

                {/* Newsletter */}
                <div>
                  <h6 className="font-semibold mb-3 flex items-center">
                    <Send className="w-4 h-4 mr-2 text-blue-400" />
                    Xəbər Bülleteni
                  </h6>
                  <form onSubmit={handleNewsletterSubmit} className="flex mb-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email ünvanınız..."
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                      required
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-r-lg transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                  <p className="text-sm text-gray-400">Yeni məhsullar və endirimlər haqqında ilk siz bilin!</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h6 className="font-semibold mb-4 text-blue-400 flex items-center">
                <Home className="w-4 h-4 mr-2" />
                Sürətli Keçidlər
              </h6>
              <ul className="space-y-2">
                <li>
                  <a href="/" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center">
                    <Home className="w-3 h-3 mr-2" />
                    Ana Səhifə
                  </a>
                </li>
                <li>
                  <a href="/products" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center">
                    <Grid3X3 className="w-3 h-3 mr-2" />
                    Məhsullar
                  </a>
                </li>
                <li>
                  <a href="/sellers" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center">
                    <Users className="w-3 h-3 mr-2" />
                    Satıcılar
                  </a>
                </li>
                <li>
                  <a href="/categories" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center">
                    <Grid3X3 className="w-3 h-3 mr-2" />
                    Kateqoriyalar
                  </a>
                </li>
                <li>
                  <a href="/about" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center">
                    <Info className="w-3 h-3 mr-2" />
                    Haqqımızda
                  </a>
                </li>
              </ul>
            </div>

            {/* Customer Support */}
            <div>
              <h6 className="font-semibold mb-4 text-blue-400 flex items-center">
                <HelpCircle className="w-4 h-4 mr-2" />
                Müştəri Dəstəyi
              </h6>
              <ul className="space-y-2">
                <li>
                  <a href="/contact" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center">
                    <MessageCircle className="w-3 h-3 mr-2" />
                    Əlaqə
                  </a>
                </li>
                <li>
                  <a href="/help" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center">
                    <HelpCircle className="w-3 h-3 mr-2" />
                    Kömək Mərkəzi
                  </a>
                </li>
                <li>
                  <a href="/faq" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center">
                    <HelpCircle className="w-3 h-3 mr-2" />
                    Tez-tez Soruşulanlar
                  </a>
                </li>
                <li>
                  <a href="/live-chat" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center">
                    <MessageCircle className="w-3 h-3 mr-2" />
                    Canlı Söhbət
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal & Contact */}
            <div>
              <h6 className="font-semibold mb-4 text-blue-400 flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Hüquqi & Əlaqə
              </h6>
              <ul className="space-y-2 mb-6">
                <li>
                  <a href="/terms" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center">
                    <FileText className="w-3 h-3 mr-2" />
                    İstifadə Şərtləri
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center">
                    <Lock className="w-3 h-3 mr-2" />
                    Məxfilik Siyasəti
                  </a>
                </li>
                <li>
                  <a href="/refund" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center">
                    <DollarSign className="w-3 h-3 mr-2" />
                    Geri Qaytarma
                  </a>
                </li>
              </ul>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 text-blue-400 mr-2 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Ünvan:</p>
                    <p className="text-sm text-gray-300">Bakı şəhəri, Yasamal rayonu<br />H.Zərdabi küç. 89B</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-blue-400 mr-2" />
                  <div>
                    <p className="font-medium">Telefon:</p>
                    <a href="tel:+994123456789" className="text-sm text-gray-300 hover:text-blue-400">
                      +994 (12) 345-67-89
                    </a>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-blue-400 mr-2" />
                  <div>
                    <p className="font-medium">Email:</p>
                    <a href="mailto:info@digex.az" className="text-sm text-gray-300 hover:text-blue-400">
                      info@digex.az
                    </a>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-6">
                <h6 className="font-semibold mb-3 text-blue-400">Sosial Media</h6>
                <div className="flex space-x-2">
                  <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors">
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-pink-600 rounded-full flex items-center justify-center transition-colors">
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-blue-500 rounded-full flex items-center justify-center transition-colors">
                    <MessageCircle className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors">
                    <Youtube className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Payment Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-8 border-t border-gray-800">
            <div>
              <h6 className="font-semibold mb-4 text-blue-400 flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                Ödəniş Üsulları
              </h6>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm flex items-center">
                  <CreditCard className="w-3 h-3 mr-1" />
                  Visa
                </span>
                <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm flex items-center">
                  <CreditCard className="w-3 h-3 mr-1" />
                  MasterCard
                </span>
                <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm flex items-center">
                  <DollarSign className="w-3 h-3 mr-1" />
                  PayPal
                </span>
                <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm flex items-center">
                  <CreditCard className="w-3 h-3 mr-1" />
                  Bank Transfer
                </span>
              </div>
            </div>
            <div>
              <h6 className="font-semibold mb-4 text-blue-400 flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Təhlükəsizlik & Sertifikatlar
              </h6>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-green-900 text-green-300 rounded-full text-sm flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  SSL Şifrələnmə
                </span>
                <span className="px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-sm flex items-center">
                  <Award className="w-3 h-3 mr-1" />
                  PCI DSS
                </span>
                <span className="px-3 py-1 bg-purple-900 text-purple-300 rounded-full text-sm flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified Seller
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-8 pt-6 border-t border-gray-800">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-gray-400 flex items-center justify-center md:justify-start">
                © {new Date().getFullYear()} DiGex. Bütün hüquqlar qorunur.
                <Heart className="w-4 h-4 text-red-500 mx-2" />
                Made in Azerbaijan
              </p>
            </div>
            <div className="flex space-x-2">
              <span className="px-3 py-1 bg-green-900 text-green-300 rounded-full text-sm flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Sürətli Çatdırılma
              </span>
              <span className="px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-sm flex items-center">
                <HelpCircle className="w-3 h-3 mr-1" />
                24/7 Dəstək
              </span>
              <span className="px-3 py-1 bg-yellow-900 text-yellow-300 rounded-full text-sm flex items-center">
                <Award className="w-3 h-3 mr-1" />
                Keyfiyyət Zəmanəti
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 hover:scale-110"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </>
  );
};

export default Footer;