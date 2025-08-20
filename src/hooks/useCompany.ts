import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { companyService } from "@/lib/supabase/company-service";
import { rolesService } from "@/lib/supabase/roles-service";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import type { Company, TreeNodeType } from "@/types/company";

// Query key factory for cache management
export const companyKeys = {
  all: ["companies"] as const,
  lists: () => [...companyKeys.all, "list"] as const,
  tree: (companyId: string) => [...companyKeys.all, "tree", companyId] as const,
  businessUnits: (companyId: string) =>
    [...companyKeys.all, "business-units", companyId] as const,
  regions: (companyId: string) =>
    [...companyKeys.all, "regions", companyId] as const,
  sites: (companyId: string) =>
    [...companyKeys.all, "sites", companyId] as const,
  assetGroups: (companyId: string) =>
    [...companyKeys.all, "asset-groups", companyId] as const,
  roles: () => [...companyKeys.all, "roles"] as const,
};

// Data fetching hooks
export function useCompanies() {
  return useQuery({
    queryKey: companyKeys.lists(),
    queryFn: () => companyService.getCompanies(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCurrentCompany() {
  const companyId = useCompanyFromUrl();

  const { data: companies, ...query } = useCompanies();

  const currentCompany = useMemo(() => {
    if (!companies || !companyId) return null;
    return companies.find((c) => c.id === companyId) || null;
  }, [companies, companyId]);

  return {
    data: currentCompany,
    ...query,
  };
}

export function useCompanyTree(companyId: string | null) {
  return useQuery({
    queryKey: companyId
      ? companyKeys.tree(companyId)
      : [...companyKeys.all, "tree", "null"],
    queryFn: () =>
      companyId ? companyService.getCompanyTree(companyId) : null,
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000, // 2 minutes - tree data changes more frequently
  });
}

export function useBusinessUnits(companyId: string | null) {
  return useQuery({
    queryKey: companyId
      ? companyKeys.businessUnits(companyId)
      : [...companyKeys.all, "business-units", "null"],
    queryFn: () =>
      companyId ? companyService.getBusinessUnits(companyId) : [],
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRegions(companyId: string | null) {
  return useQuery({
    queryKey: companyId
      ? companyKeys.regions(companyId)
      : [...companyKeys.all, "regions", "null"],
    queryFn: () => (companyId ? companyService.getRegions(companyId) : []),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSites(companyId: string | null) {
  return useQuery({
    queryKey: companyId
      ? companyKeys.sites(companyId)
      : [...companyKeys.all, "sites", "null"],
    queryFn: () => (companyId ? companyService.getSites(companyId) : []),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAssetGroups(companyId: string | null) {
  return useQuery({
    queryKey: companyId
      ? companyKeys.assetGroups(companyId)
      : [...companyKeys.all, "asset-groups", "null"],
    queryFn: () => (companyId ? companyService.getAssetGroups(companyId) : []),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRoles() {
  return useQuery({
    queryKey: companyKeys.roles(),
    queryFn: () =>
      rolesService.getRoles({
        includeSharedRole: true,
      }),
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
        [newCompany, ...old].sort(
          (a, b) =>
            new Date(b.created_at || "").getTime() -
            new Date(a.created_at || "").getTime()
        )
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      companyId,
      formData,
    }: {
      companyId: string;
      formData: FormData;
    }) => companyService.updateCompany(companyId, formData),
    onSuccess: (updatedCompany, { companyId }) => {
      // Update companies list
      queryClient.setQueryData(companyKeys.lists(), (old: Company[] = []) =>
        old.map((c) => (c.id === companyId ? updatedCompany : c))
      );

      // Invalidate tree cache for updated company
      queryClient.invalidateQueries({ queryKey: companyKeys.tree(companyId) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (companyId: string) => companyService.deleteCompany(companyId),
    onSuccess: (_, companyId) => {
      // Remove from companies list
      queryClient.setQueryData(companyKeys.lists(), (old: Company[] = []) =>
        old.filter((c) => c.id !== companyId)
      );

      // Remove all related cache entries
      queryClient.removeQueries({ queryKey: companyKeys.tree(companyId) });
      queryClient.removeQueries({
        queryKey: companyKeys.businessUnits(companyId),
      });
      queryClient.removeQueries({ queryKey: companyKeys.regions(companyId) });
      queryClient.removeQueries({ queryKey: companyKeys.sites(companyId) });
      queryClient.removeQueries({
        queryKey: companyKeys.assetGroups(companyId),
      });
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
      companyId,
    }: {
      parentType: TreeNodeType;
      parentId: number;
      nodeType: TreeNodeType;
      formData: FormData;
      companyId: string;
    }) =>
      companyService.createTreeNode(
        parentType,
        parentId,
        nodeType,
        formData,
        companyId
      ),
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
      companyId,
    }: {
      nodeType: TreeNodeType;
      nodeId: number | string;
      formData: FormData;
      companyId: string;
    }) => companyService.updateTreeNode(nodeType, nodeId, formData),
    onSuccess: (updatedData, { nodeType, nodeId, companyId }) => {
      // If it's a company update, update the companies list
      if (nodeType === "company" && updatedData) {
        queryClient.setQueryData(companyKeys.lists(), (old: Company[] = []) =>
          old.map((c) => (c.id === nodeId ? updatedData : c))
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
      companyId,
    }: {
      nodeType: TreeNodeType;
      nodeId: number | string;
      companyId: string;
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
