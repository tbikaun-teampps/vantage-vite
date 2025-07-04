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
