/**
 * Order Repository
 * All order-related database operations
 */

import { realmManager } from '../realmManager';

export class OrderRepository {
  /**
   * Create a new order
   * @param {Object} orderData - {userId, items, totalPrice, deliveryAddress, paymentMethod?, notes?}
   * @returns {Object} Created order object
   */
  static createOrder(orderData) {
    try {
      const realm = realmManager.getRealm();
      const { userId, items, totalPrice, deliveryAddress, paymentMethod, notes } = orderData;

      let order;
      realm.write(() => {
        // Get max ID
        const maxOrder = realm.objects('Order').sorted('id', true)[0];
        const newOrderId = maxOrder ? maxOrder.id + 1 : 1;

        // Create order
        order = realm.create('Order', {
          id: newOrderId,
          userId,
          totalPrice,
          status: 'pending',
          paymentMethod: paymentMethod || 'cash',
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
   * Get order history for user
   * @param {number} userId - User ID
   * @returns {Array} Array of order objects
   */
  static getOrderHistory(userId) {
    try {
      const realm = realmManager.getRealm();
      const orders = realm.objects('Order').filtered('userId = $0', userId).sorted('createdAt', true);
      return orders.map((o) => this._toObject(o));
    } catch (error) {
      console.error('❌ Error getting order history:', error);
      return [];
    }
  }

  /**
   * Update order status
   * @param {number} orderId - Order ID
   * @param {string} status - New status
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
   * Get order items
   * @param {number} orderId - Order ID
   * @returns {Array} Array of order items
   */
  static getOrderItems(orderId) {
    try {
      const realm = realmManager.getRealm();
      const items = realm.objects('OrderItem').filtered('orderId = $0', orderId);
      return items.map((item) => this._itemToObject(item));
    } catch (error) {
      console.error('❌ Error getting order items:', error);
      return [];
    }
  }

  /**
   * Cancel order (mark as cancelled)
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

      // Only allow cancellation if pending
      if (order.status !== 'pending') {
        console.warn(`Cannot cancel order with status: ${order.status}`);
        return null;
      }

      realm.write(() => {
        order.status = 'cancelled';
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
   * Get orders by status
   * @param {string} status - Order status
   * @returns {Array} Array of orders
   */
  static getOrdersByStatus(status) {
    try {
      const realm = realmManager.getRealm();
      const orders = realm.objects('Order').filtered('status = $0', status);
      return orders.map((o) => this._toObject(o));
    } catch (error) {
      console.error('❌ Error getting orders by status:', error);
      return [];
    }
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
