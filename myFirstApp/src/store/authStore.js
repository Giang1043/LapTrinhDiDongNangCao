import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isLoggedIn: false,
  error: null,

  // Load saved session
  loadSession: async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('authToken');
      if (userData && token) {
        set({ user: JSON.parse(userData), token, isLoggedIn: true });
      }
    } catch (e) {
      console.log('Error loading session:', e);
    }
  },

  // Register
  register: async ({ email, password, fullName, phone }) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.register({ email, password, fullName, phone });
      await AsyncStorage.setItem('user', JSON.stringify(result.user));
      await AsyncStorage.setItem('authToken', result.token);
      set({
        isLoading: false,
        user: result.user,
        token: result.token,
        isLoggedIn: true,
      });
      return result;
    } catch (e) {
      set({ isLoading: false, error: e.message });
      throw e;
    }
  },

  // Login
  login: async ({ email, password }) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.login({ email, password });
      await AsyncStorage.setItem('user', JSON.stringify(result.user));
      await AsyncStorage.setItem('authToken', result.token);
      set({
        isLoading: false,
        user: result.user,
        token: result.token,
        isLoggedIn: true,
      });
      return result;
    } catch (e) {
      set({ isLoading: false, error: e.message });
      throw e;
    }
  },

  // Logout
  logout: async () => {
    await authService.logout();
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('authToken');
    set({ user: null, token: null, isLoggedIn: false });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
