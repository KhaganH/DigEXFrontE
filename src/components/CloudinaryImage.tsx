import React, { useState } from 'react';
import { Package } from 'lucide-react';
import cloudinaryService from '../services/cloudinaryService';

interface CloudinaryImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  size?: 'small' | 'medium' | 'large' | 'thumbnail';
  fallbackIcon?: React.ReactNode;
  onError?: () => void;
  onClick?: () => void;
}

const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  size = 'medium',
  fallbackIcon,
  onError,
  onClick
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate optimized URL if it's a Cloudinary URL
  const getOptimizedUrl = (originalUrl: string): string => {
    if (!originalUrl) return '';
    
    // If it's already a Cloudinary URL, extract public ID and optimize
    if (cloudinaryService.isCloudinaryUrl(originalUrl)) {
      const publicId = cloudinaryService.extractPublicId(originalUrl);
      if (publicId) {
        if (size === 'thumbnail') {
          return cloudinaryService.generateThumbnail(publicId, width || 150);
        } else {
          return cloudinaryService.generateProductImage(publicId, size);
        }
      }
    }
    
    // If custom dimensions are provided, try to optimize
    if (width || height) {
      const publicId = cloudinaryService.extractPublicId(originalUrl);
      if (publicId) {
        return cloudinaryService.generateOptimizedUrl(publicId, { width, height });
      }
    }
    
    // Return original URL if not Cloudinary or can't optimize
    return originalUrl;
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
    onError?.();
  };

  const optimizedSrc = getOptimizedUrl(src);

  // Show fallback if no src or error occurred
  if (!src || imageError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        onClick={onClick}
      >
        {fallbackIcon || <Package className="w-12 h-12 text-gray-400" />}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} onClick={onClick}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <img
        src={optimizedSrc}
        alt={alt}
        className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  );
};

export default CloudinaryImage; 