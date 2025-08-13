import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companyService } from "@/lib/supabase/company-service";
import type { 
  Company, 
  CompanyTreeNode, 
  BusinessUnit, 
  Region, 
  Site, 
  AssetGroup, 
  Role, 
  TreeNodeType 
} from "@/types/company";

// Query key factory for cache management
export const companyKeys = {
  all: ['companies'] as const,
  lists: () => [...companyKeys.all, 'list'] as const,
  tree: (companyId: number) => [...companyKeys.all, 'tree', companyId] as const,
  businessUnits: (companyId: number) => [...companyKeys.all, 'business-units', companyId] as const,
  regions: (companyId: number) => [...companyKeys.all, 'regions', companyId] as const,
  sites: (companyId: number) => [...companyKeys.all, 'sites', companyId] as const,
  assetGroups: (companyId: number) => [...companyKeys.all, 'asset-groups', companyId] as const,
  roles: () => [...companyKeys.all, 'roles'] as const,
};

// Data fetching hooks
export function useCompanies() {
  return useQuery({
    queryKey: companyKeys.lists(),
    queryFn: () => companyService.getCompanies(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCompanyTree(selectedCompany: Company | null) {
  return useQuery({
    queryKey: selectedCompany ? companyKeys.tree(selectedCompany.id) : ['companies', 'tree', 'null'],
    queryFn: () => selectedCompany ? companyService.getCompanyTree(selectedCompany) : null,
    enabled: !!selectedCompany,
    staleTime: 2 * 60 * 1000, // 2 minutes - tree data changes more frequently
  });
}

export function useBusinessUnits(companyId: number | null) {
  return useQuery({
    queryKey: companyId ? companyKeys.businessUnits(companyId) : ['companies', 'business-units', 'null'],
    queryFn: () => companyId ? companyService.getBusinessUnits(companyId) : [],
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRegions(companyId: number | null) {
  return useQuery({
    queryKey: companyId ? companyKeys.regions(companyId) : ['companies', 'regions', 'null'],
    queryFn: () => companyId ? companyService.getRegions(companyId) : [],
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSites(companyId: number | null) {
  return useQuery({
    queryKey: companyId ? companyKeys.sites(companyId) : ['companies', 'sites', 'null'],
    queryFn: () => companyId ? companyService.getSites(companyId) : [],
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAssetGroups(companyId: number | null) {
  return useQuery({
    queryKey: companyId ? companyKeys.assetGroups(companyId) : ['companies', 'asset-groups', 'null'],
    queryFn: () => companyId ? companyService.getAssetGroups(companyId) : [],
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRoles() {
  return useQuery({
    queryKey: companyKeys.roles(),
    queryFn: () => companyService.getRoles(),
    staleTime: 15 * 60 * 1000, // 15 minutes - roles change infrequently
  });
}

// Mutation hooks with cache updates
export function useCompanyActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (formData: FormData) => companyService.createCompany(formData),
    onSuccess: (newCompany) => {
      // Optimistic cache update for companies list
      queryClient.setQueryData(companyKeys.lists(), (old: Company[] = []) => 
        [newCompany, ...old].sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ companyId, formData }: { companyId: number; formData: FormData }) => 
      companyService.updateCompany(companyId, formData),
    onSuccess: (updatedCompany, { companyId }) => {
      // Update companies list
      queryClient.setQueryData(companyKeys.lists(), (old: Company[] = []) =>
        old.map((c) => c.id === companyId ? updatedCompany : c)
      );
      
      // Invalidate tree cache for updated company
      queryClient.invalidateQueries({ queryKey: companyKeys.tree(companyId) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (companyId: number) => companyService.deleteCompany(companyId),
    onSuccess: (_, companyId) => {
      // Remove from companies list
      queryClient.setQueryData(companyKeys.lists(), (old: Company[] = []) =>
        old.filter((c) => c.id !== companyId)
      );
      
      // Remove all related cache entries
      queryClient.removeQueries({ queryKey: companyKeys.tree(companyId) });
      queryClient.removeQueries({ queryKey: companyKeys.businessUnits(companyId) });
      queryClient.removeQueries({ queryKey: companyKeys.regions(companyId) });
      queryClient.removeQueries({ queryKey: companyKeys.sites(companyId) });
      queryClient.removeQueries({ queryKey: companyKeys.assetGroups(companyId) });
    },
  });

  return {
    createCompany: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
    
    updateCompany: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
    
    deleteCompany: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  };
}

// Tree node mutation hooks
export function useTreeNodeActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({ 
      parentType, 
      parentId, 
      nodeType, 
      formData, 
      companyId 
    }: { 
      parentType: TreeNodeType; 
      parentId: number; 
      nodeType: TreeNodeType; 
      formData: FormData; 
      companyId: number; 
    }) => companyService.createTreeNode(parentType, parentId, nodeType, formData, companyId),
    onSuccess: (_, { companyId }) => {
      // Invalidate tree cache to reload with new node
      queryClient.invalidateQueries({ queryKey: companyKeys.tree(companyId) });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ 
      nodeType, 
      nodeId, 
      formData,
      companyId 
    }: { 
      nodeType: TreeNodeType; 
      nodeId: number; 
      formData: FormData; 
      companyId: number;
    }) => companyService.updateTreeNode(nodeType, nodeId, formData),
    onSuccess: (updatedData, { nodeType, nodeId, companyId }) => {
      // If it's a company update, update the companies list
      if (nodeType === "company" && updatedData) {
        queryClient.setQueryData(companyKeys.lists(), (old: Company[] = []) =>
          old.map((c) => c.id === nodeId ? updatedData : c)
        );
      }
      
      // Invalidate tree cache to reflect changes
      queryClient.invalidateQueries({ queryKey: companyKeys.tree(companyId) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ 
      nodeType, 
      nodeId, 
      companyId 
    }: { 
      nodeType: TreeNodeType; 
      nodeId: number; 
      companyId: number; 
    }) => companyService.deleteTreeNode(nodeType, nodeId),
    onSuccess: (_, { companyId }) => {
      // Invalidate tree cache to reflect deletion
      queryClient.invalidateQueries({ queryKey: companyKeys.tree(companyId) });
    },
  });

  return {
    createTreeNode: createMutation.mutateAsync,
    isCreatingNode: createMutation.isPending,
    createNodeError: createMutation.error,
    
    updateTreeNode: updateMutation.mutateAsync,
    isUpdatingNode: updateMutation.isPending,
    updateNodeError: updateMutation.error,
    
    deleteTreeNode: deleteMutation.mutateAsync,
    isDeletingNode: deleteMutation.isPending,
    deleteNodeError: deleteMutation.error,
  };
}