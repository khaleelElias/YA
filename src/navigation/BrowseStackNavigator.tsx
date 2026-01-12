import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { BrowseStackParamList } from './types';
import { colors, typography } from '@/theme';

// Import screens
import HomeScreen from '@/screens/home/HomeScreen';
import BookDetailScreen from '@/screens/home/BookDetailScreen';

const Stack = createStackNavigator<BrowseStackParamList>();

export default function BrowseStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          ...typography.h3,
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="BrowseHome"
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="BookDetail"
        component={BookDetailScreen}
        options={{
          title: 'Book Details',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}
