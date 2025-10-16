/**
 * Authentication and User Management Types
 * All types related to user authentication, profiles, and sessions
 */

import type { User, Session } from "@supabase/supabase-js";
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



// Authentication actions (streamlined - profile methods moved to React Query)
export interface AuthActions {
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
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
  canCreateAssessments: boolean;
  canManageCompany: boolean;
  canViewAnalytics: boolean;
  canManageUsers: boolean;
}

// Navigation guard types
export interface RouteGuard {
  requiresAuth: boolean;
  requiresRole?: UserRole;
  requiresPermission?: keyof UserPermissions;
  redirectTo?: string;
}
