// ============================================
// useAuth Hook - Authentication Logic
// ============================================

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * useAuth - Manage authentication state and operations
 * Handles:
 * - Checking auth status on app start
 * - Saving/removing auth data
 * - Logout functionality
 */
export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Check if user is logged in
   */
  const checkAuthStatus = async () => {
    try {
      const authData = await AsyncStorage.getItem('authData');
      if (authData) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsLoggedIn(false);
    } finally {
      setAuthChecked(true);
    }
  };

  /**
   * Save auth data when user logs in
   */
  const saveAuthData = async (authData) => {
    try {
      await AsyncStorage.setItem('authData', JSON.stringify(authData));
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw error;
    }
  };

  /**
   * Clear auth data when user logs out
   */
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authData');
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error logout:', error);
      throw error;
    }
  };

  return {
    isLoggedIn,
    authChecked,
    saveAuthData,
    logout,
  };
}
