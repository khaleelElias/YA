import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainTabNavigator from './MainTabNavigator';

/**
 * Root App Navigator
 *
 * IMPORTANT: No forced authentication check!
 * Users can browse, download, and read books without logging in.
 * Authentication is optional for syncing progress across devices.
 */
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <MainTabNavigator />
    </NavigationContainer>
  );
}
