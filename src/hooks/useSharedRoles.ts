import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllSharedRoles,
  getUserSharedRoles,
  createSharedRole,
  updateSharedRole,
  deleteSharedRole,
  type CreateSharedRoleData,
  type UpdateSharedRoleData,
} from "@/lib/api/shared";
import type { SharedRole } from "@/types/assessment";

// Query key factory for shared roles
export const sharedRolesKeys = {
  all: ["shared-roles"] as const,
  allRoles: () => [...sharedRolesKeys.all, "all"] as const,
  userRoles: () => [...sharedRolesKeys.all, "user"] as const,
};

// Hook to fetch all shared roles (system + user-created)
export function useAllSharedRoles() {
  return useQuery({
    queryKey: sharedRolesKeys.allRoles(),
    queryFn: getAllSharedRoles,
    staleTime: 5 * 60 * 1000, // 5 minutes - roles don't change frequently
  });
}

// Hook to fetch roles created by current user
export function useUserSharedRoles() {
  return useQuery({
    queryKey: sharedRolesKeys.userRoles(),
    queryFn: getUserSharedRoles,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for shared role mutations (create, update, delete)
export function useSharedRoleActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateSharedRoleData) => createSharedRole(data),
    onSuccess: (newRole) => {
      // Update both all roles and user roles cache
      queryClient.setQueryData(
        sharedRolesKeys.allRoles(),
        (oldData: SharedRole[] = []) => {
          return [...oldData, newRole].sort((a, b) =>
            a.name.localeCompare(b.name)
          );
        }
      );

      queryClient.setQueryData(
        sharedRolesKeys.userRoles(),
        (oldData: SharedRole[] = []) => {
          return [...oldData, newRole].sort((a, b) =>
            a.name.localeCompare(b.name)
          );
        }
      );
    },
    onError: (error) => {
      console.error("Failed to create shared role:", error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSharedRoleData }) =>
      updateSharedRole(id, data),
    onSuccess: (updatedRole) => {
      // Update the role in both caches
      queryClient.setQueryData(
        sharedRolesKeys.allRoles(),
        (oldData: SharedRole[] = []) => {
          return oldData
            .map((role) => (role.id === updatedRole.id ? updatedRole : role))
            .sort((a, b) => a.name.localeCompare(b.name));
        }
      );

      queryClient.setQueryData(
        sharedRolesKeys.userRoles(),
        (oldData: SharedRole[] = []) => {
          return oldData
            .map((role) => (role.id === updatedRole.id ? updatedRole : role))
            .sort((a, b) => a.name.localeCompare(b.name));
        }
      );
    },
    onError: (error) => {
      console.error("Failed to update shared role:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteSharedRole(id),
    onSuccess: (_, deletedId) => {
      // Remove the role from both caches
      queryClient.setQueryData(
        sharedRolesKeys.allRoles(),
        (oldData: SharedRole[] = []) => {
          return oldData.filter((role) => role.id !== deletedId);
        }
      );

      queryClient.setQueryData(
        sharedRolesKeys.userRoles(),
        (oldData: SharedRole[] = []) => {
          return oldData.filter((role) => role.id !== deletedId);
        }
      );
    },
    onError: (error) => {
      console.error("Failed to delete shared role:", error);
    },
  });

  return {
    // Actions
    createRole: createMutation.mutateAsync,
    updateRole: (id: number, data: UpdateSharedRoleData) =>
      updateMutation.mutateAsync({ id, data }),
    deleteRole: deleteMutation.mutateAsync,

    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,

    // Error states
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,

    // Reset error states
    resetErrors: () => {
      createMutation.reset();
      updateMutation.reset();
      deleteMutation.reset();
    },
  };
}

// Utility hook to refetch all shared roles data
export function useRefreshSharedRoles() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: sharedRolesKeys.all });
  };
}
