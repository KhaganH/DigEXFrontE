import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface SocialLoginButtonProps {
  provider: string;
  icon: LucideIcon;
  className: string;
  onClick: () => void;
}

const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({ 
  provider, 
  icon: Icon, 
  className, 
  onClick 
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border font-medium transition-all duration-200 hover:scale-105 hover:shadow-md ${className}`}
    >
      <Icon className="w-5 h-5" />
      {provider} ile Giriş Yap
    </button>
  );
};

export default SocialLoginButton;