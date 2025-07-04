import { createClient } from "@/lib/supabase/client";
import type {
  SharedRole,
  CreateSharedRoleData,
  UpdateSharedRoleData,
} from "@/types";

// Get all shared roles (system-generated and user-created)
export async function getSharedRoles(): Promise<{
  data: SharedRole[] | null;
  error: string | null;
}> {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("shared_roles")
      .select("*")
      .or(`created_by.is.null,created_by.eq.${user.id}`)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching shared roles:", error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Unexpected error fetching shared roles:", error);
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to fetch shared roles",
    };
  }
}

// Get shared roles created by current user
export async function getUserSharedRoles(): Promise<{
  data: SharedRole[] | null;
  error: string | null;
}> {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("shared_roles")
      .select("*")
      .eq("created_by", user.id)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching user shared roles:", error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Unexpected error fetching user shared roles:", error);
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch user shared roles",
    };
  }
}

// Create a new shared role
export async function createSharedRole(
  roleData: CreateSharedRoleData
): Promise<{ data: SharedRole | null; error: string | null }> {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: "User not authenticated" };
    }

    // Filter out undefined values
    const cleanedRoleData = Object.fromEntries(
      Object.entries(roleData).filter(([_, value]) => value !== undefined)
    );

    const { data, error } = await supabase
      .from("shared_roles")
      .insert({
        ...cleanedRoleData,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating shared role:", error);

      // Handle duplicate name constraint violation
      if (
        error.code === "23505" &&
        error.message.includes("shared_roles_name_key")
      ) {
        return {
          data: null,
          error:
            "A role with this name already exists. Please choose a different name.",
        };
      }

      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Unexpected error creating shared role:", error);
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to create shared role",
    };
  }
}

// Update a shared role (only if created by current user)
export async function updateSharedRole(
  id: number,
  roleData: UpdateSharedRoleData
): Promise<{ data: SharedRole | null; error: string | null }> {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: "User not authenticated" };
    }

    // Filter out undefined values
    const cleanedRoleData = Object.fromEntries(
      Object.entries(roleData).filter(([_, value]) => value !== undefined)
    );

    const { data, error } = await supabase
      .from("shared_roles")
      .update({
        ...cleanedRoleData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("created_by", user.id) // Only allow updating own roles
      .select()
      .single();

    if (error) {
      console.error("Error updating shared role:", error);

      // Handle duplicate name constraint violation
      if (
        error.code === "23505" &&
        error.message.includes("shared_roles_name_key")
      ) {
        return {
          data: null,
          error:
            "A role with this name already exists. Please choose a different name.",
        };
      }

      return { data: null, error: error.message };
    }

    if (!data) {
      return {
        data: null,
        error:
          "Shared role not found or you do not have permission to update it",
      };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Unexpected error updating shared role:", error);
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to update shared role",
    };
  }
}

// Delete a shared role (only if created by current user)
export async function deleteSharedRole(
  id: number
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    const { error } = await supabase
      .from("shared_roles")
      .delete()
      .eq("id", id)
      .eq("created_by", user.id); // Only allow deleting own roles

    if (error) {
      console.error("Error deleting shared role:", error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Unexpected error deleting shared role:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete shared role",
    };
  }
}
