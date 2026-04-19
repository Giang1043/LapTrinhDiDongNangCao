import httpClient from './http';
import config from '../config/api';

export const cartService = {
  // Get cart
  getCart: async () => {
    try {
      const response = await httpClient.get(config.ENDPOINTS.CART);
      // response = { success: true, data: { items: [...], itemCount, total } }
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  // Add to cart
  addToCart: async (productId, quantity = 1) => {
    try {
      const response = await httpClient.post(config.ENDPOINTS.ADD_TO_CART, {
        productId,
        quantity,
      });
      // response = { success: true, data: { items: [...], itemCount, total } }
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  // Update quantity
  updateQuantity: async (productId, quantity) => {
    try {
      const url = config.ENDPOINTS.UPDATE_CART.replace(':productId', productId);
      const response = await httpClient.put(url, { quantity });
      // response = { success: true, data: { items: [...], itemCount, total } }
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  // Remove from cart
  removeFromCart: async (productId) => {
    try {
      const url = config.ENDPOINTS.REMOVE_FROM_CART.replace(':productId', productId);
      const response = await httpClient.delete(url);
      // response = { success: true, data: { items: [...], itemCount, total } }
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  // Clear cart
  clearCart: async () => {
    try {
      const response = await httpClient.delete(config.ENDPOINTS.CLEAR_CART);
      // response = { success: true, data: { items: [], itemCount: 0, total: 0 } }
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },
};
