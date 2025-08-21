import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { interviewService } from "@/lib/supabase/interview-service";
import { rolesService } from "@/lib/supabase/roles-service";
import type {
  Interview,
  InterviewWithResponses,
  InterviewFilters,
  CreateInterviewData,
  UpdateInterviewData,
  CreateInterviewResponseData,
  UpdateInterviewResponseData,
  CreateInterviewResponseActionData,
  UpdateInterviewResponseActionData,
} from "@/types/assessment";

// Query key factory for cache management
export const interviewKeys = {
  all: ["interviews"] as const,
  lists: () => [...interviewKeys.all, "list"] as const,
  list: (filters?: InterviewFilters) =>
    [...interviewKeys.lists(), { filters }] as const,
  details: () => [...interviewKeys.all, "detail"] as const,
  detail: (id: number) => [...interviewKeys.details(), id] as const,
  roles: () => [...interviewKeys.all, "roles"] as const,
  rolesByAssessment: (assessmentId: number) =>
    [...interviewKeys.roles(), assessmentId] as const,
};

// Data fetching hooks
export function useInterviews(companyId: string, filters?: InterviewFilters) {
  return useQuery({
    queryKey: interviewKeys.list(filters),
    queryFn: () => interviewService.getInterviews(companyId, filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - moderate changes during interview management
    enabled: !!companyId,
  });
}

export function useInterviewsByAssessment(
  companyId: string,
  assessmentId: number
) {
  const filters: InterviewFilters = { assessment_id: assessmentId };
  return useQuery({
    queryKey: interviewKeys.list(filters),
    queryFn: () => interviewService.getInterviews(companyId, filters),
    staleTime: 2 * 60 * 1000,
    enabled: !!companyId && !!assessmentId,
  });
}

export function useInterviewById(id: number) {
  return useQuery({
    queryKey: interviewKeys.detail(id),
    queryFn: () => interviewService.getInterviewById(id),
    staleTime: 30 * 1000, // 30 seconds - active editing requires fresh data
    enabled: !!id,
  });
}

export function useInterviewRoles(companyId: string) {
  return useQuery({
    queryKey: interviewKeys.roles(),
    queryFn: () =>
      rolesService.getRoles({
        companyId,
        includeSharedRole: true,
        includeCompany: true,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes - roles change infrequently
    enabled: !!companyId,
  });
}

export function useInterviewRolesByAssessment(assessmentId: number) {
  return useQuery({
    queryKey: interviewKeys.rolesByAssessment(assessmentId),
    queryFn: () => interviewService.getRolesByAssessmentSite(assessmentId),
    staleTime: 5 * 60 * 1000,
    enabled: !!assessmentId,
  });
}

// Interview CRUD operations
export function useInterviewActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateInterviewData) =>
      interviewService.createInterview(data),
    onSuccess: (newInterview, variables) => {
      // Invalidate relevant interview lists
      const filters: InterviewFilters = {
        assessment_id: variables.assessment_id,
      };
      queryClient.invalidateQueries({ queryKey: interviewKeys.lists() });

      // Add to specific filtered list if it matches
      queryClient.setQueryData(
        interviewKeys.list(filters),
        (old: InterviewWithResponses[] = []) => {
          const interviewWithResponses: InterviewWithResponses = {
            ...newInterview,
            responses: [],
            completion_rate: 0,
            average_score: 0,
            min_rating_value: 0,
            max_rating_value: 5,
            interviewee: {
              email: newInterview.interviewee_email,
              role: null,
            },
            interviewer: {
              id: newInterview.interviewer_id,
              name: null,
            },
            assessment: {
              id: newInterview.assessment_id,
            },
          };
          return [interviewWithResponses, ...old];
        }
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
      isPublic,
    }: {
      id: number;
      updates: UpdateInterviewData;
      isPublic: boolean;
    }) => interviewService.updateInterview(id, updates, isPublic),
    onSuccess: async (_, { id, updates }) => {
      // Invalidate and refetch the specific interview
      queryClient.invalidateQueries({ queryKey: interviewKeys.detail(id) });

      // Update cache optimistically in lists
      queryClient.setQueriesData(
        { queryKey: interviewKeys.lists() },
        (old: InterviewWithResponses[] | undefined) => {
          if (!old) return old;
          return old.map((interview) =>
            interview.id === id ? { ...interview, ...updates } : interview
          );
        }
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => interviewService.deleteInterview(id),
    onSuccess: (_, id) => {
      // Remove from all lists
      queryClient.setQueriesData(
        { queryKey: interviewKeys.lists() },
        (old: InterviewWithResponses[] | undefined) => {
          if (!old) return old;
          return old.filter((interview) => interview.id !== id);
        }
      );

      // Remove detail query
      queryClient.removeQueries({ queryKey: interviewKeys.detail(id) });
    },
  });

  const bulkUpdateStatusMutation = useMutation({
    mutationFn: ({
      ids,
      status,
    }: {
      ids: number[];
      status: Interview["status"];
    }) => interviewService.bulkUpdateInterviewStatus(ids, status),
    onSuccess: (_, { ids, status }) => {
      // Update all lists
      queryClient.setQueriesData(
        { queryKey: interviewKeys.lists() },
        (old: InterviewWithResponses[] | undefined) => {
          if (!old) return old;
          return old.map((interview) =>
            ids.includes(interview.id) ? { ...interview, status } : interview
          );
        }
      );
    },
  });

  return {
    createInterview: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,

    updateInterview: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,

    deleteInterview: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,

    bulkUpdateStatus: bulkUpdateStatusMutation.mutateAsync,
    isBulkUpdating: bulkUpdateStatusMutation.isPending,
    bulkUpdateError: bulkUpdateStatusMutation.error,
  };
}

// Interview response operations
export function useInterviewResponseActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateInterviewResponseData) =>
      interviewService.createInterviewResponse(data),
    onSuccess: (_, variables) => {
      // Invalidate the specific interview to get updated responses
      queryClient.invalidateQueries({
        queryKey: interviewKeys.detail(variables.interview_id),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: number;
      updates: UpdateInterviewResponseData;
    }) => interviewService.updateInterviewResponse(id, updates),
    onMutate: async ({ id, updates }) => {
      // Find which interview this response belongs to and optimistically update
      const queries = queryClient.getQueriesData({
        queryKey: interviewKeys.details(),
      });

      for (const [queryKey, interview] of queries) {
        if (
          interview &&
          typeof interview === "object" &&
          "responses" in interview
        ) {
          const interviewData = interview as InterviewWithResponses;
          const hasResponse = interviewData.responses?.some((r) => r.id === id);

          if (hasResponse) {
            queryClient.setQueryData(queryKey, {
              ...interviewData,
              responses: interviewData.responses.map((response) =>
                response.id === id
                  ? {
                      ...response,
                      ...updates,
                      answered_at:
                        updates.rating_score !== null &&
                        updates.rating_score !== undefined
                          ? new Date().toISOString()
                          : response.answered_at,
                    }
                  : response
              ),
            });
            break;
          }
        }
      }
    },
    onSuccess: (_, { id }) => {
      // Find which interview this response belongs to and invalidate it to ensure
      // progress calculations and other derived state are updated correctly
      const queries = queryClient.getQueriesData({
        queryKey: interviewKeys.details(),
      });

      for (const [queryKey] of queries) {
        const interviewId = (queryKey as any[])[2]; // Extract interview ID from query key
        if (interviewId) {
          queryClient.invalidateQueries({
            queryKey: interviewKeys.detail(interviewId),
          });
          break;
        }
      }
    },
  });

  return {
    createResponse: createMutation.mutateAsync,
    isCreatingResponse: createMutation.isPending,
    createResponseError: createMutation.error,

    updateResponse: updateMutation.mutateAsync,
    isUpdatingResponse: updateMutation.isPending,
    updateResponseError: updateMutation.error,
  };
}

