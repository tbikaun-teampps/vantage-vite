import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { questionnaireService } from "@/lib/supabase/questionnaire-service";
import { rolesService } from "@/lib/supabase/roles-service";
import type {
  Questionnaire,
  QuestionnaireWithCounts,
  QuestionnaireWithStructure,
  QuestionnaireSection,
  QuestionnaireStep,
  QuestionnaireQuestion,
  QuestionnaireRatingScale,
  SharedRole,
} from "@/types/questionnaire";

// Query key factory for cache management
export const questionnaireKeys = {
  all: ["questionnaires"] as const,
  lists: () => [...questionnaireKeys.all, "list"] as const,
  list: (filters?: string) =>
    [...questionnaireKeys.lists(), { filters }] as const,
  details: () => [...questionnaireKeys.all, "detail"] as const,
  detail: (id: string) => [...questionnaireKeys.details(), id] as const,
  roles: () => [...questionnaireKeys.all, "roles"] as const,
  sharedRoles: () => [...questionnaireKeys.all, "shared-roles"] as const,
  users: () => [...questionnaireKeys.all, "users"] as const,
  usage: (id: string) => [...questionnaireKeys.all, "usage", id] as const,
};

// Data fetching hooks
export function useQuestionnaires() {
  return useQuery({
    queryKey: questionnaireKeys.list(),
    queryFn: () => questionnaireService.getQuestionnaires(),
    staleTime: 15 * 60 * 1000, // 15 minutes - slow-changing questionnaire data
  });
}

export function useQuestionnaireById(id: string) {
  return useQuery({
    queryKey: questionnaireKeys.detail(id),
    queryFn: () => questionnaireService.getQuestionnaireById(id),
    staleTime: 15 * 60 * 1000,
    enabled: !!id,
  });
}

export function useQuestionnaireRoles() {
  return useQuery({
    queryKey: questionnaireKeys.roles(),
    queryFn: () => questionnaireService.getRoles(),
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

export function useQuestionnaireUsers() {
  return useQuery({
    queryKey: questionnaireKeys.users(),
    queryFn: async () => {
      const currentUserId = await questionnaireService.getCurrentUserId();
      return questionnaireService.getUsers(currentUserId);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useQuestionnaireUsage(id: string) {
  return useQuery({
    queryKey: questionnaireKeys.usage(id),
    queryFn: () => questionnaireService.checkQuestionnaireUsage(id),
    staleTime: 30 * 1000, // 30 seconds - fast-changing usage data
    enabled: !!id,
  });
}

// Mutation hooks with cache updates
export function useQuestionnaireActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (
      data: Omit<
        Questionnaire,
        "id" | "created_at" | "updated_at" | "created_by"
      >
    ) => questionnaireService.createQuestionnaire(data),
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
      id: string;
      updates: Partial<Questionnaire>;
    }) => questionnaireService.updateQuestionnaire(id, updates),
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
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => questionnaireService.deleteQuestionnaire(id),
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
    mutationFn: (id: string) => questionnaireService.duplicateQuestionnaire(id),
    onSuccess: () => {
      // Refresh questionnaires list to get the new duplicate
      queryClient.invalidateQueries({ queryKey: questionnaireKeys.list() });
    },
  });

  const shareMutation = useMutation({
    mutationFn: ({
      questionnaireId,
      targetUserId,
    }: {
      questionnaireId: string;
      targetUserId: string;
    }) =>
      questionnaireService.shareQuestionnaireToUserId(
        questionnaireId,
        targetUserId
      ),
  });

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

    shareQuestionnaire: shareMutation.mutateAsync,
    isSharing: shareMutation.isPending,
    shareError: shareMutation.error,
  };
}

// Section operations
export function useSectionActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({
      questionnaireId,
      title,
    }: {
      questionnaireId: string;
      title: string;
    }) => {
      // Auto-calculate order_index based on existing sections
      const questionnaire =
        queryClient.getQueryData<QuestionnaireWithStructure>(
          questionnaireKeys.detail(questionnaireId)
        );
      const order_index = questionnaire?.sections?.length || 0;

      return questionnaireService.createSection({
        questionnaire_id: questionnaireId,
        title,
        order_index,
        expanded: true,
      });
    },
    onSuccess: (newSection, { questionnaireId }) => {
      // Update questionnaire detail with new section
      queryClient.setQueriesData(
        { queryKey: questionnaireKeys.details() },
        (old: QuestionnaireWithStructure | null) => {
          if (!old || old.id !== questionnaireId) return old;
          return {
            ...old,
            sections: [...old.sections, { ...newSection, steps: [] }],
          };
        }
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<QuestionnaireSection>;
    }) => questionnaireService.updateSection(id, updates),
    onSuccess: (_, { id, updates }) => {
      // Update all questionnaire details that might contain this section
      queryClient.setQueriesData(
        { queryKey: questionnaireKeys.details() },
        (old: QuestionnaireWithStructure | null) => {
          if (!old) return null;
          return {
            ...old,
            sections: old.sections.map((s) =>
              s.id === id ? { ...s, ...updates } : s
            ),
          };
        }
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => questionnaireService.deleteSection(id),
    onSuccess: (_, id) => {
      // Remove section from all questionnaire details
      queryClient.setQueriesData(
        { queryKey: questionnaireKeys.details() },
        (old: QuestionnaireWithStructure | null) => {
          if (!old) return null;
          return {
            ...old,
            sections: old.sections.filter((s) => s.id !== id),
          };
        }
      );
    },
  });

  return {
    createSection: createMutation.mutateAsync,
    isCreatingSection: createMutation.isPending,
    createSectionError: createMutation.error,

    updateSection: updateMutation.mutateAsync,
    isUpdatingSection: updateMutation.isPending,
    updateSectionError: updateMutation.error,

    deleteSection: deleteMutation.mutateAsync,
    isDeletingSection: deleteMutation.isPending,
    deleteSectionError: deleteMutation.error,
  };
}

