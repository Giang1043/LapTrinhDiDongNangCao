// ============================================
// Auth Context & Hook - Global State Management
// ============================================

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserRepository from '../database/repositories/UserRepository';
import { STORAGE_KEYS } from '../constants/appConstants';

// 1. Tạo Context
const AuthContext = createContext();

// 2. Tạo Provider bọc toàn bộ App
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Check if user is logged in by verifying stored user ID and fetching from Realm
   */
  const checkAuthStatus = async () => {
    try {
      const userId = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_USER_ID);

      if (userId) {
        // Fetch user from Realm by ID
        const user = UserRepository.getUserById(parseInt(userId, 10));

        if (user && user.isActive) {
          setCurrentUser(user);
          setIsLoggedIn(true);
        } else {
          // User not found or not active in Realm, clear auth
          await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_USER_ID);
          await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
      setIsLoggedIn(false);
      setCurrentUser(null);
    } finally {
      setAuthChecked(true);
    }
  };

  /**
   * Save auth data when user logs in
   * Stores user ID and token in AsyncStorage (minimal)
   * User data is fetched from Realm
   */
  const saveAuthData = async (authData) => {
    try {
      const { user, token } = authData;

      // Store only user ID and token in AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER_ID, String(user.id));
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);

      // Set current user from passed data
      setCurrentUser(user);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('❌ Error saving auth data:', error);
      throw error;
    }
  };

  /**
   * Clear auth data when user logs out
   */
  const logout = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_USER_ID);
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      setIsLoggedIn(false);
      setCurrentUser(null);
    } catch (error) {
      console.error('❌ Error logout:', error);
      throw error;
    }
  };

  /**
   * Get current user (re-fetch from Realm if needed)
   */
  const getCurrentUser = async () => {
    try {
      const userId = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_USER_ID);

      if (userId) {
        const user = UserRepository.getUserById(parseInt(userId, 10));
        setCurrentUser(user);
        return user;
      }

      return null;
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
  };

  /**
   * Update current user data (used after profile changes)
   * Cập nhật state Global ngay lập tức - tất cả screen sẽ thấy thay đổi này
   */
  const updateAuthData = async (updatedUser) => {
    try {
      if (updatedUser) {
        setCurrentUser(updatedUser); // Cập nhật state Global
      }
    } catch (error) {
      console.error('❌ Error updating auth data:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        authChecked,
        currentUser,
        saveAuthData,
        logout,
        getCurrentUser,
        updateAuthData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 3. Export custom hook để các file khác gọi (như cũ)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
