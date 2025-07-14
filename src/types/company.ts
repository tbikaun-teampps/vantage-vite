// types/company.ts
// Base interfaces for database entities
export interface Company {
  id: number;
  name: string;
  code?: string;
  description?: string;
  icon_url?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by: string | null;
  is_demo?: boolean;
}

export interface BusinessUnit {
  id: number;
  name: string;
  code?: string;
  description?: string;
  company_id: number;
  created_at: string;
  updated_at?: string;
  created_by: string;
}

export interface Region {
  id: number;
  name: string;
  code?: string;
  description?: string;
  business_unit_id: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface Site {
  id: number;
  name: string;
  code?: string;
  description?: string;
  region_id: number;
  lat?: number;
  lng?: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface AssetGroup {
  id: number;
  name: string;
  code?: string;
  description?: string;
  asset_type?: string;
  site_id: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface OrgChart {
  id: number;
  name?: string;
  description?: string;
  chart_type?: string;
  site_id: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface Role {
  id: number;
  name?: string; // Optional since roles now primarily use shared_role_id
  shared_role_id?: number; // Reference to shared_roles table
  level?: string;
  department?: string;
  description?: string;
  requirements?: string;
  reports_to_role_id?: string;
  sort_order: number;
  org_chart_id: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Tree structure interfaces
export interface CompanyTreeNode {
  id: string;
  name: string;
  type: "company";
  code?: string;
  description?: string;
  business_units: BusinessUnitTreeNode[];
}

export interface BusinessUnitTreeNode {
  id: string;
  name: string;
  type: "business_unit";
  regions: RegionTreeNode[];
}

export interface RegionTreeNode {
  id: string;
  name: string;
  type: "region";
  sites: SiteTreeNode[];
}

export interface SiteTreeNode {
  id: string;
  name: string;
  type: "site";
  lat?: number;
  lng?: number;
  asset_groups_container: {
    asset_groups: AssetGroupTreeNode[];
  };
  org_charts_container: {
    org_charts: OrgChartTreeNode[];
  };
}

export interface AssetGroupTreeNode {
  id: string;
  name: string;
  type: "asset_group";
}

export interface OrgChartTreeNode {
  id: string;
  name: string;
  type: "org_chart";
  roles: RoleTreeNode[];
}

export interface RoleTreeNode {
  id: string;
  name: string; // This will be the shared role name or fallback to direct name
  type: "role";
  level?: string;
  shared_role_id?: number;
  shared_role_name?: string; // Name from shared_roles table
}

// Node type for generic operations
export type TreeNodeType =
  | "company"
  | "business_unit"
  | "region"
  | "site"
  | "asset_group"
  | "org_chart"
  | "role"
  | "asset_groups_container"
  | "org_charts_container";

// Union type for all tree node interfaces
export type AnyTreeNode =
  | CompanyTreeNode
  | BusinessUnitTreeNode
  | RegionTreeNode
  | SiteTreeNode
  | AssetGroupTreeNode
  | OrgChartTreeNode
  | RoleTreeNode
  | {
      id: string;
      name?: string;
      type: "asset_groups_container";
      asset_groups: AssetGroupTreeNode[];
    }
  | {
      id: string;
      name?: string;
      type: "org_charts_container";
      org_charts: OrgChartTreeNode[];
    };