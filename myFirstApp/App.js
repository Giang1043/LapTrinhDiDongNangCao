import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, DefaultTheme } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import realmDB from './src/database/realmDB';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF6B35',
    accent: '#FF6B35',
  },
};

export default function App() {
  const [isReady, setIsReady] = React.useState(false);

  useEffect(() => {
    // Initialize Realm database on app start
    const initDB = async () => {
      try {
        await realmDB.initializeDatabase();
        console.log('✅ Database initialized successfully');
        setIsReady(true);
      } catch (error) {
        console.error('❌ Failed to initialize database:', error);
        // Still set ready even if there's an error
        setIsReady(true);
      }
    };
    
    initDB();
  }, []);

  // Don't render navigation until database is ready
  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <StatusBar style="auto" />
        <AppNavigator />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
