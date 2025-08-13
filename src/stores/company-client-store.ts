import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Company, TreeNodeType, AnyTreeNode, CompanyTreeNode } from "@/types/company";
import { companyService } from "@/lib/supabase/company-service";

interface CompanyClientState {
  // Company selection state
  selectedCompany: Company | null;
  hasUserClearedSelection: boolean;
  
  // Tree item selection state
  selectedItemId: string | null;
  selectedItemType: TreeNodeType | null;

  // Actions
  setSelectedCompany: (company: Company | null) => void;
  selectCompanyById: (companies: Company[], id: number) => void;
  setSelectedItem: (id: string | null, type: TreeNodeType | null) => void;
  clearSelection: () => void;
  
  // Complex company switching logic with session cleanup
  handleCompanySwitch: (company: Company | null) => void;
  
  // Helper for managing companies list updates with selection preservation
  updateCompaniesWithSelection: (companies: Company[]) => void;
  
  // Store management
  reset: () => void;
}

export const useCompanyClientStore = create<CompanyClientState>()(
  persist(
    (set, get) => ({
      selectedCompany: null,
      hasUserClearedSelection: false,
      selectedItemId: null,
      selectedItemType: null,

      setSelectedCompany: (company) => {
        set({
          selectedCompany: company,
          hasUserClearedSelection: company === null,
          // Clear tree selection when switching companies
          selectedItemId: null,
          selectedItemType: null,
        });
      },

      selectCompanyById: (companies, id) => {
        const company = companies.find((c) => c.id === id);
        if (company) {
          get().setSelectedCompany(company);
        }
      },

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

      handleCompanySwitch: (company) => {
        const previousCompanyId = get().selectedCompany?.id;

        set({
          selectedCompany: company,
          hasUserClearedSelection: company === null,
          // Clear selection when switching companies
          selectedItemId: null,
          selectedItemType: null,
        });

        // Complex session storage cleanup when switching companies
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
      },

      // Helper for managing companies list updates with selection preservation
      updateCompaniesWithSelection: (companies: Company[]) => {
        const current = get().selectedCompany;
        const hasUserCleared = get().hasUserClearedSelection;
        const stillExists = current && companies.find((c) => c.id === current.id);
        
        set({
          selectedCompany: stillExists
            ? current
            : hasUserCleared
            ? null
            : companies[0] || null, // Only auto-select if user hasn't intentionally cleared
        });
      },

      reset: () => {
        set({
          selectedCompany: null,
          hasUserClearedSelection: false,
          selectedItemId: null,
          selectedItemType: null,
        });
      },
    }),
    {
      name: "company-client-store",
      partialize: (state) => ({
        selectedCompany: state.selectedCompany,
        hasUserClearedSelection: state.hasUserClearedSelection,
        // Don't persist selection - it should reset between sessions
      }),
    }
  )
);

// Selector hooks for convenient component usage
export const useSelectedCompany = () =>
  useCompanyClientStore((state) => state.selectedCompany);

// This hook is deprecated - use useSelectedTreeItem instead
export const useSelectedItem = (): null => {
  // This hook needs the tree data to find the item
  // Components using this will need to provide the tree context
  // Use useSelectedTreeItem(tree) instead
  return null;
};

export const useSelectedItemId = () =>
  useCompanyClientStore((state) => state.selectedItemId);

export const useSelectedItemType = () =>
  useCompanyClientStore((state) => state.selectedItemType);

// Custom hook that combines tree data with selection to find selected item
export const useSelectedTreeItem = (tree: CompanyTreeNode | null): AnyTreeNode | null => {
  const selectedId = useCompanyClientStore((state) => state.selectedItemId);
  const selectedType = useCompanyClientStore((state) => state.selectedItemType);

  if (!selectedId || !selectedType || !tree) return null;

  return companyService.findItemInTree(tree, selectedId, selectedType);
};

// Action hooks for convenient component usage
export const useCompanyClientActions = () => {
  const store = useCompanyClientStore();
  return {
    setSelectedCompany: store.setSelectedCompany,
    selectCompanyById: store.selectCompanyById,
    setSelectedItem: store.setSelectedItem,
    clearSelection: store.clearSelection,
    handleCompanySwitch: store.handleCompanySwitch,
    updateCompaniesWithSelection: store.updateCompaniesWithSelection,
  };
};