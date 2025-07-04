import { create } from "zustand";
import {
  getSharedRoles,
  getUserSharedRoles,
  createSharedRole,
  updateSharedRole,
  deleteSharedRole,
} from "@/lib/supabase/shared-roles";
import type {
  CreateSharedRoleData,
  SharedRolesState,
  UpdateSharedRoleData,
} from "@/types";

export const useSharedRolesStore = create<SharedRolesState>((set, get) => ({
  // Initial state
  allRoles: [],
  userRoles: [],
  loading: false,
  error: null,

  // Fetch all shared roles
  fetchAllRoles: async () => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await getSharedRoles();

      if (error) {
        set({ error, loading: false });
        return;
      }

      set({ allRoles: data || [], loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch roles",
        loading: false,
      });
    }
  },

  // Fetch roles created by current user
  fetchUserRoles: async () => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await getUserSharedRoles();

      if (error) {
        set({ error, loading: false });
        return;
      }

      set({ userRoles: data || [], loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch user roles",
        loading: false,
      });
    }
  },

  // Create a new shared role
  createRole: async (roleData: CreateSharedRoleData) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await createSharedRole(roleData);

      if (error || !data) {
        set({ error: error || "Failed to create role", loading: false });
        return { success: false, error: error || "Failed to create role" };
      }

      // Update both allRoles and userRoles since the new role was created by current user
      const { allRoles, userRoles } = get();
      set({
        allRoles: [...allRoles, data],
        userRoles: [...userRoles, data],
        loading: false,
      });

      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create role";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Update a shared role
  updateRole: async (id: number, roleData: UpdateSharedRoleData) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await updateSharedRole(id, roleData);

      if (error || !data) {
        set({ error: error || "Failed to update role", loading: false });
        return { success: false, error: error || "Failed to update role" };
      }

      // Update the role in both arrays
      const { allRoles, userRoles } = get();

      const updatedAllRoles = allRoles.map((role) =>
        role.id === id ? data : role
      );

      const updatedUserRoles = userRoles.map((role) =>
        role.id === id ? data : role
      );

      set({
        allRoles: updatedAllRoles,
        userRoles: updatedUserRoles,
        loading: false,
      });

      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update role";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Delete a shared role
  deleteRole: async (id: number) => {
    set({ loading: true, error: null });

    try {
      const { success, error } = await deleteSharedRole(id);

      if (!success) {
        set({ error: error || "Failed to delete role", loading: false });
        return { success: false, error: error || "Failed to delete role" };
      }

      // Remove the role from both arrays
      const { allRoles, userRoles } = get();

      const filteredAllRoles = allRoles.filter((role) => role.id !== id);
      const filteredUserRoles = userRoles.filter((role) => role.id !== id);

      set({
        allRoles: filteredAllRoles,
        userRoles: filteredUserRoles,
        loading: false,
      });

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete role";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Clear error state
  clearError: () => set({ error: null }),
}));
