/**
 * App Constants
 * Global application constants
 */

export const APP_NAME = 'FoodApp';
export const APP_VERSION = '1.0.0';
export const DEFAULT_CURRENCY = 'VND';

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  WALLET: 'wallet',
};

export const PAYMENT_METHODS_DISPLAY = {
  cash: 'Thanh toán tiền mặt',
  card: 'Thanh toán thẻ',
  wallet: 'Ví điện tử',
};

// Order Status
export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const ORDER_STATUS_DISPLAY = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipped: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

export const ORDER_STATUS_COLORS = {
  pending: '#FFA500',
  confirmed: '#4169E1',
  shipped: '#1E90FF',
  delivered: '#28A745',
  cancelled: '#DC3545',
};

// User Preferences
export const DEFAULT_LANGUAGE = 'vi';
export const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh';

// Storage Keys (for AsyncStorage - minimal use)
export const STORAGE_KEYS = {
  AUTH_USER_ID: '@foodapp_user_id',
  AUTH_TOKEN: '@foodapp_token',
  APP_FIRST_LAUNCH: '@foodapp_first_launch',
};

// API Configuration
export const API_TIMEOUT = 30000; // 30 seconds

// Pagination
export const DEFAULT_PAGE_SIZE = 10;

// Rating
export const MAX_RATING = 5;
export const MIN_RATING = 0;

export default {
  APP_NAME,
  APP_VERSION,
  DEFAULT_CURRENCY,
  PAYMENT_METHODS,
  ORDER_STATUSES,
  DEFAULT_LANGUAGE,
  DEFAULT_TIMEZONE,
  STORAGE_KEYS,
  API_TIMEOUT,
  DEFAULT_PAGE_SIZE,
  MAX_RATING,
};
