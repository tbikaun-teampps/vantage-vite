import { createClient } from "./client";
import type { Database } from "@/types/database";

type ScopeLevel = Database["public"]["Enums"]["scope_levels"];

// Scope option types for different organizational levels
export interface ScopeOption {
  id: number;
  name: string;
  code?: string | null;
  description?: string | null;
}

export interface ProgramScope {
  id: number;
  program_id: number;
  company_id?: number | null;
  business_unit_id?: number | null;
  region_id?: number | null;
  site_id?: number | null;
  asset_group_id?: number | null;
  role_id?: number | null;
}

export class ProgramScopeService {
  private supabase = createClient();

  // Get scope options based on scope level and company
  async getScopeOptions(scopeLevel: ScopeLevel, companyId: number): Promise<ScopeOption[]> {
    switch (scopeLevel) {
      case "company":
        // For company level, return the company itself
        const { data: company, error: companyError } = await this.supabase
          .from("companies")
          .select("id, name, code, description")
          .eq("id", companyId)
          .eq("is_deleted", false)
          .single();
        
        if (companyError) throw companyError;
        return company ? [company] : [];

      case "business_unit":
        const { data: businessUnits, error: buError } = await this.supabase
          .from("business_units")
          .select("id, name, code, description")
          .eq("company_id", companyId)
          .eq("is_deleted", false)
          .order("name");
        
        if (buError) throw buError;
        return businessUnits || [];

      case "region":
        const { data: regions, error: regionError } = await this.supabase
          .from("regions")
          .select("id, name, code, description")
          .eq("company_id", companyId)
          .eq("is_deleted", false)
          .order("name");
        
        if (regionError) throw regionError;
        return regions || [];

      case "site":
        const { data: sites, error: siteError } = await this.supabase
          .from("sites")
          .select("id, name, code, description")
          .eq("company_id", companyId)
          .eq("is_deleted", false)
          .order("name");
        
        if (siteError) throw siteError;
        return sites || [];

      case "asset_group":
        const { data: assetGroups, error: agError } = await this.supabase
          .from("asset_groups")
          .select("id, name, code, description")
          .eq("company_id", companyId)
          .eq("is_deleted", false)
          .order("name");
        
        if (agError) throw agError;
        return assetGroups || [];

      case "role":
        const { data: roles, error: roleError } = await this.supabase
          .from("roles")
          .select(`
            id,
            code,
            description,
            shared_role:shared_roles!inner(name)
          `)
          .eq("company_id", companyId)
          .eq("is_deleted", false)
          .order("shared_roles.name", { referencedTable: "shared_roles" });
        
        if (roleError) throw roleError;
        return roles?.map(role => ({
          id: role.id,
          name: role.shared_role?.name || `Role ${role.id}`,
          code: role.code,
          description: role.description
        })) || [];

      default:
        return [];
    }
  }

  // Get current program scopes
  async getProgramScopes(programId: number): Promise<ProgramScope[]> {
    const { data: scopes, error } = await this.supabase
      .from("program_scopes")
      .select("*")
      .eq("program_id", programId);

    if (error) throw error;
    return scopes || [];
  }

  // Update program scopes - replaces all existing scopes
  async updateProgramScopes(
    programId: number,
    scopeLevel: ScopeLevel,
    selectedIds: number[]
  ): Promise<void> {

    // Start a transaction by deleting existing scopes first
    const { error: deleteError } = await this.supabase
      .from("program_scopes")
      .delete()
      .eq("program_id", programId);

    if (deleteError) throw deleteError;

    // Insert new scopes if any are selected
    if (selectedIds.length > 0) {
      const scopeInserts = selectedIds.map(id => {
        const baseScope = { program_id: programId };
        
        switch (scopeLevel) {
          case "company":
            return { ...baseScope, company_id: id };
          case "business_unit":
            return { ...baseScope, business_unit_id: id };
          case "region":
            return { ...baseScope, region_id: id };
          case "site":
            return { ...baseScope, site_id: id };
          case "asset_group":
            return { ...baseScope, asset_group_id: id };
          case "role":
            return { ...baseScope, role_id: id };
          default:
            return baseScope;
        }
      });

      const { error: insertError } = await this.supabase
        .from("program_scopes")
        .insert(scopeInserts);

      if (insertError) throw insertError;
    }
  }

  // Get selected scope IDs based on scope level
  getSelectedScopeIds(scopes: ProgramScope[], scopeLevel: ScopeLevel): number[] {
    return scopes.map(scope => {
      switch (scopeLevel) {
        case "company":
          return scope.company_id;
        case "business_unit":
          return scope.business_unit_id;
        case "region":
          return scope.region_id;
        case "site":
          return scope.site_id;
        case "asset_group":
          return scope.asset_group_id;
        case "role":
          return scope.role_id;
        default:
          return null;
      }
    }).filter((id): id is number => id !== null);
  }
}

export const programScopeService = new ProgramScopeService();