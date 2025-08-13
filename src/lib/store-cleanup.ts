/**
 * Utility for cleaning up all user-specific store data on logout
 * This ensures no user data persists between different user sessions
 */

import { useAppStore } from "@/stores/app-store";
import { useCompanyStore } from "@/stores/company-store";
import { useInterviewStore } from "@/stores/interview-store";
import { useDashboardStore } from "@/stores/dashboard-store";

/**
 * Clears all user-specific data from Zustand stores
 * Called when user signs out to ensure clean state for next user
 */
export const clearAllStores = (): void => {
  try {
    // Clear all stores that contain user-specific data
    useAppStore.getState().reset();
    useCompanyStore.getState().reset();
    useInterviewStore.getState().reset();
    useDashboardStore.getState().reset();
    
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
 * Clears all user-specific data except auth and app stores
 */
export const clearNonAuthStores = (): void => {
  try {
    // Clear all stores except auth store
    useCompanyStore.getState().reset();
    useInterviewStore.getState().reset();
    useDashboardStore.getState().reset();
    
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
    
    // Then reload companies for the new subscription tier
    await useCompanyStore.getState().loadCompanies();
    
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