import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { useCompanyFromUrl } from "./useCompanyFromUrl";

// Query key factory for user company role cache management
export const userCompanyRoleKeys = {
  all: ["userCompanyRole"] as const,
  detail: (userId: string, companyId: string) => 
    [...userCompanyRoleKeys.all, "detail", userId, companyId] as const,
};

/**
 * Hook to fetch the current user's role in the current company
 * Automatically enabled when user is authenticated and company is selected
 */
export function useUserCompanyRole() {
  const { user } = useAuthStore();
  
  // This will throw if no company is selected, which is expected behavior
  let companyId: string | null = null;
  try {
    companyId = useCompanyFromUrl();
  } catch {
    // If we're not on a company route, companyId will remain null
    // and the query will be disabled
  }

  return useQuery({
    queryKey: user && companyId 
      ? userCompanyRoleKeys.detail(user.id, companyId) 
      : ["userCompanyRole", "null"],
    queryFn: async () => {
      if (!user || !companyId) return null;

      const supabase = createClient();
      const { data, error } = await supabase
        .from("user_companies")
        .select("role")
        .eq("user_id", user.id)
        .eq("company_id", companyId)
        .single();

      if (error) {
        console.error("Error fetching user company role:", error);
        // If no role found, user might not have access to this company
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Failed to fetch user role: ${error.message}`);
      }

      return data?.role || null;
    },
    enabled: !!user && !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}

/**
 * Utility hook to check if user has at least the minimum required role
 * Role hierarchy: viewer < admin < owner
 */
export function useHasMinRole(minRole: 'viewer' | 'admin' | 'owner'): boolean {
  const { data: userRole, isLoading } = useUserCompanyRole();
  
  // If still loading, return false for safety (deny access)
  if (isLoading || !userRole) {
    return false;
  }
  
  const roleHierarchy = { viewer: 0, admin: 1, owner: 2 };
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] ?? -1;
  const minLevel = roleHierarchy[minRole];
  
  return userLevel >= minLevel;
}

/**
 * Utility hook to check if user has a specific role
 */
export function useHasRole(role: 'viewer' | 'admin' | 'owner'): boolean {
  const { data: userRole } = useUserCompanyRole();
  return userRole === role;
}

/**
 * Utility hook to check if user is an owner
 */
export function useIsOwner(): boolean {
  return useHasRole('owner');
}

/**
 * Utility hook to check if user is an admin or owner
 */
export function useCanAdmin(): boolean {
  return useHasMinRole('admin');
}

/**
 * Utility hook that returns role-based permissions object
 */
export function useRolePermissions() {
  const { data: userRole, isLoading } = useUserCompanyRole();
  
  const isOwner = userRole === 'owner';
  const isAdmin = userRole === 'admin' || isOwner;
  const canView = !!userRole; // viewer, admin, or owner
  
  return {
    userRole,
    isLoading,
    isOwner,
    isAdmin,
    canView,
    canEdit: isAdmin,
    canDelete: isOwner,
    canManageUsers: isOwner,
    canCreateCompany: isOwner,
  };
}