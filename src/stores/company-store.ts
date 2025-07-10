// stores/company-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "./auth-store";
import type {
  AnyTreeNode,
  TreeNodeType,
  CompanyTreeNode,
  Company,
  Role,
  BusinessUnit,
  Region,
  Site,
  AssetGroup,
} from "@/types/company";

// Utility function to find an item in the tree by ID and type
const findItemInTree = (
  tree: CompanyTreeNode | null,
  targetId: string,
  targetType: TreeNodeType
): AnyTreeNode | null => {
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

                // Check asset_groups_container
                if (
                  targetType === "asset_groups_container" &&
                  site.asset_groups_container
                ) {
                  const containerNode = {
                    id: `${site.id}-asset-groups-container`,
                    type: "asset_groups_container" as const,
                    asset_groups: site.asset_groups_container.asset_groups,
                  };
                  if (containerNode.id === targetId) return containerNode;
                }

                // Check org_charts_container
                if (
                  targetType === "org_charts_container" &&
                  site.org_charts_container
                ) {
                  const containerNode = {
                    id: `${site.id}-org-charts-container`,
                    type: "org_charts_container" as const,
                    org_charts: site.org_charts_container.org_charts,
                  };
                  if (containerNode.id === targetId) return containerNode;
                }

                // Search in asset groups
                if (site.asset_groups_container?.asset_groups) {
                  for (const ag of site.asset_groups_container.asset_groups) {
                    if (ag.id === targetId && ag.type === targetType) return ag;
                  }
                }

                // Search in org charts
                if (site.org_charts_container?.org_charts) {
                  for (const oc of site.org_charts_container.org_charts) {
                    if (oc.id === targetId && oc.type === targetType) return oc;

                    // Search in roles
                    if (oc.roles) {
                      for (const role of oc.roles) {
                        if (role.id === targetId && role.type === targetType)
                          return role;
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
};

interface CompanyState {
  companies: Company[];
  selectedCompany: Company | null;
  hasUserClearedSelection: boolean;
  companyTree: CompanyTreeNode | null; // Full tree for selected company
  isLoading: boolean;
  isLoadingTree: boolean;
  roles: Role[];
  isLoadingRoles: boolean;
  businessUnits: BusinessUnit[];
  regions: Region[];
  sites: Site[];
  assetGroups: AssetGroup[];

  // Selection state
  selectedItemId: string | null;
  selectedItemType: TreeNodeType | null;

  // Company actions
  setCompanies: (companies: Company[]) => void;
  addCompany: (company: Company) => void;
  setSelectedCompany: (company: Company | null) => void;
  selectCompanyById: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setLoadingTree: (loading: boolean) => void;

  // Org chart actions
  loadRoles: () => Promise<void>;

  // Tree actions
  setCompanyTree: (tree: CompanyTreeNode | null) => void;

  // Selection actions - NEW
  setSelectedItem: (id: string | null, type: TreeNodeType | null) => void;
  clearSelection: () => void;

  // Supabase actions - Companies
  loadCompanies: () => Promise<void>;
  createCompany: (formData: FormData) => Promise<{
    success: boolean;
    error?: string;
    data?: Company;
    message?: string;
  }>;
  updateCompany: (
    companyId: number,
    formData: FormData
  ) => Promise<{
    success: boolean;
    error?: string;
    data?: Company;
    message?: string;
  }>;
  deleteCompany: (companyId: number) => Promise<{
    success: boolean;
    error?: string;
    message?: string;
  }>;
  loadBusinessUnits: () => Promise<void>;
  loadRegions: () => Promise<void>;
  loadSites: () => Promise<void>;
  loadAssetGroups: () => Promise<void>;

  // Tree loading
  loadCompanyTree: () => Promise<void>;

  // Generic CRUD for tree nodes
  createTreeNode: (
    parentType: TreeNodeType,
    parentId: number,
    nodeType: TreeNodeType,
    formData: FormData
  ) => Promise<{
    success: boolean;
    error?: string;
    message?: string;
  }>;

  updateTreeNode: (
    nodeType: TreeNodeType,
    nodeId: number,
    formData: FormData
  ) => Promise<{
    success: boolean;
    error?: string;
    message?: string;
  }>;

  deleteTreeNode: (
    nodeType: TreeNodeType,
    nodeId: number
  ) => Promise<{
    success: boolean;
    error?: string;
    message?: string;
  }>;
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set, get) => ({
      companies: [],
      selectedCompany: null,
      hasUserClearedSelection: false,
      companyTree: null,
      isLoading: false,
      isLoadingTree: false,
      roles: [],
      isLoadingRoles: false,
      businessUnits: [],
      regions: [],
      sites: [],
      assetGroups: [],

      // Selection state - NEW
      selectedItemId: null,
      selectedItemType: null,

      // Company actions
      setCompanies: (companies) => {
        const current = get().selectedCompany;
        const hasUserCleared = get().hasUserClearedSelection;
        const stillExists =
          current && companies.find((c) => c.id === current.id);
        set({
          companies,
          selectedCompany: stillExists
            ? current
            : hasUserCleared
            ? null
            : companies[0] || null, // Only auto-select if user hasn't intentionally cleared
        });
      },

      addCompany: (company) => {
        set((state) => ({
          companies: [...state.companies, company],
          selectedCompany: company,
          companyTree: null, // Clear tree when new company selected
          // Clear selection when switching companies
          selectedItemId: null,
          selectedItemType: null,
          hasUserClearedSelection: false,
        }));

        // Load tree for the newly created company
        get().loadCompanyTree();
      },

      setSelectedCompany: (company) => {
        const previousCompanyId = get().selectedCompany?.id;
        
        set({
          selectedCompany: company,
          companyTree: null, // Clear tree when switching companies
          // Clear selection when switching companies
          selectedItemId: null,
          selectedItemType: null,
          hasUserClearedSelection: company === null,
        });

        // Clear session storage when switching companies
        if (previousCompanyId && company && previousCompanyId !== company.id) {
          // Clear any cached interview/assessment data
          const keysToRemove = [];
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && (key.includes('interview_') || key.includes('assessment_') || key.includes('questionnaire_'))) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => sessionStorage.removeItem(key));
          
          // Navigate away from detail pages
          const currentPath = window.location.pathname;
          const isDetailPage = currentPath.includes('/interviews/') || 
                              currentPath.includes('/assessments/onsite/') ||
                              currentPath.includes('/questionnaires/');
          
          if (isDetailPage) {
            window.location.href = '/dashboard';
          }
        }

        // Load tree for the newly selected company
        if (company) {
          get().loadCompanyTree();
        }
      },

      selectCompanyById: (id) => {
        const company = get().companies.find((c) => c.id === id);
        if (company) {
          get().setSelectedCompany(company);
        }
      },

      setLoading: (isLoading) => set({ isLoading }),
      setLoadingTree: (isLoadingTree) => set({ isLoadingTree }),

      // Load roles
      loadRoles: async () => {
        try {
          const supabase = createClient();
          const { data: roles, error } = await supabase
            .from("roles")
            .select("*")
            .eq("is_active", true)
            .order("name");

          if (error) throw error;
          set({ roles });
        } catch (error) {
          console.error("Error loading companies:", error);
        } finally {
          set({ isLoading: false });
        }
      },
      loadBusinessUnits: async () => {
        try {
          const company = get().selectedCompany;
          if (!company) {
            console.error("No company selected to load business units");
            return;
          }
          const supabase = createClient();
          const { data: businessUnits, error } = await supabase
            .from("business_units")
            .select("*")
            .eq("company_id", company.id)
            .order("name");

          if (error) throw error;
          set({ businessUnits });
        } catch (error) {
          console.error("Error loading business units:", error);
        }
      },
      loadRegions: async () => {
        try {
          const company = get().selectedCompany;
          if (!company) {
            console.error("No company selected to load regions");
            return;
          }
          const supabase = createClient();
          const { data: regions, error } = await supabase
            .from("regions")
            .select("*")
            .eq("company_id", company.id)
            .order("name");

          if (error) throw error;
          set({ regions });
        } catch (error) {
          console.error("Error loading regions:", error);
        }
      },
      loadSites: async () => {
        try {
          const company = get().selectedCompany;
          if (!company) {
            console.error("No company selected to load sites");
            return;
          }
          const supabase = createClient();
          const { data: sites, error } = await supabase
            .from("sites")
            .select("*")
            .eq("company_id", company.id)
            .order("name");

          if (error) throw error;
          set({ sites });
        } catch (error) {
          console.error("Error loading sites:", error);
        }
      },
      loadAssetGroups: async () => {
        try {
          const company = get().selectedCompany;
          if (!company) {
            console.error("No company selected to load asset groups");
            return;
          }
          const supabase = createClient();
          const { data: assetGroups, error } = await supabase
            .from("asset_groups")
            .select("*")
            .eq("company_id", company.id)
            .order("name");

          if (error) throw error;
          set({ assetGroups });
        } catch (error) {
          console.error("Error loading asset groups:", error);
        }
      },

      // Tree actions
      setCompanyTree: (tree) => set({ companyTree: tree }),

      // Selection actions - NEW
      setSelectedItem: (id, type) => {
        set({
          selectedItemId: id,
          selectedItemType: type,
        });
      },

      clearSelection: () => {
        set({
          selectedItemId: null,
          selectedItemType: null,
        });
      },

      // Supabase actions - Companies
      loadCompanies: async () => {
        set({ isLoading: true });
        try {
          const supabase = createClient();

          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError || !user) {
            console.error("Authentication required");
            return;
          }

          // Get user's demo mode status
          const authState = useAuthStore.getState();
          const isDemoMode = authState.isDemoMode;

          // Load companies based on demo mode status
          let query = supabase
            .from("companies")
            .select("*")
            .eq("is_deleted", false);

          if (isDemoMode) {
            // Demo users see only demo companies
            query = query.eq("is_demo", true);
          } else {
            // Regular users see only their own companies (non-demo)
            query = query.eq("is_demo", false).eq("created_by", user.id);
          }

          const { data: companies, error } = await query.order("created_at", {
            ascending: false,
          });

          if (error) {
            console.error("Error fetching companies:", error);
            return;
          }

          get().setCompanies(companies || []);

          // If there's a selected company, load its tree
          const selectedCompany = get().selectedCompany;
          if (selectedCompany) {
            await get().loadCompanyTree();
          }
        } catch (error) {
          console.error("Error loading companies:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      createCompany: async (formData: FormData) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          return {
            success: false,
            error: "Company creation is disabled in demo mode.",
          };
        }

        try {
          const supabase = createClient();

          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError || !user) {
            return { success: false, error: "Authentication required" };
          }

          const name = formData.get("name") as string;
          const code = formData.get("code") as string;
          const description = formData.get("description") as string;

          if (!name || name.trim().length < 2) {
            return {
              success: false,
              error: "Company name must be at least 2 characters",
            };
          }

          const { data: company, error: insertError } = await supabase
            .from("companies")
            .insert({
              name: name.trim(),
              code: code?.trim() || null,
              description: description?.trim() || null,
              created_by: user.id,
            })
            .select()
            .single();

          if (insertError) {
            console.error("Database insert error:", insertError);
            return { success: false, error: "Failed to create company" };
          }

          get().addCompany(company);

          return {
            success: true,
            data: company,
            message: "Company created successfully",
          };
        } catch (error) {
          console.error("Unexpected error in createCompany:", error);
          return { success: false, error: "An unexpected error occurred" };
        }
      },

      updateCompany: async (companyId: number, formData: FormData) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          return {
            success: false,
            error: "Company editing is disabled in demo mode.",
          };
        }

        try {
          const supabase = createClient();
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError || !user) {
            return { success: false, error: "Authentication required" };
          }

          const name = formData.get("name") as string;
          const code = formData.get("code") as string;
          const description = formData.get("description") as string;

          if (!name || name.trim().length < 2) {
            return {
              success: false,
              error: "Company name must be at least 2 characters",
            };
          }

          const { data: existingCompany, error: fetchError } = await supabase
            .from("companies")
            .select("*")
            .eq("id", companyId)
            .eq("created_by", user.id)
            .eq("is_deleted", false)
            .single();

          if (fetchError || !existingCompany) {
            return {
              success: false,
              error: "Company not found or access denied",
            };
          }

          const { data: updatedCompany, error: updateError } = await supabase
            .from("companies")
            .update({
              name: name.trim(),
              code: code?.trim() || null,
              description: description?.trim() || null,
            })
            .eq("id", companyId)
            .eq("created_by", user.id)
            .select()
            .single();

          if (updateError) {
            console.error("Database update error:", updateError);
            return { success: false, error: "Failed to update company" };
          }

          // Update in store
          set((state) => {
            const updatedCompanies = state.companies.map((c) =>
              c.id === companyId ? { ...c, ...updatedCompany } : c
            );
            return {
              companies: updatedCompanies,
              selectedCompany:
                state.selectedCompany?.id === companyId
                  ? { ...state.selectedCompany, ...updatedCompany }
                  : state.selectedCompany,
            };
          });

          // Update tree name if this is the selected company
          const currentTree = get().companyTree;
          if (currentTree && currentTree.id === companyId.toString()) {
            set({
              companyTree: {
                ...currentTree,
                name: updatedCompany.name,
              },
            });
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
      },

      deleteCompany: async (companyId: number) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          return {
            success: false,
            error: "Company deletion is disabled in demo mode.",
          };
        }

        try {
          const supabase = createClient();

          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError || !user) {
            return { success: false, error: "Authentication required" };
          }

          const { data: company, error: fetchError } = await supabase
            .from("companies")
            .select("*")
            .eq("id", companyId)
            .eq("created_by", user.id)
            .eq("is_deleted", false)
            .single();

          if (fetchError || !company) {
            return {
              success: false,
              error: "Company not found or access denied",
            };
          }

          // Soft delete: update is_deleted, deleted_at, and deleted_by
          const { error: deleteError } = await supabase
            .from("companies")
            .update({
              is_deleted: true,
              deleted_at: new Date().toISOString(),
              deleted_by: user.id,
            })
            .eq("id", companyId)
            .eq("created_by", user.id);

          if (deleteError) {
            console.error("Error deleting company:", deleteError);
            return { success: false, error: "Failed to delete company" };
          }

          // Remove from store
          set((state) => {
            const remainingCompanies = state.companies.filter(
              (c) => c.id !== companyId
            );
            const wasSelectedCompany = state.selectedCompany?.id === companyId;

            return {
              companies: remainingCompanies,
              selectedCompany: wasSelectedCompany
                ? remainingCompanies[0] || null
                : state.selectedCompany,
              companyTree: wasSelectedCompany ? null : state.companyTree,
              // Clear selection if we deleted the selected company
              selectedItemId: wasSelectedCompany ? null : state.selectedItemId,
              selectedItemType: wasSelectedCompany
                ? null
                : state.selectedItemType,
            };
          });

          // If we selected a new company, load its tree
          const newSelectedCompany = get().selectedCompany;
          if (newSelectedCompany) {
            await get().loadCompanyTree();
          }

          return { success: true, message: "Company deleted successfully" };
        } catch (error) {
          console.error("Unexpected error in deleteCompany:", error);
          return { success: false, error: "An unexpected error occurred" };
        }
      },

      // Tree loading - Single query with joins to get full hierarchy OR demo data
      loadCompanyTree: async () => {
        const selectedCompany = get().selectedCompany;
        if (!selectedCompany) {
          set({ companyTree: null });
          return;
        }

        set({ isLoadingTree: true });
        try {
          const supabase = createClient();

          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError || !user) {
            console.error("Authentication required");
            return;
          }

          // Load full tree structure with a single query using joins
          let treeQuery = supabase
            .from("companies")
            .select(
              `
              *,
              business_units(
                *,
                regions(
                  *,
                  sites(
                    *,
                    asset_groups(*),
                    org_charts(
                      *,
                      roles(
                        *,
                        shared_roles(
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
            .eq("is_deleted", false);

          // Only filter by created_by for non-demo companies
          if (!selectedCompany.is_demo) {
            treeQuery = treeQuery.eq("created_by", user.id);
          }

          const { data: treeData, error } = await treeQuery.single();

          if (error) {
            console.error("Error fetching company tree:", error);
            return;
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
                        description: role.shared_roles?.description
                      })),
                    })),
                  },
                })),
              })),
            })),
          };

          get().setCompanyTree(tree);
        } catch (error) {
          console.error("Error loading company tree:", error);
        } finally {
          set({ isLoadingTree: false });
        }
      },

      // Generic CRUD operations for tree nodes
      createTreeNode: async (parentType, parentId, nodeType, formData) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          return {
            success: false,
            error: `Creating ${nodeType.replace(
              "_",
              " "
            )} is disabled in demo mode.`,
          };
        }

        try {
          const supabase = createClient();

          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError || !user) {
            return { success: false, error: "Authentication required" };
          }

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

          // Get the currently selected company
          const company = get().selectedCompany;
          if (!company && nodeType !== "company") {
            return {
              success: false,
              error: "No company selected",
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
            created_by: user.id,
          };

          // Only add name if it's not a role with shared_role_id
          if (!(nodeType === "role" && shared_role_id)) {
            insertData.name = name.trim();
          }

          if (config.parentField) {
            insertData[config.parentField] = parentId;
          }

          // Add company_id to all real entities except company itself
          if (nodeType !== "company" && company) {
            insertData.company_id = company.id;
          }

          // Special handling for specific node types
          if (nodeType === "org_chart") {
            insertData.chart_type = formData.get("chart_type") || "operational";
            insertData.is_active = true;
          } else if (nodeType === "role") {
            insertData.level = formData.get("level") || null;
            insertData.department = formData.get("department") || null;
            insertData.sort_order = 0;
            insertData.is_active = true;

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

          const { error: insertError } = await supabase
            .from(config.table)
            .insert(insertData);

          if (insertError) {
            console.error("Database insert error:", insertError);
            return {
              success: false,
              error: `Failed to create ${nodeType.replace("_", " ")}`,
            };
          }

          // Reload the tree to reflect changes
          await get().loadCompanyTree();

          return {
            success: true,
            message: `${nodeType.replace("_", " ")} created successfully`,
          };
        } catch (error) {
          console.error("Unexpected error in createTreeNode:", error);
          return { success: false, error: "An unexpected error occurred" };
        }
      },

      updateTreeNode: async (nodeType, nodeId, formData) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          return {
            success: false,
            error: `Editing ${nodeType.replace(
              "_",
              " "
            )} is disabled in demo mode.`,
          };
        }

        try {
          const supabase = createClient();

          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError || !user) {
            return { success: false, error: "Authentication required" };
          }

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
          const query = supabase
            .from(table)
            .update(updateData)
            .eq("id", nodeId)
            .eq("created_by", user.id);

          // Get updated data back for company type
          const { data: updatedData, error: updateError } =
            nodeType === "company"
              ? await query.select().single()
              : await query;

          if (updateError) {
            console.error("Database update error:", updateError);
            return {
              success: false,
              error: `Failed to update ${nodeType.replace("_", " ")}`,
            };
          }

          // Special handling for company updates
          if (nodeType === "company" && updatedData) {
            // Update the companies array
            set((state) => {
              const updatedCompanies = state.companies.map((c) =>
                c.id === nodeId ? { ...c, ...updatedData } : c
              );

              return {
                companies: updatedCompanies,
                // Update selectedCompany if it's the one we updated
                selectedCompany:
                  state.selectedCompany?.id === nodeId
                    ? { ...state.selectedCompany, ...updatedData }
                    : state.selectedCompany,
              };
            });

            // Update tree name as well
            const currentTree = get().companyTree;
            if (currentTree && currentTree.id === nodeId.toString()) {
              set({
                companyTree: {
                  ...currentTree,
                  name: updatedData.name,
                  code: updatedData.code,
                  description: updatedData.description,
                },
              });
            }
          } else {
            // For non-company updates, just reload the tree
            await get().loadCompanyTree();
          }

          return {
            success: true,
            message: `${nodeType
              .replace("_", " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())} Updated Successfully`,
          };
        } catch (error) {
          console.error("Unexpected error in updateTreeNode:", error);
          return { success: false, error: "An unexpected error occurred" };
        }
      },
      deleteTreeNode: async (nodeType, nodeId) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          return {
            success: false,
            error: `Deleting ${nodeType.replace(
              "_",
              " "
            )} is disabled in demo mode.`,
          };
        }

        try {
          const supabase = createClient();

          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError || !user) {
            return { success: false, error: "Authentication required" };
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

          let deleteError;

          if (nodeType === "company") {
            // Soft delete for companies
            const { error } = await supabase
              .from(table)
              .update({
                is_deleted: true,
                deleted_at: new Date().toISOString(),
                deleted_by: user.id,
              })
              .eq("id", nodeId)
              .eq("created_by", user.id);
            deleteError = error;
          } else {
            // Hard delete for other tree nodes
            const { error } = await supabase
              .from(table)
              .delete()
              .eq("id", nodeId)
              .eq("created_by", user.id);
            deleteError = error;
          }

          if (deleteError) {
            console.error("Database delete error:", deleteError);

            // Handle foreign key constraint errors
            if (deleteError.code === "23503") {
              if (deleteError.message?.includes("interview_response_roles")) {
                return {
                  success: false,
                  error:
                    "Cannot delete this role because it's used in interview responses. Please delete the related interviews first.",
                };
              }
              // Handle other foreign key constraints
              return {
                success: false,
                error: `Cannot delete this ${nodeType.replace(
                  "_",
                  " "
                )} because it's being used elsewhere. Please remove related items first.`,
              };
            }

            return {
              success: false,
              error: `Failed to delete ${nodeType.replace("_", " ")}`,
            };
          }

          // Clear selection if we're deleting the selected item
          const { selectedItemId, selectedItemType } = get();
          if (
            selectedItemId === nodeId.toString() &&
            selectedItemType === nodeType
          ) {
            get().clearSelection();
          }

          // Reload the tree to reflect changes
          await get().loadCompanyTree();

          return {
            success: true,
            message: `${nodeType.replace("_", " ")} deleted successfully`,
          };
        } catch (error) {
          console.error("Unexpected error in deleteTreeNode:", error);
          return { success: false, error: "An unexpected error occurred" };
        }
      },
    }),
    {
      name: "company-store",
      partialize: (state) => ({
        companies: state.companies,
        selectedCompany: state.selectedCompany,
        hasUserClearedSelection: state.hasUserClearedSelection,
        // Don't persist tree - it'll be loaded fresh when company is selected
        // Don't persist selection - it should reset between sessions
      }),
    }
  )
);

