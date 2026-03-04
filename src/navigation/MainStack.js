// ============================================
// Main Stack Navigator (App Stack)
// ============================================

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BottomTabNavigator from './BottomTabNavigator';

const Stack = createNativeStackNavigator();

/**
 * Main Stack - All app screens after authentication
 */
export default function MainStack({ onLogout }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="MainStackScreen"
        options={{
          animationEnabled: false,
        }}
      >
        {(props) => <BottomTabNavigator {...props} onLogout={onLogout} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
