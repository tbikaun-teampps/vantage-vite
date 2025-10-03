import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase.js";

export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type Contact = Database["public"]["Tables"]["contacts"]["Row"];

export type CompanyWithRole = Company & {
  role: Database["public"]["Tables"]["user_companies"]["Row"]["role"];
};

export interface CreateCompanyData {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateCompanyData {
  name?: string;
  code?: string;
  description?: string;
}

export interface CreateContactData {
  full_name: string;
  email: string;
  phone?: string;
  title?: string;
}

export interface UpdateContactData {
  full_name?: string;
  email?: string;
  phone?: string;
  title?: string;
}

export type EntityType =
  | "business-units"
  | "regions"
  | "sites"
  | "asset-groups"
  | "work-groups"
  | "roles";
export type ContactEntityType =
  | "company"
  | "business-unit"
  | "region"
  | "site"
  | "asset-group"
  | "work-group"
  | "role";

const query2tableMap: Record<EntityType, string> = {
  "business-units": "business_units",
  regions: "regions",
  sites: "sites",
  "asset-groups": "asset_groups",
  "work-groups": "work_groups",
  roles: "roles",
};

const junctionTableMap: Record<ContactEntityType, string> = {
  company: "company_contacts",
  "business-unit": "business_unit_contacts",
  region: "region_contacts",
  site: "site_contacts",
  "asset-group": "asset_group_contacts",
  "work-group": "work_group_contacts",
  role: "role_contacts",
};

const foreignKeyTableMap: Record<ContactEntityType, string> = {
  company: "company_id",
  "business-unit": "business_unit_id",
  region: "region_id",
  site: "site_id",
  "asset-group": "asset_group_id",
  "work-group": "work_group_id",
  role: "role_id",
};

export class CompaniesService {
  private supabase: SupabaseClient<Database>;
  private userId: string;

  constructor(supabaseClient: SupabaseClient<Database>, userId: string) {
    this.supabase = supabaseClient;
    this.userId = userId;
  }

  async getCompanies(): Promise<CompanyWithRole[]> {
    // Use !inner to ensure only companies with matching user associations are returned
    const { data, error } = await this.supabase
      .from("companies")
      .select("*, user_companies!inner(user_id, role)")
      .eq("is_deleted", false)
      .eq("user_companies.user_id", this.userId)
      .order("name", { ascending: true });

    if (error) throw error;
    const companies =
      data?.map((company) => {
        const { user_companies, ...companyData } = company;
        return {
          ...companyData,
          role: user_companies[0]?.role || null,
        };
      }) || [];

    return companies;
  }

  async getCompanyById(companyId: string): Promise<CompanyWithRole | null> {
    // Use !inner to ensure user has access to this company
    const { data, error } = await this.supabase
      .from("companies")
      .select("*, user_companies!inner(user_id, role)")
      .eq("id", companyId)
      .eq("is_deleted", false)
      .eq("user_companies.user_id", this.userId)
      .maybeSingle();

    if (error) throw error;

    if (!data) return null;

    // Remove user_companies from response
    const { user_companies, ...companyData } = data;
    return {
      ...companyData,
      role: user_companies[0]?.role || null,
    };
  }

  async createCompany(
    companyData: CreateCompanyData
  ): Promise<CompanyWithRole> {
    const { data, error } = await this.supabase
      .from("companies")
      .insert([{ ...companyData, created_by: this.userId }])
      .select()
      .single();

    if (error) throw error;

    // Add user_companies association
    const { error: userCompanyError } = await this.supabase
      .from("user_companies")
      .insert([
        {
          user_id: this.userId,
          company_id: data.id,
          role: "owner",
          created_by: this.userId,
        },
      ]);

    if (userCompanyError) {
      // Rollback company creation if association fails
      await this.supabase.from("companies").delete().eq("id", data.id);
      throw userCompanyError;
    }

    return { ...data, role: "owner" };
  }