// Step operations
export function useStepActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({ sectionId, title }: { sectionId: string; title: string }) =>
      questionnaireService.createStep({
        questionnaire_section_id: sectionId,
        title,
        expanded: true,
      }),
    onSuccess: (newStep, { sectionId }) => {
      // Update questionnaire detail with new step
      queryClient.setQueriesData(
        { queryKey: questionnaireKeys.details() },
        (old: QuestionnaireWithStructure | null) => {
          if (!old) return null;
          return {
            ...old,
            sections: old.sections.map((section) =>
              section.id === sectionId
                ? {
                    ...section,
                    steps: [...section.steps, { ...newStep, questions: [] }],
                  }
                : section
            ),
          };
        }
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<QuestionnaireStep>;
    }) => questionnaireService.updateStep(id, updates),
    onSuccess: (_, { id, updates }) => {
      queryClient.setQueriesData(
        { queryKey: questionnaireKeys.details() },
        (old: QuestionnaireWithStructure | null) => {
          if (!old) return null;
          return {
            ...old,
            sections: old.sections.map((section) => ({
              ...section,
              steps: section.steps.map((step) =>
                step.id === id ? { ...step, ...updates } : step
              ),
            })),
          };
        }
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => questionnaireService.deleteStep(id),
    onSuccess: (_, id) => {
      queryClient.setQueriesData(
        { queryKey: questionnaireKeys.details() },
        (old: QuestionnaireWithStructure | null) => {
          if (!old) return null;
          return {
            ...old,
            sections: old.sections.map((section) => ({
              ...section,
              steps: section.steps.filter((step) => step.id !== id),
            })),
          };
        }
      );
    },
  });

  return {
    createStep: createMutation.mutateAsync,
    isCreatingStep: createMutation.isPending,
    createStepError: createMutation.error,

    updateStep: updateMutation.mutateAsync,
    isUpdatingStep: updateMutation.isPending,
    updateStepError: updateMutation.error,

    deleteStep: deleteMutation.mutateAsync,
    isDeletingStep: deleteMutation.isPending,
    deleteStepError: deleteMutation.error,
  };
}

