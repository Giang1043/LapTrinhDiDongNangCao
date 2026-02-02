import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';

export const unstable_settings = {
  anchor: 'intro',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isSignedIn, isLoading } = useAuth();

  if (isLoading) {
    // Có thể hiển thị loading screen ở đây
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {isSignedIn ? (
          // Authenticated screens
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen 
              name="product-detail" 
              options={{ 
                headerShown: false,
                presentation: 'card',
              }} 
            />
          </>
        ) : (
          // Auth screens
          <>
            <Stack.Screen name="intro" options={{ headerShown: false }} />
            <Stack.Screen 
              name="login" 
              options={{ 
                headerShown: false,
              }} 
            />
            <Stack.Screen 
              name="register" 
              options={{ 
                headerShown: false,
              }} 
            />
            <Stack.Screen 
              name="forgot-password" 
              options={{ 
                headerShown: false,
              }} 
            />
          </>
        )}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const paperTheme = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </PaperProvider>
  );
}
