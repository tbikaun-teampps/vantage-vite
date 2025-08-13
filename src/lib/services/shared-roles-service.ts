import { createClient } from "@/lib/supabase/client";
import type {
  SharedRole,
  CreateSharedRoleData,
  UpdateSharedRoleData,
} from "@/types/domains/shared-roles";

export class SharedRolesService {
  private supabase = createClient();

  private async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser();
    if (error || !user) {
      throw new Error("User not authenticated");
    }
    return user;
  }

  private cleanObject(obj: Record<string, unknown>) {
    return Object.fromEntries(
      Object.entries(obj).filter(([, value]) => value !== undefined)
    );
  }

  async getAllRoles(): Promise<SharedRole[]> {
    const user = await this.getCurrentUser();

    const { data, error } = await this.supabase
      .from("shared_roles")
      .select("*")
      .eq("is_deleted", false)
      .or(`created_by.is.null,created_by.eq.${user.id}`)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching shared roles:", error);
      throw new Error(error.message);
    }

    return data || [];
  }

  async getUserRoles(): Promise<SharedRole[]> {
    const user = await this.getCurrentUser();

    const { data, error } = await this.supabase
      .from("shared_roles")
      .select("*")
      .eq("is_deleted", false)
      .eq("created_by", user.id)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching user shared roles:", error);
      throw new Error(error.message);
    }

    return data || [];
  }

  async createRole(roleData: CreateSharedRoleData): Promise<SharedRole> {
    const user = await this.getCurrentUser();
    const cleanedRoleData = this.cleanObject(roleData as Record<string, unknown>);

    const { data, error } = await this.supabase
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
        throw new Error(
          "A role with this name already exists. Please choose a different name."
        );
      }

      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Failed to create shared role");
    }

    return data;
  }

  async updateRole(
    id: number,
    roleData: UpdateSharedRoleData
  ): Promise<SharedRole> {
    const user = await this.getCurrentUser();
    const cleanedRoleData = this.cleanObject(roleData as Record<string, unknown>);

    const { data, error } = await this.supabase
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
        throw new Error(
          "A role with this name already exists. Please choose a different name."
        );
      }

      throw new Error(error.message);
    }

    if (!data) {
      throw new Error(
        "Shared role not found or you do not have permission to update it"
      );
    }

    return data;
  }

  async deleteRole(id: number): Promise<void> {
    const user = await this.getCurrentUser();

    const { error } = await this.supabase
      .from("shared_roles")
      .delete()
      .eq("id", id)
      .eq("created_by", user.id); // Only allow deleting own roles

    if (error) {
      console.error("Error deleting shared role:", error);
      throw new Error(error.message);
    }
  }
}

export const sharedRolesService = new SharedRolesService();