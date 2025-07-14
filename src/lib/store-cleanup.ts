/**
 * Utility for cleaning up all user-specific store data on logout
 * This ensures no user data persists between different user sessions
 */

/**
 * Clears all user-specific data from Zustand stores
 * Called when user signs out to ensure clean state for next user
 */
export const clearAllStores = async (): Promise<void> => {
  try {
    // Dynamic imports to avoid circular dependencies
    const [
      { useAnalyticsStore },
      { useAppStore },
      { useCompanyStore },
      { useAssessmentStore },
      { useInterviewStore },
      { useQuestionnaireStore },
      { useDashboardStore },
      { useSharedRolesStore },
    ] = await Promise.all([
      import("@/stores/analytics-store"),
      import("@/stores/app-store"),
      import("@/stores/company-store"),
      import("@/stores/assessment-store"),
      import("@/stores/interview-store"),
      import("@/stores/questionnaire-store"),
      import("@/stores/dashboard-store"),
      import("@/stores/shared-roles-store"),
    ]);

    // Clear all stores that contain user-specific data
    useAnalyticsStore.getState().reset();
    useAppStore.getState().reset();
    useCompanyStore.getState().reset();
    useAssessmentStore.getState().reset();
    useInterviewStore.getState().reset();
    useQuestionnaireStore.getState().reset();
    useDashboardStore.getState().reset();
    useSharedRolesStore.getState().reset();
    
    console.log("✅ All stores cleared successfully");
  } catch (error) {
    console.error("❌ Error clearing stores:", error);
    // Don't throw - we want logout to proceed even if store cleanup fails
  }
};

/**
 * Clears persisted data from localStorage/sessionStorage
 * Handles data that might be persisted by Zustand persist middleware
 */
export const clearPersistedStoreData = (): void => {
  try {
    // Clear company store persisted data
    localStorage.removeItem("company-store");
    
    // Clear any other persisted store data as needed
    // Add more localStorage.removeItem() calls as stores use persist middleware
    
    console.log("✅ Persisted store data cleared");
  } catch (error) {
    console.error("❌ Error clearing persisted data:", error);
    // Don't throw - we want logout to proceed even if cleanup fails
  }
};

/**
 * Complete cleanup of all store data (both in-memory and persisted)
 * This is the main function that should be called on user logout
 */
export const performCompleteStoreCleanup = async (): Promise<void> => {
  await clearAllStores();
  clearPersistedStoreData();
};