// Simple selectors for company selector component
export const useSelectedCompany = () =>
  useCompanyStore((state) => state.selectedCompany);
export const useCompanies = () => useCompanyStore((state) => state.companies);
export const useCompanyLoading = () =>
  useCompanyStore((state) => state.isLoading);

// Tree selectors
export const useCompanyTree = () =>
  useCompanyStore((state) => state.companyTree);
export const useTreeLoading = () =>
  useCompanyStore((state) => state.isLoadingTree);

// Selection selectors - NEW
export const useSelectedItem = (): AnyTreeNode | null => {
  const tree = useCompanyStore((state) => state.companyTree);
  const selectedId = useCompanyStore((state) => state.selectedItemId);
  const selectedType = useCompanyStore((state) => state.selectedItemType);

  if (!selectedId || !selectedType || !tree) return null;

  return findItemInTree(tree, selectedId, selectedType);
};

export const useSelectedItemId = () =>
  useCompanyStore((state) => state.selectedItemId);
export const useSelectedItemType = () =>
  useCompanyStore((state) => state.selectedItemType);

// Company store actions
export const useCompanyStoreActions = () => {
  const store = useCompanyStore();
  return {
    loadCompanies: store.loadCompanies,
    createCompany: store.createCompany,
    updateCompany: store.updateCompany,
    deleteCompany: store.deleteCompany,
    setSelectedCompany: store.setSelectedCompany,
    loadCompanyTree: store.loadCompanyTree,
    createTreeNode: store.createTreeNode,
    updateTreeNode: store.updateTreeNode,
    deleteTreeNode: store.deleteTreeNode,
    // Selection actions
    setSelectedItem: store.setSelectedItem,
    clearSelection: store.clearSelection,
  };
};
