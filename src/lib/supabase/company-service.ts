import { createClient } from "./client";
import type {
  Company,
  CompanyTreeNode,
  BusinessUnit,
  Region,
  Site,
  AssetGroup,
  TreeNodeType,
  AnyTreeNode,
  BusinessUnitTreeNode,
  RegionTreeNode,
  SiteTreeNode,
  AssetGroupTreeNode,
  WorkGroupTreeNode,
  RoleTreeNode,
} from "@/types/company";
import { checkDemoAction } from "./utils";

export class CompanyService {
  private supabase = createClient();

  // Utility function to find an item in the tree by ID and type
  // Helper method to build role hierarchy from flat role list
  private buildRoleHierarchy(flatRoles: any[]): RoleTreeNode[] {
    const transformedRoles: RoleTreeNode[] = flatRoles.map((role: any) => ({
      type: "role",
      id: role.id.toString(),
      work_group_id: role.work_group_id.toString(),
      company_id: role.company_id,
      shared_role_id: role.shared_role_id,
      level: role.level,
      reports_to_role_id: role.reports_to_role_id,
      sort_order: role.sort_order,
      created_at: role.created_at,
      created_by: role.created_by,
      updated_at: role.updated_at,
      deleted_at: role.deleted_at,
      is_deleted: role.is_deleted,
      code: role.code,
      description: role.shared_roles?.description || null,
      name: role.shared_roles?.name || "",
      shared_roles: {
        name: role.shared_roles?.name || "",
        description: role.shared_roles?.description || null,
      },
      reporting_roles: [],
      companyId: role.company_id, // Used for ContactCRUD
    }));

    // Build hierarchy: roles without reports_to_role_id are top-level
    const topLevelRoles: RoleTreeNode[] = [];
    const roleMap = new Map<string, RoleTreeNode>();

    // First, create a map of all roles by ID
    transformedRoles.forEach((role) => {
      roleMap.set(role.id, role);
    });

    // Then, build the hierarchy
    transformedRoles.forEach((role) => {
      if (role.reports_to_role_id) {
        // This role reports to another role
        const manager = roleMap.get(role.reports_to_role_id.toString());
        if (manager) {
          manager.reporting_roles.push(role);
        } else {
          // Manager not found in same work group, treat as top-level
          topLevelRoles.push(role);
        }
      } else {
        // Top-level role (no manager)
        topLevelRoles.push(role);
      }
    });

    return topLevelRoles;
  }

  // Helper method to search within role hierarchy recursively
  private searchInRoleHierarchy(
    roles: RoleTreeNode[],
    targetId: string,
    targetType: TreeNodeType
  ): RoleTreeNode | null {
    for (const role of roles) {
      if (role.id.toString() === targetId && targetType === "role") {
        return role;
      }
      // Search in reporting roles recursively
      if (role.reporting_roles && role.reporting_roles.length > 0) {
        const foundInReports = this.searchInRoleHierarchy(
          role.reporting_roles,
          targetId,
          targetType
        );
        if (foundInReports) return foundInReports;
      }
    }
    return null;
  }

