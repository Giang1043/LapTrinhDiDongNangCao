import httpClient from './http';
import config from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  // Register
  register: async ({ email, password, fullName, phone }) => {
    try {
      const response = await httpClient.post(config.ENDPOINTS.REGISTER, {
        email,
        password,
        full_name: fullName,
        phone,
      });

      // Save token
      if (response.token) {
        await AsyncStorage.setItem('authToken', response.token);
      }

      return {
        success: true,
        user: response.user,
        token: response.token,
      };
    } catch (error) {
      throw error;
    }
  },

  // Login
  login: async ({ email, password }) => {
    try {
      const response = await httpClient.post(config.ENDPOINTS.LOGIN, {
        email,
        password,
      });

      // Save token
      if (response.token) {
        await AsyncStorage.setItem('authToken', response.token);
      }

      return {
        success: true,
        token: response.token,
        user: response.user,
      };
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      await httpClient.post(config.ENDPOINTS.LOGOUT);
      await AsyncStorage.removeItem('authToken');
      return { success: true };
    } catch (error) {
      // Still remove token locally even if API call fails
      await AsyncStorage.removeItem('authToken');
      return { success: true };
    }
  },

  // Get token from storage
  getToken: async () => {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      return null;
    }
  },
};
