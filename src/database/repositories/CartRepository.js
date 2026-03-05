/**
 * Cart Repository
 * All cart item-related database operations
 */

import { realmManager } from '../realmManager';

export class CartRepository {
  /**
   * Add item to cart
   * @param {Object} cartData - {userId, productId, quantity}
   * @returns {Object} Created cart item
   */
  static addToCart(cartData) {
    try {
      const realm = realmManager.getRealm();
      const { userId, productId, quantity } = cartData;

      // Check if item already in cart
      const existing = realm
        .objects('CartItem')
        .filtered('userId = $0 AND productId = $1', userId, productId)[0];

      let cartItem;
      realm.write(() => {
        if (existing) {
          // Update quantity if exists
          existing.quantity += quantity;
          existing.updatedAt = new Date();
          cartItem = existing;
        } else {
          // Create new cart item
          const maxCartItem = realm.objects('CartItem').sorted('id', true)[0];
          const newId = maxCartItem ? maxCartItem.id + 1 : 1;

          cartItem = realm.create('CartItem', {
            id: newId,
            userId,
            productId,
            quantity,
            addedAt: new Date(),
            updatedAt: new Date(),
          });
        }
      });

      console.log(`✓ Added to cart: product ${productId}`);
      return this._toObject(cartItem);
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      throw error;
    }
  }

  /**
   * Get all cart items for user
   * @param {number} userId - User ID
   * @returns {Array} Array of cart items
   */
  static getCartItems(userId) {
    try {
      const realm = realmManager.getRealm();
      const items = realm.objects('CartItem').filtered('userId = $0', userId);
      return items.map((item) => this._toObject(item));
    } catch (error) {
      console.error('❌ Error getting cart items:', error);
      return [];
    }
  }

  /**
   * Update cart item quantity
   * @param {number} cartItemId - Cart item ID
   * @param {number} quantity - New quantity
   * @returns {Object|null} Updated cart item or null
   */
  static updateCartItem(cartItemId, quantity) {
    try {
      const realm = realmManager.getRealm();
      const item = realm.objects('CartItem').filtered('id = $0', cartItemId)[0];

      if (!item) {
        console.warn(`Cart item not found: ${cartItemId}`);
        return null;
      }

      realm.write(() => {
        if (quantity <= 0) {
          realm.delete(item);
          console.log(`✓ Cart item removed: ${cartItemId}`);
          return true;
        }

        item.quantity = quantity;
        item.updatedAt = new Date();
      });

      return this._toObject(item);
    } catch (error) {
      console.error('❌ Error updating cart item:', error);
      throw error;
    }
  }

  /**
   * Remove item from cart
   * @param {number} cartItemId - Cart item ID
   * @returns {boolean} Success status
   */
  static removeFromCart(cartItemId) {
    try {
      const realm = realmManager.getRealm();
      const item = realm.objects('CartItem').filtered('id = $0', cartItemId)[0];

      if (!item) {
        console.warn(`Cart item not found: ${cartItemId}`);
        return false;
      }

      realm.write(() => {
        realm.delete(item);
      });

      console.log(`✓ Cart item removed: ${cartItemId}`);
      return true;
    } catch (error) {
      console.error('❌ Error removing from cart:', error);
      throw error;
    }
  }

  /**
   * Clear all cart items for user
   * @param {number} userId - User ID
   * @returns {boolean} Success status
   */
  static clearCart(userId) {
    try {
      const realm = realmManager.getRealm();
      const items = realm.objects('CartItem').filtered('userId = $0', userId);

      if (items.length === 0) {
        console.log(`Cart already empty for user: ${userId}`);
        return true;
      }

      realm.write(() => {
        realm.delete(items);
      });

      console.log(`✓ Cart cleared for user: ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      throw error;
    }
  }

  /**
   * Get cart total price (needs product prices joined)
   * This is a simple calculation - in production might join with Product
   * @param {number} userId - User ID
   * @param {Function} getProductPrice - Function to get product price
   * @returns {number} Total price
   */
  static getCartTotal(userId, getProductPrice) {
    try {
      const items = this.getCartItems(userId);
      let total = 0;

      items.forEach((item) => {
        const price = getProductPrice(item.productId);
        if (price) {
          total += price * item.quantity;
        }
      });

      return total;
    } catch (error) {
      console.error('❌ Error calculating cart total:', error);
      return 0;
    }
  }

  /**
   * Get cart item count for user
   * @param {number} userId - User ID
   * @returns {number} Total items in cart
   */
  static getCartItemCount(userId) {
    try {
      const realm = realmManager.getRealm();
      const items = realm.objects('CartItem').filtered('userId = $0', userId);
      return items.reduce((sum, item) => sum + item.quantity, 0);
    } catch (error) {
      console.error('❌ Error getting cart item count:', error);
      return 0;
    }
  }

  /**
   * Convert Realm object to plain JavaScript object
   * @private
   */
  static _toObject(cartItem) {
    return {
      id: cartItem.id,
      userId: cartItem.userId,
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      addedAt: cartItem.addedAt,
      updatedAt: cartItem.updatedAt,
    };
  }
}

export default CartRepository;
