// stores/company-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { companyService } from "@/lib/supabase/company-service";
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

  // Store management
  reset: () => void;
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
            if (
              key &&
              (key.includes("interview_") ||
                key.includes("assessment_") ||
                key.includes("questionnaire_"))
            ) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach((key) => sessionStorage.removeItem(key));

          // Navigate away from detail pages
          const currentPath = window.location.pathname;
          const isDetailPage =
            currentPath.includes("/interviews/") ||
            currentPath.includes("/assessments/onsite/") ||
            currentPath.includes("/questionnaires/");

          if (isDetailPage) {
            window.location.href = "/dashboard";
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
          const roles = await companyService.getRoles();
          set({ roles });
        } catch (error) {
          console.error("Error loading roles:", error);
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
          const businessUnits = await companyService.getBusinessUnits(company.id);
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
          const regions = await companyService.getRegions(company.id);
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
          const sites = await companyService.getSites(company.id);
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
          const assetGroups = await companyService.getAssetGroups(company.id);
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
          const companies = await companyService.getCompanies();
          get().setCompanies(companies);

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
        try {
          const result = await companyService.createCompany(formData);
          
          if (result.success && result.data) {
            get().addCompany(result.data);
          }
          
          return result;
        } catch (error) {
          console.error("Unexpected error in createCompany:", error);
          return { success: false, error: "An unexpected error occurred" };
        }
      },

      updateCompany: async (companyId: number, formData: FormData) => {
        try {
          const result = await companyService.updateCompany(companyId, formData);
          
          if (result.success && result.data) {
            // Update in store
            set((state) => {
              const updatedCompanies = state.companies.map((c) =>
                c.id === companyId ? { ...c, ...result.data } : c
              );
              return {
                companies: updatedCompanies,
                selectedCompany:
                  state.selectedCompany?.id === companyId
                    ? { ...state.selectedCompany, ...result.data }
                    : state.selectedCompany,
              };
            });

            // Update tree name if this is the selected company
            const currentTree = get().companyTree;
            if (currentTree && currentTree.id === companyId.toString()) {
              set({
                companyTree: {
                  ...currentTree,
                  name: result.data.name,
                  code: result.data.code,
                  description: result.data.description,
                },
              });
            }
          }
          
          return result;
        } catch (error) {
          console.error("Unexpected error in updateCompany:", error);
          return { success: false, error: "An unexpected error occurred" };
        }
      },

      deleteCompany: async (companyId: number) => {
        try {
          const result = await companyService.deleteCompany(companyId);
          
          if (result.success) {
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
          }
          
          return result;
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
          const tree = await companyService.getCompanyTree(selectedCompany);
          get().setCompanyTree(tree);
        } catch (error) {
          console.error("Error loading company tree:", error);
        } finally {
          set({ isLoadingTree: false });
        }
      },

      // Generic CRUD operations for tree nodes
      createTreeNode: async (parentType, parentId, nodeType, formData) => {
        try {
          // Get the currently selected company
          const company = get().selectedCompany;
          if (!company && nodeType !== "company") {
            return {
              success: false,
              error: "No company selected",
            };
          }

          const result = await companyService.createTreeNode(
            parentType,
            parentId,
            nodeType,
            formData,
            company?.id || 0
          );

          if (result.success) {
            // Reload the tree to reflect changes
            await get().loadCompanyTree();
          }

          return result;
        } catch (error) {
          console.error("Unexpected error in createTreeNode:", error);
          return { success: false, error: "An unexpected error occurred" };
        }
      },

      updateTreeNode: async (nodeType, nodeId, formData) => {
        try {
          const result = await companyService.updateTreeNode(nodeType, nodeId, formData);

          if (result.success) {
            // Special handling for company updates
            if (nodeType === "company" && result.data) {
              // Update the companies array
              set((state) => {
                const updatedCompanies = state.companies.map((c) =>
                  c.id === nodeId ? { ...c, ...result.data } : c
                );

                return {
                  companies: updatedCompanies,
                  // Update selectedCompany if it's the one we updated
                  selectedCompany:
                    state.selectedCompany?.id === nodeId
                      ? { ...state.selectedCompany, ...result.data }
                      : state.selectedCompany,
                };
              });

              // Update tree name as well
              const currentTree = get().companyTree;
              if (currentTree && currentTree.id === nodeId.toString()) {
                set({
                  companyTree: {
                    ...currentTree,
                    name: result.data.name,
                    code: result.data.code,
                    description: result.data.description,
                  },
                });
              }
            } else {
              // For non-company updates, just reload the tree
              await get().loadCompanyTree();
            }
          }

          return result;
        } catch (error) {
          console.error("Unexpected error in updateTreeNode:", error);
          return { success: false, error: "An unexpected error occurred" };
        }
      },
      deleteTreeNode: async (nodeType, nodeId) => {
        try {
          const result = await companyService.deleteTreeNode(nodeType, nodeId);

          if (result.success) {
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
          }

          return result;
        } catch (error) {
          console.error("Unexpected error in deleteTreeNode:", error);
          return { success: false, error: "An unexpected error occurred" };
        }
      },

      // Store management
      reset: () => {
        set({
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
          selectedItemId: null,
          selectedItemType: null,
        });
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
