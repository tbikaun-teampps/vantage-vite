import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { programService } from "@/lib/supabase/program-service";
import type { CreateProgramFormData, Program } from "@/types/program";
import type { ProgramUpdateFormData } from "@/pages/programs/detail/components/program-update-schema";
import { toast } from "sonner";

// Query key factory for cache management
export const programKeys = {
  all: ["programs"] as const,
  lists: () => [...programKeys.all, "list"] as const,
  list: (companyId?: number) => [...programKeys.lists(), { companyId }] as const,
  details: () => [...programKeys.all, "detail"] as const,
  detail: (id: number) => [...programKeys.details(), id] as const,
};

// Hook to fetch programs with optional company filtering
export function usePrograms(companyId?: number) {
  return useQuery({
    queryKey: programKeys.list(companyId),
    queryFn: () => programService.getPrograms(companyId),
    staleTime: 5 * 60 * 1000, // 5 minutes - program data changes moderately
  });
}

// Hook to fetch a specific program by ID with objectives
export function useProgramById(id: number) {
  return useQuery({
    queryKey: programKeys.detail(id),
    queryFn: () => programService.getProgramById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id, // Only run if id is provided
  });
}

export function useCreateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProgramFormData) => programService.createProgram(data),
    onSuccess: (program: Program) => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      toast.success(`${program.name} has been created successfully.`);
    },
    onError: (error) => {
      console.error("Failed to create program:", error);
      toast.error("Failed to create program. Please try again.");
    },
  });
}

export function useUpdateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ programId, updateData }: { programId: number; updateData: ProgramUpdateFormData }) =>
      programService.updateProgram(programId, updateData),
    onSuccess: (program: Program) => {
      queryClient.invalidateQueries({ queryKey: programKeys.detail(program.id) });
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      toast.success("Program details updated successfully.");
    },
    onError: (error) => {
      console.error("Failed to update program:", error);
      toast.error("Failed to update program. Please try again.");
    },
  });
}

export function useUpdateProgramOnsiteQuestionnaire() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ programId, questionnaireId }: { programId: number; questionnaireId: number | null }) =>
      programService.updateProgramOnsiteQuestionnaire(programId, questionnaireId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: programKeys.detail(variables.programId) });
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      
      if (variables.questionnaireId) {
        toast.success("Onsite questionnaire linked to program successfully.");
      } else {
        toast.success("Onsite questionnaire unlinked from program successfully.");
      }
    },
    onError: (error) => {
      console.error("Failed to update program onsite questionnaire:", error);
      toast.error("Failed to update onsite questionnaire. Please try again.");
    },
  });
}

export function useUpdateProgramPresiteQuestionnaire() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ programId, questionnaireId }: { programId: number; questionnaireId: number | null }) =>
      programService.updateProgramPresiteQuestionnaire(programId, questionnaireId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: programKeys.detail(variables.programId) });
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      
      if (variables.questionnaireId) {
        toast.success("Pre-assessment questionnaire linked to program successfully.");
      } else {
        toast.success("Pre-assessment questionnaire unlinked from program successfully.");
      }
    },
    onError: (error) => {
      console.error("Failed to update program presite questionnaire:", error);
      toast.error("Failed to update pre-assessment questionnaire. Please try again.");
    },
  });
}

export function useDeleteProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => programService.deleteProgram(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      toast.success("Program has been deleted successfully.");
    },
    onError: (error) => {
      console.error("Failed to delete program:", error);
      toast.error("Failed to delete program. Please try again.");
    },
  });
}