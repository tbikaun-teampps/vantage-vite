// stores/assessment-store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { assessmentService } from "@/lib/supabase/assessment-service";
import { useAuthStore } from "./auth-store";
import type {
  Assessment,
  AssessmentWithCounts,
  AssessmentWithQuestionnaire,
  CreateAssessmentData,
  UpdateAssessmentData,
  AssessmentFilters,
  Questionnaire,
} from "@/types/assessment";

interface AssessmentStore {
  // State
  assessments: AssessmentWithCounts[];
  selectedAssessment: AssessmentWithQuestionnaire | null;
  questionnaires: Questionnaire[];
  filters: AssessmentFilters;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;

  // Actions
  loadAssessments: (filters?: AssessmentFilters, companyId?: string) => Promise<void>;
  loadAssessmentById: (id: string) => Promise<void>;
  loadQuestionnaires: () => Promise<void>;

  createAssessment: (
    assessmentData: CreateAssessmentData
  ) => Promise<Assessment>;
  updateAssessment: (
    id: string,
    updates: UpdateAssessmentData
  ) => Promise<void>;
  deleteAssessment: (id: string) => Promise<void>;
  duplicateAssessment: (id: string) => Promise<Assessment>;

  setSelectedAssessment: (assessment: AssessmentWithQuestionnaire | null) => void;
  setFilters: (filters: Partial<AssessmentFilters>) => void;
  clearFilters: () => void;

  // UI state management
  startCreating: () => void;
  cancelCreating: () => void;
  clearError: () => void;

  // Utility actions
  refreshAssessment: (id: string) => Promise<void>;
  getAssessmentOptions: () => Array<{ id: string; name: string }>;
}

const initialFilters: AssessmentFilters = {
  status: undefined,
  questionnaire_id: undefined,
  created_by: undefined,
  date_range: undefined,
  search: undefined,
};

export const useAssessmentStore = create<AssessmentStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      assessments: [],
      selectedAssessment: null,
      questionnaires: [],
      filters: initialFilters,
      isLoading: false,
      isCreating: false,
      error: null,

      // Load assessments with optional filtering
      loadAssessments: async (filters?: AssessmentFilters, companyId?: string) => {
        // Prevent multiple simultaneous calls
        const currentState = get();
        if (currentState.isLoading) {
          return;
        }

        set({ isLoading: true, error: null });
        try {
          // Use passed companyId or get from current filters
          const currentFilters = get().filters;
          const appliedFilters: AssessmentFilters = {
            ...currentFilters,
            ...(filters || {}),
            // Use provided companyId if available
            ...(companyId && { company_id: companyId }),
          };
          
          const assessments = await assessmentService.getAssessments(
            appliedFilters
          );
          set({
            assessments,
            isLoading: false,
            filters: appliedFilters,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to load assessments",
            isLoading: false,
          });
        }
      },

      // Load specific assessment with questionnaire structure
      loadAssessmentById: async (id: string) => {
        // Check if we already have this assessment loaded
        const { selectedAssessment } = get();
        if (selectedAssessment?.id === Number(id)) {
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const assessment = await assessmentService.getAssessmentById(id);
          set({ selectedAssessment: assessment, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to load assessment",
            isLoading: false,
          });
        }
      },

      // Load questionnaires for assessment creation
      loadQuestionnaires: async () => {
        try {
          const questionnaires = await assessmentService.getQuestionnaires();
          set({ questionnaires });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to load questionnaires",
          });
        }
      },

      // Create new assessment
      createAssessment: async (assessmentData) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error("Assessment creation is disabled in demo mode.");
        }

        set({ isLoading: true, isCreating: true, error: null });
        try {
          // Company ID should be passed in assessmentData
          if (!assessmentData.company_id) {
            throw new Error("No company selected");
          }
          const newAssessment = await assessmentService.createAssessment(assessmentData);

          // Reload assessments to get updated list - pass company_id to avoid cross-store dependency  
          await get().loadAssessments(undefined, assessmentData.company_id);

          // Load the newly created assessment
          await get().loadAssessmentById(newAssessment.id);

          set({ isCreating: false, isLoading: false });
          return newAssessment;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to create assessment",
            isLoading: false,
            isCreating: false,
          });
          throw error;
        }
      },

      // Update assessment
      updateAssessment: async (id, updates) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error("Assessment editing is disabled in demo mode.");
        }

        try {
          await assessmentService.updateAssessment(id, updates);

          // Update local state
          const { assessments, selectedAssessment } = get();
          set({
            assessments: assessments.map((a) =>
              a.id === id ? { ...a, ...updates, last_modified: "Just now" } : a
            ),
            selectedAssessment:
              selectedAssessment?.id === id
                ? { ...selectedAssessment, ...updates }
                : selectedAssessment,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update assessment",
          });
          throw error;
        }
      },

      // Delete assessment
      deleteAssessment: async (id) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error("Assessment deletion is disabled in demo mode.");
        }

        set({ isLoading: true, error: null });
        try {
          await assessmentService.deleteAssessment(id);

          const { assessments, selectedAssessment } = get();
          const updatedAssessments = assessments.filter((a) => a.id !== id);

          set({
            assessments: updatedAssessments,
            selectedAssessment:
              selectedAssessment?.id === id ? null : selectedAssessment,
            isLoading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to delete assessment",
            isLoading: false,
          });
          throw error;
        }
      },

      // Duplicate assessment
      duplicateAssessment: async (id) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error("Assessment duplication is disabled in demo mode.");
        }

        set({ isLoading: true, error: null });
        try {
          const newAssessment = await assessmentService.duplicateAssessment(id);

          // Reload assessments to get updated list with current filters
          await get().loadAssessments();

          // Load the duplicated assessment
          await get().loadAssessmentById(newAssessment.id);

          set({ isLoading: false });
          return newAssessment;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to duplicate assessment",
            isLoading: false,
          });
          throw error;
        }
      },

      // Set selected assessment
      setSelectedAssessment: (assessment) => {
        set({ selectedAssessment: assessment });
      },

      // Filter management
      setFilters: (newFilters) => {
        const currentFilters = get().filters;
        const updatedFilters = { ...currentFilters, ...newFilters };
        set({ filters: updatedFilters });
        // Note: Components should manually call loadAssessments() after setting filters
      },

      clearFilters: () => {
        set({ filters: initialFilters });
        // Note: Components should manually call loadAssessments() after clearing filters
      },

      // UI state management
      startCreating: () => set({ isCreating: true, error: null }),
      cancelCreating: () => set({ isCreating: false }),
      clearError: () => set({ error: null }),

      // Utility actions
      refreshAssessment: async (id) => {
        const { selectedAssessment } = get();
        if (selectedAssessment?.id === id) {
          await get().loadAssessmentById(id);
        }
        // Also refresh the assessments list to update counts
        await get().loadAssessments();
      },

      getAssessmentOptions: () => {
        const { assessments } = get();
        return assessments.map((assessment) => ({
          id: assessment.id,
          name: assessment.name,
        }));
      },
    }),
    { name: "assessment-store" }
  )
);
