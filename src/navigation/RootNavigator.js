import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import IntroScreen from '../screens/IntroScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import BottomTabNavigator from './BottomTabNavigator';

const Stack = createNativeStackNavigator();

// Auth Stack
function AuthStack({ onAuthSuccess }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Login"
        options={{
          animationEnabled: false,
        }}
      >
        {(props) => (
          <LoginScreen {...props} onLoginSuccess={onAuthSuccess} />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="SignUp"
        options={{
          animationEnabled: false,
        }}
      >
        {(props) => (
          <SignUpScreen {...props} onSignUpSuccess={onAuthSuccess} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkFirstLaunchAndAuth();
  }, []);

  const checkFirstLaunchAndAuth = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      const userInfo = await AsyncStorage.getItem('userInfo');

      if (hasLaunched === null) {
        setIsFirstLaunch(true);
        await AsyncStorage.setItem('hasLaunched', 'true');
        setIsLoggedIn(false);
      } else {
        setIsFirstLaunch(false);
        // Kiểm tra user đã login hay chưa
        if (userInfo) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      }
    } catch (error) {
      console.log('Error checking first launch:', error);
      setIsFirstLaunch(false);
      setIsLoggedIn(false);
    }
  };

  const handleAuthSuccess = async (user) => {
    try {
      // Lưu user info vào AsyncStorage
      await AsyncStorage.setItem('userInfo', JSON.stringify(user));
      setIsLoggedIn(true);
    } catch (error) {
      console.log('Error saving user info:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userInfo');
      setIsLoggedIn(false);
    } catch (error) {
      console.log('Error logout:', error);
    }
  };

  if (isFirstLaunch === null) {
    return null; // Loading state
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isFirstLaunch ? (
        <Stack.Screen
          name="Intro"
          component={IntroScreen}
          options={{
            animationEnabled: false,
          }}
        />
      ) : null}
      {!isLoggedIn ? (
        <Stack.Screen
          name="AuthStack"
          options={{
            animationEnabled: false,
          }}
        >
          {(props) => <AuthStack {...props} onAuthSuccess={handleAuthSuccess} />}
        </Stack.Screen>
      ) : (
        <Stack.Screen
          name="MainStack"
          options={{
            animationEnabled: false,
          }}
        >
          {(props) => (
            <BottomTabNavigator {...props} onLogout={handleLogout} />
          )}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}
