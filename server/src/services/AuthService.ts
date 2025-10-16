import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface SignInResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
    };
    profile: Profile;
    permissions: {
      canAccessMainApp: boolean;
      features: string[];
      maxCompanies: number;
    };
    session: {
      access_token: string;
      refresh_token: string;
    };
  };
  error?: string;
  message?: string;
}

const SUBSCRIPTION_FEATURES = {
  demo: {
    maxCompanies: 1,
    features: ["interviews", "assessments", "basic_analytics"],
  },
  consultant: {
    maxCompanies: 999,
    features: [
      "interviews",
      "assessments",
      "analytics",
      "recommendations",
      "advanced_features",
    ],
  },
  enterprise: {
    maxCompanies: 1,
    features: [
      "interviews",
      "assessments",
      "analytics",
      "recommendations",
      "advanced_features",
      "custom_branding",
    ],
  },
  interview_only: {
    maxCompanies: 0,
    features: ["interview_access_only"],
  },
};

export class AuthService {
  private supabase: SupabaseClient<Database>;
  private supabaseAdmin: SupabaseClient<Database>;

  constructor(
    supabaseClient: SupabaseClient<Database>,
    supabaseAdminClient: SupabaseClient<Database>
  ) {
    this.supabase = supabaseClient;
    this.supabaseAdmin = supabaseAdminClient;
  }

  /**
   * Sign in a user with email and password
   * Validates credentials, checks subscription tier, and returns enriched user data
   * Blocks interview_only users from accessing the main application
   */
  async signIn(email: string, password: string): Promise<SignInResponse> {
    // Authenticate with Supabase
    const { data: authData, error: authError } =
      await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError || !authData.user || !authData.session) {
      return {
        success: false,
        error: "Authentication Failed",
        message: authError?.message || "Invalid email or password",
      };
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Failed to fetch profile:", profileError);
      return {
        success: false,
        error: "Profile Fetch Failed",
        message: "Unable to retrieve user profile",
      };
    }

    if (!profile) {
      return {
        success: false,
        error: "Profile Not Found",
        message: "User profile does not exist",
      };
    }

    // CRITICAL: Block interview_only users from main app access
    if (profile.subscription_tier === "interview_only") {
      // Sign them out immediately
      await this.supabase.auth.signOut();

      return {
        success: false,
        error: "Access Denied",
        message: "This account is not authorized to access the application",
      };
    }

    // Build permissions object based on subscription tier
    const tierConfig =
      SUBSCRIPTION_FEATURES[
        profile.subscription_tier as keyof typeof SUBSCRIPTION_FEATURES
      ] || SUBSCRIPTION_FEATURES.demo;

    const permissions = {
      canAccessMainApp: true,
      features: tierConfig.features,
      maxCompanies: tierConfig.maxCompanies,
    };

    // Return enriched response
    return {
      success: true,
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email || email,
        },
        profile,
        permissions,
        session: {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
        },
      },
    };
  }

  /**
   * Sign out a user
   * Invalidates the user's session token using admin client
   * @param token - The user's access token to invalidate
   */
  async signOut(token: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const { error } = await this.supabaseAdmin.auth.admin.signOut(token);

      if (error) {
        console.error("Sign out error:", error);
        return {
          success: false,
          error: "Sign Out Failed",
          message: error.message,
        };
      }

      return {
        success: true,
        message: "Successfully signed out",
      };
    } catch (err) {
      console.error("Unexpected sign out error:", err);
      return {
        success: false,
        error: "Sign Out Failed",
        message: "An unexpected error occurred during sign out",
      };
    }
  }

//   /**
//    *
//    * @param _email
//    */
//   async resetPassword(_email: string) {}

//   /**
//    *
//    * @param _token
//    */
//   async validateSession(_token: string) {}

//   /**
//    *
//    * @param _userId
//    */
//   async getEnrichedUserData(_userId: string) {}
}
