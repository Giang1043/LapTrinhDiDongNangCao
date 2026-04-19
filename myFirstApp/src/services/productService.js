import httpClient from './http';
import config from '../config/api';

export const productService = {
  // Get all categories
  getCategories: async () => {
    try {
      const response = await httpClient.get(config.ENDPOINTS.CATEGORIES);
      // response = { success: true, data: [...] }
      // We need response.data which is the array
      if (Array.isArray(response.data)) {
        return response.data;
      }
      // Fallback in case response is just array
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.log('getCategories error:', error);
      throw error;
    }
  },

  // Get products
  getProducts: async ({ categoryId = null, page = 1, limit = 20 } = {}) => {
    try {
      let url = config.ENDPOINTS.PRODUCTS;
      const params = new URLSearchParams();
      
      if (categoryId) {
        params.append('categoryId', categoryId);
      }
      params.append('page', page);
      params.append('limit', limit);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await httpClient.get(url);
      // response = { success: true, data: { products: [...], pagination: {...} } }
      // response.data = { products: [...], pagination: {...} }
      const dataField = response.data;
      return {
        products: dataField?.products || [],
        pagination: dataField?.pagination || {},
      };
    } catch (error) {
      console.log('getProducts error:', error);
      throw error;
    }
  },

  // Get featured products
  getFeaturedProducts: async () => {
    try {
      const response = await httpClient.get(config.ENDPOINTS.FEATURED);
      // response = { success: true, data: [...] }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return Array.isArray(response) ? response : [];
    } catch (error) {
      throw error;
    }
  },

  // Get product detail
  getProductDetail: async (productId) => {
    try {
      const url = config.ENDPOINTS.PRODUCT_DETAIL.replace(':id', productId);
      const response = await httpClient.get(url);
      // response = { success: true, data: {...product} }
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  // Search products
  searchProducts: async (query) => {
    try {
      const response = await httpClient.get(
        `${config.ENDPOINTS.SEARCH}?query=${encodeURIComponent(query)}`
      );
      // response = { success: true, data: { products: [...], pagination: {...} } }
      // response.data = { products: [...], pagination: {...} }
      const dataField = response.data;
      return dataField?.products || [];
    } catch (error) {
      throw error;
    }
  },
};
