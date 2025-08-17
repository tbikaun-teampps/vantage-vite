import { createClient } from "@/lib/supabase/client";
import type { CreateInput, UpdateInput } from "@/types";
import type { SharedRole, Role } from "@/types/assessment";

interface RoleQueryOptions {
  companyId?: number;
  includeSharedRole?: boolean;
  includeOrgChart?: boolean;
  includeCompany?: boolean;
  siteId?: number;
  orgChartIds?: number[];
}

/**
 * Unified Roles Service
 * Handles both shared role management and company-specific role operations
 */
export class RolesService {
  private supabase = createClient();

  // Helper method to get current user
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

  // ========================================
  // SHARED ROLE MANAGEMENT
  // ========================================

  // Get all shared roles (system-generated and user-created)
  async getSharedRoles(): Promise<{
    data: SharedRole[] | null;
    error: string | null;
  }> {
    try {
      const user = await this.getCurrentUser();

      const { data, error } = await this.supabase
        .from("shared_roles")
        .select("*")
        .eq("is_deleted", false)
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
          error instanceof Error
            ? error.message
            : "Failed to fetch shared roles",
      };
    }
  }

  // Get shared roles created by current user
  async getUserSharedRoles(): Promise<{
    data: SharedRole[] | null;
    error: string | null;
  }> {
    try {
      const user = await this.getCurrentUser();

      const { data, error } = await this.supabase
        .from("shared_roles")
        .select("*")
        .eq("is_deleted", false)
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
  async createSharedRole(roleData: CreateInput<"shared_roles">): Promise<{
    data: SharedRole | null;
    error: string | null;
  }> {
    try {
      const user = await this.getCurrentUser();

      const { data, error } = await this.supabase
        .from("shared_roles")
        .insert({
          ...roleData,
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
          error instanceof Error
            ? error.message
            : "Failed to create shared role",
      };
    }
  }

  // Update a shared role (only if created by current user)
  async updateSharedRole(
    id: number,
    roleData: UpdateInput<"shared_roles">
  ): Promise<{
    data: SharedRole | null;
    error: string | null;
  }> {
    try {
      const user = await this.getCurrentUser();
      const { data, error } = await this.supabase
        .from("shared_roles")
        .update({
          ...roleData,
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
          error instanceof Error
            ? error.message
            : "Failed to update shared role",
      };
    }
  }

  // Delete a shared role (only if created by current user)
  async deleteSharedRole(id: number): Promise<{
    success: boolean;
    error: string | null;
  }> {
    try {
      const user = await this.getCurrentUser();

      const { error } = await this.supabase
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
          error instanceof Error
            ? error.message
            : "Failed to delete shared role",
      };
    }
  }

  // ========================================
  // COMPANY ROLE OPERATIONS
  // ========================================

  // Unified method to get roles with flexible filtering options
  async getRoles(options: RoleQueryOptions = {}): Promise<Role[]> {
    try {
      const {
        companyId,
        includeSharedRole = true,
        includeOrgChart = false,
        includeCompany = false,
        siteId,
        orgChartIds,
      } = options;

      // Build the select query based on options
      // Always include core fields
      let selectQuery = "*, is_deleted";
      if (includeSharedRole) {
        selectQuery += ", shared_role:shared_roles(id, name, description)";
      }
      if (includeOrgChart) {
        selectQuery += ", org_chart:org_charts(id, name, site_id)";
      }
      if (includeCompany) {
        selectQuery +=
          ", company:companies!inner(id, name, deleted_at, created_by)";
      }

      let query = this.supabase.from("roles").select(selectQuery);

      // Apply filters
      query.eq("is_deleted", false);
      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      if (siteId && includeOrgChart) {
        query = query.eq("org_chart.site_id", siteId);
      }

      if (orgChartIds && orgChartIds.length > 0) {
        query = query.in("org_chart_id", orgChartIds);
      }

      if (includeCompany) {
        query = query.is("company.deleted_at", null);
      }

      const { data, error } = await query.order("shared_role_id");
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error in getRoles:", error);
      return [];
    }
  }

  // Get roles for a specific company (simplified interface)
  async getRolesByCompany(companyId: number): Promise<Role[]> {
    return this.getRoles({
      companyId,
      includeSharedRole: true,
      includeCompany: true,
    });
  }

  // Get roles filtered by assessment site context
  async getRolesByAssessmentSite(assessmentId: number): Promise<Role[]> {
    try {
      // First, get the assessment to find the site_id
      const { data: assessmentData, error: assessmentError } =
        await this.supabase
          .from("assessments")
          .select("site_id, company_id, is_deleted")
          .eq("is_deleted", false)
          .eq("id", assessmentId)
          .single();

      if (assessmentError || !assessmentData) {
        console.error("Error getting assessment site:", assessmentError);
        return [];
      }

      // Get org chart IDs for this specific site only
      const { data: orgCharts, error: orgChartError } = await this.supabase
        .from("org_charts")
        .select("id, name, site_id, is_deleted")
        .eq("is_deleted", false)
        .eq("site_id", assessmentData.site_id)
        .eq("company_id", assessmentData.company_id);

      if (orgChartError || !orgCharts || orgCharts.length === 0) {
        console.error("Error getting org charts for site:", orgChartError);
        return [];
      }

      const orgChartIds = orgCharts.map((oc) => oc.id);

      const roles = await this.getRoles({
        companyId: assessmentData.company_id,
        orgChartIds,
        includeSharedRole: true,
        includeOrgChart: true,
      });

      // Remove any potential duplicates based on role ID
      const uniqueRoles = roles.filter(
        (role, index, arr) => arr.findIndex((r) => r.id === role.id) === index
      );

      return uniqueRoles;
    } catch (error) {
      console.error("Error in getRolesByAssessmentSite:", error);
      return [];
    }
  }

  // Get roles that are both associated with a question AND available at the assessment site
  async getRolesIntersectionForQuestion(
    assessmentId: number,
    questionId: number
  ): Promise<Role[]> {
    try {
      // 1. Get shared_role_ids associated with this question
      const { data: questionRoles, error: questionRolesError } =
        await this.supabase
          .from("questionnaire_question_roles")
          .select("shared_role_id, is_deleted")
          .eq("is_deleted", false)
          .eq("questionnaire_question_id", questionId);

      if (questionRolesError) {
        console.error("Error fetching question roles:", questionRolesError);
        throw questionRolesError;
      }

      // 2. Get roles available at the assessment site
      const siteRoles = await this.getRolesByAssessmentSite(assessmentId);

      // If question has no associated roles, return all site roles
      if (!questionRoles || questionRoles.length === 0) {
        return siteRoles;
      }

      const questionSharedRoleIds = questionRoles.map(
        (qr) => qr.shared_role_id
      );

      // 3. Filter site roles to only include those whose shared_role_id matches question roles
      const intersectionRoles = siteRoles.filter(
        (role) =>
          role.shared_role_id &&
          questionSharedRoleIds.includes(role.shared_role_id)
      );

      return intersectionRoles;
    } catch (error) {
      console.error("Error in getRolesIntersectionForQuestion:", error);
      return [];
    }
  }

  // Get all roles for a questionnaire filtered by assessment context
  async getAllRolesForQuestionnaire(assessmentId: number): Promise<Role[]> {
    try {
      // 1. Get questionnaire ID for the assessment
      const { data: assessment, error: assessmentError } = await this.supabase
        .from("assessments")
        .select("questionnaire_id")
        .eq("id", assessmentId)
        .eq("is_deleted", false)
        .single();

      if (assessmentError || !assessment?.questionnaire_id) {
        console.error(
          "Error getting questionnaire for assessment:",
          assessmentError
        );
        return [];
      }

      // 2. Get all shared_role_ids associated with this questionnaire
      // First, get all question IDs for this questionnaire by traversing the hierarchy
      const { data: questions, error: questionsError } = await this.supabase
        .from("questionnaire_questions")
        .select(
          `
          id,
          questionnaire_steps!inner(
            questionnaire_sections!inner(
              questionnaire_id
            )
          )
        `
        )
        .eq(
          "questionnaire_steps.questionnaire_sections.questionnaire_id",
          assessment.questionnaire_id
        )
        .eq("is_deleted", false);

      if (questionsError) {
        console.error(
          "Error fetching questionnaire questions:",
          questionsError
        );
        throw questionsError;
      }

      const questionIds = questions?.map((q) => q.id) || [];

      // Handle empty questionIds case
      if (questionIds.length === 0) {
        return [];
      }

      // Now get the shared_role_ids for these questions
      const { data: questionRoles, error: questionRolesError } =
        await this.supabase
          .from("questionnaire_question_roles")
          .select("shared_role_id")
          .in("questionnaire_question_id", questionIds)
          .eq("is_deleted", false);

      if (questionRolesError) {
        console.error(
          "Error fetching questionnaire roles:",
          questionRolesError
        );
        throw questionRolesError;
      }

      // 3. Get roles available at the assessment site
      const siteRoles = await this.getRolesByAssessmentSite(assessmentId);

      // If questionnaire has no associated roles, return no roles
      if (!questionRoles || questionRoles.length === 0) {
        return [];
      }

      // Get unique shared role IDs
      const uniqueSharedRoleIds = [
        ...new Set(questionRoles.map((qr) => qr.shared_role_id)),
      ];

      // 4. Filter site roles to only include those whose shared_role_id matches questionnaire roles
      const intersectionRoles = siteRoles.filter(
        (role) =>
          role.shared_role_id &&
          uniqueSharedRoleIds.includes(role.shared_role_id)
      );

      return intersectionRoles;
    } catch (error) {
      console.error("Error in getAllRolesForQuestionnaire:", error);
      return [];
    }
  }
}

// Create singleton instance
export const rolesService = new RolesService();

// Export function-based interface for backward compatibility
export async function getRoles(): Promise<Role[]> {
  return rolesService.getRoles({
    includeSharedRole: true,
    includeCompany: true,
  });
}
