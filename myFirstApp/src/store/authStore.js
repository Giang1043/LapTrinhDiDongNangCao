import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isLoggedIn: false,
  error: null,
  otpData: null, // { email, type, otp_for_testing }

  // Load saved session
  loadSession: async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
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
      set({
        isLoading: false,
        otpData: { email, password, fullName, phone, type: 'register', otp_for_testing: result.otp_for_testing },
      });
      return result;
    } catch (e) {
      set({ isLoading: false, error: e.message });
      throw e;
    }
  },

  // Verify Register OTP
  verifyRegisterOTP: async (otp) => {
    const { otpData } = get();
    if (!otpData || otpData.type !== 'register') throw new Error('Không có dữ liệu đăng ký');
    set({ isLoading: true, error: null });
    try {
      const result = await authService.verifyRegisterOTP({
        email: otpData.email,
        password: otpData.password,
        fullName: otpData.fullName,
        phone: otpData.phone,
        otp,
      });
      set({ isLoading: false, otpData: null });
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
      await AsyncStorage.setItem('token', result.token);
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

  // Forgot Password
  forgotPassword: async ({ email }) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.forgotPassword({ email });
      set({
        isLoading: false,
        otpData: { email, type: 'forgot', otp_for_testing: result.otp_for_testing },
      });
      return result;
    } catch (e) {
      set({ isLoading: false, error: e.message });
      throw e;
    }
  },

  // Reset Password
  resetPassword: async ({ otp, newPassword }) => {
    const { otpData } = get();
    if (!otpData || otpData.type !== 'forgot') throw new Error('Không có dữ liệu');
    set({ isLoading: true, error: null });
    try {
      const result = await authService.resetPassword({ email: otpData.email, otp, newPassword });
      set({ isLoading: false, otpData: null });
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
    await AsyncStorage.removeItem('token');
    set({ user: null, token: null, isLoggedIn: false, otpData: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
