// API configuration - Backend at localhost:3000
const API_BASE_URL = process.env.API_BASE_URL || 'http://10.0.2.2:3000/api/v1';

export default {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    // Auth
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    // Products
    CATEGORIES: '/products/categories',
    PRODUCTS: '/products',
    PRODUCT_DETAIL: '/products/:id',
    FEATURED: '/products/featured',
    SEARCH: '/products/search',
    // Cart
    CART: '/cart',
    ADD_TO_CART: '/cart/add',
    UPDATE_CART: '/cart/items/:productId',
    REMOVE_FROM_CART: '/cart/items/:productId',
    CLEAR_CART: '/cart',
    // Orders
    CHECKOUT: '/orders',
    ORDERS: '/orders',
    ORDER_DETAIL: '/orders/:id',
    CANCEL_ORDER: '/orders/:id/cancel',
  },
};
