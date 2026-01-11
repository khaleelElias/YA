/**
 * Supabase Client Configuration
 *
 * IMPORTANT: This client supports ANONYMOUS access.
 * - No auth redirects
 * - No forced login
 * - Anonymous users can browse and download books
 * - Authentication is OPTIONAL (only for sync, bookmarks, teacher features)
 */

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get Supabase credentials from environment
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.\n' +
    'Required: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY'
  );
}

/**
 * Supabase client instance
 *
 * Uses AsyncStorage for session persistence (Expo-compatible)
 * Anonymous users can access published books without authentication
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use AsyncStorage for session persistence (works offline)
    storage: AsyncStorage,

    // Do NOT auto-refresh session (respects offline mode)
    autoRefreshToken: true,

    // Do NOT persist session across app restarts for anonymous users
    // Only persist if user explicitly logs in
    persistSession: true,

    // Do NOT detect session from URL (not applicable for mobile)
    detectSessionInUrl: false,
  },

  // Global options
  global: {
    headers: {
      'x-app-name': 'yazidi-library',
    },
  },
});

/**
 * Helper to check if user is authenticated
 * Returns true if user has valid session, false for anonymous
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getSession();
  return data.session !== null;
};

/**
 * Helper to get current user (null for anonymous)
 */
export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data.user;
};

/**
 * Helper to sign out
 * Does NOT crash if user is already anonymous
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};