// Interview response action operations
export function useInterviewResponseActionMutations(
  interviewId?: number,
  publicCredentials?: {
    interviewId: number;
    accessCode: string;
    email: string;
  }
) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateInterviewResponseActionData) => {
      if (publicCredentials) {
        return interviewService.createPublicInterviewResponseAction(
          publicCredentials.interviewId,
          publicCredentials.accessCode,
          publicCredentials.email,
          data
        );
      }
      return interviewService.createInterviewResponseAction(data);
    },
    onSuccess: () => {
      // Invalidate the specific interview cache to trigger a refetch
      if (interviewId || publicCredentials?.interviewId) {
        const targetInterviewId = interviewId || publicCredentials!.interviewId;
        queryClient.invalidateQueries({
          queryKey: interviewKeys.detail(targetInterviewId),
        });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: number;
      updates: UpdateInterviewResponseActionData;
    }) => {
      if (publicCredentials) {
        return interviewService.updatePublicInterviewResponseAction(
          id,
          publicCredentials.interviewId,
          publicCredentials.accessCode,
          publicCredentials.email,
          updates
        );
      }
      return interviewService.updateInterviewResponseAction(id, updates);
    },
    onSuccess: () => {
      // Invalidate the specific interview cache to trigger a refetch
      if (interviewId || publicCredentials?.interviewId) {
        const targetInterviewId = interviewId || publicCredentials!.interviewId;
        queryClient.invalidateQueries({
          queryKey: interviewKeys.detail(targetInterviewId),
        });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (publicCredentials) {
        return interviewService.deletePublicInterviewResponseAction(
          id,
          publicCredentials.interviewId,
          publicCredentials.accessCode,
          publicCredentials.email
        );
      }
      return interviewService.deleteInterviewResponseAction(id);
    },
    onSuccess: () => {
      // Invalidate the specific interview cache to trigger a refetch
      if (interviewId || publicCredentials?.interviewId) {
        const targetInterviewId = interviewId || publicCredentials!.interviewId;
        queryClient.invalidateQueries({
          queryKey: interviewKeys.detail(targetInterviewId),
        });
      }
    },
  });

  return {
    createAction: createMutation.mutateAsync,
    isCreatingAction: createMutation.isPending,
    createActionError: createMutation.error,

    updateAction: updateMutation.mutateAsync,
    isUpdatingAction: updateMutation.isPending,
    updateActionError: updateMutation.error,

    deleteAction: deleteMutation.mutateAsync,
    isDeletingAction: deleteMutation.isPending,
    deleteActionError: deleteMutation.error,
  };
}

// Public interview response operations with credentials (simplified)
export function usePublicInterviewResponseActions(
  interviewId: number,
  accessCode: string,
  email: string
) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({
      responseId,
      updates,
    }: {
      responseId: number;
      updates: UpdateInterviewResponseData;
    }) =>
      interviewService.updatePublicInterviewResponse(
        responseId,
        interviewId,
        accessCode,
        email,
        updates
      ),
    onSuccess: () => {
      // Just invalidate the interview to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: interviewKeys.detail(interviewId),
      });
    },
  });

  return {
    updateResponse: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
  };
}

// Utility hook for interview progress calculation
export function useInterviewProgress(interviewId: number) {
  const { data: interview } = useInterviewById(interviewId);

  if (!interview) return null;

  return interviewService.calculateInterviewProgress(interview);
}
