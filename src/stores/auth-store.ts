import { create } from "zustand";
import { type User, type Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  is_demo_mode: boolean;
  demo_progress: DemoProgress;
  demo_disabled_at?: string;
  created_at: string;
  updated_at: string;
}

interface DemoProgress {
  toursCompleted: string[];
  featuresExplored: string[];
  lastActivity?: string;
  welcomeShown: boolean;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  authenticated: boolean;
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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,
  isDemoMode: false,
  authenticated: false,

  setUser: (user) => set({ user, authenticated: !!user }),
  setSession: (session) => set({ session, authenticated: !!session?.user }),
  setProfile: (profile) =>
    set({ profile, isDemoMode: profile?.is_demo_mode ?? false }),
  setLoading: (loading) => set({ loading }),

  signIn: async (email: string, password: string) => {
    const supabase = createClient();
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    // Fetch the user's profile to check welcome status
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profile) {
        set({ profile, isDemoMode: profile.is_demo_mode });

        // Return redirect path based on welcome status
        const redirectPath = !profile.demo_progress?.welcomeShown
          ? "/welcome"
          : "/dashboard";
        return { redirectPath };
      }
    }

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
      // Create profile with initial demo progress
      const profileData = {
        id: data.user.id,
        email: data.user.email!,
        full_name: fullName,
        is_demo_mode: true,
        demo_progress: {
          toursCompleted: [],
          featuresExplored: [],
          welcomeShown: false,
        },
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
        console.error("❌ Supabase signOut error:", error);
        throw error;
      }
      // Clear the auth state
      set({ user: null, session: null, profile: null, isDemoMode: false, authenticated: false });
    } catch (error) {
      console.error("❌ Logout failed:", error);
      // Even if logout fails, try to clear local state
      set({ user: null, session: null, profile: null, isDemoMode: false, authenticated: false });
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

  fetchProfile: async () => {
    const { user } = get();
    if (!user) {
      throw new Error("No authenticated user");
    }
    const supabase = createClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("❌ Error fetching profile:", error);
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    if (profile) {
      set({ profile, isDemoMode: profile.is_demo_mode });
    } else {
      throw new Error("No profile found for user");
    }
  },

  updateDemoMode: async (isDemoMode: boolean) => {
    const { user, profile } = get();
    if (!user || !profile) return { error: "User not authenticated" };

    const supabase = createClient();
    const updateData: Partial<UserProfile> = {
      is_demo_mode: isDemoMode,
      updated_at: new Date().toISOString(),
    };

    if (!isDemoMode) {
      updateData.demo_disabled_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id);

    if (error) {
      return { error: error.message };
    }

    // Update local state
    const updatedProfile = { ...profile, ...updateData };
    set({ profile: updatedProfile, isDemoMode });
    return {};
  },

  updateDemoProgress: async (progress: Partial<DemoProgress>) => {
    const { user, profile } = get();
    if (!user || !profile) return { error: "User not authenticated" };

    const updatedProgress = {
      ...profile.demo_progress,
      ...progress,
      lastActivity: new Date().toISOString(),
    };

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        demo_progress: updatedProgress,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      return { error: error.message };
    }

    // Update local state
    const updatedProfile = { ...profile, demo_progress: updatedProgress };
    set({ profile: updatedProfile });
    return {};
  },

  updateProfile: async (profileData: Partial<UserProfile>) => {
    const { user, profile } = get();
    if (!user || !profile) return { error: "User not authenticated" };

    const supabase = createClient();
    const updateData = {
      ...profileData,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id);

    if (error) {
      return { error: error.message };
    }

    // Update local state
    const updatedProfile = { ...profile, ...updateData };
    set({ profile: updatedProfile });
    return {};
  },

  initialize: async () => {
    const supabase = createClient();

    // Get initial session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log("session", session);

    const user = session?.user ?? null;
    set({ session, user, loading: false, authenticated: !!user });

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session);
      const user = session?.user ?? null;
      set({ session, user, loading: false, authenticated: !!user });

      if (user) {
        // Fetch profile for new session
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          set({ profile, isDemoMode: profile.is_demo_mode });

          // Check if user needs welcome redirect
          if (
            !profile.demo_progress?.welcomeShown &&
            typeof window !== "undefined"
          ) {
            // Only redirect if not already on welcome page
            if (!window.location.pathname.includes("/welcome")) {
              window.location.href = "/welcome";
            }
          }
        }
      } else {
        // Clear profile when user logs out
        set({ profile: null, isDemoMode: false, authenticated: false });
      }
    });
  },

  checkWelcomeRedirect: () => {
    const { profile } = get();
    if (!profile) return false;

    // Return true if user needs to see welcome (hasn't completed it)
    return !profile.demo_progress?.welcomeShown;
  },
}));

// Export types for use in other files
export type { UserProfile, DemoProgress };
