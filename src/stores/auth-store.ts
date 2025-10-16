import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { queryClient } from "@/lib/query-client";
import type { AuthStore } from "@/types";

let isInitialized = false;

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  loading: true,
  authenticated: false,

  setUser: (user) => set({ user, authenticated: !!user }),
  setSession: (session) => set({ session, authenticated: !!session?.user }),
  setLoading: (loading) => set({ loading }),

  signIn: async (email: string, password: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    // Note: Profile will be fetched by React Query hook automatically
    return { redirectPath: "/select-company" };
  },

  signOut: async () => {
    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      // Logout from Canny (commented out for now)
      // if (window.Canny) {
      //   window.Canny('logout');
      // }

      // Clear the auth state
      set({
        user: null,
        session: null,
        authenticated: false,
      });

      // Clear React Query cache to prevent data leakage between users
      queryClient.clear();
    } catch {
      // Even if logout fails, try to clear local state and stores
      set({
        user: null,
        session: null,
        authenticated: false,
      });

      // Still clear React Query cache to prevent data leakage
      queryClient.clear();
    }
  },

  resetPassword: async (email: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { error: error.message };
    }
    return {};
  },

  // Profile methods removed - now handled by React Query useProfile hook

  initialize: async () => {
    // Prevent multiple initializations
    if (isInitialized) {
      return;
    }
    isInitialized = true;

    const supabase = createClient();

    // Get initial session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user ?? null;
    set({ session, user, loading: false, authenticated: !!user });

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (_, session) => {
      const user = session?.user ?? null;
      set({ session, user, loading: false, authenticated: !!user });

      // Clear React Query cache when user logs out or session expires
      if (!user) {
        queryClient.clear();
      }

      // Note: Profile will be automatically fetched by React Query useProfile hook
      // when user state changes. No need to fetch it here.
    });
  },
}));
