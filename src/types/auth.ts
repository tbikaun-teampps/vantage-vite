/**
 * Authentication and User Management Types
 * All types related to user authentication, profiles, and sessions
 */

import type { DatabaseRow, Enums } from "./utils";

// Database types
export type DatabaseProfile = DatabaseRow<"profiles">;

// Subscription types (using database enum)
export type SubscriptionTier = Enums["subscription_tier_enum"];

export interface SubscriptionFeatures {
  maxCompanies: number;
}

// Core user types
export interface UserProfile extends DatabaseProfile {
  // All fields now come directly from DatabaseProfile
}

// Token storage (replaces Supabase Session)
export interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number; // Unix timestamp in seconds
}

// Simplified user type (from backend, not Supabase User)
export interface AuthUser {
  id: string;
  email: string;
}

// Backend auth response types
export interface BackendAuthResponse {
  success: boolean;
  data?: {
    user: AuthUser;
    profile: UserProfile;
    permissions: UserPermissions;
    session: {
      access_token: string;
      refresh_token: string;
    };
  };
  error?: string;
  message?: string;
}

// Auth state (updated for backend auth)
interface AuthState {
  user: AuthUser | null;
  session: TokenData | null;
  profile: UserProfile | null;
  permissions: UserPermissions | null;
  loading: boolean;
  authenticated: boolean;
}



// Authentication actions (streamlined - profile methods moved to React Query)
export interface AuthActions {
  setUser: (user: AuthUser | null) => void;
  setSession: (session: TokenData | null) => void;
  setLoading: (loading: boolean) => void;

  signIn: (
    email: string,
    password: string
  ) => Promise<{ error?: string; redirectPath?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;

  initialize: () => Promise<void>;
}

// Complete auth store interface
export interface AuthStore extends AuthState, AuthActions {}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface ResetPasswordFormData {
  email: string;
}

export interface UpdateProfileFormData {
  full_name: string;
  email: string;
}

// API types
export interface AuthResponse {
  user?: User;
  session?: Session;
  error?: string;
  redirectPath?: string;
}

export interface ProfileUpdateData {
  full_name?: string;
  subscription_tier?: SubscriptionTier;
  subscription_features?: SubscriptionFeatures;
  onboarded?: boolean;
  onboarded_at?: string;
}

// Utility types
export type UserRole = "admin" | "manager" | "user";

export interface UserPermissions {
  canAccessMainApp: boolean;
  features: string[];
  maxCompanies: number;
}

// Navigation guard types
export interface RouteGuard {
  requiresAuth: boolean;
  requiresRole?: UserRole;
  requiresPermission?: keyof UserPermissions;
  redirectTo?: string;
}
