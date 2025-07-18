// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/public/login',
    REGISTER: '/api/public/register',
    LOGOUT: '/api/auth/logout'
  },
  CART: {
    ADD: '/api/cart/add',
    LIST: '/api/cart',
    COUNT: '/api/cart/count',
    UPDATE: '/api/cart/update',
    REMOVE: '/api/cart/remove',
    CLEAR: '/api/cart/clear',
    CHECKOUT: '/api/cart/checkout'
  },
  PRODUCTS: {
    LIST: '/api/public/products',
    DETAIL: '/api/public/products',
    CATEGORIES: '/api/public/categories',
    PREMIUM: '/api/public/products/premium',
    SEARCH: '/api/public/products/search'
  },
  SELLER: {
    DASHBOARD: '/api/seller/dashboard',
    PRODUCTS: '/api/seller/products',
    ORDERS: '/api/seller/orders',
    ANALYTICS: '/api/seller/analytics',
    SETTINGS: '/api/seller/settings'
  },
  ADMIN: {
    DASHBOARD: '/admin/api/dashboard',
    USERS: '/admin/api/users',
    PRODUCTS: '/admin/api/products',
    ORDERS: '/admin/api/orders',
    CATEGORIES: '/admin/api/categories'
  },
  CHAT: {
    LIST: '/api/chat/list',
    MESSAGES: '/api/chat',
    SEND: '/api/chat',
    UNREAD_COUNT: '/api/chat'
  }
};

// UI Constants
export const UI_CONSTANTS = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PRODUCTS_PER_PAGE: 12
  },
  TIMEOUTS: {
    TOAST_DURATION: 3000,
    REDIRECT_DELAY: 2000,
    LOADING_DELAY: 500
  },
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 6,
    MAX_TITLE_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 2000,
    MIN_PRICE: 0.01,
    MAX_PRICE: 999999.99
  }
};

// User Roles
export const USER_ROLES = {
  USER: 'USER',
  SELLER: 'SELLER',
  ADMIN: 'ADMIN'
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DELIVERED: 'delivered'
} as const;

// Product Stock Types
export const STOCK_TYPES = {
  STOCK: 'stock',
  MANUAL: 'manual'
} as const;

// Alert Types
export const ALERT_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['text/plain', 'application/pdf']
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER: 'user',
  CART_COUNT: 'cartCount',
  THEME: 'theme'
} as const;

// Cloudinary Configuration
export const CLOUDINARY_CONFIG = {
  CLOUD_NAME: 'dyvwoifrw',
  API_KEY: '665369159425733',
  UPLOAD_PRESET: 'digex_uploads', // Dashboard'da oluşturduğunuz preset
  FOLDER: {
    PRODUCTS: 'digex/products',
    RECEIPTS: 'digex/receipts',
    AVATARS: 'digex/avatars',
    DOCUMENTS: 'digex/documents'
  }
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];
export type StockType = typeof STOCK_TYPES[keyof typeof STOCK_TYPES];
export type AlertType = typeof ALERT_TYPES[keyof typeof ALERT_TYPES]; 