import { CLOUDINARY_CONFIG, FILE_UPLOAD } from '../constants';

// SHA-1 hash function for signature
async function sha1(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Upload response interface
export interface CloudinaryUploadResponse {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

class CloudinaryService {
  // Direct upload to Cloudinary (unsigned upload preset kullanarak)
  async uploadImage(
    file: File, 
    folder: string = CLOUDINARY_CONFIG.FOLDER.PRODUCTS,
    options?: {
      tags?: string[];
      context?: Record<string, string>;
    }
  ): Promise<CloudinaryUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      formData.append('folder', folder);
      
      // Optional parameters
      if (options?.tags) {
        formData.append('tags', options.tags.join(','));
      }
      
      if (options?.context) {
        const contextString = Object.entries(options.context)
          .map(([key, value]) => `${key}=${value}`)
          .join('|');
        formData.append('context', contextString);
      }
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Cloudinary Upload Error:', errorText);
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  // Basic optimized URL generator (will be enhanced after package installation)
  generateOptimizedUrl(
    publicId: string,
    options?: {
      width?: number;
      height?: number;
      quality?: string;
      format?: string;
    }
  ): string {
    const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.CLOUD_NAME}/image/upload`;
    let transformations: string[] = [];
    
    // Auto format and quality
    transformations.push('f_auto', 'q_auto');
    
    if (options?.width || options?.height) {
      const resize = ['c_auto', 'g_auto'];
      if (options.width) resize.push(`w_${options.width}`);
      if (options.height) resize.push(`h_${options.height}`);
      transformations.push(...resize);
    }
    
    const transformationString = transformations.length > 0 
      ? transformations.join(',') + '/' 
      : '';
    
    return `${baseUrl}/${transformationString}${publicId}`;
  }

  // Thumbnail generator
  generateThumbnail(publicId: string, size: number = 150): string {
    return this.generateOptimizedUrl(publicId, {
      width: size,
      height: size
    });
  }

  // Product image URL generator
  generateProductImage(publicId: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
    const sizes = {
      small: { width: 300, height: 300 },
      medium: { width: 600, height: 600 },
      large: { width: 1200, height: 1200 }
    };
    
    return this.generateOptimizedUrl(publicId, sizes[size]);
  }

  // Receipt image generator (for balance load receipts)
  generateReceiptImage(publicId: string): string {
    return this.generateOptimizedUrl(publicId, {
      width: 800
    });
  }

  // Delete image (requires backend API)
  async deleteImage(publicId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/cloudinary/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ publicId })
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Multiple files upload
  async uploadMultipleImages(
    files: File[],
    folder: string = CLOUDINARY_CONFIG.FOLDER.PRODUCTS
  ): Promise<CloudinaryUploadResponse[]> {
    const uploadPromises = files.map(file => 
      this.uploadImage(file, folder)
    );
    
    return Promise.all(uploadPromises);
  }

  // Validate file before upload
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size (5MB limit)
    if (file.size > FILE_UPLOAD.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: 'Fayl ölçüsü 5MB-dan böyük ola bilməz'
      };
    }

    // Check file type
    if (!FILE_UPLOAD.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Yalnız JPG, PNG, WebP formatları dəstəklənir'
      };
    }

    return { valid: true };
  }

  // Get Cloudinary info for uploaded file
  getImageInfo(publicId: string) {
    return {
      url: this.generateOptimizedUrl(publicId),
      thumbnail: this.generateThumbnail(publicId),
      publicId,
      cloudName: CLOUDINARY_CONFIG.CLOUD_NAME
    };
  }

  // Check if URL is a Cloudinary URL
  isCloudinaryUrl(url: string): boolean {
    return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
  }

  // Extract public ID from Cloudinary URL
  extractPublicId(url: string): string | null {
    try {
      if (!this.isCloudinaryUrl(url)) return null;
      
      const parts = url.split('/');
      const uploadIndex = parts.indexOf('upload');
      
      if (uploadIndex === -1) return null;
      
      // Skip transformations if they exist
      let publicIdIndex = uploadIndex + 1;
      if (parts[publicIdIndex] && parts[publicIdIndex].includes('_')) {
        publicIdIndex++;
      }
      
      const publicIdParts = parts.slice(publicIdIndex);
      const publicId = publicIdParts.join('/');
      
      // Remove file extension
      return publicId.replace(/\.[^/.]+$/, '');
    } catch (error) {
      return null;
    }
  }
}

export const cloudinaryService = new CloudinaryService();
export default cloudinaryService; 