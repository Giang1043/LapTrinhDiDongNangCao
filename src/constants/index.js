// File này chứa các constant sử dụng trong ứng dụng

export const COLORS = {
  // Primary
  PRIMARY: '#007AFF',
  SECONDARY: '#5AC8FA',
  
  // Status
  SUCCESS: '#34C759',
  DANGER: '#FF3B30',
  WARNING: '#FF9500',
  INFO: '#00C7FF',
  
  // Neutral
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY_LIGHT: '#F5F5F5',
  GRAY_MEDIUM: '#E5E5E5',
  GRAY_DARK: '#999999',
  TEXT_PRIMARY: '#333333',
  TEXT_SECONDARY: '#666666',
  TEXT_TERTIARY: '#999999',
  
  // Background
  BG_PRIMARY: '#FFFFFF',
  BG_SECONDARY: '#F9F9F9',
  BG_TERTIARY: '#F5F5F5',
};

export const SIZES = {
  // Padding
  PADDING_XS: 4,
  PADDING_SM: 8,
  PADDING_MD: 12,
  PADDING_LG: 16,
  PADDING_XL: 20,
  PADDING_2XL: 24,
  
  // Font sizes
  FONT_XS: 10,
  FONT_SM: 11,
  FONT_MD: 12,
  FONT_LG: 13,
  FONT_XL: 14,
  FONT_2XL: 16,
  FONT_3XL: 18,
  FONT_4XL: 24,
  FONT_5XL: 28,
  
  // Border radius
  RADIUS_SM: 4,
  RADIUS_MD: 8,
  RADIUS_LG: 12,
  RADIUS_XL: 16,
  RADIUS_2XL: 20,
  
  // Icon sizes
  ICON_SM: 20,
  ICON_MD: 24,
  ICON_LG: 32,
  ICON_XL: 48,
};

export const FONTS = {
  WEIGHT_400: '400',
  WEIGHT_500: '500',
  WEIGHT_600: '600',
  WEIGHT_700: '700',
};

export const API_ENDPOINTS = {
  CATEGORIES: '/categories',
  PRODUCTS: '/products',
  BEST_SELLING: '/products/best-selling',
  DISCOUNTED: '/products/discounted',
  PRODUCT_DETAIL: '/products/:id',
};

export const PRODUCT_LIMITS = {
  BEST_SELLING: 10,
  DISCOUNTED: 20,
  CATEGORIES: 8,
};

export const MESSAGES = {
  LOADING: 'Đang tải dữ liệu...',
  ERROR: 'Lỗi tải dữ liệu. Vui lòng thử lại!',
  RETRY: 'Thử lại',
  CANCEL: 'Hủy',
  OK: 'OK',
  NO_DATA: 'Không có dữ liệu',
};