// Question operations
export function useQuestionActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({
      stepId,
      title,
      question_text,
      context,
    }: {
      stepId: string;
      title: string;
      question_text: string;
      context?: string;
    }) =>
      questionnaireService.createQuestion({
        questionnaire_step_id: stepId,
        title,
        question_text,
        context,
      }),
    onSuccess: (newQuestion, { stepId }) => {
      queryClient.setQueriesData(
        { queryKey: questionnaireKeys.details() },
        (old: QuestionnaireWithStructure | null) => {
          if (!old) return null;
          return {
            ...old,
            sections: old.sections.map((section) => ({
              ...section,
              steps: section.steps.map((step) =>
                step.id === stepId
                  ? {
                      ...step,
                      questions: [
                        ...step.questions,
                        {
                          ...newQuestion,
                          question_rating_scales: [],
                          question_roles: [],
                        },
                      ],
                    }
                  : step
              ),
            })),
          };
        }
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<QuestionnaireQuestion>;
    }) => questionnaireService.updateQuestion(id, updates),
    onSuccess: (_, { id, updates }) => {
      queryClient.setQueriesData(
        { queryKey: questionnaireKeys.details() },
        (old: QuestionnaireWithStructure | null) => {
          if (!old) return null;
          return {
            ...old,
            sections: old.sections.map((section) => ({
              ...section,
              steps: section.steps.map((step) => ({
                ...step,
                questions: step.questions.map((question) =>
                  question.id === id ? { ...question, ...updates } : question
                ),
              })),
            })),
          };
        }
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => questionnaireService.deleteQuestion(id),
    onSuccess: (_, id) => {
      queryClient.setQueriesData(
        { queryKey: questionnaireKeys.details() },
        (old: QuestionnaireWithStructure | null) => {
          if (!old) return null;
          return {
            ...old,
            sections: old.sections.map((section) => ({
              ...section,
              steps: section.steps.map((step) => ({
                ...step,
                questions: step.questions.filter(
                  (question) => question.id !== id
                ),
              })),
            })),
          };
        }
      );
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => questionnaireService.duplicateQuestion(id),
    onSuccess: (newQuestion) => {
      queryClient.setQueriesData(
        { queryKey: questionnaireKeys.details() },
        (old: QuestionnaireWithStructure | null) => {
          if (!old) return null;
          return {
            ...old,
            sections: old.sections.map((section) => ({
              ...section,
              steps: section.steps.map((step) => {
                const hasOriginalQuestion = step.questions.some(
                  (q) => q.id === newQuestion.questionnaire_step_id
                );
                if (hasOriginalQuestion) {
                  return {
                    ...step,
                    questions: [...step.questions, newQuestion],
                  };
                }
                return step;
              }),
            })),
          };
        }
      );
    },
  });

  const updateRatingScalesMutation = useMutation({
    mutationFn: async ({
      questionId,
      ratingScaleAssociations,
    }: {
      questionId: string;
      ratingScaleAssociations: Array<{
        ratingScaleId: string;
        description: string;
      }>;
    }) => {
      const currentUserId = await questionnaireService.getCurrentUserId();
      return questionnaireService.updateQuestionRatingScales(
        questionId,
        ratingScaleAssociations,
        currentUserId
      );
    },
    onSuccess: (_, { questionId, ratingScaleAssociations }) => {
      queryClient.setQueriesData(
        { queryKey: questionnaireKeys.details() },
        (old: QuestionnaireWithStructure | null) => {
          if (!old) return null;

          const updatedAssociations = ratingScaleAssociations.map(
            (association) => {
              const ratingScale = old.rating_scales.find(
                (scale) => scale.id === association.ratingScaleId
              );
              return {
                id: `temp-${Date.now()}-${Math.random()}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                created_by: "",
                questionnaire_question_id: questionId,
                questionnaire_rating_scale_id: association.ratingScaleId,
                description: association.description,
                rating_scale: ratingScale!,
              };
            }
          );

          return {
            ...old,
            sections: old.sections.map((section) => ({
              ...section,
              steps: section.steps.map((step) => ({
                ...step,
                questions: step.questions.map((question) =>
                  question.id === questionId
                    ? {
                        ...question,
                        question_rating_scales: updatedAssociations,
                      }
                    : question
                ),
              })),
            })),
          };
        }
      );
    },
  });

  const updateRolesMutation = useMutation({
    mutationFn: ({
      questionnaire_question_id,
      shared_role_ids,
    }: {
      questionnaire_question_id: string;
      shared_role_ids: string[];
    }) =>
      questionnaireService.updateQuestionRoles(
        questionnaire_question_id,
        shared_role_ids
      ),
    onSuccess: (_, { questionnaire_question_id, shared_role_ids }) => {
      queryClient.setQueriesData(
        { queryKey: questionnaireKeys.details() },
        (old: QuestionnaireWithStructure | null) => {
          if (!old) return null;

          // Get shared roles data
          const sharedRoles =
            (queryClient.getQueryData(
              questionnaireKeys.sharedRoles()
            ) as SharedRole[]) || [];
          const selectedRoles = sharedRoles
            .filter((role) => shared_role_ids.includes(role.id))
            .map((role) => ({
              id: `temp-${Date.now()}-${Math.random()}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: "",
              questionnaire_question_id: questionnaire_question_id,
              shared_role_id: role.id,
              role: role,
            }));

          return {
            ...old,
            sections: old.sections.map((section) => ({
              ...section,
              steps: section.steps.map((step) => ({
                ...step,
                questions: step.questions.map((question) =>
                  question.id === questionnaire_question_id
                    ? { ...question, question_roles: selectedRoles }
                    : question
                ),
              })),
            })),
          };
        }
      );
    },
  });

  return {
    createQuestion: createMutation.mutateAsync,
    isCreatingQuestion: createMutation.isPending,
    createQuestionError: createMutation.error,

    updateQuestion: updateMutation.mutateAsync,
    isUpdatingQuestion: updateMutation.isPending,
    updateQuestionError: updateMutation.error,

    deleteQuestion: deleteMutation.mutateAsync,
    isDeletingQuestion: deleteMutation.isPending,
    deleteQuestionError: deleteMutation.error,

    duplicateQuestion: duplicateMutation.mutateAsync,
    isDuplicatingQuestion: duplicateMutation.isPending,
    duplicateQuestionError: duplicateMutation.error,

    updateQuestionRatingScales: updateRatingScalesMutation.mutateAsync,
    isUpdatingRatingScales: updateRatingScalesMutation.isPending,
    updateRatingScalesError: updateRatingScalesMutation.error,

    updateQuestionRoles: updateRolesMutation.mutateAsync,
    isUpdatingRoles: updateRolesMutation.isPending,
    updateRolesError: updateRolesMutation.error,
  };
}

