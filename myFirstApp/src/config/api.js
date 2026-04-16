// API configuration - change API_BASE_URL in .env when backend is ready
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

export default {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    // Auth
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    VERIFY_OTP: '/auth/verify-otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    // User
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile/update',
    CHANGE_PASSWORD: '/user/change-password',
    CHANGE_PHONE: '/user/change-phone',
    CHANGE_EMAIL: '/user/change-email',
    VERIFY_PHONE_OTP: '/user/verify-phone-otp',
    VERIFY_EMAIL_OTP: '/user/verify-email-otp',
    // Products
    CATEGORIES: '/categories',
    PRODUCTS: '/products',
    PRODUCT_DETAIL: '/products/:id',
    TOP_SELLING: '/products/top-selling',
    DISCOUNTED: '/products/discounted',
    SEARCH: '/products/search',
    // Cart
    CART: '/cart',
    ADD_TO_CART: '/cart/add',
    UPDATE_CART: '/cart/update',
    REMOVE_FROM_CART: '/cart/remove',
    // Orders
    CHECKOUT: '/orders/checkout',
    ORDERS: '/orders',
    ORDER_DETAIL: '/orders/:id',
    CANCEL_ORDER: '/orders/:id/cancel',
  },
};
