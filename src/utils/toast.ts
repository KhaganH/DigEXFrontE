// Toast notification utility
const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  // Remove existing toasts
  const existingToasts = document.querySelectorAll('.custom-toast');
  existingToasts.forEach(toast => toast.remove());
  
  const toast = document.createElement('div');
  toast.className = `custom-toast alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
  toast.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
  
  const iconMap = {
    'success': 'check-circle',
    'error': 'exclamation-triangle',
    'warning': 'exclamation-triangle',
    'info': 'info-circle'
  };
  
  toast.innerHTML = `
    <div class="d-flex align-items-center">
      <i class="bi bi-${iconMap[type]} me-2"></i>
      ${message}
      <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 3000);
};

// Global window object'e ekle
if (typeof window !== 'undefined') {
  (window as any).showToast = showToast;
} 