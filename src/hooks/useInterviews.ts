import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { interviewService } from "@/lib/supabase/interview-service";
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
  InterviewResponseAction,
  Role,
} from "@/types/assessment";

// Query key factory for cache management
export const interviewKeys = {
  all: ["interviews"] as const,
  lists: () => [...interviewKeys.all, "list"] as const,
  list: (filters?: InterviewFilters) =>
    [...interviewKeys.lists(), { filters }] as const,
  details: () => [...interviewKeys.all, "detail"] as const,
  detail: (id: string) => [...interviewKeys.details(), id] as const,
  roles: () => [...interviewKeys.all, "roles"] as const,
  rolesByAssessment: (assessmentId: string) =>
    [...interviewKeys.roles(), assessmentId] as const,
};

// Data fetching hooks
export function useInterviews(filters?: InterviewFilters) {
  return useQuery({
    queryKey: interviewKeys.list(filters),
    queryFn: () => interviewService.getInterviews(undefined, filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - moderate changes during interview management
  });
}

export function useInterviewsByAssessment(assessmentId: string) {
  const filters: InterviewFilters = { assessment_id: parseInt(assessmentId) };
  return useQuery({
    queryKey: interviewKeys.list(filters),
    queryFn: () => interviewService.getInterviews(undefined, filters),
    staleTime: 2 * 60 * 1000,
  });
}

export function useInterviewById(id: string) {
  return useQuery({
    queryKey: interviewKeys.detail(id),
    queryFn: () => interviewService.getInterviewById(id),
    staleTime: 30 * 1000, // 30 seconds - active editing requires fresh data
    enabled: !!id,
  });
}


export function useInterviewRoles() {
  return useQuery({
    queryKey: interviewKeys.roles(),
    queryFn: () => interviewService.getRoles(),
    staleTime: 5 * 60 * 1000, // 5 minutes - roles change infrequently
  });
}

export function useInterviewRolesByAssessment(assessmentId: string) {
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
        assessment_id: parseInt(variables.assessment_id),
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
              role: undefined,
            },
            interviewer: {
              id: newInterview.interviewer_id,
              name: undefined,
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
      id: string;
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
            interview.id.toString() === id
              ? { ...interview, ...updates }
              : interview
          );
        }
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => interviewService.deleteInterview(id),
    onSuccess: (_, id) => {
      // Remove from all lists
      queryClient.setQueriesData(
        { queryKey: interviewKeys.lists() },
        (old: InterviewWithResponses[] | undefined) => {
          if (!old) return old;
          return old.filter((interview) => interview.id.toString() !== id);
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
      ids: string[];
      status: Interview["status"];
    }) => interviewService.bulkUpdateInterviewStatus(ids, status),
    onSuccess: (_, { ids, status }) => {
      // Update all lists
      queryClient.setQueriesData(
        { queryKey: interviewKeys.lists() },
        (old: InterviewWithResponses[] | undefined) => {
          if (!old) return old;
          return old.map((interview) =>
            ids.includes(interview.id.toString())
              ? { ...interview, status }
              : interview
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
        queryKey: interviewKeys.detail(variables.interview_id.toString()),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
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
          const hasResponse = interviewData.responses?.some(
            (r) => r.id.toString() === id
          );

          if (hasResponse) {
            queryClient.setQueryData(queryKey, {
              ...interviewData,
              responses: interviewData.responses.map((response) =>
                response.id.toString() === id
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
            queryKey: interviewKeys.detail(interviewId) 
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
export function useInterviewResponseActionMutations(publicCredentials?: {
  interviewId: string;
  accessCode: string;
  email: string;
}) {
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
    onSuccess: (newAction, variables) => {
      // Optimistically update the interview cache
      const updateInterviewWithNewAction = (
        interview: InterviewWithResponses
      ): InterviewWithResponses => ({
        ...interview,
        responses: interview.responses.map((response) => {
          const responseId = variables.interview_response_id;
          if (
            response.id.toString() === responseId.toString() ||
            response.id === responseId ||
            response.id === parseInt(responseId.toString())
          ) {
            return {
              ...response,
              actions: [...(response.actions || []), newAction],
            };
          }
          return response;
        }),
      });

      // Update all interview detail queries
      queryClient.setQueriesData(
        { queryKey: interviewKeys.details() },
        (old: InterviewWithResponses | undefined) => {
          if (!old) return old;
          return updateInterviewWithNewAction(old);
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
    onSuccess: (updatedAction, { id }) => {
      // Update the action in cache
      queryClient.setQueriesData(
        { queryKey: interviewKeys.details() },
        (old: InterviewWithResponses | undefined) => {
          if (!old) return old;
          return {
            ...old,
            responses: old.responses.map((response) => ({
              ...response,
              actions: response.actions?.map((action) =>
                action.id.toString() === id.toString() ||
                action.id === id ||
                action.id === parseInt(id.toString())
                  ? updatedAction
                  : action
              ),
            })),
          };
        }
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
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
    onSuccess: (_, id) => {
      // Remove the action from cache
      queryClient.setQueriesData(
        { queryKey: interviewKeys.details() },
        (old: InterviewWithResponses | undefined) => {
          if (!old) return old;
          return {
            ...old,
            responses: old.responses.map((response) => ({
              ...response,
              actions: response.actions?.filter(
                (action) =>
                  !(
                    action.id.toString() === id.toString() ||
                    action.id === id ||
                    action.id === parseInt(id.toString())
                  )
              ),
            })),
          };
        }
      );
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
  interviewId: string,
  accessCode: string,
  email: string
) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({
      responseId,
      updates,
    }: {
      responseId: string;
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
        queryKey: interviewKeys.detail(interviewId) 
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
export function useInterviewProgress(interviewId: string) {
  const { data: interview } = useInterviewById(interviewId);

  if (!interview) return null;

  return interviewService.calculateInterviewProgress(interview);
}