// Rating scale operations
export function useRatingScaleActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({
      questionnaireId,
      ratingData,
    }: {
      questionnaireId: string;
      ratingData: Omit<
        QuestionnaireRatingScale,
        "id" | "created_at" | "updated_at" | "questionnaire_id" | "created_by"
      >;
    }) =>
      questionnaireService.createRatingScale({
        ...ratingData,
        questionnaire_id: questionnaireId,
      }),
    onSuccess: (newRatingScale, { questionnaireId }) => {
      queryClient.setQueriesData(
        { queryKey: questionnaireKeys.details() },
        (old: QuestionnaireWithStructure | null) => {
          if (!old || old.id !== questionnaireId) return old;
          return {
            ...old,
            rating_scales: [...old.rating_scales, newRatingScale],
          };
        }
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<QuestionnaireRatingScale>;
    }) => questionnaireService.updateRatingScale(id, updates),
    onSuccess: (_, { id, updates }) => {
      queryClient.setQueriesData(
        { queryKey: questionnaireKeys.details() },
        (old: QuestionnaireWithStructure | null) => {
          if (!old) return null;
          return {
            ...old,
            rating_scales: old.rating_scales.map((scale) =>
              scale.id === id ? { ...scale, ...updates } : scale
            ),
          };
        }
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => questionnaireService.deleteRatingScale(id),
    onSuccess: (_, id) => {
      queryClient.setQueriesData(
        { queryKey: questionnaireKeys.details() },
        (old: QuestionnaireWithStructure | null) => {
          if (!old) return null;
          return {
            ...old,
            rating_scales: old.rating_scales.filter((scale) => scale.id !== id),
          };
        }
      );
    },
  });

  return {
    createRatingScale: createMutation.mutateAsync,
    isCreatingRatingScale: createMutation.isPending,
    createRatingScaleError: createMutation.error,

    updateRatingScale: updateMutation.mutateAsync,
    isUpdatingRatingScale: updateMutation.isPending,
    updateRatingScaleError: updateMutation.error,

    deleteRatingScale: deleteMutation.mutateAsync,
    isDeletingRatingScale: deleteMutation.isPending,
    deleteRatingScaleError: deleteMutation.error,
  };
}
