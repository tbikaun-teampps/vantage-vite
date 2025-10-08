import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
export interface AuthUser {
  id: string;
  email: string;
  isDemoMode: boolean;
  isAdmin: boolean;
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

    // Get profile data directly from database to check demo mode and admin status
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier, is_admin")
      .eq("id", authData.user.id)
      .single();

    const isDemoMode = profile?.subscription_tier === "demo";
    const isAdmin = profile?.is_admin === true;

    return {
      id: authData.user.id,
      email: authData.user.email || "",
      isDemoMode,
      isAdmin,
      isAuthenticated: true,
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