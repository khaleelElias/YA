import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { database } from './src/services/database';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    async function initializeApp() {
      try {
        console.log('[App] Initializing app...');

        // Initialize local database
        await database.initialize();

        console.log('[App] App initialized successfully');
        setIsReady(true);
      } catch (error: any) {
        console.error('[App] Failed to initialize app:', error);
        setInitError(error.message || 'Failed to initialize app');
        setIsReady(true); // Still show app, but with error
      }
    }

    initializeApp();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4A574" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (initError) {
    console.warn('[App] App started with initialization error:', initError);
    // Continue anyway - the app can still work without local database
  }

  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
