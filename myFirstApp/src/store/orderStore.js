import { create } from 'zustand';
import { orderService } from '../services/orderService';

// Order status constants
export const ORDER_STATUS = {
  NEW: 1,
  CONFIRMED: 2,
  PREPARING: 3,
  DELIVERING: 4,
  DELIVERED: 5,
  CANCELLED: 6,
};

export const ORDER_STATUS_LABELS = {
  1: 'Mới',
  2: 'Xác nhận',
  3: 'Đang chuẩn bị',
  4: 'Đang giao',
  5: 'Đã giao',
  6: 'Đã hủy',
  // String keys for backend compatibility
  'pending': 'Mới',
  'confirmed': 'Xác nhận',
  'preparing': 'Đang chuẩn bị',
  'delivering': 'Đang giao',
  'delivered': 'Đã giao',
  'cancelled': 'Đã hủy',
};

export const ORDER_STATUS_COLORS = {
  1: '#FFC107', // yellow - pending
  2: '#2196F3', // blue - confirmed
  3: '#FF9800', // orange - preparing
  4: '#FF9800', // orange - delivering
  5: '#4CAF50', // green - delivered
  6: '#F44336', // red - cancelled
  // String keys for backend compatibility
  'pending': '#FFC107', // yellow - pending
  'confirmed': '#2196F3', // blue - confirmed
  'preparing': '#FF9800', // orange - preparing
  'delivering': '#FF9800', // orange - delivering
  'delivered': '#4CAF50', // green - delivered
  'cancelled': '#F44336', // red - cancelled
};

const useOrderStore = create((set, get) => ({
  orders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,

  // Load orders from backend
  loadOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await orderService.getOrders();
      set({
        orders: data || [],
        isLoading: false,
      });
    } catch (e) {
      console.log('Error loading orders:', e);
      set({
        error: e.message,
        isLoading: false,
      });
    }
  },

  // Get order detail
  getOrderDetail: async (orderId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await orderService.getOrderDetail(orderId);
      set({
        selectedOrder: data,
        isLoading: false,
      });
      return data;
    } catch (e) {
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  // Place order (checkout)
  placeOrder: async ({ items, address, phone, paymentMethod = 'COD', note = '' }) => {
    set({ isLoading: true, error: null });
    try {
      const data = await orderService.createOrder({
        address,
        phone,
        paymentMethod,
        note,
      });
      // Reload orders
      await get().loadOrders();
      set({ isLoading: false });
      return data;
    } catch (e) {
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  // Cancel order
  cancelOrder: async (orderId, reason = '') => {
    set({ isLoading: true, error: null });
    try {
      const data = await orderService.cancelOrder(orderId, reason);
      // Reload orders
      await get().loadOrders();
      set({ isLoading: false });
      return data;
    } catch (e) {
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },
}));

export default useOrderStore;
