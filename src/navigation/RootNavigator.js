import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import IntroScreen from '../screens/IntroScreen';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import { useAuth } from '../hooks/useAuth';
import { initializeRealmDatabase } from '../services/migrationService';


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
  const { isLoggedIn, authChecked, saveAuthData, logout } = useAuth();

  /**
   * Initialize Realm database on app launch (with fallback)
   */
  useEffect(() => {
    const initRealm = async () => {
      try {
        const result = await initializeRealmDatabase();
        if (result) {
          console.log('✅ Database initialization complete');
        } else {
          console.log('⚠️ Database initialization skipped, using AsyncStorage fallback');
        }
      } catch (error) {
        console.error('❌ Error initializing database:', error);
        console.log('💾 App will continue with AsyncStorage fallback');
        // App continues anyway - not a blocker
      }
    };

    initRealm();
  }, []);

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
