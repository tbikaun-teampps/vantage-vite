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
        contacts (
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
      .eq("contacts.is_deleted", false)
      .order("full_name", { ascending: true });

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
      })
      .select("*")
      .single();

    if (contactError) throw contactError;

    const linkData = {
      contact_id: insertedContact.id,
      [foreignKeyField]:
        entityType === "company" ? entityId : parseInt(entityId),
      created_by: this.userId,
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
}
