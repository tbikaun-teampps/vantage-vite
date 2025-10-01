import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rolesService } from "@/lib/supabase/roles-service";
import type {
  QuestionnaireWithCounts,
  QuestionnaireWithStructure,
  CreateQuestionnaireData,
  UpdateQuestionnaireData,
} from "@/types/assessment";
import {
  checkQuestionnaireUsage,
  getQuestionnaireById,
  getQuestionnaires,
  createQuestionnaire,
  updateQuestionnaire,
  deleteQuestionnaire,
  duplicateQuestionnaire,
} from "@/lib/api/questionnaires";
import { settingsKeys } from "@/hooks/questionnaire/useSettings";

// Query key factory for cache management
export const questionnaireKeys = {
  all: ["questionnaires"] as const,
  lists: () => [...questionnaireKeys.all, "list"] as const,
  list: (filters?: string) =>
    [...questionnaireKeys.lists(), { filters }] as const,
  details: () => [...questionnaireKeys.all, "detail"] as const,
  detail: (id: number) => [...questionnaireKeys.details(), id] as const,
  roles: () => [...questionnaireKeys.all, "roles"] as const,
  sharedRoles: () => [...questionnaireKeys.all, "shared-roles"] as const,
  users: () => [...questionnaireKeys.all, "users"] as const,
  usage: (id: number) => [...questionnaireKeys.all, "usage", id] as const,
};

// Data fetching hooks
export function useQuestionnaires() {
  return useQuery({
    queryKey: questionnaireKeys.list(),
    queryFn: () => getQuestionnaires(),
    staleTime: 15 * 60 * 1000, // 15 minutes - slow-changing questionnaire data
  });
}

export function useQuestionnaireById(id: number) {
  return useQuery({
    queryKey: questionnaireKeys.detail(id),
    queryFn: () => getQuestionnaireById(id),
    staleTime: 15 * 60 * 1000,
    enabled: !!id,
  });
}

export function useQuestionnaireRoles() {
  return useQuery({
    queryKey: questionnaireKeys.roles(),
    queryFn: () =>
      rolesService.getRoles({
        includeSharedRole: true,
        includeCompany: true,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes - normal business data
  });
}

export function useSharedRoles() {
  return useQuery({
    queryKey: questionnaireKeys.sharedRoles(),
    queryFn: async () => {
      const { data, error } = await rolesService.getSharedRoles();
      if (error) throw new Error(error);
      if (!data) throw new Error("No shared roles data returned");
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useQuestionnaireUsage(id: number) {
  return useQuery({
    queryKey: questionnaireKeys.usage(id),
    queryFn: () => checkQuestionnaireUsage(id),
    staleTime: 30 * 1000, // 30 seconds - fast-changing usage data
    enabled: !!id,
  });
}

// Mutation hooks with cache updates
export function useQuestionnaireActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateQuestionnaireData) => createQuestionnaire(data),
    onSuccess: (newQuestionnaire) => {
      // Add to questionnaires list
      queryClient.setQueryData(
        questionnaireKeys.list(),
        (old: QuestionnaireWithCounts[] = []) => {
          const newWithCounts = {
            ...newQuestionnaire,
            section_count: 0,
            step_count: 0,
            question_count: 0,
          };
          return [newWithCounts, ...old];
        }
      );

      // Invalidate to get fresh data with counts
      queryClient.invalidateQueries({ queryKey: questionnaireKeys.list() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: number;
      updates: UpdateQuestionnaireData;
    }) => updateQuestionnaire(id, updates),
    onSuccess: (updatedQuestionnaire, { id }) => {
      // Update questionnaire list
      queryClient.setQueryData(
        questionnaireKeys.list(),
        (old: QuestionnaireWithCounts[] = []) =>
          old.map((q) => (q.id === id ? { ...q, ...updatedQuestionnaire } : q))
      );

      // Update questionnaire detail
      queryClient.setQueryData(
        questionnaireKeys.detail(id),
        (old: QuestionnaireWithStructure | null) =>
          old ? { ...old, ...updatedQuestionnaire } : null
      );

      // Update settings tab cache (used by the settings form)
      queryClient.setQueryData(settingsKeys.basic(id), (old: any) =>
        old ? { ...old, ...updatedQuestionnaire } : null
      );

      // Invalidate all related queries to ensure UI updates everywhere
      queryClient.invalidateQueries({ queryKey: questionnaireKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: settingsKeys.basic(id) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteQuestionnaire(id),
    onSuccess: (_, id) => {
      // Remove from questionnaires list
      queryClient.setQueryData(
        questionnaireKeys.list(),
        (old: QuestionnaireWithCounts[] = []) => old.filter((q) => q.id !== id)
      );

      // Remove questionnaire detail
      queryClient.removeQueries({ queryKey: questionnaireKeys.detail(id) });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: number) => duplicateQuestionnaire(id),
    onSuccess: () => {
      // Refresh questionnaires list to get the new duplicate
      queryClient.invalidateQueries({ queryKey: questionnaireKeys.list() });
    },
  });

  // TODO: Implement share functionality in the API
  // const shareMutation = useMutation({
  //   mutationFn: ({
  //     questionnaireId,
  //     targetUserId,
  //   }: {
  //     questionnaireId: number;
  //     targetUserId: string;
  //   }) =>
  //     shareQuestionnaireToUserId(questionnaireId, targetUserId),
  // });

  return {
    createQuestionnaire: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,

    updateQuestionnaire: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,

    deleteQuestionnaire: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,

    duplicateQuestionnaire: duplicateMutation.mutateAsync,
    isDuplicating: duplicateMutation.isPending,
    duplicateError: duplicateMutation.error,

    // TODO: Re-enable when share functionality is implemented in API
    // shareQuestionnaire: shareMutation.mutateAsync,
    // isSharing: shareMutation.isPending,
    // shareError: shareMutation.error,
  };
}
