/**
 * Order Repository
 * All order-related database operations
 * 
 * Order Status Codes:
 * 1 - Mới (Pending)
 * 2 - Đã xác nhận (Confirmed - auto after 30 mins)
 * 3 - Đang chuẩn bị (Preparing)
 * 4 - Đang giao (Shipping)
 * 5 - Hoàn thành (Completed)
 * 6 - Đã hủy (Cancelled)
 */

import { realmManager } from '../realmManager';

export class OrderRepository {
  /**
   * Create a new order (COD - Cash On Delivery)
   * @param {Object} orderData - {userId, items, totalPrice, deliveryAddress, notes?}
   * @returns {Object} Created order object
   */
  static createOrder(orderData) {
    try {
      const realm = realmManager.getRealm();
      const { userId, items, totalPrice, deliveryAddress, notes } = orderData;

      let order;
      realm.write(() => {
        // Get max ID
        const maxOrder = realm.objects('Order').sorted('id', true)[0];
        const newOrderId = maxOrder ? maxOrder.id + 1 : 1;

        // Create order with status = 1 (Mới)
        order = realm.create('Order', {
          id: newOrderId,
          userId,
          totalPrice,
          status: 1, // Mới/Pending
          paymentMethod: 'COD', // Cash On Delivery
          deliveryAddress,
          notes: notes || '',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Create order items
        items.forEach((item, index) => {
          const maxOrderItem = realm.objects('OrderItem').sorted('id', true)[0];
          const newItemId = maxOrderItem ? maxOrderItem.id + 1 : 1 + index;

          realm.create('OrderItem', {
            id: newItemId + index,
            orderId: newOrderId,
            productId: item.productId,
            quantity: item.quantity,
            priceAtOrder: item.priceAtOrder || 0,
          });
        });
      });

      console.log(`✓ Order created: ${order.id}`);
      return this._toObject(order);
    } catch (error) {
      console.error('❌ Error creating order:', error);
      throw error;
    }
  }

  /**
   * Get order by ID with items
   * @param {number} orderId - Order ID
   * @returns {Object|null} Order object with items or null
   */
  static getOrderById(orderId) {
    try {
      const realm = realmManager.getRealm();
      const order = realm.objects('Order').filtered('id = $0', orderId)[0];

      if (!order) {
        console.warn(`Order not found: ${orderId}`);
        return null;
      }

      const orderObj = this._toObject(order);
      const items = realm.objects('OrderItem').filtered('orderId = $0', orderId);
      orderObj.items = items.map((item) => this._itemToObject(item));

      return orderObj;
    } catch (error) {
      console.error('❌ Error getting order by ID:', error);
      return null;
    }
  }

  /**
   * Get order history for user (sorted by createdAt desc)
   * @param {number} userId - User ID
   * @returns {Array} Array of order objects with items
   */
  static getOrderHistory(userId) {
    try {
      const realm = realmManager.getRealm();
      const orders = realm.objects('Order').filtered('userId = $0', userId).sorted('createdAt', true);
      
      return orders.map((o) => {
        const orderObj = this._toObject(o);
        const items = realm.objects('OrderItem').filtered('orderId = $0', o.id);
        orderObj.items = items.map((item) => this._itemToObject(item));
        return orderObj;
      });
    } catch (error) {
      console.error('❌ Error getting order history:', error);
      return [];
    }
  }

  /**
   * Get orders by status for user
   * @param {number} userId - User ID
   * @param {Array<number>} statusArray - Array of status codes [1, 2, 3, ...]
   * @returns {Array} Array of order objects
   */
  static getOrdersByStatus(userId, statusArray) {
    try {
      const realm = realmManager.getRealm();
      let orders = realm.objects('Order').filtered('userId = $0', userId);

      // Filter by status array
      orders = orders.filter((o) => statusArray.includes(o.status));

      return Array.from(orders).map((o) => {
        const orderObj = this._toObject(o);
        const items = realm.objects('OrderItem').filtered('orderId = $0', o.id);
        orderObj.items = items.map((item) => this._itemToObject(item));
        return orderObj;
      });
    } catch (error) {
      console.error('❌ Error getting orders by status:', error);
      return [];
    }
  }

  /**
   * Update order status
   * @param {number} orderId - Order ID
   * @param {number} status - New status code (1-6)
   * @returns {Object|null} Updated order or null
   */
  static updateOrderStatus(orderId, status) {
    try {
      const realm = realmManager.getRealm();
      const order = realm.objects('Order').filtered('id = $0', orderId)[0];

      if (!order) {
        console.warn(`Order not found: ${orderId}`);
        return null;
      }

      realm.write(() => {
        order.status = status;
        order.updatedAt = new Date();
      });

      console.log(`✓ Order status updated: ${orderId} -> ${status}`);
      return this._toObject(order);
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      throw error;
    }
  }

  /**
   * Check and auto-update order statuses based on time
   * If order status = 1 (Mới) and 30 minutes have passed -> update to status 2 (Đã xác nhận)
   * @param {number} userId - User ID
   * @returns {Array} Array of updated orders
   */
  static updateOrderStatuses(userId) {
    try {
      const realm = realmManager.getRealm();
      const now = new Date();
      const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds

      const orders = realm.objects('Order').filtered('userId = $0', userId);
      const updatedOrders = [];

      realm.write(() => {
        orders.forEach((order) => {
          // Check if order is still in status 1 (Mới)
          if (order.status === 1) {
            const timePassed = now.getTime() - new Date(order.createdAt).getTime();

            // If 30+ minutes have passed, auto-update to status 2 (Đã xác nhận)
            if (timePassed >= thirtyMinutes) {
              order.status = 2;
              order.updatedAt = new Date();
              updatedOrders.push(this._toObject(order));
              console.log(`✓ Order auto-updated: ${order.id} -> status 2 (Đã xác nhận)`);
            }
          }
        });
      });

      return updatedOrders;
    } catch (error) {
      console.error('❌ Error updating order statuses:', error);
      return [];
    }
  }

  /**
   * Get order item details (enrich with product data)
   * @param {number} orderId - Order ID
   * @param {Function} getProductById - Function to fetch product details
   * @returns {Array} Array of order items with product info
   */
  static getOrderItemsEnriched(orderId, getProductById) {
    try {
      const realm = realmManager.getRealm();
      const items = realm.objects('OrderItem').filtered('orderId = $0', orderId);

      return items.map((item) => {
        const product = getProductById(item.productId);
        return {
          ...this._itemToObject(item),
          product,
        };
      });
    } catch (error) {
      console.error('❌ Error getting enriched order items:', error);
      return [];
    }
  }

  /**
   * Cancel order (only if status = 1 and within 30 minutes)
   * @param {number} orderId - Order ID
   * @returns {Object|null} Updated order or null
   */
  static cancelOrder(orderId) {
    try {
      const realm = realmManager.getRealm();
      const order = realm.objects('Order').filtered('id = $0', orderId)[0];

      if (!order) {
        console.warn(`Order not found: ${orderId}`);
        return null;
      }

      // Only allow cancellation if status = 1 (Mới)
      if (order.status !== 1) {
        console.warn(`Cannot cancel order with status: ${order.status}`);
        return null;
      }

      // Check if within 30 minutes
      const now = new Date();
      const timePassed = now.getTime() - new Date(order.createdAt).getTime();
      const thirtyMinutes = 30 * 60 * 1000;

      if (timePassed > thirtyMinutes) {
        console.warn(`Cannot cancel order after 30 minutes: ${orderId}`);
        return null;
      }

      realm.write(() => {
        order.status = 6; // Đã hủy
        order.updatedAt = new Date();
      });

      console.log(`✓ Order cancelled: ${orderId}`);
      return this._toObject(order);
    } catch (error) {
      console.error('❌ Error cancelling order:', error);
      throw error;
    }
  }

  /**
   * Check if order can be cancelled (status 1 and within 30 mins)
   * @param {number} orderId - Order ID
   * @returns {boolean}
   */
  static canCancelOrder(orderId) {
    try {
      const realm = realmManager.getRealm();
      const order = realm.objects('Order').filtered('id = $0', orderId)[0];

      if (!order || order.status !== 1) {
        return false;
      }

      const now = new Date();
      const timePassed = now.getTime() - new Date(order.createdAt).getTime();
      const thirtyMinutes = 30 * 60 * 1000;

      return timePassed <= thirtyMinutes;
    } catch (error) {
      console.error('❌ Error checking cancel eligibility:', error);
      return false;
    }
  }

  /**
   * Get time remaining until order auto-confirms (if status = 1)
   * @param {number} orderId - Order ID
   * @returns {number|null} Milliseconds remaining, or null if not applicable
   */
  static getTimeUntilAutoConfirm(orderId) {
    try {
      const realm = realmManager.getRealm();
      const order = realm.objects('Order').filtered('id = $0', orderId)[0];

      if (!order || order.status !== 1) {
        return null;
      }

      const now = new Date();
      const timePassed = now.getTime() - new Date(order.createdAt).getTime();
      const thirtyMinutes = 30 * 60 * 1000;
      const timeRemaining = thirtyMinutes - timePassed;

      return timeRemaining > 0 ? timeRemaining : 0;
    } catch (error) {
      console.error('❌ Error calculating time until auto-confirm:', error);
      return null;
    }
  }

  /**
   * Get order status text
   * @param {number} status - Status code
   * @returns {string} Status text
   */
  static getStatusText(status) {
    const statusMap = {
      1: 'Mới',
      2: 'Đã xác nhận',
      3: 'Đang chuẩn bị',
      4: 'Đang giao',
      5: 'Hoàn thành',
      6: 'Đã hủy',
    };
    return statusMap[status] || 'Không xác định';
  }

  /**
   * Convert Realm order object to plain JavaScript object
   * @private
   */
  static _toObject(order) {
    return {
      id: order.id,
      userId: order.userId,
      totalPrice: order.totalPrice,
      status: order.status,
      paymentMethod: order.paymentMethod,
      deliveryAddress: order.deliveryAddress,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  /**
   * Convert Realm order item object to plain JavaScript object
   * @private
   */
  static _itemToObject(item) {
    return {
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      quantity: item.quantity,
      priceAtOrder: item.priceAtOrder,
    };
  }
}

export default OrderRepository;
