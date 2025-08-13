/**
 * Utility for cleaning up all user-specific store data on logout
 * This ensures no user data persists between different user sessions
 */

import { useCompanyClientStore } from "@/stores/company-client-store";
import { queryClient } from "@/lib/query-client";

/**
 * Clears all user-specific data from Zustand stores and React Query cache
 * Called when user signs out to ensure clean state for next user
 */
export const clearAllStores = (): void => {
  try {
    // Clear all remaining Zustand stores that contain user-specific data
    useCompanyClientStore.getState().reset();
    
    // Clear React Query cache
    queryClient.clear();
    
    console.log("✅ All stores and cache cleared successfully");
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
    // Clear company client store persisted data
    localStorage.removeItem("company-client-store");
    
    // Clear any other persisted store data as needed
    // Add more localStorage.removeItem() calls as stores use persist middleware
    
    console.log("✅ Persisted store data cleared");
  } catch (error) {
    console.error("❌ Error clearing persisted data:", error);
    // Don't throw - we want logout to proceed even if cleanup fails
  }
};

/**
 * Clears all user-specific data except auth and app stores
 */
export const clearNonAuthStores = (): void => {
  try {
    // Clear all stores except auth store
    useCompanyClientStore.getState().reset();
    
    console.log("✅ Non-auth stores cleared for demo mode change");
  } catch (error) {
    console.error("❌ Error clearing non-auth stores:", error);
    // Don't throw - we want demo mode change to proceed even if store cleanup fails
  }
};

/**
 * Refreshes stores for subscription tier changes
 * Clears all non-auth stores and reloads user-accessible companies
 */
export const refreshStoresForSubscriptionChange = async (): Promise<void> => {
  try {
    // First clear all non-auth stores
    clearNonAuthStores();
    
    // Companies will be automatically refetched by React Query when components remount
    // No manual reload needed - React Query handles this automatically
    
    console.log("✅ Stores refreshed for subscription tier change");
  } catch (error) {
    console.error("❌ Error refreshing stores for subscription change:", error);
    // Don't throw - we want subscription change to proceed even if store refresh fails
  }
};

/**
 * Complete cleanup of all store data (both in-memory and persisted)
 * This is the main function that should be called on user logout
 */
export const performCompleteStoreCleanup = (): void => {
  clearAllStores();
  clearPersistedStoreData();
};