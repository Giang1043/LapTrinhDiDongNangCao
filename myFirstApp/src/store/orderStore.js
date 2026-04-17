import { create } from 'zustand';
import realmDB from '../database/realmDB';

// Order statuses
export const ORDER_STATUS = {
  NEW: 1,           // Đơn hàng mới
  CONFIRMED: 2,     // Đã xác nhận
  PREPARING: 3,     // Shop đang chuẩn bị
  DELIVERING: 4,    // Đang giao hàng
  DELIVERED: 5,     // Đã giao thành công
  CANCELLED: 6,     // Đã hủy
};

export const ORDER_STATUS_LABELS = {
  1: 'Đơn hàng mới',
  2: 'Đã xác nhận',
  3: 'Đang chuẩn bị hàng',
  4: 'Đang giao hàng',
  5: 'Đã giao thành công',
  6: 'Đã hủy',
};

export const ORDER_STATUS_COLORS = {
  1: '#2196F3',    // blue
  2: '#4CAF50',    // green
  3: '#FF9800',    // orange
  4: '#9C27B0',    // purple
  5: '#4CAF50',    // green
  6: '#F44336',    // red
};

const useOrderStore = create((set, get) => ({
  orders: [],
  isLoading: false,

  // Load orders from Realm database
  loadOrders: async () => {
    try {
      // Auto-confirm orders that are 30+ minutes old
      await realmDB.autoConfirmOrders();
      
      // Fetch all orders from Realm
      const orders = await realmDB.getAllOrders();
      set({ orders });
    } catch (e) {
      console.log('Error loading orders:', e);
    }
  },

  // Place order
  placeOrder: async ({ items, address, phone, paymentMethod, note }) => {
    set({ isLoading: true });
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Create order in Realm
      const newOrder = await realmDB.placeOrder({
        items,
        address,
        phone,
        paymentMethod: paymentMethod || 'COD',
        note: note || '',
      });
      
      // Update local state
      const { orders } = get();
      set({ 
        orders: [newOrder, ...orders], 
        isLoading: false 
      });
      
      return newOrder;
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  // Cancel order (only within 30 min or request cancel if preparing)
  cancelOrder: async (orderId, reason) => {
    try {
      const { orders } = get();
      const order = orders.find(o => o.id === orderId);
      if (!order) throw new Error('Không tìm thấy đơn hàng');

      const minutesSinceOrder = (Date.now() - order.createdAt.getTime()) / (1000 * 60);

      if (order.status === ORDER_STATUS.DELIVERED || order.status === ORDER_STATUS.CANCELLED) {
        throw new Error('Không thể hủy đơn hàng này');
      }

      if (order.status === ORDER_STATUS.DELIVERING) {
        throw new Error('Đơn hàng đang giao, không thể hủy');
      }

      // If > 30 min and status is PREPARING -> send cancel request
      if (order.status === ORDER_STATUS.PREPARING) {
        // Mock: send cancel request to shop (update in Realm)
        await realmDB.updateOrderStatus(orderId, ORDER_STATUS.CANCELLED);
        await realmDB.cancelOrder(orderId, reason || 'Khách yêu cầu hủy');
        
        // Update local state
        const updated = await realmDB.getAllOrders();
        set({ orders: updated });
        
        return { type: 'request', message: 'Đã gửi yêu cầu hủy đơn cho shop' };
      }

      // Within 30 min -> direct cancel
      if (minutesSinceOrder <= 30 || order.status <= ORDER_STATUS.CONFIRMED) {
        await realmDB.cancelOrder(orderId, reason || 'Khách hủy');
        
        // Update local state
        const updated = await realmDB.getAllOrders();
        set({ orders: updated });
        
        return { type: 'cancelled', message: 'Đã hủy đơn hàng' };
      }

      throw new Error('Đã quá 30 phút, không thể hủy trực tiếp');
    } catch (e) {
      console.error('Error cancelling order:', e);
      throw e;
    }
  },

  // Simulate status progression (for testing)
  advanceOrderStatus: async (orderId) => {
    try {
      const { orders } = get();
      const order = orders.find(o => o.id === orderId);
      
      if (order && order.status < ORDER_STATUS.DELIVERED && order.status !== ORDER_STATUS.CANCELLED) {
        const newStatus = order.status + 1;
        await realmDB.updateOrderStatus(orderId, newStatus);
        
        // Update local state
        const updated = await realmDB.getAllOrders();
        set({ orders: updated });
      }
    } catch (e) {
      console.error('Error advancing order status:', e);
      throw e;
    }
  },
}));

export default useOrderStore;
