/**
 * Authentication Store
 *
 * IMPORTANT: Authentication is OPTIONAL in this app
 * - Anonymous users can browse, download, and read books
 * - Auth is only required for: sync, bookmarks with notes, teacher features
 * - No forced login gates
 */

import { create } from 'zustand';
import { supabase, getCurrentUser } from '@/api/supabase';
import type { Profile, SignInCredentials, SignUpData } from '@/types';

interface AuthState {
  // Auth state
  // - null: Loading/checking session
  // - undefined: Anonymous user (no account)
  // - Profile: Authenticated user
  profile: Profile | undefined | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;

  // Helpers
  isAuthenticated: () => boolean;
  isAnonymous: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  profile: null, // null = loading
  isLoading: false,
  error: null,

  /**
   * Initialize auth state
   * Check for existing session, but don't force login
   */
  initialize: async () => {
    try {
      set({ isLoading: true, error: null });

      // Check for existing session
      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData.session) {
        // User has valid session, fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionData.session.user.id)
          .single();

        if (profileError) {
          console.warn('Failed to fetch profile:', profileError);
          // Session exists but profile fetch failed
          // Set anonymous to allow app usage
          set({ profile: undefined, isLoading: false });
          return;
        }

        set({ profile: profileData, isLoading: false });
      } else {
        // No session = anonymous user
        set({ profile: undefined, isLoading: false });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // On error, allow anonymous access
      set({ profile: undefined, isLoading: false, error: 'Failed to initialize auth' });
    }
  },

  /**
   * Sign in with email and password
   */
  signIn: async (credentials: SignInCredentials) => {
    try {
      set({ isLoading: true, error: null });

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned from sign in');

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) throw profileError;

      set({ profile: profileData, isLoading: false });
    } catch (error: any) {
      console.error('Sign in error:', error);
      set({ error: error.message || 'Failed to sign in', isLoading: false });
      throw error;
    }
  },

  /**
   * Sign up with email, password, and optional profile data
   */
  signUp: async (data: SignUpData) => {
    try {
      set({ isLoading: true, error: null });

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned from sign up');

      // Create profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          display_name: data.display_name || null,
          preferred_language: data.preferred_language || 'ku',
          role: 'reader',
        })
        .select()
        .single();

      if (profileError) throw profileError;

      set({ profile: profileData, isLoading: false });

      // TODO: Trigger anonymous data migration here
      // await migrateAnonymousDataToUser(authData.user.id);
    } catch (error: any) {
      console.error('Sign up error:', error);
      set({ error: error.message || 'Failed to sign up', isLoading: false });
      throw error;
    }
  },

  /**
   * Sign out
   * Sets state to anonymous (undefined), does NOT crash app
   */
  signOut: async () => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Set to anonymous (undefined)
      set({ profile: undefined, isLoading: false });
    } catch (error: any) {
      console.error('Sign out error:', error);
      set({ error: error.message || 'Failed to sign out', isLoading: false });
      throw error;
    }
  },

  /**
   * Clear error message
   */
  clearError: () => set({ error: null }),

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    const { profile } = get();
    return profile !== undefined && profile !== null;
  },

  /**
   * Check if user is anonymous
   */
  isAnonymous: () => {
    const { profile } = get();
    return profile === undefined;
  },
}));

/**
 * Listen to auth state changes
 * Updates store when user signs in/out from another tab/device
 */
supabase.auth.onAuthStateChange(async (event, session) => {
  const store = useAuthStore.getState();

  if (event === 'SIGNED_IN' && session) {
    // User signed in, fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileData) {
      store.profile = profileData;
    }
  } else if (event === 'SIGNED_OUT') {
    // User signed out, set to anonymous
    store.profile = undefined;
  } else if (event === 'TOKEN_REFRESHED' && session) {
    // Token refreshed, maintain current profile
    // No action needed
  }
});
