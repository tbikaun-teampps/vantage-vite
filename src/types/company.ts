import type { DatabaseRow } from "./utils";

export type Company = DatabaseRow<"companies">;
export type BusinessUnit = DatabaseRow<"business_units">;
export type Region = DatabaseRow<"regions">;
export type Site = DatabaseRow<"sites">;
export type AssetGroup = DatabaseRow<"asset_groups">;
export type OrgChart = DatabaseRow<"org_charts">;
export type Role = DatabaseRow<"roles">;

// Tree structure interfaces
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

// Tree nodes that can be created by the user:
export type CreateableTreeNodeType = Omit<
  TreeNodeType,
  "asset_groups_container" | "org_charts_container" | "company"
>;

export interface CompanyTreeNode
  extends Omit<
    Company,
    | "created_by"
    | "is_deleted"
    | "is_demo"
    | "updated_at"
    | "deleted_at"
    | "icon_url"
    | "created_at"
  > {
  type: "company";
  business_units: BusinessUnitTreeNode[];
}

export interface BusinessUnitTreeNode extends BusinessUnit {
  type: "business_unit";
  regions: RegionTreeNode[];
}

export interface RegionTreeNode extends Region {
  type: "region";
  sites: SiteTreeNode[];
}

export interface SiteTreeNode extends Site {
  type: "site";
  asset_groups_container: {
    asset_groups: AssetGroupTreeNode[];
  };
  org_charts_container: {
    org_charts: OrgChartTreeNode[];
  };
  asset_groups: AssetGroupTreeNode[];
  org_charts: OrgChartTreeNode[];
}

export interface AssetGroupTreeNode extends AssetGroup {
  type: "asset_group";
}

export interface OrgChartTreeNode extends OrgChart {
  type: "org_chart";
  roles: RoleTreeNode[];
}

export interface RoleTreeNode extends Role {
  type: "role";
  shared_roles: {
    name: string;
    description: string | null;
  };
  // shared_role_name?: string; // Name from shared_roles table
  // shared_role_description?: string // Description from shared_roles table
}

interface BaseTreeNode {
  id: string;
  name?: string;
  type: TreeNodeType;
}
export interface AssetGroupsContainerTreeNode extends BaseTreeNode {
  type: "asset_groups_container";
  asset_groups: AssetGroupTreeNode[];
}

export interface OrgChartsContainerTreeNode extends BaseTreeNode {
  type: "org_charts_container";
  org_charts: OrgChartTreeNode[];
}

// Union type for all tree node interfaces
export type AnyTreeNode =
  | CompanyTreeNode
  | BusinessUnitTreeNode
  | RegionTreeNode
  | SiteTreeNode
  | AssetGroupTreeNode
  | OrgChartTreeNode
  | RoleTreeNode
  | AssetGroupsContainerTreeNode
  | OrgChartsContainerTreeNode;
