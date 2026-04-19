import { create } from 'zustand';
import { cartService } from '../services/cartService';

const useCartStore = create((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  // Load cart from backend
  loadCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await cartService.getCart();
      set({
        items: data.items || [],
        isLoading: false,
      });
    } catch (e) {
      // Silently fail if no auth token - cart will be empty
      console.log('Error loading cart:', e.message);
      set({
        items: [],
        error: null,
        isLoading: false,
      });
    }
  },

  // Add to cart
  addToCart: async (productId, quantity = 1) => {
    set({ isLoading: true, error: null });
    try {
      const data = await cartService.addToCart(productId, quantity);
      set({
        items: data.items || [],
        isLoading: false,
      });
      return data;
    } catch (e) {
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  // Update quantity
  updateQuantity: async (productId, quantity) => {
    set({ isLoading: true, error: null });
    try {
      if (quantity <= 0) {
        return await get().removeFromCart(productId);
      }
      const data = await cartService.updateQuantity(productId, quantity);
      set({
        items: data.items || [],
        isLoading: false,
      });
      return data;
    } catch (e) {
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  // Remove from cart
  removeFromCart: async (productId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await cartService.removeFromCart(productId);
      set({
        items: data.items || [],
        isLoading: false,
      });
      return data;
    } catch (e) {
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  // Clear cart
  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      await cartService.clearCart();
      set({
        items: [],
        isLoading: false,
      });
    } catch (e) {
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  // Get total
  getTotal: () => {
    return get().items.reduce((sum, i) => sum + ((i.product?.price || 0) * i.quantity), 0);
  },

  // Get item count
  getItemCount: () => {
    return get().items.reduce((sum, i) => sum + i.quantity, 0);
  },
}));

export default useCartStore;
