/**
 * Company Hierarchy and Organizational Structure Types
 * All types related to company organization, hierarchy, and structure
 */

import type { DatabaseRow } from '../utils'

// Database types
export type DatabaseCompany = DatabaseRow<'companies'>
export type DatabaseBusinessUnit = DatabaseRow<'business_units'>
export type DatabaseRegion = DatabaseRow<'regions'>
export type DatabaseSite = DatabaseRow<'sites'>
export type DatabaseAssetGroup = DatabaseRow<'asset_groups'>
export type DatabaseRole = DatabaseRow<'roles'>

// Core entity types
export interface Company extends DatabaseCompany {
  // Relations
  business_units?: BusinessUnit[]
  created_by_user?: Pick<UserProfile, 'id' | 'full_name'>
}

export interface CompanyWithCounts extends Company {
  business_unit_count: number
  region_count: number
  site_count: number
  asset_group_count: number
  user_count: number
  assessment_count: number
}

export interface BusinessUnit extends DatabaseBusinessUnit {
  // Relations
  company?: Pick<Company, 'id' | 'name'>
  regions?: Region[]
  created_by_user?: Pick<UserProfile, 'id' | 'full_name'>
}

export interface BusinessUnitWithCounts extends BusinessUnit {
  region_count: number
  site_count: number
  asset_group_count: number
  assessment_count: number
}

export interface Region extends DatabaseRegion {
  // Relations
  business_unit?: Pick<BusinessUnit, 'id' | 'name'>
  sites?: Site[]
  created_by_user?: Pick<UserProfile, 'id' | 'full_name'>
}

export interface RegionWithCounts extends Region {
  site_count: number
  asset_group_count: number
  assessment_count: number
}

export interface Site extends DatabaseSite {
  // Relations
  region?: Pick<Region, 'id' | 'name'>
  asset_groups?: AssetGroup[]
  created_by_user?: Pick<UserProfile, 'id' | 'full_name'>
}

export interface SiteWithCounts extends Site {
  asset_group_count: number
  assessment_count: number
}

export interface AssetGroup extends DatabaseAssetGroup {
  // Relations
  site?: Pick<Site, 'id' | 'name'>
  created_by_user?: Pick<UserProfile, 'id' | 'full_name'>
}

export interface AssetGroupWithCounts extends AssetGroup {
  role_count: number
  assessment_count: number
}

export interface Role extends DatabaseRole {
  // Relations
  created_by_user?: Pick<UserProfile, 'id' | 'full_name'>
}

// Tree structure types for hierarchical display
export interface CompanyTreeNode {
  id: number
  name: string
  type: 'company'
  level: 0
  parent_id: null
  children: BusinessUnitTreeNode[]
  expanded?: boolean
  counts?: {
    business_units: number
    regions: number
    sites: number
    asset_groups: number
    assessments: number
  }
}

export interface BusinessUnitTreeNode {
  id: number
  name: string
  type: 'business_unit'
  level: 1
  parent_id: number
  company_id: number
  children: RegionTreeNode[]
  expanded?: boolean
  counts?: {
    regions: number
    sites: number
    asset_groups: number
    assessments: number
  }
}

export interface RegionTreeNode {
  id: number
  name: string
  type: 'region'
  level: 2
  parent_id: number
  business_unit_id: number
  children: SiteTreeNode[]
  expanded?: boolean
  counts?: {
    sites: number
    asset_groups: number
    assessments: number
  }
}

export interface SiteTreeNode {
  id: number
  name: string
  type: 'site'
  level: 3
  parent_id: number
  region_id: number
  children: AssetGroupTreeNode[]
  expanded?: boolean
  counts?: {
    asset_groups: number
    assessments: number
  }
}

export interface AssetGroupTreeNode {
  id: number
  name: string
  type: 'asset_group'
  level: 4
  parent_id: number
  site_id: number
  expanded?: boolean
  counts?: {
    roles: number
    assessments: number
  }
}


export interface RoleTreeNode {
  id: number
  type: 'role'
  level: 6
  shared_role_id: number | null
  shared_role?: { id: number; name: string }
  children: never[]
  expanded?: never
  counts?: never
}

// Union type for any tree node
export type TreeNode = 
  | CompanyTreeNode
  | BusinessUnitTreeNode
  | RegionTreeNode
  | SiteTreeNode
  | AssetGroupTreeNode
  | RoleTreeNode

// Tree node type discriminator
export type TreeNodeType = TreeNode['type']

// Generic tree operations
export interface TreeState {
  selectedNode: TreeNode | null
  expandedNodes: Set<string> // format: "type:id"
  searchTerm: string
  filterType: TreeNodeType | 'all'
}

// Form data types
export interface CreateCompanyData {
  name: string
  description?: string
  industry?: string
  size?: string
  headquarters_location?: string
}

export interface UpdateCompanyData {
  name?: string
  description?: string
  industry?: string
  size?: string
  headquarters_location?: string
}

export interface CreateBusinessUnitData {
  company_id: number
  name: string
  description?: string
}

export interface UpdateBusinessUnitData {
  name?: string
  description?: string
}

export interface CreateRegionData {
  business_unit_id: number
  name: string
  description?: string
}

export interface UpdateRegionData {
  name?: string
  description?: string
}

export interface CreateSiteData {
  region_id: number
  name: string
  description?: string
  address?: string
  coordinates?: {
    latitude: number
    longitude: number
  }
}

export interface UpdateSiteData {
  name?: string
  description?: string
  address?: string
  coordinates?: {
    latitude: number
    longitude: number
  }
}

export interface CreateAssetGroupData {
  site_id: number
  name: string
  description?: string
  asset_type?: string
}

export interface UpdateAssetGroupData {
  name?: string
  description?: string
  asset_type?: string
}

export interface CreateOrgChartData {
  asset_group_id: number
  name: string
  description?: string
}

export interface UpdateOrgChartData {
  name?: string
  description?: string
}

export interface CreateRoleData {
  shared_role_id: number
  description?: string
  level?: string
}

export interface UpdateRoleData {
  shared_role_id?: number
  description?: string
  level?: string
}

// Hierarchy navigation types
export interface BreadcrumbItem {
  id: number
  name: string
  type: TreeNodeType
  path: string
}

export interface HierarchyPath {
  company?: Pick<Company, 'id' | 'name'>
  business_unit?: Pick<BusinessUnit, 'id' | 'name'>
  region?: Pick<Region, 'id' | 'name'>
  site?: Pick<Site, 'id' | 'name'>
  asset_group?: Pick<AssetGroup, 'id' | 'name'>
}

// Search and filter types
export interface CompanyHierarchyFilters {
  search?: string
  type?: TreeNodeType[]
  has_assessments?: boolean
  created_by?: string
  date_range?: {
    start: string
    end: string
  }
}

// Bulk operations
export interface BulkMoveOperation {
  node_ids: number[]
  node_type: TreeNodeType
  target_parent_id: number
  target_parent_type: TreeNodeType
}

export interface BulkDeleteOperation {
  node_ids: number[]
  node_type: TreeNodeType
  cascade?: boolean
}

// Import placeholder for UserProfile
interface UserProfile {
  id: string
  full_name?: string
}