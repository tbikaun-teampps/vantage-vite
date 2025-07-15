import { createClient } from "./client";
import { getAuthenticatedUser } from "@/lib/auth/auth-utils";
import { rolesService } from "./roles-service";
import type {
  Company,
  CompanyTreeNode,
  BusinessUnit,
  Region,
  Site,
  AssetGroup,
  Role,
  TreeNodeType,
} from "@/types/company";
import { checkDemoAction } from "./utils";

export class CompanyService {
  private supabase = createClient();

  // Company CRUD operations
  async getCompanies(): Promise<Company[]> {
    const { data: companies, error } = await this.supabase
      .from("companies")
      .select("*")
      .eq('is_deleted', false)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Error fetching companies:", error);
      throw error;
    }

    return companies || [];
  }

  async createCompany(formData: FormData): Promise<{
    success: boolean;
    error?: string;
    data?: Company;
    message?: string;
  }> {
    try {
      await checkDemoAction();

      const name = formData.get("name") as string;
      const code = formData.get("code") as string;
      const description = formData.get("description") as string;

      if (!name || name.trim().length < 2) {
        return {
          success: false,
          error: "Company name must be at least 2 characters",
        };
      }

      const { data: company, error: insertError } = await this.supabase
        .from("companies")
        .insert({
          name: name.trim(),
          code: code?.trim() || null,
          description: description?.trim() || null,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Database insert error:", insertError);

        // Handle RLS policy violations gracefully
        if (
          insertError.code === "42501" ||
          insertError.message.includes("policy")
        ) {
          return {
            success: false,
            error: "Company creation is not allowed in demo mode",
          };
        }

        return { success: false, error: "Failed to create company" };
      }

      return {
        success: true,
        data: company,
        message: "Company created successfully",
      };
    } catch (error) {
      console.error("Unexpected error in createCompany:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  async updateCompany(
    companyId: number,
    formData: FormData
  ): Promise<{
    success: boolean;
    error?: string;
    data?: Company;
    message?: string;
  }> {
    try {
      await checkDemoAction();

      const name = formData.get("name") as string;
      const code = formData.get("code") as string;
      const description = formData.get("description") as string;

      if (!name || name.trim().length < 2) {
        return {
          success: false,
          error: "Company name must be at least 2 characters",
        };
      }

      const { data: updatedCompany, error: updateError } = await this.supabase
        .from("companies")
        .update({
          name: name.trim(),
          code: code?.trim() || null,
          description: description?.trim() || null,
        })
        .eq("id", companyId)
        .select()
        .single();

      if (updateError) {
        console.error("Database update error:", updateError);
        return { success: false, error: "Failed to update company" };
      }

      return {
        success: true,
        data: updatedCompany,
        message: "Company updated successfully",
      };
    } catch (error) {
      console.error("Unexpected error in updateCompany:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  async deleteCompany(companyId: number): Promise<{
    success: boolean;
    error?: string;
    message?: string;
  }> {
    try {
      await checkDemoAction();
      // Simple soft delete - triggers will handle cascading
      const { error } = await this.supabase
        .from("companies")
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
        })
        .eq("id", companyId);

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        message: "Company and all related entities deleted successfully",
      };
    } catch (error) {
      console.error("Error in deleteCompany:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      };
    }
  }

  // Company tree operations
  async getCompanyTree(
    selectedCompany: Company
  ): Promise<CompanyTreeNode | null> {
    try {
      const { id: userId } = await getAuthenticatedUser();

      // Load full tree structure with a single query using joins
      let treeQuery = this.supabase
        .from("companies")
        .select(
          `
          *,
          business_units!business_units_company_id_fkey(
            *,
            regions!regions_business_unit_id_fkey(
              *,
              sites!sites_region_id_fkey(
                *,
                asset_groups!asset_groups_site_id_fkey(*),
                org_charts!org_charts_site_id_fkey(
                  *,
                  roles!roles_org_chart_id_fkey(
                    *,
                    shared_roles!roles_shared_role_id_fkey(
                      id,
                      name,
                      description
                    )
                  )
                )
              )
            )
          )
        `
        )
        .eq("id", selectedCompany.id)
        .eq("is_deleted", false)
        .eq("business_units.is_deleted", false)
        .eq("business_units.regions.is_deleted", false)
        .eq("business_units.regions.sites.is_deleted", false)
        .eq("business_units.regions.sites.asset_groups.is_deleted", false)
        .eq("business_units.regions.sites.org_charts.is_deleted", false)
        .eq("business_units.regions.sites.org_charts.roles.is_deleted", false)
        .eq("business_units.regions.sites.org_charts.roles.shared_roles.is_deleted", false);

      // Only filter by created_by for non-demo companies
      if (!selectedCompany.is_demo) {
        treeQuery = treeQuery.eq("created_by", userId);
      }

      const { data: treeData, error } = await treeQuery.single();

      if (error) {
        console.error("Error fetching company tree:", error);
        throw error;
      }

      // Transform flat relational data into tree structure
      const tree: CompanyTreeNode = {
        id: treeData.id.toString(),
        name: treeData.name,
        type: "company",
        code: treeData.code,
        description: treeData.description,
        business_units: (treeData.business_units || []).map((bu: any) => ({
          id: bu.id.toString(),
          companyId: treeData.id.toString(),
          name: bu.name,
          type: "business_unit",
          code: bu.code,
          manager: bu.manager,
          description: bu.description,
          regions: (bu.regions || []).map((region: any) => ({
            id: region.id.toString(),
            business_unitId: bu.id.toString(),
            name: region.name,
            description: region.description,
            code: region.code,
            type: "region",
            sites: (region.sites || []).map((site: any) => ({
              id: site.id.toString(),
              regionId: region.id.toString(),
              name: site.name,
              type: "site",
              code: site.code,
              lat: site.lat,
              lng: site.lng,
              description: site.description,
              asset_groups_container: {
                asset_groups: (site.asset_groups || []).map((ag: any) => ({
                  id: ag.id.toString(),
                  siteId: site.id.toString(),
                  name: ag.name,
                  description: ag.description,
                  code: ag.code,
                  type: "asset_group",
                })),
              },
              org_charts_container: {
                org_charts: (site.org_charts || []).map((oc: any) => ({
                  id: oc.id.toString(),
                  siteId: site.id.toString(),
                  name: oc.name || oc.description || `Chart ${oc.id}`,
                  type: "org_chart",
                  description: oc.description,
                  chart_type: oc.chart_type,
                  roles: (oc.roles || []).map((role: any) => ({
                    id: role.id.toString(),
                    org_chartId: oc.id.toString(),
                    name: role.shared_roles?.name || `Role ${role.id}`,
                    type: "role",
                    level: role.level,
                    department: role.department,
                    shared_role_id: role.shared_role_id
                      ? role.shared_role_id.toString()
                      : undefined,
                    shared_role_name: role.shared_roles?.name,
                    description: role.shared_roles?.description,
                  })),
                })),
              },
            })),
          })),
        })),
      };

      return tree;
    } catch (error) {
      console.error("Error loading company tree:", error);
      throw error;
    }
  }

  // Individual entity operations
  async getBusinessUnits(companyId: number): Promise<BusinessUnit[]> {
    const { data: businessUnits, error } = await this.supabase
      .from("business_units")
      .select("*")
      .eq('is_deleted', false)
      .eq("company_id", companyId)
      .order("name");

    if (error) {
      console.error("Error loading business units:", error);
      throw error;
    }

    return businessUnits || [];
  }

  async getRegions(companyId: number): Promise<Region[]> {
    const { data: regions, error } = await this.supabase
      .from("regions")
      .select("*")
      .eq('is_deleted', false)
      .eq("company_id", companyId)
      .order("name");

    if (error) {
      console.error("Error loading regions:", error);
      throw error;
    }

    return regions || [];
  }

  async getSites(companyId: number): Promise<Site[]> {
    const { data: sites, error } = await this.supabase
      .from("sites")
      .select("*")
      .eq('is_deleted', false)
      .eq("company_id", companyId)
      .order("name");

    if (error) {
      console.error("Error loading sites:", error);
      throw error;
    }

    return sites || [];
  }

  async getAssetGroups(companyId: number): Promise<AssetGroup[]> {
    const { data: assetGroups, error } = await this.supabase
      .from("asset_groups")
      .select("*")
      .eq('is_deleted', false)
      .eq("company_id", companyId)
      .order("name");

    if (error) {
      console.error("Error loading asset groups:", error);
      throw error;
    }

    return assetGroups || [];
  }

  async getRoles(): Promise<Role[]> {
    // Use the unified roles service for consistency
    return rolesService.getRoles({
      includeSharedRole: true,
    });
  }

  // Generic tree node CRUD operations
  async createTreeNode(
    parentType: TreeNodeType,
    parentId: number,
    nodeType: TreeNodeType,
    formData: FormData,
    companyId: number
  ): Promise<{
    success: boolean;
    error?: string;
    message?: string;
  }> {
    try {
      await checkDemoAction();

      const name = formData.get("name") as string;
      const code = formData.get("code") as string;
      const description = formData.get("description") as string;
      // Check for shared_role_id upfront for roles
      const shared_role_id =
        nodeType === "role" ? formData.get("shared_role_id") : null;

      // For roles with shared_role_id, we don't need a name
      // For all other entities, name is required
      if (nodeType === "role" && shared_role_id) {
        // Role with shared_role_id - no name validation needed
      } else if (!name || name.trim().length < 2) {
        return {
          success: false,
          error: `${nodeType.replace(
            "_",
            " "
          )} name must be at least 2 characters`,
        };
      }

      // Map node types to table names and parent field names
      const tableMap: Record<
        TreeNodeType,
        { table: string; parentField: string }
      > = {
        company: { table: "companies", parentField: "" },
        business_unit: {
          table: "business_units",
          parentField: "company_id",
        },
        region: { table: "regions", parentField: "business_unit_id" },
        site: { table: "sites", parentField: "region_id" },
        asset_group: { table: "asset_groups", parentField: "site_id" },
        org_chart: { table: "org_charts", parentField: "site_id" },
        role: { table: "roles", parentField: "org_chart_id" },
        asset_groups_container: { table: "", parentField: "" }, // Not a real entity
        org_charts_container: { table: "", parentField: "" }, // Not a real entity
      };

      const config = tableMap[nodeType];
      if (!config || !config.table) {
        return { success: false, error: "Invalid node type" };
      }

      // Build insert data
      const insertData: any = {
        code: code?.trim() || null,
        description: description?.trim() || null,
      };

      // Only add name if it's not a role with shared_role_id
      if (!(nodeType === "role" && shared_role_id)) {
        insertData.name = name.trim();
      }

      if (config.parentField) {
        insertData[config.parentField] = parentId;
      }

      // Add company_id to all real entities except company itself
      if (nodeType !== "company") {
        insertData.company_id = companyId;
      }

      // Special handling for specific node types
      if (nodeType === "org_chart") {
        insertData.chart_type = formData.get("chart_type") || "operational";
      } else if (nodeType === "role") {
        insertData.level = formData.get("level") || null;
        insertData.department = formData.get("department") || null;
        insertData.sort_order = 0;

        // Handle shared_role_id if provided
        if (shared_role_id) {
          insertData.shared_role_id = parseInt(shared_role_id as string);
          // Remove name if using shared role (shouldn't exist anyway)
          delete insertData.name;
        }
      } else if (nodeType === "site") {
        const lat = formData.get("lat");
        const lng = formData.get("lng");
        if (lat) insertData.lat = parseFloat(lat as string);
        if (lng) insertData.lng = parseFloat(lng as string);
      }

      const { error: insertError } = await this.supabase
        .from(config.table)
        .insert(insertData);

      if (insertError) {
        console.error("Database insert error:", insertError);
        return {
          success: false,
          error: `Failed to create ${nodeType.replace("_", " ")}`,
        };
      }

      return {
        success: true,
        message: `${nodeType.replace("_", " ")} created successfully`,
      };
    } catch (error) {
      console.error("Unexpected error in createTreeNode:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  async updateTreeNode(
    nodeType: TreeNodeType,
    nodeId: number,
    formData: FormData
  ): Promise<{
    success: boolean;
    error?: string;
    message?: string;
    data?: any;
  }> {
    try {
      await checkDemoAction();

      const name = formData.get("name") as string;
      const code = formData.get("code") as string;
      const description = formData.get("description") as string;
      const shared_role_id = formData.get("shared_role_id");

      // For roles with shared_role_id, we don't need a name
      // For all other entities, name is required
      if (nodeType === "role" && shared_role_id) {
        // Role with shared_role_id - no name validation needed
      } else if (!name || name.trim().length < 2) {
        return {
          success: false,
          error: `${nodeType.replace(
            "_",
            " "
          )} name must be at least 2 characters`,
        };
      }

      const tableMap: Record<TreeNodeType, string> = {
        company: "companies",
        business_unit: "business_units",
        region: "regions",
        site: "sites",
        asset_group: "asset_groups",
        org_chart: "org_charts",
        role: "roles",
        asset_groups_container: "", // Not a real entity
        org_charts_container: "", // Not a real entity
      };

      const table = tableMap[nodeType];
      if (!table) {
        return { success: false, error: "Invalid node type" };
      }

      const updateData: any = {
        code: code?.trim() || null,
        description: description?.trim() || null,
      };

      // Only include name if it's not a role with shared_role_id
      if (!(nodeType === "role" && shared_role_id)) {
        updateData.name = name.trim();
      }

      // Special handling for specific node types
      if (nodeType === "site") {
        const lat = formData.get("lat");
        const lng = formData.get("lng");
        if (lat) updateData.lat = parseFloat(lat as string);
        if (lng) updateData.lng = parseFloat(lng as string);
      } else if (nodeType === "business_unit") {
        const manager = formData.get("manager") as string;
        updateData.manager = manager?.trim() || null;
      } else if (nodeType === "org_chart") {
        const chart_type = formData.get("chart_type") as string;
        updateData.chart_type = chart_type || "operational";
      } else if (nodeType === "role") {
        updateData.level = formData.get("level") || null;
        updateData.department = formData.get("department") || null;

        // Handle shared_role_id if provided
        if (shared_role_id) {
          updateData.shared_role_id = parseInt(shared_role_id as string);
          // Remove name if using shared role
          delete updateData.name;
        }
      }

      // For company updates, we need the updated data back
      const query = this.supabase
        .from(table)
        .update(updateData)
        .eq("id", nodeId);

      // Get updated data back for company type
      const { data: updatedData, error: updateError } =
        nodeType === "company" ? await query.select().single() : await query;

      if (updateError) {
        console.error("Database update error:", updateError);
        return {
          success: false,
          error: `Failed to update ${nodeType.replace("_", " ")}`,
        };
      }

      return {
        success: true,
        data: updatedData,
        message: `${nodeType
          .replace("_", " ")
          .replace(/\b\w/g, (l) => l.toUpperCase())} Updated Successfully`,
      };
    } catch (error) {
      console.error("Unexpected error in updateTreeNode:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  async deleteTreeNode(
    nodeType: TreeNodeType,
    nodeId: number
  ): Promise<{
    success: boolean;
    error?: string;
    message?: string;
  }> {
    try {
      await checkDemoAction();

      // Handle container entities
      if (
        nodeType === "asset_groups_container" ||
        nodeType === "org_charts_container"
      ) {
        return { success: false, error: "Cannot delete container entities" };
      }

      // Map node types to table names
      const tableMap: Record<TreeNodeType, string> = {
        company: "companies",
        business_unit: "business_units",
        region: "regions",
        site: "sites",
        asset_group: "asset_groups",
        org_chart: "org_charts",
        role: "roles",
        asset_groups_container: "", // Not a real entity
        org_charts_container: "", // Not a real entity
      };

      const table = tableMap[nodeType];
      if (!table) {
        return { success: false, error: "Invalid node type" };
      }

      // Simple soft delete - triggers will handle cascading
      const { error } = await this.supabase
        .from(table)
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
        })
        .eq("id", nodeId);

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        message: `${nodeType.replace("_", " ")} deleted successfully`,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      };
    }
  }
}

export const companyService = new CompanyService();
