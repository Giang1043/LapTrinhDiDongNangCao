import httpClient from './http';
import config from '../config/api';

export const orderService = {
  // Get all orders
  getOrders: async ({ page = 1, limit = 20 } = {}) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);

      const response = await httpClient.get(
        `${config.ENDPOINTS.ORDERS}?${params.toString()}`
      );
      // response = { success: true, data: [...] }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return Array.isArray(response) ? response : [];
    } catch (error) {
      throw error;
    }
  },

  // Get order detail
  getOrderDetail: async (orderId) => {
    try {
      const url = config.ENDPOINTS.ORDER_DETAIL.replace(':id', orderId);
      const response = await httpClient.get(url);
      // response = { success: true, data: {...order} }
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  // Create order (checkout)
  createOrder: async ({ address, phone, paymentMethod, note = '' }) => {
    try {
      const response = await httpClient.post(config.ENDPOINTS.CHECKOUT, {
        address,
        phone,
        payment_method: paymentMethod,
        note,
      });
      // response = { success: true, data: {...order} }
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  // Cancel order
  cancelOrder: async (orderId, reason = '') => {
    try {
      const url = config.ENDPOINTS.CANCEL_ORDER.replace(':id', orderId);
      const response = await httpClient.post(url, { reason });
      // response = { success: true, data: {...} }
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },
};
