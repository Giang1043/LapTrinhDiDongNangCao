import { create } from 'zustand';
import realmDB from '../database/realmDB';

const useCartStore = create((set, get) => ({
  items: [], // [{ product, quantity }] - simplified format for UI
  isLoading: false,

  // Load cart from Realm database
  loadCart: async () => {
    try {
      const cartItems = await realmDB.getAllCartItems();
      // Convert Realm objects to plain objects with product structure
      const items = cartItems.map(item => ({
        product: {
          id: item.productId,
          name: item.productName,
          price: item.price,
          image: item.image,
          categoryId: item.categoryId,
        },
        quantity: item.quantity,
      }));
      set({ items });
    } catch (e) {
      console.log('Error loading cart:', e);
    }
  },

  // Add to cart
  addToCart: async (product, quantity = 1) => {
    try {
      const { items } = get();
      await realmDB.addToCart(product, quantity);
      
      // Update local state
      const existingIndex = items.findIndex(i => i.product.id === product.id);
      let newItems;
      if (existingIndex >= 0) {
        newItems = [...items];
        newItems[existingIndex] = { 
          ...newItems[existingIndex], 
          quantity: newItems[existingIndex].quantity + quantity 
        };
      } else {
        newItems = [...items, { product, quantity }];
      }
      set({ items: newItems });
    } catch (e) {
      console.error('Error adding to cart:', e);
      throw e;
    }
  },

  // Update quantity
  updateQuantity: async (productId, quantity) => {
    try {
      const { items } = get();
      
      if (quantity <= 0) {
        await realmDB.removeFromCart(productId);
        const newItems = items.filter(i => i.product.id !== productId);
        set({ items: newItems });
      } else {
        await realmDB.updateCartItemQuantity(productId, quantity);
        const newItems = items.map(i => 
          i.product.id === productId ? { ...i, quantity } : i
        );
        set({ items: newItems });
      }
    } catch (e) {
      console.error('Error updating cart quantity:', e);
      throw e;
    }
  },

  // Remove from cart
  removeFromCart: async (productId) => {
    try {
      const { items } = get();
      await realmDB.removeFromCart(productId);
      const newItems = items.filter(i => i.product.id !== productId);
      set({ items: newItems });
    } catch (e) {
      console.error('Error removing from cart:', e);
      throw e;
    }
  },

  // Clear cart
  clearCart: async () => {
    try {
      await realmDB.clearCart();
      set({ items: [] });
    } catch (e) {
      console.error('Error clearing cart:', e);
      throw e;
    }
  },

  // Get total
  getTotal: () => {
    return get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  },

  // Get item count
  getItemCount: () => {
    return get().items.reduce((sum, i) => sum + i.quantity, 0);
  },
}));

export default useCartStore;
