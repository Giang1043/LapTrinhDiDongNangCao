import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // Load orders from storage
  loadOrders: async () => {
    try {
      const data = await AsyncStorage.getItem('orders');
      if (data) {
        let orders = JSON.parse(data);
        // Auto-confirm orders after 30 minutes
        const now = Date.now();
        orders = orders.map(order => {
          if (order.status === ORDER_STATUS.NEW && now - order.createdAt > 30 * 60 * 1000) {
            return { ...order, status: ORDER_STATUS.CONFIRMED, confirmedAt: order.createdAt + 30 * 60 * 1000 };
          }
          return order;
        });
        set({ orders });
        await AsyncStorage.setItem('orders', JSON.stringify(orders));
      }
    } catch (e) {
      console.log('Error loading orders:', e);
    }
  },

  // Place order
  placeOrder: async ({ items, address, phone, paymentMethod, note }) => {
    set({ isLoading: true });
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    const { orders } = get();
    const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    const newOrder = {
      id: `ORD${Date.now()}`,
      items,
      address,
      phone,
      paymentMethod: paymentMethod || 'COD',
      note: note || '',
      total,
      status: ORDER_STATUS.NEW,
      createdAt: Date.now(),
      confirmedAt: null,
      cancelledAt: null,
      cancelReason: null,
    };
    const updated = [newOrder, ...orders];
    set({ orders: updated, isLoading: false });
    await AsyncStorage.setItem('orders', JSON.stringify(updated));
    return newOrder;
  },

  // Cancel order (only within 30 min or request cancel if preparing)
  cancelOrder: async (orderId, reason) => {
    const { orders } = get();
    const order = orders.find(o => o.id === orderId);
    if (!order) throw new Error('Không tìm thấy đơn hàng');

    const minutesSinceOrder = (Date.now() - order.createdAt) / (1000 * 60);

    if (order.status === ORDER_STATUS.DELIVERED || order.status === ORDER_STATUS.CANCELLED) {
      throw new Error('Không thể hủy đơn hàng này');
    }

    if (order.status === ORDER_STATUS.DELIVERING) {
      throw new Error('Đơn hàng đang giao, không thể hủy');
    }

    // If > 30 min and status is PREPARING -> send cancel request
    if (order.status === ORDER_STATUS.PREPARING) {
      // Mock: send cancel request to shop
      const updated = orders.map(o =>
        o.id === orderId ? { ...o, cancelRequested: true, cancelReason: reason || 'Khách yêu cầu hủy' } : o
      );
      set({ orders: updated });
      await AsyncStorage.setItem('orders', JSON.stringify(updated));
      return { type: 'request', message: 'Đã gửi yêu cầu hủy đơn cho shop' };
    }

    // Within 30 min -> direct cancel
    if (minutesSinceOrder <= 30 || order.status <= ORDER_STATUS.CONFIRMED) {
      const updated = orders.map(o =>
        o.id === orderId ? { ...o, status: ORDER_STATUS.CANCELLED, cancelledAt: Date.now(), cancelReason: reason || 'Khách hủy' } : o
      );
      set({ orders: updated });
      await AsyncStorage.setItem('orders', JSON.stringify(updated));
      return { type: 'cancelled', message: 'Đã hủy đơn hàng' };
    }

    throw new Error('Đã quá 30 phút, không thể hủy trực tiếp');
  },

  // Simulate status progression (for testing)
  advanceOrderStatus: async (orderId) => {
    const { orders } = get();
    const updated = orders.map(o => {
      if (o.id === orderId && o.status < ORDER_STATUS.DELIVERED && o.status !== ORDER_STATUS.CANCELLED) {
        return { ...o, status: o.status + 1 };
      }
      return o;
    });
    set({ orders: updated });
    await AsyncStorage.setItem('orders', JSON.stringify(updated));
  },
}));

export default useOrderStore;