  async updateCompany(
    companyId: string,
    companyData: UpdateCompanyData
  ): Promise<Company | null> {
    const { data, error } = await this.supabase
      .from("companies")
      .update(companyData)
      .eq("id", companyId)
      .eq("is_deleted", false)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCompany(companyId: string): Promise<boolean> {
    // Check if the user is an owner of the company
    const { data: userCompanyData, error: userCompanyError } =
      await this.supabase
        .from("user_companies")
        .select("*")
        .eq("company_id", companyId)
        .eq("user_id", this.userId)
        .eq("role", "owner")
        .maybeSingle();

    if (userCompanyError) throw userCompanyError;

    if (!userCompanyData) {
      console.log("User is not an owner of the company");
      throw new Error("Only owners can delete the company");
    }

    const { error } = await this.supabase
      .from("companies")
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq("id", companyId);

    if (error) throw error;
    return true;
  }

  async getCompanyEntities(
    companyId: string,
    type: EntityType
  ): Promise<any[]> {
    const tableName = query2tableMap[type];
    if (!tableName) {
      throw new Error("Invalid entity type");
    }

    const { data, error } = await (this.supabase as any)
      .from(tableName)
      .select("*")
      .eq("is_deleted", false)
      .eq("company_id", companyId);

    if (error) throw error;
    return data || [];
  }

  async createCompanyEntity(
    companyId: string,
    type: EntityType,
    entityData: any
  ): Promise<any> {
    const tableName = query2tableMap[type];
    if (!tableName) {
      throw new Error("Invalid entity type");
    }

    const { data, error } = await (this.supabase as any)
      .from(tableName)
      .insert([
        { ...entityData, company_id: companyId, created_by: this.userId },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCompanyEntity(
    companyId: string,
    entityId: string,
    type: EntityType,
    entityData: any
  ): Promise<any> {
    const tableName = query2tableMap[type];
    if (!tableName) {
      throw new Error("Invalid entity type");
    }

    const { data, error } = await (this.supabase as any)
      .from(tableName)
      .update(entityData)
      .eq("id", parseInt(entityId))
      .eq("company_id", companyId)
      .eq("is_deleted", false)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCompanyEntity(
    companyId: string,
    entityId: string,
    type: EntityType
  ): Promise<boolean> {
    const tableName = query2tableMap[type];
    if (!tableName) {
      throw new Error("Invalid entity type");
    }

    const { error } = await (this.supabase as any)
      .from(tableName)
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq("id", parseInt(entityId))
      .eq("company_id", companyId);

    if (error) throw error;
    return true;
  }

  async getCompanyTree(companyId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from("companies")
      .select(
        `
        id,name,code,description,
        business_units!business_units_company_id_fkey(
          id,name,code,description,
          regions!regions_business_unit_id_fkey(
            id,name,code,description,
            sites!sites_region_id_fkey(
              id,name,code,description,lat,lng,
              asset_groups!asset_groups_site_id_fkey(
                id,name,code,description,
                work_groups!work_groups_asset_group_id_fkey(
                  id,name,code,description,
                  roles!roles_work_group_id_fkey(
                    id,code,level,reports_to_role_id,
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
      )
      .single();

    if (error) throw error;

    if (!data) return null;

    this.transformRoleHierarchy(data);
    this.addTreeNodeTypes(data);
    return data;
  }

  async getCompanyContacts(companyId: string): Promise<Contact[]> {
    const { data, error } = await this.supabase
      .from("contacts")
      .select("*")
      .eq("company_id", companyId)
      .eq("is_deleted", false)
      .order("full_name", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getEntityContacts(
    companyId: string,
    entityType: ContactEntityType,
    entityId: string
  ): Promise<Contact[]> {
    const tableName = junctionTableMap[entityType];
    const foreignKeyField = foreignKeyTableMap[entityType];

    if (!tableName || !foreignKeyField) {
      throw new Error("Invalid entity type");
    }

    const { data, error } = await (this.supabase as any)
      .from(tableName)
      .select(
        `
        contact_id,
        contacts(
          id,
          full_name,
          email,
          phone,
          title,
          is_deleted
        )
      `
      )
      .eq(
        foreignKeyField,
        entityType === "company" ? entityId : parseInt(entityId)
      )
      .eq("contacts.company_id", companyId)
      .eq("contacts.is_deleted", false);

    if (error) throw error;

    return data?.map((item: any) => item.contacts) || [];
  }

  async createEntityContact(
    companyId: string,
    entityType: ContactEntityType,
    entityId: string,
    contactData: CreateContactData
  ): Promise<Contact> {
    const tableName = junctionTableMap[entityType];
    const foreignKeyField = foreignKeyTableMap[entityType];

    if (!tableName || !foreignKeyField) {
      throw new Error("Invalid entity type");
    }

    const { data: insertedContact, error: contactError } = await this.supabase
      .from("contacts")
      .insert({
        ...contactData,
        company_id: companyId,
        created_by: this.userId,
      })
      .select("*")
      .single();

    if (contactError) throw contactError;

    const linkData = {
      contact_id: insertedContact.id,
      [foreignKeyField]:
        entityType === "company" ? entityId : parseInt(entityId),
      created_by: this.userId,
      company_id: companyId,
    };

    const { error: linkError } = await (this.supabase as any)
      .from(tableName)
      .insert(linkData);

    if (linkError) {
      await this.supabase
        .from("contacts")
        .delete()
        .eq("id", insertedContact.id);
      throw linkError;
    }

    return insertedContact;
  }

  async updateContact(
    companyId: string,
    contactId: string,
    contactData: UpdateContactData
  ): Promise<Contact | null> {
    if (Object.keys(contactData).length === 0) {
      throw new Error("No update data provided");
    }

    const { data, error } = await this.supabase
      .from("contacts")
      .update(contactData)
      .eq("id", parseInt(contactId))
      .eq("company_id", companyId)
      .eq("is_deleted", false)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  }

  async deleteEntityContact(
    companyId: string,
    entityType: ContactEntityType,
    entityId: string,
    contactId: string
  ): Promise<{ success: boolean; message: string }> {
    const tableName = junctionTableMap[entityType];
    const foreignKeyField = foreignKeyTableMap[entityType];

    if (!tableName || !foreignKeyField) {
      throw new Error("Invalid entity type");
    }

    const { error: unlinkError } = await (this.supabase as any)
      .from(tableName)
      .delete()
      .eq("contact_id", parseInt(contactId))
      .eq(
        foreignKeyField,
        entityType === "company" ? entityId : parseInt(entityId)
      );

    if (unlinkError) throw unlinkError;

    const junctionTables = Object.values(junctionTableMap);
    let hasOtherLinks = false;

    for (const jTable of junctionTables) {
      const { data, error } = await (this.supabase as any)
        .from(jTable)
        .select("contact_id")
        .eq("contact_id", parseInt(contactId))
        .limit(1);

      if (error) continue;

      if (data && data.length > 0) {
        hasOtherLinks = true;
        break;
      }
    }

    if (!hasOtherLinks) {
      const { error: deleteError } = await this.supabase
        .from("contacts")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", parseInt(contactId))
        .eq("company_id", companyId);

      if (deleteError) throw deleteError;

      return {
        success: true,
        message: "Contact unlinked and deleted (no other links found)",
      };
    }

    return {
      success: true,
      message: "Contact unlinked from entity",
    };
  }

  private transformRoleHierarchy(data: any): void {
    const transformWorkGroup = (workGroup: any) => {
      if (!workGroup.roles || workGroup.roles.length === 0) {
        return workGroup;
      }

      const roles = workGroup.roles;
      const roleMap = new Map();
      const topLevelRoles: any[] = [];

      roles.forEach((role: any) => {
        role.reporting_roles = [];
        role.work_group_id = workGroup.id;
        if (role.shared_roles) {
          role.name = role.shared_roles.name;
          role.description = role.shared_roles.description;
          role.shared_role_id = role.shared_roles.id;
          delete role.shared_roles;
        }
        roleMap.set(role.id.toString(), role);
      });

      roles.forEach((role: any) => {
        if (role.reports_to_role_id) {
          const manager = roleMap.get(role.reports_to_role_id.toString());
          if (manager) {
            manager.reporting_roles.push(role);
          } else {
            topLevelRoles.push(role);
          }
        } else {
          topLevelRoles.push(role);
        }
      });

      return {
        ...workGroup,
        roles: topLevelRoles,
      };
    };

    if (data.business_units) {
      data.business_units.forEach((bu: any) => {
        if (bu.regions) {
          bu.regions.forEach((region: any) => {
            if (region.sites) {
              region.sites.forEach((site: any) => {
                if (site.asset_groups) {
                  site.asset_groups.forEach((ag: any) => {
                    if (ag.work_groups) {
                      ag.work_groups = ag.work_groups.map(transformWorkGroup);
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  }

  private addTreeNodeTypes(data: any): void {
    // Add type to root company node
    data.type = "company";

    // Process business units
    if (data.business_units && Array.isArray(data.business_units)) {
      data.business_units.forEach((bu: any) => {
        bu.type = "business_unit";

        // Process regions
        if (bu.regions && Array.isArray(bu.regions)) {
          bu.regions.forEach((region: any) => {
            region.type = "region";

            // Process sites
            if (region.sites && Array.isArray(region.sites)) {
              region.sites.forEach((site: any) => {
                site.type = "site";

                // Process asset groups
                if (site.asset_groups && Array.isArray(site.asset_groups)) {
                  site.asset_groups.forEach((ag: any) => {
                    ag.type = "asset_group";

                    // Process work groups
                    if (ag.work_groups && Array.isArray(ag.work_groups)) {
                      ag.work_groups.forEach((wg: any) => {
                        wg.type = "work_group";

                        // Process roles (including nested reporting_roles)
                        if (wg.roles && Array.isArray(wg.roles)) {
                          this.addRoleTypes(wg.roles);
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  }

  private addRoleTypes(roles: any[]): void {
    roles.forEach((role: any) => {
      role.type = "role";
      // Recursively add type to reporting roles
      if (role.reporting_roles && Array.isArray(role.reporting_roles)) {
        this.addRoleTypes(role.reporting_roles);
      }
    });
  }

  async exportCompanyStructure(companyId: string): Promise<any> {
    // Get the full company tree
    const tree = await this.getCompanyTree(companyId);

    if (!tree) {
      throw new Error("Company not found");
    }

    // Transform tree to simple export format
    return this.transformToSimpleFormat(tree, "company");
  }

  private transformToSimpleFormat(item: any, type: string): any {
    const result: any = {
      id: item.id,
      name: item.name || "",
      type: type,
      children: [],
    };

    // Add children based on type
    if (type === "company" && item.business_units) {
      result.children = item.business_units.map((bu: any) =>
        this.transformToSimpleFormat(bu, "business_unit")
      );
    } else if (type === "business_unit" && item.regions) {
      result.children = item.regions.map((region: any) => {
        const regionNode = this.transformToSimpleFormat(region, "region");
        if (region.sites) {
          regionNode.children = region.sites.map((site: any) => {
            const siteNode = this.transformToSimpleFormat(site, "site");
            // Add asset groups directly to site
            if (site.asset_groups) {
              siteNode.children = site.asset_groups.map((ag: any) => {
                const agNode = this.transformToSimpleFormat(ag, "asset_group");
                // Add work groups to asset groups
                if (ag.work_groups) {
                  agNode.children = ag.work_groups.map((wg: any) => {
                    const wgNode = this.transformToSimpleFormat(wg, "work_group");
                    // Add roles to work groups
                    if (wg.roles) {
                      wgNode.children = wg.roles.map((role: any) =>
                        this.transformToSimpleFormat(role, "role")
                      );
                    }
                    return wgNode;
                  });
                }
                return agNode;
              });
            }
            return siteNode;
          });
        }
        return regionNode;
      });
    } else if (type === "region" && item.sites) {
      result.children = item.sites.map((site: any) =>
        this.transformToSimpleFormat(site, "site")
      );
    } else if (type === "site" && item.asset_groups) {
      result.children = item.asset_groups.map((ag: any) => {
        const agNode = this.transformToSimpleFormat(ag, "asset_group");
        if (ag.work_groups) {
          agNode.children = ag.work_groups.map((wg: any) => {
            const wgNode = this.transformToSimpleFormat(wg, "work_group");
            if (wg.roles) {
              wgNode.children = wg.roles.map((role: any) =>
                this.transformToSimpleFormat(role, "role")
              );
            }
            return wgNode;
          });
        }
        return agNode;
      });
    } else if (type === "asset_group" && item.work_groups) {
      result.children = item.work_groups.map((wg: any) => {
        const wgNode = this.transformToSimpleFormat(wg, "work_group");
        if (wg.roles) {
          wgNode.children = wg.roles.map((role: any) =>
            this.transformToSimpleFormat(role, "role")
          );
        }
        return wgNode;
      });
    } else if (type === "work_group" && item.roles) {
      result.children = item.roles.map((role: any) =>
        this.transformToSimpleFormat(role, "role")
      );
    } else if (type === "role" && item.reporting_roles) {
      result.children = item.reporting_roles.map((role: any) =>
        this.transformToSimpleFormat(role, "role")
      );
    }

    return result;
  }

  async importCompanyStructure(
    companyId: string,
    importData: {
      business_units: Array<{
        name: string;
        code: string;
        description: string | null;
      }>;
      regions: Array<{
        business_unit_key: string;
        name: string;
        code: string;
        description: string | null;
      }>;
      sites: Array<{
        region_key: string;
        name: string;
        code: string;
        description: string | null;
        lat: number | null;
        lng: number | null;
      }>;
      asset_groups: Array<{
        site_key: string;
        name: string;
        code: string;
        description: string | null;
      }>;
      work_groups: Array<{
        asset_group_key: string;
        name: string;
        code: string;
        description: string | null;
      }>;
      roles: Array<{
        work_group_key: string;
        shared_role_id: number | undefined;
        level: string | null;
      }>;
      contacts: Array<{
        entity_type: string;
        entity_key: string;
        full_name: string;
        email: string;
      }>;
    }
  ): Promise<void> {
    // Maps to track created entity IDs for parent-child relationships
    const businessUnitMap = new Map<string, number>();
    const regionMap = new Map<string, number>();
    const siteMap = new Map<string, number>();
    const assetGroupMap = new Map<string, number>();
    const workGroupMap = new Map<string, number>();
    const roleMap = new Map<string, number>();

    // Arrays to track created IDs for rollback
    const createdBusinessUnitIds: number[] = [];
    const createdRegionIds: number[] = [];
    const createdSiteIds: number[] = [];
    const createdAssetGroupIds: number[] = [];
    const createdWorkGroupIds: number[] = [];
    const createdRoleIds: number[] = [];
    const createdContactIds: number[] = [];
    const createdJunctionTableEntries: Array<{
      table: string;
      contactId: number;
      entityId: number;
    }> = [];

    // Cleanup function for rollback
    const cleanup = async () => {
      console.log("Rolling back import due to error...");

      // Delete in reverse order to respect foreign key constraints
      // 1. Delete junction table entries (role_contacts, work_group_contacts, etc.)
      for (const entry of createdJunctionTableEntries) {
        try {
          await (this.supabase as any)
            .from(entry.table)
            .delete()
            .eq("contact_id", entry.contactId);
        } catch (err) {
          console.error(`Failed to delete junction entry:`, err);
        }
      }

      // 2. Delete contacts
      if (createdContactIds.length > 0) {
        try {
          await this.supabase
            .from("contacts")
            .delete()
            .in("id", createdContactIds);
        } catch (err) {
          console.error("Failed to delete contacts:", err);
        }
      }

      // 3. Delete roles
      if (createdRoleIds.length > 0) {
        try {
          await this.supabase
            .from("roles")
            .delete()
            .in("id", createdRoleIds);
        } catch (err) {
          console.error("Failed to delete roles:", err);
        }
      }

      // 4. Delete work groups
      if (createdWorkGroupIds.length > 0) {
        try {
          await this.supabase
            .from("work_groups")
            .delete()
            .in("id", createdWorkGroupIds);
        } catch (err) {
          console.error("Failed to delete work groups:", err);
        }
      }

      // 5. Delete asset groups
      if (createdAssetGroupIds.length > 0) {
        try {
          await this.supabase
            .from("asset_groups")
            .delete()
            .in("id", createdAssetGroupIds);
        } catch (err) {
          console.error("Failed to delete asset groups:", err);
        }
      }

      // 6. Delete sites
      if (createdSiteIds.length > 0) {
        try {
          await this.supabase
            .from("sites")
            .delete()
            .in("id", createdSiteIds);
        } catch (err) {
          console.error("Failed to delete sites:", err);
        }
      }

      // 7. Delete regions
      if (createdRegionIds.length > 0) {
        try {
          await this.supabase
            .from("regions")
            .delete()
            .in("id", createdRegionIds);
        } catch (err) {
          console.error("Failed to delete regions:", err);
        }
      }

      // 8. Delete business units
      if (createdBusinessUnitIds.length > 0) {
        try {
          await this.supabase
            .from("business_units")
            .delete()
            .in("id", createdBusinessUnitIds);
        } catch (err) {
          console.error("Failed to delete business units:", err);
        }
      }

      console.log("Rollback completed");
    };

    try {
      // 1. Create Business Units
      if (importData.business_units.length > 0) {
        const { data: createdBUs, error: buError } = await this.supabase
          .from("business_units")
          .insert(
            importData.business_units.map((bu) => ({
              company_id: companyId,
              name: bu.name,
              code: bu.code,
              description: bu.description,
              created_by: this.userId,
            }))
          )
          .select("id, name");

        if (buError) throw buError;

        createdBUs?.forEach((bu) => {
          businessUnitMap.set(bu.name, bu.id);
          createdBusinessUnitIds.push(bu.id);
        });
      }

      // 2. Create Regions
      if (importData.regions.length > 0) {
        const { data: createdRegions, error: regionError } = await this.supabase
          .from("regions")
          .insert(
            importData.regions.map((region) => ({
              company_id: companyId,
              business_unit_id: businessUnitMap.get(region.business_unit_key),
              name: region.name,
              code: region.code,
              description: region.description,
              created_by: this.userId,
            }))
          )
          .select("id, business_unit_id, name");

        if (regionError) throw regionError;

        createdRegions?.forEach((region) => {
          const buName = Array.from(businessUnitMap.entries()).find(
            ([_, id]) => id === region.business_unit_id
          )?.[0];
          const key = `${buName}|${region.name}`;
          regionMap.set(key, region.id);
          createdRegionIds.push(region.id);
        });
      }

      // 3. Create Sites
      if (importData.sites.length > 0) {
        const { data: createdSites, error: siteError } = await this.supabase
          .from("sites")
          .insert(
            importData.sites.map((site) => ({
              company_id: companyId,
              region_id: regionMap.get(site.region_key),
              name: site.name,
              code: site.code,
              description: site.description,
              lat: site.lat,
              lng: site.lng,
              created_by: this.userId,
            }))
          )
          .select("id, region_id, name");

        if (siteError) throw siteError;

        createdSites?.forEach((site) => {
          const regionName = Array.from(regionMap.entries()).find(
            ([_, id]) => id === site.region_id
          )?.[0];
          const key = `${regionName}|${site.name}`;
          siteMap.set(key, site.id);
          createdSiteIds.push(site.id);
        });
      }

      // 4. Create Asset Groups
      if (importData.asset_groups.length > 0) {
        const { data: createdAGs, error: agError } = await this.supabase
          .from("asset_groups")
          .insert(
            importData.asset_groups.map((ag) => ({
              company_id: companyId,
              site_id: siteMap.get(ag.site_key),
              name: ag.name,
              code: ag.code,
              description: ag.description,
              created_by: this.userId,
            }))
          )
          .select("id, site_id, name");

        if (agError) throw agError;

        createdAGs?.forEach((ag) => {
          const siteName = Array.from(siteMap.entries()).find(
            ([_, id]) => id === ag.site_id
          )?.[0];
          const key = `${siteName}|${ag.name}`;
          assetGroupMap.set(key, ag.id);
          createdAssetGroupIds.push(ag.id);
        });
      }

      // 5. Create Work Groups
      if (importData.work_groups.length > 0) {
        const { data: createdWGs, error: wgError } = await this.supabase
          .from("work_groups")
          .insert(
            importData.work_groups.map((wg) => ({
              company_id: companyId,
              asset_group_id: assetGroupMap.get(wg.asset_group_key),
              name: wg.name,
              code: wg.code,
              description: wg.description,
              created_by: this.userId,
            }))
          )
          .select("id, asset_group_id, name");

        if (wgError) throw wgError;

        createdWGs?.forEach((wg) => {
          const agName = Array.from(assetGroupMap.entries()).find(
            ([_, id]) => id === wg.asset_group_id
          )?.[0];
          const key = `${agName}|${wg.name}`;
          workGroupMap.set(key, wg.id);
          createdWorkGroupIds.push(wg.id);
        });
      }

      // 6. Create Roles
      if (importData.roles.length > 0) {
        const { data: createdRoles, error: roleError } = await this.supabase
          .from("roles")
          .insert(
            importData.roles.map((role) => ({
              company_id: companyId,
              work_group_id: workGroupMap.get(role.work_group_key),
              shared_role_id: role.shared_role_id,
              level: role.level,
              created_by: this.userId,
            }))
          )
          .select("id, work_group_id, shared_role_id");

        if (roleError) throw roleError;

        createdRoles?.forEach((role, index) => {
          const originalRole = importData.roles[index];
          roleMap.set(originalRole.work_group_key, role.id);
          createdRoleIds.push(role.id);
        });
      }

      // 7. Create Contacts
      if (importData.contacts.length > 0) {
        // First, create all contacts
        const { data: createdContacts, error: contactError } =
          await this.supabase
            .from("contacts")
            .insert(
              importData.contacts.map((contact) => ({
                company_id: companyId,
                full_name: contact.full_name,
                email: contact.email,
                created_by: this.userId,
              }))
            )
            .select("id");

        if (contactError) throw contactError;

        // Track created contact IDs
        createdContacts?.forEach((contact) => {
          createdContactIds.push(contact.id);
        });

        // Then, link contacts to entities
        const contactLinks: any[] = [];

        importData.contacts.forEach((contact, index) => {
          const contactId = createdContacts?.[index]?.id;
          if (!contactId) return;

          let entityId: number | string | undefined;
          let tableName: string;
          let foreignKeyField: string;

          switch (contact.entity_type) {
            case "business_unit":
              entityId = businessUnitMap.get(contact.entity_key);
              tableName = "business_unit_contacts";
              foreignKeyField = "business_unit_id";
              break;
            case "region":
              entityId = regionMap.get(contact.entity_key);
              tableName = "region_contacts";
              foreignKeyField = "region_id";
              break;
            case "site":
              entityId = siteMap.get(contact.entity_key);
              tableName = "site_contacts";
              foreignKeyField = "site_id";
              break;
            case "asset_group":
              entityId = assetGroupMap.get(contact.entity_key);
              tableName = "asset_group_contacts";
              foreignKeyField = "asset_group_id";
              break;
            case "work_group":
              entityId = workGroupMap.get(contact.entity_key);
              tableName = "work_group_contacts";
              foreignKeyField = "work_group_id";
              break;
            case "role":
              entityId = roleMap.get(contact.entity_key);
              tableName = "role_contacts";
              foreignKeyField = "role_id";
              break;
            default:
              return;
          }

          if (entityId) {
            contactLinks.push({
              table: tableName,
              data: {
                contact_id: contactId,
                [foreignKeyField]: entityId,
                company_id: companyId,
                created_by: this.userId,
              },
            });
          }
        });

        // Insert contact links
        for (const link of contactLinks) {
          const { error: linkError } = await (this.supabase as any)
            .from(link.table)
            .insert(link.data);

          if (linkError) throw linkError;

          // Track junction table entry for rollback
          createdJunctionTableEntries.push({
            table: link.table,
            contactId: link.data.contact_id,
            entityId:
              link.data.business_unit_id ||
              link.data.region_id ||
              link.data.site_id ||
              link.data.asset_group_id ||
              link.data.work_group_id ||
              link.data.role_id,
          });
        }
      }
    } catch (error) {
      console.error("Error during company structure import:", error);
      await cleanup();
      throw new Error(
        `Import failed and rolled back: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
