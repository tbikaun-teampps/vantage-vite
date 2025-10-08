import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { interviewService } from "@/lib/supabase/interview-service";
import { getInterviews } from "@/lib/api/interviews";
import type {
  InterviewWithResponses,
  InterviewFilters,
  CreateInterviewResponseData,
  UpdateInterviewResponseData,
} from "@/types/assessment";
import { getInterviewsByAssessmentId } from "@/lib/api/assessments";

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
    queryFn: () => getInterviews(companyId, filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - moderate changes during interview management
    enabled: !!companyId,
  });
}

export function useInterviewsByAssessment(assessmentId: number) {
  const filters: InterviewFilters = { assessment_id: assessmentId };
  return useQuery({
    queryKey: interviewKeys.list(filters),
    queryFn: () => getInterviewsByAssessmentId(assessmentId),
    staleTime: 2 * 60 * 1000,
    enabled: !!assessmentId,
  });
}

export function useInterviewsByProgram(
  companyId: string,
  programId: number,
  programPhaseId: number | null = null,
  questionnaireId: number
) {
  return useQuery({
    queryKey: interviewKeys.list({
      program_id: programId,
      program_phase_id: programPhaseId || undefined,
      questionnaire_id: questionnaireId,
    }),
    queryFn: () =>
      interviewService.getProgramInterviews(
        companyId,
        programId,
        programPhaseId,
        questionnaireId
      ),
    staleTime: 2 * 60 * 1000,
    enabled: !!companyId && !!programId,
  });
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
    onSuccess: () => {
      // Invalidate all interview details to ensure progress calculations are updated
      queryClient.invalidateQueries({ queryKey: interviewKeys.details() });
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
