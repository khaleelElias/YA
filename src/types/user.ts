/**
 * User and Profile Types
 */

export type UserRole = 'reader' | 'admin' | 'teacher';

export interface Profile {
  id: string;
  role: UserRole;
  display_name: string | null;
  preferred_language: 'ku' | 'ar' | 'en' | 'de';
  created_at: string;
  updated_at: string;
}

/**
 * Auth state
 * - null: Not checked yet (loading)
 * - undefined: Anonymous user (no account)
 * - Profile: Authenticated user
 */
export type AuthState = Profile | undefined | null;

/**
 * Sign in credentials
 */
export interface SignInCredentials {
  email: string;
  password: string;
}

/**
 * Sign up data
 */
export interface SignUpData {
  email: string;
  password: string;
  display_name?: string;
  preferred_language?: 'ku' | 'ar' | 'en' | 'de';
}
