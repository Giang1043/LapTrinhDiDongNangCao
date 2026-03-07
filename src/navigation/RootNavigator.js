import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import IntroScreen from '../screens/IntroScreen';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import { useAuth } from '../hooks/useAuth';
import { useCartStore } from '../store/useCartStore';
import { realmManager } from '../database/realmManager';
import { seedDatabase } from '../database/seedData';


const Stack = createNativeStackNavigator();

/**
 * Root Navigator - Main entry point for navigation
 * Handles:
 * - Intro screen on first launch
 * - Authentication flows
 * - Main app navigation
 */
export default function RootNavigator() {
  const [isAppStarted, setIsAppStarted] = useState(false);
  const { isLoggedIn, authChecked, currentUser, saveAuthData, logout } = useAuth();
  const initializeCart = useCartStore((state) => state.initializeCart);

  /**
   * Initialize Realm database and seed initial data on app launch
   */
  useEffect(() => {
    const initRealm = async () => {
      try {
        console.log('🚀 Initializing app...');

        // Initialize Realm connection
        await realmManager.initialize();

        // Seed initial data if needed
        await seedDatabase();

        // Initialize cart if user is logged in
        if (currentUser?.id) {
          await initializeCart(currentUser.id);
        }

        console.log('✅ App initialization complete');
      } catch (error) {
        console.error('❌ Error initializing app:', error);
        throw error;
      }
    };

    initRealm();
  }, [currentUser, initializeCart]);

  /**
   * Handle successful login/signup
   */
  const handleAuthSuccess = async (authData) => {
    try {
      await saveAuthData(authData);
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  };

  /**
   * Handle successful account activation
   */
  const handleActivationSuccess = async (authData) => {
    try {
      await saveAuthData(authData);
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logout:', error);
    }
  };

  // Show intro screen first time
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAppStarted ? (
        <Stack.Screen
          name="Intro"
          options={{
            animationEnabled: false,
          }}
        >
          {(props) => (
            <IntroScreen
              {...props}
              isLoggedIn={isLoggedIn}
              authChecked={authChecked}
              onIntroFinish={() => setIsAppStarted(true)}
            />
          )}
        </Stack.Screen>
      ) : null}

      {!isLoggedIn ? (
        <Stack.Screen
          name="AuthStack"
          options={{
            animationEnabled: false,
          }}
        >
          {(props) => (
            <AuthStack
              {...props}
              onAuthSuccess={handleAuthSuccess}
              onActivationSuccess={handleActivationSuccess}
            />
          )}
        </Stack.Screen>
      ) : (
        <Stack.Screen
          name="MainStack"
          options={{
            animationEnabled: false,
          }}
        >
          {(props) => (
            <MainStack {...props} onLogout={handleLogout} />
          )}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}
