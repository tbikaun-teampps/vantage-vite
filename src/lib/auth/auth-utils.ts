import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

const supabase = createClient();
export interface AuthUser {
  id: string;
  email: string;
  isDemoMode: boolean;
  isAuthenticated: boolean;
}

export interface AuthResult {
  user: AuthUser;
  error: string | null;
}

/**
 * Get the current authenticated user with demo mode status
 * Centralized authentication logic used across all services
 * @throws {Error} When user is not authenticated
 */
export async function getAuthenticatedUser(): Promise<AuthUser> {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      throw new Error(authError?.message || "User not authenticated");
    }

    // Get demo mode status from auth store
    const authStore = useAuthStore.getState();
    const isDemoMode = authStore?.profile?.subscription_tier === 'demo';

    return {
      id: authData.user.id,
      email: authData.user.email || "",
      isDemoMode,
      isAuthenticated: true
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Authentication failed");
  }
}

/**
 * Get current user ID or throw an error
 * Used for operations that require authentication
 */
export async function getCurrentUserId(): Promise<string> {
  const user = await getAuthenticatedUser();
  return user.id;
}

/**
 * Check if current user is in demo mode
 */
export async function isCurrentUserInDemoMode(): Promise<boolean> {
  const user = await getAuthenticatedUser();
  return user.isDemoMode;
}
