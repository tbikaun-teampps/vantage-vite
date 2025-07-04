// stores/app-store.ts
// Centralized app initialization with proper error handling and sequencing

import { create } from "zustand";
import { useAuthStore } from "./auth-store";
import { useCompanyStore } from "./company-store";

export type InitializationStep = "pending" | "loading" | "complete" | "error";

export interface AppState {
  // Overall app state
  isInitialized: boolean;
  isInitializing: boolean;
  initializationError: string | null;

  // Step-by-step progress
  steps: {
    auth: InitializationStep;
    profile: InitializationStep;
    companies: InitializationStep;
  };

  // Progress tracking
  currentStep: string;
  progress: number; // 0-100

  // Actions
  initialize: () => Promise<void>;
  retry: () => Promise<void>;
  reset: () => void;
  handleDemoModeChange: (newDemoMode: boolean) => Promise<void>;
}

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
      // Reload companies with new demo mode
      const companyStore = useCompanyStore.getState();

      // Clear current selection and tree
      companyStore.setSelectedCompany(null);
      companyStore.setCompanyTree(null);

      // Reload companies
      await companyStore.loadCompanies();

      // Verify companies were loaded
      const { companies } = useCompanyStore.getState();

      if (newDemoMode && companies.length === 0) {
        throw new Error("Failed to load demo companies");
      }

      // Auto-select first company if available
      if (companies.length > 0) {
        companyStore.setSelectedCompany(companies[0]);
      }
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
 */
async function loadCompanies(set: (partial: Partial<AppState>) => void) {
  const { isDemoMode } = useAuthStore.getState();
  set({
    steps: { auth: "complete", profile: "complete", companies: "loading" },
    currentStep: isDemoMode ? "Loading demo data..." : "Loading companies...",
    progress: 80,
  });

  try {
    const companyStore = useCompanyStore.getState();
    await companyStore.loadCompanies();

    // Verify companies were loaded
    const { companies } = useCompanyStore.getState();

    if (isDemoMode && companies.length === 0) {
      throw new Error("Failed to load demo companies");
    }

    // If we have companies, auto-select the first one if none selected
    const { selectedCompany } = useCompanyStore.getState();
    if (companies.length > 0 && !selectedCompany) {
      companyStore.setSelectedCompany(companies[0]);
    } else if (selectedCompany) {
      companyStore.loadCompanyTree();
    }

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