  findItemInTree(
    tree: CompanyTreeNode | null,
    targetId: string,
    targetType: TreeNodeType
  ): AnyTreeNode | null {
    if (!tree) return null;

    const search = (node: any): AnyTreeNode | null => {
      if (node.id === targetId && node.type === targetType) {
        return node;
      }

      // Search in business units
      if (node.business_units) {
        for (const bu of node.business_units) {
          if (bu.id === targetId && bu.type === targetType) return bu;

          // Search in regions
          if (bu.regions) {
            for (const region of bu.regions) {
              if (region.id === targetId && region.type === targetType)
                return region;

              // Search in sites
              if (region.sites) {
                for (const site of region.sites) {
                  if (site.id === targetId && site.type === targetType)
                    return site;

                  // Search in asset groups
                  if (site.asset_groups) {
                    for (const ag of site.asset_groups) {
                      if (ag.id === targetId && ag.type === targetType)
                        return ag;

                      // Search in work groups
                      if (ag.work_groups) {
                        for (const wg of ag.work_groups) {
                          if (wg.id === targetId && wg.type === targetType)
                            return wg;

                          // Search in roles (including role hierarchy)
                          if (wg.roles) {
                            const foundRole = this.searchInRoleHierarchy(
                              wg.roles,
                              targetId,
                              targetType
                            );
                            if (foundRole) return foundRole;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      return null;
    };

    return search(tree);
  }

  // Company CRUD operations
  async getCompanies(): Promise<Company[]> {
    const { data: companies, error } = await this.supabase
      .from("companies")
      .select("*")
      .eq("is_deleted", false)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Error fetching companies:", error);
      throw error;
    }

    return companies || [];
  }

  async createCompany(formData: FormData): Promise<Company> {
    await checkDemoAction();

    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const description = formData.get("description") as string;

    if (!name || name.trim().length < 2) {
      throw new Error("Company name must be at least 2 characters");
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
        throw new Error("Company creation is not allowed in demo mode");
      }

      throw new Error("Failed to create company");
    }

    return company;
  }

  async updateCompany(companyId: string, formData: FormData): Promise<Company> {
    await checkDemoAction();

    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const description = formData.get("description") as string;

    if (!name || name.trim().length < 2) {
      throw new Error("Company name must be at least 2 characters");
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
      throw new Error("Failed to update company");
    }

    return updatedCompany;
  }

  async deleteCompany(companyId: string): Promise<void> {
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
      console.error("Error in deleteCompany:", error);
      throw new Error(error.message);
    }
  }

  // Company tree operations
  async getCompanyTree(companyId: string): Promise<CompanyTreeNode | null> {
    try {
      // Load full tree structure with a single query using joins
      const treeQuery = this.supabase
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
                asset_groups!asset_groups_site_id_fkey(
                  *,
                  work_groups!work_groups_asset_group_id_fkey(
                    *,
                    roles!roles_work_group_id_fkey(
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
          )
        `
        )
        .eq("id", companyId)
        .eq("is_deleted", false)
        .eq("business_units.is_deleted", false)
        .eq("business_units.regions.is_deleted", false)
        .eq("business_units.regions.sites.is_deleted", false)
        .eq("business_units.regions.sites.asset_groups.is_deleted", false)
        .eq(
          "business_units.regions.sites.asset_groups.work_groups.is_deleted",
          false
        )
        .eq(
          "business_units.regions.sites.asset_groups.work_groups.roles.is_deleted",
          false
        )
        .eq(
          "business_units.regions.sites.asset_groups.work_groups.roles.shared_roles.is_deleted",
          false
        );

      const { data: treeData, error } = await treeQuery.single();

      if (error) {
        console.error("Error fetching company tree:", error);
        throw error;
      }

      // Transform flat relational data into tree structure
      const tree: CompanyTreeNode = {
        type: "company",
        id: treeData.id,
        name: treeData.name,
        code: treeData.code,
        description: treeData.description,
        business_units: (treeData.business_units || []).map(
          (bu: BusinessUnitTreeNode) => ({
            type: "business_unit",
            id: bu.id,
            companyId: treeData.id,
            name: bu.name,
            code: bu.code,
            description: bu.description,
            regions: (bu.regions || []).map((region: RegionTreeNode) => ({
              type: "region",
              id: region.id,
              business_unitId: bu.id,
              name: region.name,
              description: region.description,
              code: region.code,
              companyId: treeData.id,
              sites: (region.sites || []).map((site: SiteTreeNode) => ({
                type: "site",
                id: site.id,
                regionId: region.id,
                name: site.name,
                code: site.code,
                lat: site.lat,
                lng: site.lng,
                description: site.description,
                companyId: treeData.id,
                asset_groups: (site.asset_groups || []).map(
                  (ag: AssetGroupTreeNode) => ({
                    type: "asset_group",
                    id: ag.id,
                    site_id: site.id,
                    name: ag.name,
                    description: ag.description,
                    code: ag.code,
                    companyId: treeData.id,
                    work_groups: (ag.work_groups || []).map(
                      (wg: WorkGroupTreeNode) => ({
                        type: "work_group",
                        id: wg.id,
                        asset_group_id: ag.id,
                        name: wg.name,
                        description: wg.description,
                        code: wg.code,
                        companyId: treeData.id,
                        roles: this.buildRoleHierarchy(wg.roles || []),
                      })
                    ),
                  })
                ),
              })),
            })),
          })
        ),
      };

      return tree;
    } catch (error) {
      console.error("Error loading company tree:", error);
      throw error;
    }
  }

  // Individual entity operations
  async getBusinessUnits(companyId: string): Promise<BusinessUnit[]> {
    const { data: businessUnits, error } = await this.supabase
      .from("business_units")
      .select("*")
      .eq("is_deleted", false)
      .eq("company_id", companyId)
      .order("name");

    if (error) {
      console.error("Error loading business units:", error);
      throw error;
    }

    return businessUnits || [];
  }

  async getRegions(companyId: string): Promise<Region[]> {
    const { data: regions, error } = await this.supabase
      .from("regions")
      .select("*")
      .eq("is_deleted", false)
      .eq("company_id", companyId)
      .order("name");

    if (error) {
      console.error("Error loading regions:", error);
      throw error;
    }

    return regions || [];
  }

  async getSites(companyId: string): Promise<Site[]> {
    const { data: sites, error } = await this.supabase
      .from("sites")
      .select("*")
      .eq("is_deleted", false)
      .eq("company_id", companyId)
      .order("name");

    if (error) {
      console.error("Error loading sites:", error);
      throw error;
    }

    return sites || [];
  }

  async getAssetGroups(companyId: string): Promise<AssetGroup[]> {
    const { data: assetGroups, error } = await this.supabase
      .from("asset_groups")
      .select("*")
      .eq("is_deleted", false)
      .eq("company_id", companyId)
      .order("name");

    if (error) {
      console.error("Error loading asset groups:", error);
      throw error;
    }

    return assetGroups || [];
  }

  // Generic tree node CRUD operations
  async createTreeNode(
    parentType: TreeNodeType,
    parentId: number | string,
    nodeType: TreeNodeType,
    formData: FormData,
    companyId: string
  ): Promise<void> {
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
      throw new Error(
        `${nodeType.replace("_", " ")} name must be at least 2 characters`
      );
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
      work_group: { table: "work_groups", parentField: "asset_group_id" },
      role: { table: "roles", parentField: "work_group_id" },
    };

    const config = tableMap[nodeType];
    if (!config || !config.table) {
      throw new Error("Invalid node type");
    }

    // Build insert data
    const insertData: any = {
      code: code?.trim() || null,
    };

    // Only add description for non-role entities (roles get description from shared_roles)
    if (nodeType !== "role") {
      insertData.description = description?.trim() || null;
    }

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
    if (nodeType === "role") {
      insertData.level = formData.get("level") || null;
      insertData.sort_order = 0;

      // Handle shared_role_id if provided
      if (shared_role_id) {
        insertData.shared_role_id = parseInt(shared_role_id as string);
        // Remove name if using shared role (shouldn't exist anyway)
        delete insertData.name;
      }
      // Handle reports_to_role_id if provided
      const reports_to_role_id = formData.get("reports_to_role_id");
      if (reports_to_role_id) {
        insertData.reports_to_role_id = parseInt(reports_to_role_id as string);
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
      throw new Error(`Failed to create ${nodeType.replace("_", " ")}`);
    }
  }

  async updateTreeNode(
    nodeType: TreeNodeType,
    nodeId: number | string,
    formData: FormData
  ): Promise<Company | null> {
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
      throw new Error(
        `${nodeType.replace("_", " ")} name must be at least 2 characters`
      );
    }

    const tableMap: Record<TreeNodeType, string> = {
      company: "companies",
      business_unit: "business_units",
      region: "regions",
      site: "sites",
      asset_group: "asset_groups",
      work_group: "work_groups",
      role: "roles",
    };

    const table = tableMap[nodeType];
    if (!table) {
      throw new Error("Invalid node type");
    }

    const updateData: any = {
      code: code?.trim() || null,
    };

    // Only add description for non-role entities (roles get description from shared_roles)
    if (nodeType !== "role") {
      updateData.description = description?.trim() || null;
    }

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
    } else if (nodeType === "role") {
      updateData.level = formData.get("level") || null;

      // Handle shared_role_id if provided
      if (shared_role_id) {
        updateData.shared_role_id = parseInt(shared_role_id as string);
        // Remove name if using shared role
        delete updateData.name;
      }
      // Handle reports_to_role_id if provided
      const reports_to_role_id = formData.get("reports_to_role_id");
      if (reports_to_role_id) {
        updateData.reports_to_role_id = parseInt(reports_to_role_id as string);
      } else {
        // If empty string or null, set to null (no manager)
        updateData.reports_to_role_id = null;
      }
    }

    // For company updates, we need the updated data back
    const query = this.supabase.from(table).update(updateData).eq("id", nodeId);

    // Get updated data back for company type, null for others
    if (nodeType === "company") {
      const { data: updatedData, error: updateError } = await query
        .select()
        .single();

      if (updateError) {
        console.error("Database update error:", updateError);
        throw new Error(`Failed to update ${nodeType.replace("_", " ")}`);
      }

      return updatedData;
    } else {
      const { error: updateError } = await query;

      if (updateError) {
        console.error("Database update error:", updateError);
        throw new Error(`Failed to update ${nodeType.replace("_", " ")}`);
      }

      return null;
    }
  }

  async deleteTreeNode(
    nodeType: TreeNodeType,
    nodeId: number | string
  ): Promise<void> {
    await checkDemoAction();

    // Map node types to table names
    const tableMap: Record<TreeNodeType, string> = {
      company: "companies",
      business_unit: "business_units",
      region: "regions",
      site: "sites",
      asset_group: "asset_groups",
      work_group: "work_groups",
      role: "roles",
    };

    const table = tableMap[nodeType];
    if (!table) {
      throw new Error("Invalid node type");
    }

    // Soft delete - db triggers will handle cascading
    const { error } = await this.supabase
      .from(table)
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", nodeId);

    if (error) {
      console.error("Database delete error:", error);
      throw new Error(error.message);
    }
  }
}

export const companyService = new CompanyService();
