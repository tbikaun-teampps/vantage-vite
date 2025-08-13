import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assessmentService } from "@/lib/supabase/assessment-service";
import type {
  AssessmentWithCounts,
  AssessmentWithQuestionnaire,
  CreateAssessmentData,
  UpdateAssessmentData,
  AssessmentFilters,
} from "@/types/assessment";

// Query key factory for assessments
export const assessmentKeys = {
  all: ['assessments'] as const,
  lists: () => [...assessmentKeys.all, 'list'] as const,
  list: (filters?: AssessmentFilters) => [...assessmentKeys.lists(), { filters }] as const,
  details: () => [...assessmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...assessmentKeys.details(), id] as const,
  questionnaires: () => [...assessmentKeys.all, 'questionnaires'] as const,
};

// Hook to fetch assessments with optional filtering
export function useAssessments(filters?: AssessmentFilters) {
  return useQuery({
    queryKey: assessmentKeys.list(filters),
    queryFn: () => assessmentService.getAssessments(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes - assessment data changes moderately
  });
}

// Hook to fetch a specific assessment by ID with questionnaire structure
export function useAssessmentById(id: string) {
  return useQuery({
    queryKey: assessmentKeys.detail(id),
    queryFn: () => assessmentService.getAssessmentById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id, // Only run if id is provided
  });
}

// Hook to fetch questionnaires for assessment creation
export function useQuestionnaires() {
  return useQuery({
    queryKey: assessmentKeys.questionnaires(),
    queryFn: () => assessmentService.getQuestionnaires(),
    staleTime: 15 * 60 * 1000, // 15 minutes - questionnaires change infrequently
  });
}

// Hook for assessment mutations (create, update, delete, duplicate)
export function useAssessmentActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateAssessmentData) =>
      assessmentService.createAssessment(data),
    onSuccess: (newAssessment) => {
      // Invalidate assessment lists that might include this new assessment
      queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() });
      
      // Set the new assessment in detail cache
      queryClient.setQueryData(
        assessmentKeys.detail(newAssessment.id.toString()),
        newAssessment
      );
    },
    onError: (error) => {
      console.error("Failed to create assessment:", error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssessmentData }) =>
      assessmentService.updateAssessment(id, data),
    onSuccess: (updatedAssessment, { id }) => {
      // Update the assessment in lists cache
      queryClient.setQueriesData(
        { queryKey: assessmentKeys.lists() },
        (oldData: AssessmentWithCounts[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map((assessment) =>
            assessment.id === Number(id)
              ? { ...assessment, ...updatedAssessment, last_modified: "Just now" }
              : assessment
          );
        }
      );

      // Update the assessment in detail cache
      queryClient.setQueryData(
        assessmentKeys.detail(id),
        (oldData: AssessmentWithQuestionnaire | null | undefined) => {
          if (!oldData) return oldData;
          return { ...oldData, ...updatedAssessment };
        }
      );
    },
    onError: (error) => {
      console.error("Failed to update assessment:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => assessmentService.deleteAssessment(id),
    onSuccess: (_, deletedId) => {
      // Remove from lists cache
      queryClient.setQueriesData(
        { queryKey: assessmentKeys.lists() },
        (oldData: AssessmentWithCounts[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.filter((assessment) => assessment.id !== Number(deletedId));
        }
      );

      // Remove from detail cache
      queryClient.removeQueries({ queryKey: assessmentKeys.detail(deletedId) });
    },
    onError: (error) => {
      console.error("Failed to delete assessment:", error);
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => assessmentService.duplicateAssessment(id),
    onSuccess: (newAssessment) => {
      // Invalidate lists to show the new duplicated assessment
      queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() });
      
      // Set the new assessment in detail cache
      queryClient.setQueryData(
        assessmentKeys.detail(newAssessment.id.toString()),
        newAssessment
      );
    },
    onError: (error) => {
      console.error("Failed to duplicate assessment:", error);
    },
  });

  return {
    // Actions
    createAssessment: createMutation.mutateAsync,
    updateAssessment: (id: string, data: UpdateAssessmentData) =>
      updateMutation.mutateAsync({ id, data }),
    deleteAssessment: deleteMutation.mutateAsync,
    duplicateAssessment: duplicateMutation.mutateAsync,

    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDuplicating: duplicateMutation.isPending,
    isLoading: createMutation.isPending || updateMutation.isPending || 
               deleteMutation.isPending || duplicateMutation.isPending,

    // Error states
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    duplicateError: duplicateMutation.error,

    // Reset error states
    resetErrors: () => {
      createMutation.reset();
      updateMutation.reset();
      deleteMutation.reset();
      duplicateMutation.reset();
    },
  };
}

// Utility hook to refetch all assessment data
export function useRefreshAssessments() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: assessmentKeys.all });
  };
}