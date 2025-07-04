/**
 * Authentication and User Management Types
 * All types related to user authentication, profiles, and sessions
 */

import type { User, Session } from "@supabase/supabase-js";
import type { DatabaseRow } from "../utils";

// Database types
export type DatabaseProfile = DatabaseRow<"profiles">;

// Core user types
export interface UserProfile extends Omit<DatabaseProfile, 'demo_progress'> {
  demo_progress: DemoProgress;
}

export interface DemoProgress {
  toursCompleted: string[];
  featuresExplored: string[];
  lastActivity?: string;
  welcomeShown: boolean;
}

// Authentication state
export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  authenticated: boolean;
}

// Authentication actions
export interface AuthActions {
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;

  signIn: (
    email: string,
    password: string
  ) => Promise<{ error?: string; redirectPath?: string }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    code: string
  ) => Promise<{ error?: string; redirectPath?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;

  updateDemoMode: (isDemoMode: boolean) => Promise<{ error?: string }>;
  updateDemoProgress: (
    progress: Partial<DemoProgress>
  ) => Promise<{ error?: string }>;
  updateProfile: (
    profileData: Partial<UserProfile>
  ) => Promise<{ error?: string }>;

  initialize: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  checkWelcomeRedirect: () => boolean;
}

// Complete auth store interface
export interface AuthStore extends AuthState, AuthActions {}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  email: string;
  password: string;
  fullName: string;
  signupCode: string;
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
  is_demo_mode?: boolean;
  demo_progress?: DemoProgress;
  demo_disabled_at?: string;
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
