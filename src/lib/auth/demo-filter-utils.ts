import { getAuthenticatedUser, type AuthUser } from "./auth-utils";

/**
 * Apply demo mode filtering to Supabase queries
 * Handles the common pattern of showing demo data vs user-owned data
 */
export async function applyDemoFiltering<T>(
  query: any,
  options: {
    demoField?: string;
    createdByField?: string;
    skipAuthCheck?: boolean;
  } = {}
): Promise<any> {
  const {
    demoField = "is_demo",
    createdByField = "created_by",
    skipAuthCheck = false
  } = options;

  // If we should skip auth check, return query as-is (will be filtered by RLS)
  if (skipAuthCheck) {
    return query;
  }

  // Get authenticated user
  let user: AuthUser;
  try {
    user = await getAuthenticatedUser();
  } catch (error) {
    // If not authenticated, return query as-is (will be filtered by RLS)
    return query;
  }

  // Apply demo mode filtering
  if (user.isDemoMode) {
    // Demo users only see demo data
    return query.eq(demoField, true);
  } else {
    // Regular users see only their own data
    return query.eq(createdByField, user.id);
  }
}

/**
 * Apply demo filtering specifically for company-related data
 * Handles the complex company filtering pattern used across services
 */
export async function applyCompanyDemoFiltering(
  query: any,
  companyTableAlias: string = "company"
): Promise<any> {
  let user: AuthUser;
  try {
    user = await getAuthenticatedUser();
  } catch (error) {
    // If not authenticated, return query as-is (will be filtered by RLS)
    return query;
  }

  if (user.isDemoMode) {
    // Demo users only see data from demo companies
    return query.eq(`${companyTableAlias}.is_demo`, true);
  } else {
    // Regular users see data only from their own companies
    return query.eq(`${companyTableAlias}.created_by`, user.id);
  }
}

/**
 * Apply simple demo filtering where user owns the data directly
 */
export async function applyUserOwnedFiltering(
  query: any,
  options: {
    demoField?: string;
    createdByField?: string;
  } = {}
): Promise<any> {
  return applyDemoFiltering(query, options);
}

/**
 * Get user IDs for filtering - returns current user ID or empty array
 * Used for queries that need user ID arrays
 */
export async function getUserIdsForFiltering(): Promise<string[]> {
  try {
    const user = await getAuthenticatedUser();
    
    if (user.isDemoMode) {
      return [];
    }
    
    return [user.id];
  } catch {
    return [];
  }
}

/**
 * Standard error handling wrapper for service methods
 * Provides consistent error handling and fallback behavior
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  fallbackValue: T,
  errorContext: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`Error in ${errorContext}:`, error);
    return fallbackValue;
  }
}