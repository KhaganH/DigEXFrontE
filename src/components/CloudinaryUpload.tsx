import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Check, AlertCircle } from 'lucide-react';
import cloudinaryService, { CloudinaryUploadResponse } from '../services/cloudinaryService';
import { CLOUDINARY_CONFIG } from '../constants';

interface CloudinaryUploadProps {
  onUploadSuccess: (result: CloudinaryUploadResponse) => void;
  onUploadError?: (error: string) => void;
  folder?: string;
  acceptedTypes?: string[];
  maxSizeInMB?: number;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  showPreview?: boolean;
  previewSize?: 'small' | 'medium' | 'large';
}

const CloudinaryUpload: React.FC<CloudinaryUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  folder = CLOUDINARY_CONFIG.FOLDER.PRODUCTS,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxSizeInMB = 5,
  className = '',
  disabled = false,
  placeholder = 'Faylı seçin və ya bura sürükləyin',
  showPreview = true,
  previewSize = 'medium'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<CloudinaryUploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    setError(null);
    
    // File validation
    const validation = cloudinaryService.validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Geçersiz dosya');
      onUploadError?.(validation.error || 'Geçersiz dosya');
      return;
    }

    // Additional type check
    if (!acceptedTypes.includes(file.type)) {
      const error = `Yalnız ${acceptedTypes.join(', ')} formatları dəstəklənir`;
      setError(error);
      onUploadError?.(error);
      return;
    }

    // Size check
    if (file.size > maxSizeInMB * 1024 * 1024) {
      const error = `Fayl ölçüsü ${maxSizeInMB}MB-dan böyük ola bilməz`;
      setError(error);
      onUploadError?.(error);
      return;
    }

    // Create preview
    if (showPreview) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }

    setIsUploading(true);

    try {
      const result = await cloudinaryService.uploadImage(file, folder, {
        tags: ['frontend-upload'],
        context: {
          uploadedAt: new Date().toISOString(),
          source: 'web-app'
        }
      });

      if (result.success) {
        setUploadedFile(result);
        onUploadSuccess(result);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Yükləmə xətası baş verdi';
      setError(errorMessage);
      onUploadError?.(errorMessage);
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const getPreviewSize = () => {
    switch (previewSize) {
      case 'small': return 'w-16 h-16';
      case 'medium': return 'w-32 h-32';
      case 'large': return 'w-48 h-48';
      default: return 'w-32 h-32';
    }
  };

  return (
    <div className={`cloudinary-upload ${className}`}>
      {/* Upload Area */}
      {!uploadedFile && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
            ${isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${error ? 'border-red-300 bg-red-50' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-2" />
              <p className="text-sm text-gray-600">Yüklənir...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-1">{placeholder}</p>
              <p className="text-xs text-gray-500">
                Maksimum {maxSizeInMB}MB • {acceptedTypes.map(type => 
                  type.split('/')[1].toUpperCase()
                ).join(', ')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Preview */}
      {showPreview && previewUrl && !uploadedFile && (
        <div className="mt-4">
          <div className="relative inline-block">
            <img
              src={previewUrl}
              alt="Preview"
              className={`${getPreviewSize()} object-cover rounded-lg border`}
            />
            <button
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Success State */}
      {uploadedFile && (
        <div className="border border-green-300 bg-green-50 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-500 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Fayl uğurla yükləndi
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Public ID: {uploadedFile.publicId}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="text-green-600 hover:text-green-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {showPreview && uploadedFile.url && (
            <div className="mt-3">
              <img
                src={cloudinaryService.generateThumbnail(uploadedFile.publicId!, 150)}
                alt="Uploaded"
                className={`${getPreviewSize()} object-cover rounded border`}
              />
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mt-4 border border-red-300 bg-red-50 rounded-lg p-3">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CloudinaryUpload; 