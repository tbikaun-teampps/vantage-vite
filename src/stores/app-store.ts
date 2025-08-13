import { create } from "zustand";
import { useAuthStore } from "./auth-store";
import { useCompanyClientStore } from "./company-client-store";
import type { AppState } from "@/types";

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  isInitialized: false,
  isInitializing: false,
  initializationError: null,
  steps: {
    auth: "pending",
    profile: "pending",
    companies: "pending",
  },
  currentStep: "",
  progress: 0,

  // Reset to initial state
  reset: () => {
    set({
      isInitialized: false,
      isInitializing: false,
      initializationError: null,
      steps: {
        auth: "pending",
        profile: "pending",
        companies: "pending",
      },
      currentStep: "",
      progress: 0,
    });
  },

  // Main initialisation sequence
  initialize: async () => {
    const state = get();

    // Prevent duplicate initialisation
    if (state.isInitializing || state.isInitialized) {
      return;
    }

    set({
      isInitializing: true,
      initializationError: null,
      currentStep: "Initializing application...",
      progress: 0,
    });

    try {
      // Step 1: Initialize authentication
      await initializeAuth(set);

      // Step 2: Load user profile
      await loadProfile(set);

      // Step 3: Load companies (demo or real based on profile)
      await loadCompanies(set);

      // Initialization complete
      set({
        isInitialized: true,
        isInitializing: false,
        currentStep: "Ready",
        progress: 100,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown initialisation error";
      console.error("❌ App initialisation failed:", errorMessage);

      set({
        isInitializing: false,
        initializationError: errorMessage,
        currentStep: "Initialisation failed",
      });
    }
  },

  // Retry failed initialisation
  retry: async () => {
    get().reset();
    await get().initialize();
  },

  // Handle demo mode changes (reload companies and tree)
  handleDemoModeChange: async (newDemoMode: boolean) => {
    set({
      currentStep: newDemoMode
        ? "Loading demo data..."
        : "Loading your data...",
      steps: { auth: "complete", profile: "complete", companies: "loading" },
      progress: 80,
    });

    try {
      // Clear current company selection and tree
      const companyClientStore = useCompanyClientStore.getState();
      companyClientStore.setSelectedCompany(null);

      // Note: React Query will automatically refetch companies when components remount
      // or when the query keys are invalidated. The demo mode change should trigger
      // a profile update which will cause React Query to refetch with new permissions.

      set({
        steps: { auth: "complete", profile: "complete", companies: "complete" },
        currentStep: newDemoMode ? "Demo data loaded" : "Your data loaded",
        progress: 100,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reload data";
      console.error("❌ Demo mode change failed:", errorMessage);

      set({
        steps: { auth: "complete", profile: "complete", companies: "error" },
        currentStep: "Failed to reload data",
        initializationError: errorMessage,
      });

      throw error;
    }
  },
}));

/**
 * Step 1: Initialize authentication and session
 */
async function initializeAuth(set: (partial: Partial<AppState>) => void) {
  set({
    steps: { auth: "loading", profile: "pending", companies: "pending" },
    currentStep: "Authenticating...",
    progress: 10,
  });

  try {
    const authStore = useAuthStore.getState();
    await authStore.initialize();

    // Check if we have a user
    const { user } = useAuthStore.getState();

    if (!user) {
      throw new Error("No authenticated user found");
    }
    set({
      steps: { auth: "complete", profile: "pending", companies: "pending" },
      progress: 33,
    });
  } catch (error) {
    set({
      steps: { auth: "error", profile: "pending", companies: "pending" },
    });
    throw new Error(
      `Authentication failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Step 2: Load user profile and determine demo mode
 */
async function loadProfile(set: (partial: Partial<AppState>) => void) {
  set({
    steps: { auth: "complete", profile: "loading", companies: "pending" },
    currentStep: "Loading profile...",
    progress: 40,
  });

  try {
    // Wait for profile to be loaded (auth store should have this)
    const authStore = useAuthStore.getState();

    // If profile is already loaded, we're good
    if (!authStore.profile) {
      // If no profile, we need to fetch it
      await authStore.fetchProfile();

      const updatedState = useAuthStore.getState();
      if (!updatedState.profile) {
        throw new Error("Failed to load user profile");
      }
    }
    set({
      steps: { auth: "complete", profile: "complete", companies: "pending" },
      progress: 66,
    });
  } catch (error) {
    set({
      steps: { auth: "complete", profile: "error", companies: "pending" },
    });
    throw new Error(
      `Profile loading failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Step 3: Load companies (demo or real based on profile)
 * Note: With React Query migration, companies are loaded automatically when components mount.
 * This step now just marks the companies as ready to be loaded.
 */
async function loadCompanies(set: (partial: Partial<AppState>) => void) {
  const { profile } = useAuthStore.getState();
  set({
    steps: { auth: "complete", profile: "complete", companies: "loading" },
    currentStep:
      profile?.subscription_tier === "demo"
        ? "Loading demo data..."
        : "Loading companies...",
    progress: 80,
  });

  try {
    // With React Query, companies will be automatically loaded when components mount
    // and use the useCompanies() hook. We just need to signal that initialization is complete.
    
    set({
      steps: { auth: "complete", profile: "complete", companies: "complete" },
      progress: 95,
    });
  } catch (error) {
    set({
      steps: { auth: "complete", profile: "complete", companies: "error" },
    });
    throw new Error(
      `Company loading failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Hook to get initialisation status
 */
export function useAppInitialization() {
  const {
    isInitialized,
    isInitializing,
    initializationError,
    steps,
    currentStep,
    progress,
    initialize,
    retry,
    reset,
    handleDemoModeChange,
  } = useAppStore();

  return {
    isInitialized,
    isInitializing,
    initializationError,
    steps,
    currentStep,
    progress,
    initialize,
    retry,
    reset,
    handleDemoModeChange,
    // Convenience getters
    hasError: !!initializationError,
    isReady: isInitialized && !isInitializing && !initializationError,
  };
}
