import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { programScopeService } from "@/lib/supabase/program-scope-service";
import type { Database } from "@/types/database";
import type { ProgramWithRelations } from "@/types/program";
import { toast } from "sonner";

type ScopeLevel = Database["public"]["Enums"]["scope_levels"];

// Query key factory for scope-related queries
export const programScopeKeys = {
  all: ["program-scopes"] as const,
  options: (scopeLevel: ScopeLevel, companyId: number) => 
    [...programScopeKeys.all, "options", scopeLevel, companyId] as const,
  scopes: (programId: number) => 
    [...programScopeKeys.all, "scopes", programId] as const,
};

// Hook to fetch scope options based on scope level and company
export function useScopeOptions(scopeLevel: ScopeLevel, companyId: number) {
  return useQuery({
    queryKey: programScopeKeys.options(scopeLevel, companyId),
    queryFn: () => programScopeService.getScopeOptions(scopeLevel, companyId),
    staleTime: 10 * 60 * 1000, // 10 minutes - organizational data changes infrequently
    enabled: !!scopeLevel && !!companyId,
  });
}

// Hook to fetch current program scopes
export function useProgramScopes(programId: number) {
  return useQuery({
    queryKey: programScopeKeys.scopes(programId),
    queryFn: () => programScopeService.getProgramScopes(programId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!programId,
  });
}

// Hook to update program scopes
export function useUpdateProgramScopes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      programId,
      scopeLevel,
      selectedIds,
    }: {
      programId: number;
      scopeLevel: ScopeLevel;
      selectedIds: number[];
    }) => {
      return programScopeService.updateProgramScopes(programId, scopeLevel, selectedIds);
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: programScopeKeys.scopes(variables.programId) 
      });
      
      const scopeType = variables.scopeLevel.replace("_", " ");
      const count = variables.selectedIds.length;
      
      if (count === 0) {
        toast.success(`Program scope cleared - applies to entire company`);
      } else {
        toast.success(`Program scope updated - ${count} ${scopeType}${count === 1 ? "" : "s"} selected`);
      }
    },
    onError: (error) => {
      console.error("Failed to update program scopes:", error);
      toast.error("Failed to update program scope. Please try again.");
    },
  });
}

// Utility function to validate if a program has proper scope assignment
export function isProgramScopeValid(program: ProgramWithRelations, currentScopes: any[] = []): boolean {
  // Company-level programs are always considered properly scoped
  if (program.scope_level === "company") {
    return true;
  }
  
  // For other scope levels, check if at least one scope item is selected
  return currentScopes.length > 0;
}

// Utility function to validate if a program has a questionnaire for assessments
export function isProgramQuestionnaireValid(program: ProgramWithRelations): boolean {
  return !!program.questionnaire_id;
}

// Hook to check if a program is valid for assessment creation (scope + questionnaire)
export function useProgramAssessmentValidation(program: ProgramWithRelations | null) {
  const { data: currentScopes = [], isLoading } = useProgramScopes(program?.id || 0);
  
  if (!program) {
    return {
      isValid: false,
      isLoading,
      currentScopes,
      reason: null,
      scopeValid: false,
      questionnaireValid: false,
    };
  }

  const scopeValid = isProgramScopeValid(program, currentScopes);
  const questionnaireValid = isProgramQuestionnaireValid(program);
  const isValid = scopeValid && questionnaireValid;
  
  let reason = null;
  if (!scopeValid && !questionnaireValid) {
    reason = `Program must have ${program.scope_level?.replace("_", " ")} scope items assigned and a questionnaire linked before assessments can be created.`;
  } else if (!scopeValid) {
    reason = `Program must have ${program.scope_level?.replace("_", " ")} scope items assigned before assessments can be created.`;
  } else if (!questionnaireValid) {
    reason = "Program must have a questionnaire linked before onsite assessments can be created.";
  }
  
  return {
    isValid,
    isLoading,
    currentScopes,
    reason,
    scopeValid,
    questionnaireValid,
  };
}

// Keep the original scope validation hook for backwards compatibility
export function useProgramScopeValidation(program: ProgramWithRelations | null) {
  const { data: currentScopes = [], isLoading } = useProgramScopes(program?.id || 0);
  
  const isValid = program ? isProgramScopeValid(program, currentScopes) : false;
  
  return {
    isValid,
    isLoading,
    currentScopes,
    reason: !isValid && program?.scope_level !== "company" 
      ? `Program must have ${program?.scope_level?.replace("_", " ")} scope items assigned before assessments can be created.`
      : null
  };
}