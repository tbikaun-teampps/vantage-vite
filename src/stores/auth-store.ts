import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
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
    // Redirect logic will be handled by DashboardLayout using useProfile
    return { redirectPath: "/dashboard" };
  },

  signUp: async (
    email: string,
    password: string,
    fullName: string,
    code: string
  ) => {
    // Validate signup code
    const expectedCode = import.meta.env.VITE_SIGNUP_CODE;
    if (!expectedCode || code !== expectedCode) {
      return { error: "Invalid signup code" };
    }

    const supabase = createClient();

    // Sign up the user
    const { error: signUpError, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      return { error: signUpError.message };
    }

    if (data.user) {
      // Create profile with demo subscription tier
      const profileData = {
        id: data.user.id,
        email: data.user.email!,
        full_name: fullName,
        subscription_tier: 'demo' as const,
        subscription_features: {
          maxCompanies: 1
        },
        onboarded: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await supabase
        .from("profiles")
        .insert(profileData);

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // Continue anyway, as profile might be created by trigger
      }

      return { redirectPath: "/welcome" };
    }

    return { redirectPath: "/welcome" };
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
    } catch {
      // Even if logout fails, try to clear local state and stores
      set({
        user: null,
        session: null,
        authenticated: false,
      });
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

      // Note: Profile will be automatically fetched by React Query useProfile hook
      // when user state changes. No need to fetch it here.
    });
  },
}));

