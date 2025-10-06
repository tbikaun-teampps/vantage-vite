import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase.js";

export type SharedRole = Database["public"]["Tables"]["shared_roles"]["Row"];
export type CreateSharedRoleData =
  Database["public"]["Tables"]["shared_roles"]["Insert"];
export type UpdateSharedRoleData =
  Database["public"]["Tables"]["shared_roles"]["Update"];

export class SharedRolesService {
  private supabase: SupabaseClient<Database>;
  private userId: string;

  constructor(supabaseClient: SupabaseClient<Database>, userId: string) {
    this.supabase = supabaseClient;
    this.userId = userId;
  }

  /**
   * Get all shared roles (system roles + user-created roles)
   * System roles have created_by = null
   * User can see their own roles + system roles
   */
  async getAllRoles(): Promise<SharedRole[]> {
    const { data, error } = await this.supabase
      .from("shared_roles")
      .select("*")
      .eq("is_deleted", false)
      .or(`created_by.is.null,created_by.eq.${this.userId}`)
      .order("name", { ascending: true });

    if (error) throw error;

    return data || [];
  }

  /**
   * Get only roles created by the current user
   */
  async getUserRoles(): Promise<SharedRole[]> {
    const { data, error } = await this.supabase
      .from("shared_roles")
      .select("*")
      .eq("is_deleted", false)
      .eq("created_by", this.userId)
      .order("name", { ascending: true });

    if (error) throw error;

    return data || [];
  }

  /**
   * Create a new shared role
   * Automatically sets created_by to current user
   */
  async createRole(
    roleData: Omit<CreateSharedRoleData, "created_by">
  ): Promise<SharedRole> {
    const { data, error } = await this.supabase
      .from("shared_roles")
      .insert({
        ...roleData,
        created_by: this.userId,
      })
      .select()
      .single();

    if (error) {
      // Handle duplicate name constraint violation
      if (
        error.code === "23505" &&
        error.message.includes("shared_roles_name_key")
      ) {
        throw new Error(
          "A role with this name already exists. Please choose a different name."
        );
      }
      throw error;
    }

    if (!data) {
      throw new Error("Failed to create shared role");
    }

    return data;
  }

  /**
   * Update an existing shared role
   * Only allows updating roles created by the current user
   */
  async updateRole(
    id: number,
    roleData: Omit<UpdateSharedRoleData, "created_by" | "updated_at">
  ): Promise<SharedRole> {
    const { data, error } = await this.supabase
      .from("shared_roles")
      .update({
        ...roleData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("created_by", this.userId) // Only allow updating own roles
      .select()
      .single();

    if (error) {
      // Handle duplicate name constraint violation
      if (
        error.code === "23505" &&
        error.message.includes("shared_roles_name_key")
      ) {
        throw new Error(
          "A role with this name already exists. Please choose a different name."
        );
      }
      throw error;
    }

    if (!data) {
      throw new Error(
        "Shared role not found or you do not have permission to update it"
      );
    }

    return data;
  }

  /**
   * Delete a shared role (soft delete)
   * Only allows deleting roles created by the current user
   */
  async deleteRole(id: number): Promise<void> {
    const { error } = await this.supabase
      .from("shared_roles")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("created_by", this.userId); // Only allow deleting own roles

    if (error) throw error;
  }
}
