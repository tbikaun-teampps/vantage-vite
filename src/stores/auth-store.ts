import { create } from "zustand";
import { queryClient } from "@/lib/query-client";
import { apiClient } from "@/lib/api/client";
import { TokenManager } from "@/lib/auth/token-manager";
import type { AuthStore, BackendAuthResponse } from "@/types/auth";

let isInitialized = false;

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  profile: null,
  permissions: null,
  loading: true,
  authenticated: false,

  setUser: (user) => set({ user, authenticated: !!user }),
  setSession: (session) => set({ session, authenticated: !!session }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),

  signIn: async (email: string, password: string) => {
    try {
      const response = await apiClient.post<BackendAuthResponse>(
        "/auth/signin",
        {
          email,
          password,
        }
      );

      if (!response.data.success || !response.data.data) {
        return { error: response.data.message || "Sign in failed" };
      }

      const { user, profile, permissions, session } = response.data.data;

      // Store tokens with expiry (1 hour from now if backend doesn't provide expires_at)
      const expiresAt = Date.now() / 1000 + 3600; // Default: 1 hour
      TokenManager.setTokens({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: expiresAt,
      });

      // Update store with enriched data
      set({
        user,
        profile,
        permissions,
        session: {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: expiresAt,
        },
        authenticated: true,
        loading: false,
      });

      return { redirectPath: "/select-company" };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Sign in failed";
      return { error: message };
    }
  },

  signOut: async () => {
    try {
      // Call backend to invalidate session
      await apiClient.post("/auth/signout");
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      // Always clear local state regardless of backend response
      TokenManager.clearTokens();

      // Logout from Canny (commented out for now)
      // if (window.Canny) {
      //   window.Canny('logout');
      // }

      // Clear the auth state
      set({
        user: null,
        session: null,
        profile: null,
        permissions: null,
        authenticated: false,
      });

      // Clear React Query cache to prevent data leakage between users
      queryClient.clear();
    }
  },

  resetPassword: async (email: string) => {
    try {
      await apiClient.post("/auth/reset-password", { email });
      return {};
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Password reset failed";
      return { error: message };
    }
  },

  // Profile methods removed - now handled by React Query useProfile hook

  initialize: async () => {
    // Prevent multiple initializations
    if (isInitialized) {
      return;
    }
    isInitialized = true;

    // Check if we have stored tokens
    const tokens = TokenManager.getTokens();

    if (!tokens) {
      set({ loading: false, authenticated: false });
      return;
    }

    try {
      // Validate session with backend
      const response =
        await apiClient.get<BackendAuthResponse>("/auth/session");

      if (response.data.success && response.data.data) {
        const { user, profile, permissions } = response.data.data;

        set({
          user,
          profile,
          permissions,
          session: tokens,
          authenticated: true,
          loading: false,
        });
      } else {
        // Session invalid - clear tokens
        TokenManager.clearTokens();
        set({ loading: false, authenticated: false });
      }
    } catch (error) {
      // Session validation failed - clear tokens
      console.error("Session initialization failed:", error);
      TokenManager.clearTokens();
      set({ loading: false, authenticated: false });
    }
  },
}));
