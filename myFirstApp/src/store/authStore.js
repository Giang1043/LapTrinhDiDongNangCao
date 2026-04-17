import { create } from 'zustand';
import { authService } from '../services/authService';
import realmDB from '../database/realmDB';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isLoggedIn: false,
  error: null,
  otpData: null, // { email, type, otp_for_testing }

  // Load saved session from Realm
  loadSession: async () => {
    try {
      // For now, we'll load from the first user in the database
      // In a real app, you might store user ID in a secure storage
      const allUsers = await realmDB.getAllCategories(); // This is just a test
      // We'll keep user null on app start and require login
      // User data will be managed through login/register flows
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
      
      // Save user to Realm database
      await realmDB.createUser({
        id: result.user.id,
        email: otpData.email,
        password: otpData.password,
        fullName: otpData.fullName,
        phone: otpData.phone,
        avatar: result.user.avatar || '',
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
      
      // Update user password in Realm
      const user = await realmDB.getUserByEmail(otpData.email);
      if (user) {
        await realmDB.updateUser(user.id, { password: newPassword });
      }
      
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
    set({ user: null, token: null, isLoggedIn: false, otpData: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
