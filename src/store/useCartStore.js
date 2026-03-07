/**
 * Cart Store (Zustand)
 * Global state management for shopping cart
 * Synchronizes with CartRepository (Realm Database)
 */

import { create } from 'zustand';
import CartRepository from '../database/repositories/CartRepository';
import ProductRepository from '../database/repositories/ProductRepository';

export const useCartStore = create((set, get) => ({
  // State
  cartItems: [], // Array of {id, userId, productId, quantity, product}
  total: 0,
  loading: false,

  /**
   * Initialize cart: Load from Realm when app starts
   * Called once when app boots (in RootNavigator)
   */
  initializeCart: async (userId) => {
    if (!userId) {
      console.log('⚠️ No user ID provided for cart initialization');
      return;
    }

    try {
      set({ loading: true });

      // Get cart items from Realm
      const realmItems = CartRepository.getCartItems(userId);

      // Enrich with product data
      const enrichedItems = realmItems.map((cartItem) => {
        const product = ProductRepository.getProductById(cartItem.productId);
        return {
          ...cartItem,
          product,
        };
      });

      // Calculate total
      const total = enrichedItems.reduce((sum, item) => {
        const price = item.product?.price || 0;
        const discount = item.product?.discount || 0;
        const discountedPrice = price - (price * discount) / 100;
        return sum + discountedPrice * item.quantity;
      }, 0);

      set({ cartItems: enrichedItems, total });
      console.log('✓ Cart initialized:', {
        items: enrichedItems.length,
        total,
      });
    } catch (error) {
      console.error('❌ Error initializing cart:', error);
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Add product to cart
   * Updates both Zustand state and Realm database
   * @param {number} userId - Current user ID
   * @param {number} productId - Product to add
   * @param {number} quantity - Quantity (default 1)
   */
  addToCart: (userId, productId, quantity = 1) => {
    try {
      // Add to Realm
      CartRepository.addToCart({
        userId,
        productId,
        quantity,
      });

      // Update Zustand state
      const { cartItems } = get();

      // Check if product already in cart
      const existingIndex = cartItems.findIndex(
        (item) => item.productId === productId
      );

      let updatedItems;
      if (existingIndex >= 0) {
        // Update existing item
        updatedItems = [...cartItems];
        updatedItems[existingIndex].quantity += quantity;
      } else {
        // Add new item with product data
        const product = ProductRepository.getProductById(productId);
        const newItem = {
          id: Date.now(), // Temporary ID, will be replaced on reload
          userId,
          productId,
          quantity,
          product,
        };
        updatedItems = [...cartItems, newItem];
      }

      // Calculate new total
      const newTotal = updatedItems.reduce((sum, item) => {
        const price = item.product?.price || 0;
        const discount = item.product?.discount || 0;
        const discountedPrice = price - (price * discount) / 100;
        return sum + discountedPrice * item.quantity;
      }, 0);

      set({ cartItems: updatedItems, total: newTotal });
      console.log('✓ Added to cart:', { productId, quantity });
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
    }
  },

  /**
   * Update cart item quantity
   * @param {number} cartItemId - Cart item ID
   * @param {number} newQuantity - New quantity
   */
  updateQuantity: (cartItemId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        // Remove if quantity becomes 0 or less
        get().removeFromCart(cartItemId);
        return;
      }

      // Update in Realm
      CartRepository.updateCartItem(cartItemId, newQuantity);

      // Update Zustand state
      const { cartItems } = get();
      const updatedItems = cartItems.map((item) =>
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      );

      // Calculate new total
      const newTotal = updatedItems.reduce((sum, item) => {
        const price = item.product?.price || 0;
        const discount = item.product?.discount || 0;
        const discountedPrice = price - (price * discount) / 100;
        return sum + discountedPrice * item.quantity;
      }, 0);

      set({ cartItems: updatedItems, total: newTotal });
      console.log('✓ Updated quantity:', { cartItemId, newQuantity });
    } catch (error) {
      console.error('❌ Error updating quantity:', error);
    }
  },

  /**
   * Remove item from cart
   * @param {number} cartItemId - Cart item ID
   */
  removeFromCart: (cartItemId) => {
    try {
      // Remove from Realm
      CartRepository.removeFromCart(cartItemId);

      // Update Zustand state
      const { cartItems } = get();
      const updatedItems = cartItems.filter((item) => item.id !== cartItemId);

      // Calculate new total
      const newTotal = updatedItems.reduce((sum, item) => {
        const price = item.product?.price || 0;
        const discount = item.product?.discount || 0;
        const discountedPrice = price - (price * discount) / 100;
        return sum + discountedPrice * item.quantity;
      }, 0);

      set({ cartItems: updatedItems, total: newTotal });
      console.log('✓ Removed from cart:', { cartItemId });
    } catch (error) {
      console.error('❌ Error removing from cart:', error);
    }
  },

  /**
   * Clear entire cart
   * @param {number} userId - User ID
   */
  clearCart: (userId) => {
    try {
      CartRepository.clearCart(userId);
      set({ cartItems: [], total: 0 });
      console.log('✓ Cart cleared');
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
    }
  },

  /**
   * Get cart item count (sum of quantities)
   */
  getCartCount: () => {
    const { cartItems } = get();
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  },

  /**
   * Get total price
   */
  getTotal: () => {
    const { total } = get();
    return total;
  },

  /**
   * Reload cart from Realm (for manual sync)
   * Useful after external changes
   */
  reloadCart: async (userId) => {
    try {
      set({ loading: true });
      await get().initializeCart(userId);
    } catch (error) {
      console.error('❌ Error reloading cart:', error);
    } finally {
      set({ loading: false });
    }
  },
}));
