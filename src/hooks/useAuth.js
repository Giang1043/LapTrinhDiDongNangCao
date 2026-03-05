// ============================================
// useAuth Hook - Authentication Logic
// ============================================

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserRepository from '../database/repositories/UserRepository';
import { STORAGE_KEYS } from '../constants/appConstants';

/**
 * useAuth - Manage authentication state and operations
 * Handles:
 * - Checking auth status on app start (loads user from Realm)
 * - Saving/removing auth data (minimal AsyncStorage, user data from Realm)
 * - Logout functionality
 */
export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Check auth status on mount
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

  return {
    isLoggedIn,
    authChecked,
    currentUser,
    saveAuthData,
    logout,
    getCurrentUser,
  };
}
