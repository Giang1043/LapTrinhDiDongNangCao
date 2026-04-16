import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useCartStore = create((set, get) => ({
  items: [], // [{ product, quantity }]
  isLoading: false,

  // Load cart from storage
  loadCart: async () => {
    try {
      const data = await AsyncStorage.getItem('cart');
      if (data) set({ items: JSON.parse(data) });
    } catch (e) {
      console.log('Error loading cart:', e);
    }
  },

  // Save cart to storage
  _saveCart: async (items) => {
    await AsyncStorage.setItem('cart', JSON.stringify(items));
  },

  // Add to cart
  addToCart: (product, quantity = 1) => {
    const { items, _saveCart } = get();
    const existingIndex = items.findIndex(i => i.product.id === product.id);
    let newItems;
    if (existingIndex >= 0) {
      newItems = [...items];
      newItems[existingIndex] = { ...newItems[existingIndex], quantity: newItems[existingIndex].quantity + quantity };
    } else {
      newItems = [...items, { product, quantity }];
    }
    set({ items: newItems });
    _saveCart(newItems);
  },

  // Update quantity
  updateQuantity: (productId, quantity) => {
    const { items, _saveCart } = get();
    if (quantity <= 0) {
      const newItems = items.filter(i => i.product.id !== productId);
      set({ items: newItems });
      _saveCart(newItems);
    } else {
      const newItems = items.map(i => i.product.id === productId ? { ...i, quantity } : i);
      set({ items: newItems });
      _saveCart(newItems);
    }
  },

  // Remove from cart
  removeFromCart: (productId) => {
    const { items, _saveCart } = get();
    const newItems = items.filter(i => i.product.id !== productId);
    set({ items: newItems });
    _saveCart(newItems);
  },

  // Clear cart
  clearCart: async () => {
    set({ items: [] });
    await AsyncStorage.removeItem('cart');
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
