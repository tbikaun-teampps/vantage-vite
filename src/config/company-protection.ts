/**
 * Configuration for company protection system
 */

// Pages that are accessible without a selected company
export const WHITELISTED_ROUTES = [
  // General pages
  "/help",
  "/support",
  "/notifications",
  "/account",
  "/settings/company/new"
] as const;

// Configuration for company protection system
export const COMPANY_PROTECTION_CONFIG = {
  // Enable logging for debugging
  ENABLE_LOGGING: import.meta.env.DEV,
} as const;

/**
 * Check if a route should be accessible without company selection
 */
export function isRouteWhitelisted(pathname: string): boolean {
  return WHITELISTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

