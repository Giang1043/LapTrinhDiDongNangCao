import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, DefaultTheme } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF6B35',
    accent: '#FF6B35',
  },
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <StatusBar style="auto" />
        <AppNavigator />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
