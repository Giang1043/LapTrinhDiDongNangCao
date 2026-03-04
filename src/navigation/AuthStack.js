// ============================================
// Auth Stack Navigator
// ============================================

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import SuccessScreen from '../screens/SuccessScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';

const Stack = createNativeStackNavigator();

/**
 * Auth Stack - All authentication related screens
 */
export default function AuthStack({ onAuthSuccess, onActivationSuccess }) {
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
