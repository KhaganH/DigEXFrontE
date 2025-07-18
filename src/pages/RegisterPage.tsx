import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, UserPlus, Chrome, Facebook } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import { useAuth } from '../hooks/useAuth';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface RegisterPageProps {
  onNavigate?: (page: 'home' | 'login' | 'register') => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  } | null>(null);

  const { register } = useAuth();

  const validateUsername = (username: string): string | undefined => {
    if (!username.trim()) {
      return 'İstifadəçi adı zorunludur';
    }
    if (username.length < 3 || username.length > 20) {
      return 'İstifadəçi adı 3-20 simvol olmalıdır';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Yalnız hərf, rəqəm və alt xətt (_) istifadə edilə bilər';
    }
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return 'Email ünvanı zorunludur';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Düzgün email ünvanı daxil edin';
    }
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return 'Şifrə zorunludur';
    }
    if (password.length < 6) {
      return 'Şifrə ən azı 6 simvol olmalıdır';
    }
    return undefined;
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): string | undefined => {
    if (!confirmPassword) {
      return 'Şifrə təsdiqi zorunludur';
    }
    if (password !== confirmPassword) {
      return 'Şifrələr uyğun gəlmir';
    }
    return undefined;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    let error: string | undefined;
    switch (field) {
      case 'username':
        error = validateUsername(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        // Also revalidate confirm password if it exists
        if (formData.confirmPassword) {
          const confirmError = validateConfirmPassword(value, formData.confirmPassword);
          setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
        }
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(formData.password, value);
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      username: validateUsername(formData.username),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.password, formData.confirmPassword)
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setAlert({
        type: 'error',
        message: 'Zəhmət olmasa bütün sahələri düzgün doldurun'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await register(formData);
      
      setAlert({
        type: 'success',
        message: 'Qeydiyyat uğurla tamamlandı! Avtomatik giriş edilir...'
      });
      
      // Redirect to home immediately after successful registration and auto-login
      setTimeout(() => {
        navigate('/');
      }, 800);
      
    } catch (error: any) {
      setAlert({
        type: 'error',
        message: error.message || 'Qeydiyyat zamanı xəta baş verdi. Yenidən cəhd edin.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialRegister = (provider: string) => {
    // Redirect to OAuth endpoint
    window.location.href = `http://localhost:1111/oauth2/authorization/${provider.toLowerCase()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          {/* Alert */}
          {alert && (
            <div className="mb-6">
              <Alert 
                type={alert.type} 
                message={alert.message} 
                onClose={() => setAlert(null)} 
              />
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <UserPlus className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-white">Yeni Hesab Yaradın</h1>
                <p className="text-green-100 mt-2">DiGex ailəsinə qoşulun</p>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-8">
              {/* Social Registration Options */}
              <div className="space-y-3 mb-8">
                <button
                  onClick={() => handleSocialRegister('Google')}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-gray-300 font-medium transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-red-500 hover:bg-red-50 text-gray-700"
                >
                  <Chrome className="w-5 h-5" />
                  Google ilə Qeydiyyat
                </button>
                <button
                  onClick={() => handleSocialRegister('Facebook')}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-gray-300 font-medium transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-blue-500 hover:bg-blue-50 text-gray-700"
                >
                  <Facebook className="w-5 h-5" />
                  Facebook ilə Qeydiyyat
                </button>
              </div>

              {/* Divider */}
              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">və ya</span>
                </div>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Field */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    İstifadəçi adı
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        errors.username ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="İstifadəçi adınızı daxil edin"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    3-20 simvol, yalnız hərf, rəqəm və alt xətt (_)
                  </div>
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Email ünvanınızı daxil edin"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Düzgün email ünvanı daxil edin
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Şifrə
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Şifrənizi daxil edin"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Minimum 6 simvol
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Şifrəni təsdiq et
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Şifrənizi təkrar daxil edin"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Şifrənizi təkrar daxil edin
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Hesab yaradılır...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Hesab Yarat
                    </>
                  )}
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Hesabınız var?{' '}
                  <button 
                    onClick={() => navigate('/login')}
                    className="text-green-600 hover:text-green-500 font-medium transition-colors"
                  >
                    Daxil olun
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;