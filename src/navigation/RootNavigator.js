import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import IntroScreen from '../screens/IntroScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import SuccessScreen from '../screens/SuccessScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import BottomTabNavigator from './BottomTabNavigator';

const Stack = createNativeStackNavigator();

// Auth Stack
function AuthStack({ onAuthSuccess, onActivationSuccess }) {
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
        component={SignUpScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <Stack.Screen
        name="OTPVerification"
        options={{
          animationEnabled: false,
        }}
      >
        {(props) => (
          <OTPVerificationScreen
            {...props}
            onActivationSuccess={onActivationSuccess}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="Success"
        component={SuccessScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{
          animationEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAppStarted, setIsAppStarted] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authData = await AsyncStorage.getItem('authData');
      if (authData) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.log('Error checking auth status:', error);
      setIsLoggedIn(false);
    } finally {
      setAuthChecked(true);
    }
  };

  const handleAuthSuccess = async (authData) => {
    try {
      await AsyncStorage.setItem('authData', JSON.stringify(authData));
      setIsLoggedIn(true);
    } catch (error) {
      console.log('Error saving auth data:', error);
    }
  };

  const handleOTPVerified = () => {
    // OTP đã verified, tiếp theo là activation
    console.log('OTP verified');
  };

  const handleActivationSuccess = async (authData) => {
    try {
      // Lưu auth data sactivation sẽ được xử lý tự động công
      await AsyncStorage.setItem('authData', JSON.stringify(authData));
      setIsLoggedIn(true);
    } catch (error) {
      console.log('Error saving auth data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authData');
      setIsLoggedIn(false);
    } catch (error) {
      console.log('Error logout:', error);
    }
  };

  // Luôn render Intro lần đầu, sau đó kiểm tra auth và render AuthStack/MainStack
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
            <BottomTabNavigator {...props} onLogout={handleLogout} />
          )}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}
