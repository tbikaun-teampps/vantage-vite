import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { questionnaireService } from "@/lib/supabase/questionnaire-service";
import { useAuthStore } from "./auth-store";
import { getSharedRoles } from "@/lib/supabase/shared-roles";
import type {
  Questionnaire,
  QuestionnaireWithCounts,
  QuestionnaireWithStructure,
  QuestionnaireSection,
  QuestionnaireStep,
  QuestionnaireQuestion,
  QuestionnaireRatingScale,
  Role,
  SharedRole,
} from "@/types/questionnaire";

interface User {
  id: string;
  email: string;
  raw_user_meta_data?: {
    full_name?: string;
    name?: string;
  };
}

interface QuestionnaireStore {
  // State
  questionnaires: QuestionnaireWithCounts[];
  selectedQuestionnaire: QuestionnaireWithStructure | null;
  roles: Role[];
  sharedRoles: SharedRole[];
  users: User[];
  isLoading: boolean;
  isCreating: boolean;
  isLoadingUsers: boolean;
  error: string | null;

  // Actions
  loadQuestionnaires: () => Promise<void>;
  loadQuestionnaireById: (id: string) => Promise<void>;
  loadRoles: () => Promise<void>;
  loadSharedRoles: () => Promise<void>;
  loadUsers: () => Promise<void>;
  createQuestionnaire: (
    questionnaireData: Omit<Questionnaire, "id" | "created_at" | "updated_at">
  ) => Promise<Questionnaire>;
  updateQuestionnaire: (
    id: string,
    updates: Partial<Questionnaire>
  ) => Promise<void>;
  deleteQuestionnaire: (id: string) => Promise<void>;
  duplicateQuestionnaire: (id: string) => Promise<void>;
  setSelectedQuestionnaire: (
    questionnaire: QuestionnaireWithStructure | null
  ) => void;
  startCreating: () => void;
  cancelCreating: () => void;

  // Section actions
  createSection: (
    questionnaireId: string,
    title: string
  ) => Promise<QuestionnaireSection>;
  updateSection: (
    id: string,
    updates: Partial<QuestionnaireSection>
  ) => Promise<void>;
  deleteSection: (id: string) => Promise<void>;

  // Step actions
  createStep: (sectionId: string, title: string) => Promise<QuestionnaireStep>;
  updateStep: (
    id: string,
    updates: Partial<QuestionnaireStep>
  ) => Promise<void>;
  deleteStep: (id: string) => Promise<void>;

  // Question actions
  createQuestion: (
    stepId: string,
    title: string,
    additionalFields?: Partial<QuestionnaireQuestion>
  ) => Promise<QuestionnaireQuestion>;
  updateQuestion: (
    id: string,
    updates: Partial<QuestionnaireQuestion>
  ) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  duplicateQuestion: (id: string) => Promise<void>;
  updateQuestionRatingScales: (
    questionId: string,
    ratingScaleAssociations: Array<{
      ratingScaleId: string;
      description: string;
    }>
  ) => Promise<void>;
  updateQuestionRoles: (questionId: string, roleIds: string[]) => Promise<void>;

  // Rating scale actions
  createRatingScale: (
    questionnaireId: string,
    ratingData: Omit<
      QuestionnaireRatingScale,
      "id" | "created_at" | "updated_at" | "questionnaire_id"
    >
  ) => Promise<QuestionnaireRatingScale>;
  updateRatingScale: (
    id: string,
    updates: Partial<QuestionnaireRatingScale>
  ) => Promise<void>;
  deleteRatingScale: (id: string) => Promise<void>;

  // Share actions
  shareQuestionnaire: (
    questionnaireId: string,
    targetUserId: string
  ) => Promise<void>;

  // Utility actions
  clearError: () => void;

  // Store management
  reset: () => void;
}

export const useQuestionnaireStore = create<QuestionnaireStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      questionnaires: [],
      selectedQuestionnaire: null,
      roles: [],
      sharedRoles: [],
      users: [],
      isLoading: false,
      isCreating: false,
      isLoadingUsers: false,
      error: null,

      // Load questionnaires list
      loadQuestionnaires: async () => {
        set({ isLoading: true, error: null });
        try {
          const questionnaires = await questionnaireService.getQuestionnaires();
          set({ questionnaires, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to load questionnaires",
            isLoading: false,
          });
        }
      },

      // Load specific questionnaire with full structure
      loadQuestionnaireById: async (id: string) => {
        // Check if we already have this questionnaire loaded
        const { selectedQuestionnaire } = get();
        if (selectedQuestionnaire?.id === id) {
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const questionnaire = await questionnaireService.getQuestionnaireById(
            id
          );
          set({ selectedQuestionnaire: questionnaire, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to load questionnaire",
            isLoading: false,
          });
        }
      },

      // Load roles
      loadRoles: async () => {
        try {
          const roles = await questionnaireService.getRoles();
          set({ roles });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to load roles",
          });
        }
      },
      loadSharedRoles: async () => {
        try {
          const { data: sharedRoles, error } = await getSharedRoles();
          if (error) {
            throw new Error(error);
          }
          if (sharedRoles === null) {
            throw new Error("No shared roles data returned");
          }
          set({ sharedRoles });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to load shared roles",
          });
        }
      },

      loadUsers: async () => {
        set({ isLoadingUsers: true, error: null });
        try {
          const currentUserId = await questionnaireService.getCurrentUserId();
          const users = await questionnaireService.getUsers(currentUserId);
          set({ users, isLoadingUsers: false });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to load users",
            isLoadingUsers: false,
          });
        }
      },

      // Create new questionnaire
      createQuestionnaire: async (questionnaireData) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error("Questionnaire creation is disabled in demo mode.");
        }

        set({ isLoading: true, error: null });
        try {
          const currentUserId = await questionnaireService.getCurrentUserId();
          const newQuestionnaire =
            await questionnaireService.createQuestionnaire({
              ...questionnaireData,
              created_by: currentUserId,
            });

          // Reload questionnaires and select the new one
          await get().loadQuestionnaires();
          await get().loadQuestionnaireById(newQuestionnaire.id);
          set({ isCreating: false, isLoading: false });

          return newQuestionnaire;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to create questionnaire",
            isLoading: false,
          });
        }
      },

      // Update questionnaire
      updateQuestionnaire: async (id, updates) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error("Questionnaire editing is disabled in demo mode.");
        }
        try {
          // Check if editing structure/questions (not just metadata)
          const isStructuralChange = Object.keys(updates).some(
            (key) => !["name", "status", "description", "guidelines"].includes(key)
          );

          if (isStructuralChange) {
            // Check if questionnaire is in use
            const usage = await questionnaireService.checkQuestionnaireUsage(
              id
            );
            if (usage.isInUse) {
              throw new Error(
                `This questionnaire is currently being used by ${usage.assessmentCount} assessment(s) and ${usage.interviewCount} interview(s). ` +
                  `To make structural changes, please duplicate the questionnaire or delete the associated assessments first.`
              );
            }
          }

          await questionnaireService.updateQuestionnaire(id, updates);

          // Update local state
          const { questionnaires, selectedQuestionnaire } = get();
          set({
            questionnaires: questionnaires.map((s) =>
              s.id === id ? { ...s, ...updates } : s
            ),
            selectedQuestionnaire:
              selectedQuestionnaire?.id === id
                ? { ...selectedQuestionnaire, ...updates }
                : selectedQuestionnaire,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update questionnaire",
          });
          throw error; // Re-throw to let UI handle it
        }
      },

      // Delete q
      deleteQuestionnaire: async (id) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error("Questionnaire deletion is disabled in demo mode.");
        }

        set({ isLoading: true, error: null });
        try {
          // Check if questionnaire is in use before deletion
          const usage = await questionnaireService.checkQuestionnaireUsage(id);
          if (usage.isInUse) {
            throw new Error(
              `This questionnaire cannot be deleted because it is currently being used by ${usage.assessmentCount} assessment(s) and ${usage.interviewCount} interview(s). ` +
                `Please delete the associated assessments and interviews first.`
            );
          }

          await questionnaireService.deleteQuestionnaire(id);

          const { questionnaires, selectedQuestionnaire } = get();
          const updatedQuestionnaires = questionnaires.filter(
            (s) => s.id !== id
          );

          set({
            questionnaires: updatedQuestionnaires,
            selectedQuestionnaire:
              selectedQuestionnaire?.id === id ? null : selectedQuestionnaire,
            isLoading: false,
          });
        } catch (error) {
          let errorMessage = "Failed to delete questionnaire";

          if (error instanceof Error) {
            // Handle foreign key constraint violations
            if (
              error.message.includes("23503") ||
              error.message.includes("violates foreign key constraint") ||
              error.message.includes("assessments_questionnaire_id_fkey")
            ) {
              errorMessage =
                "Cannot delete questionnaire - it is currently being used by one or more assessments. Please remove the questionnaire from all assessments before deleting it.";
            } else {
              errorMessage = error.message;
            }
          }

          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      // Duplicate q
      duplicateQuestionnaire: async (id) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error(
            "Questionnaire duplication is disabled in demo mode."
          );
        }

        set({ isLoading: true, error: null });
        try {
          const newQuestionnaire =
            await questionnaireService.duplicateQuestionnaire(id);

          // Reload questionnaires and select the duplicated one
          await get().loadQuestionnaires();
          await get().loadQuestionnaireById(newQuestionnaire.id);
          set({ isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to duplicate questionnaire",
            isLoading: false,
          });
        }
      },

      // Set selected q
      setSelectedQuestionnaire: (questionnaire) => {
        set({ selectedQuestionnaire: questionnaire });
      },

      // UI state management
      startCreating: () => set({ isCreating: true }),
      cancelCreating: () => set({ isCreating: false }),

      // Section operations
      createSection: async (questionnaireId, title) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error("Section creation is disabled in demo mode.");
        }
        try {
          // Check if questionnaire is in use before allowing section creation
          const usage = await questionnaireService.checkQuestionnaireUsage(
            questionnaireId
          );
          if (usage.isInUse) {
            throw new Error(
              `This questionnaire is currently being used by ${usage.assessmentCount} assessment(s) and ${usage.interviewCount} interview(s). ` +
                `Section creation is locked. Please duplicate the questionnaire to make changes.`
            );
          }

          const currentUserId = await questionnaireService.getCurrentUserId();
          const { selectedQuestionnaire } = get();

          // Calculate next order index
          const orderIndex = selectedQuestionnaire?.sections?.length || 0;
          const newSection = await questionnaireService.createSection({
            questionnaire_id: questionnaireId,
            title,
            order_index: orderIndex,
            expanded: true,
            created_by: currentUserId,
          });

          // Update local state
          if (selectedQuestionnaire?.id === questionnaireId) {
            set({
              selectedQuestionnaire: {
                ...selectedQuestionnaire,
                sections: [
                  ...selectedQuestionnaire.sections,
                  { ...newSection, steps: [] },
                ],
              },
            });
          }

          return newSection;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to create section",
          });
          throw error;
        }
      },

      updateSection: async (id, updates) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error("Section editing is disabled in demo mode.");
        }
        try {
          // Check if questionnaire is in use before allowing section updates
          const { selectedQuestionnaire } = get();
          if (selectedQuestionnaire) {
            const usage = await questionnaireService.checkQuestionnaireUsage(
              selectedQuestionnaire.id
            );
            if (usage.isInUse) {
              throw new Error(
                `This questionnaire is currently being used by ${usage.assessmentCount} assessment(s) and ${usage.interviewCount} interview(s). ` +
                  `Section editing is locked. Please duplicate the questionnaire to make changes.`
              );
            }
          }

          await questionnaireService.updateSection(id, updates);

          if (selectedQuestionnaire) {
            set({
              selectedQuestionnaire: {
                ...selectedQuestionnaire,
                sections: selectedQuestionnaire.sections.map((s) =>
                  s.id === id ? { ...s, ...updates } : s
                ),
              },
            });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update section",
          });
        }
      },

      deleteSection: async (id) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error("Section deletion is disabled in demo mode.");
        }
        try {
          // Check if questionnaire is in use before allowing section deletion
          const { selectedQuestionnaire } = get();
          if (selectedQuestionnaire) {
            const usage = await questionnaireService.checkQuestionnaireUsage(
              selectedQuestionnaire.id
            );
            if (usage.isInUse) {
              throw new Error(
                `This questionnaire is currently being used by ${usage.assessmentCount} assessment(s) and ${usage.interviewCount} interview(s). ` +
                  `Section deletion is locked. Please duplicate the questionnaire to make changes.`
              );
            }
          }

          await questionnaireService.deleteSection(id);

          if (selectedQuestionnaire) {
            set({
              selectedQuestionnaire: {
                ...selectedQuestionnaire,
                sections: selectedQuestionnaire.sections.filter(
                  (s) => s.id !== id
                ),
              },
            });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to delete section",
          });
        }
      },

      // Step operations
      createStep: async (sectionId, title) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error("Step creation is disabled in demo mode.");
        }
        try {
          // Check if questionnaire is in use before allowing step creation
          const { selectedQuestionnaire } = get();
          if (selectedQuestionnaire) {
            const usage = await questionnaireService.checkQuestionnaireUsage(
              selectedQuestionnaire.id
            );
            if (usage.isInUse) {
              throw new Error(
                `This questionnaire is currently being used by ${usage.assessmentCount} assessment(s) and ${usage.interviewCount} interview(s). ` +
                  `Step creation is locked. Please duplicate the questionnaire to make changes.`
              );
            }
          }

          const currentUserId = await questionnaireService.getCurrentUserId();

          // Find the section and calculate order index
          const section = selectedQuestionnaire?.sections.find(
            (s) => s.id === sectionId
          );
          const orderIndex = section?.steps?.length || 0;
          const newStep = await questionnaireService.createStep({
            questionnaire_section_id: sectionId,
            title,
            order_index: orderIndex,
            expanded: true,
            created_by: currentUserId,
          });

          // Update local state
          if (selectedQuestionnaire) {
            set({
              selectedQuestionnaire: {
                ...selectedQuestionnaire,
                sections: selectedQuestionnaire.sections.map((s) =>
                  s.id === sectionId
                    ? {
                        ...s,
                        steps: [...s.steps, { ...newStep, questions: [] }],
                      }
                    : s
                ),
              },
            });
          }

          return newStep;
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to create step",
          });
          throw error;
        }
      },

      updateStep: async (id, updates) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error("Step editing is disabled in demo mode.");
        }
        try {
          // Check if questionnaire is in use before allowing step updates
          const { selectedQuestionnaire } = get();
          if (selectedQuestionnaire) {
            const usage = await questionnaireService.checkQuestionnaireUsage(
              selectedQuestionnaire.id
            );
            if (usage.isInUse) {
              throw new Error(
                `This questionnaire is currently being used by ${usage.assessmentCount} assessment(s) and ${usage.interviewCount} interview(s). ` +
                  `Step editing is locked. Please duplicate the questionnaire to make changes.`
              );
            }
          }

          await questionnaireService.updateStep(id, updates);

          if (selectedQuestionnaire) {
            set({
              selectedQuestionnaire: {
                ...selectedQuestionnaire,
                sections: selectedQuestionnaire.sections.map((section) => ({
                  ...section,
                  steps: section.steps.map((step) =>
                    step.id === id ? { ...step, ...updates } : step
                  ),
                })),
              },
            });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to update step",
          });
        }
      },

      deleteStep: async (id) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error("Step deletion is disabled in demo mode.");
        }
        try {
          // Check if questionnaire is in use before allowing step deletion
          const { selectedQuestionnaire } = get();
          if (selectedQuestionnaire) {
            const usage = await questionnaireService.checkQuestionnaireUsage(
              selectedQuestionnaire.id
            );
            if (usage.isInUse) {
              throw new Error(
                `This questionnaire is currently being used by ${usage.assessmentCount} assessment(s) and ${usage.interviewCount} interview(s). ` +
                  `Step deletion is locked. Please duplicate the questionnaire to make changes.`
              );
            }
          }

          await questionnaireService.deleteStep(id);

          if (selectedQuestionnaire) {
            set({
              selectedQuestionnaire: {
                ...selectedQuestionnaire,
                sections: selectedQuestionnaire.sections.map((section) => ({
                  ...section,
                  steps: section.steps.filter((step) => step.id !== id),
                })),
              },
            });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to delete step",
          });
        }
      },

      // Question operations
      createQuestion: async (stepId, title, additionalFields) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error("Question creation is disabled in demo mode.");
        }
        try {
          const currentUserId = await questionnaireService.getCurrentUserId();
          const { selectedQuestionnaire } = get();

          // Check if questionnaire is in use before allowing question creation
          if (selectedQuestionnaire) {
            const usage = await questionnaireService.checkQuestionnaireUsage(
              selectedQuestionnaire.id.toString()
            );
            if (usage.isInUse) {
              throw new Error(
                `This questionnaire is currently being used by ${usage.assessmentCount} assessment(s) and ${usage.interviewCount} interview(s). ` +
                  `Question creation is locked. Please duplicate the questionnaire to make changes.`
              );
            }
          }

          // Find the step and calculate order index
          let orderIndex = 0;
          for (const section of selectedQuestionnaire?.sections || []) {
            const step = section.steps.find((s) => s.id === stepId);
            if (step) {
              orderIndex = step.questions.length;
              break;
            }
          }

          const newQuestion = await questionnaireService.createQuestion({
            questionnaire_step_id: stepId,
            title,
            question_text: additionalFields?.question_text || title, // Use provided question_text or fallback to title
            context: additionalFields?.context,
            order_index: orderIndex,
            created_by: currentUserId,
            ...additionalFields, // Spread any other additional fields
          });

          // Update local state
          if (selectedQuestionnaire) {
            set({
              selectedQuestionnaire: {
                ...selectedQuestionnaire,
                sections: selectedQuestionnaire.sections.map((section) => ({
                  ...section,
                  steps: section.steps.map((step) =>
                    step.id === stepId
                      ? {
                          ...step,
                          questions: [
                            ...step.questions,
                            {
                              ...newQuestion,
                              applicable_roles: [],
                            },
                          ],
                        }
                      : step
                  ),
                })),
              },
            });
          }

          return newQuestion;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to create question",
          });
          throw error;
        }
      },

      updateQuestion: async (id, updates) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error("Question editing is disabled in demo mode.");
        }
        try {
          // Check if questionnaire is in use before allowing question updates
          const { selectedQuestionnaire } = get();
          if (selectedQuestionnaire) {
            const usage = await questionnaireService.checkQuestionnaireUsage(
              selectedQuestionnaire.id.toString()
            );
            if (usage.isInUse) {
              throw new Error(
                `This questionnaire is currently being used by ${usage.assessmentCount} assessment(s) and ${usage.interviewCount} interview(s). ` +
                  `Question editing is locked. Please duplicate the questionnaire to make changes.`
              );
            }
          }

          await questionnaireService.updateQuestion(id, updates);

          if (selectedQuestionnaire) {
            set({
              selectedQuestionnaire: {
                ...selectedQuestionnaire,
                sections: selectedQuestionnaire.sections.map((section) => ({
                  ...section,
                  steps: section.steps.map((step) => ({
                    ...step,
                    questions: step.questions.map((question) =>
                      question.id === id
                        ? { ...question, ...updates }
                        : question
                    ),
                  })),
                })),
              },
            });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update question",
          });
        }
      },

      deleteQuestion: async (id) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error("Question deletion is disabled in demo mode.");
        }
        try {
          await questionnaireService.deleteQuestion(id);

          const { selectedQuestionnaire } = get();
          if (selectedQuestionnaire) {
            set({
              selectedQuestionnaire: {
                ...selectedQuestionnaire,
                sections: selectedQuestionnaire.sections.map((section) => ({
                  ...section,
                  steps: section.steps.map((step) => ({
                    ...step,
                    questions: step.questions.filter(
                      (question) => question.id !== id
                    ),
                  })),
                })),
              },
            });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to delete question",
          });
        }
      },

      duplicateQuestion: async (id) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error("Question duplication is disabled in demo mode.");
        }
        try {
          const newQuestion = await questionnaireService.duplicateQuestion(id);

          const { selectedQuestionnaire } = get();
          if (selectedQuestionnaire) {
            // Add the new question to the local state immediately
            set({
              selectedQuestionnaire: {
                ...selectedQuestionnaire,
                sections: selectedQuestionnaire.sections.map((section) => ({
                  ...section,
                  steps: section.steps.map((step) => {
                    // Find the step that contains the original question
                    const hasOriginalQuestion = step.questions.some(
                      (q) => q.id === id
                    );
                    if (hasOriginalQuestion) {
                      // Add the complete new question to this step
                      return {
                        ...step,
                        questions: [...step.questions, newQuestion],
                      };
                    }
                    return step;
                  }),
                })),
              },
            });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to duplicate question",
          });
          throw error;
        }
      },

      updateQuestionRatingScales: async (
        questionId,
        ratingScaleAssociations
      ) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error(
            "Question rating scale updates are disabled in demo mode."
          );
        }
        try {
          const currentUserId = await questionnaireService.getCurrentUserId();
          await questionnaireService.updateQuestionRatingScales(
            questionId,
            ratingScaleAssociations,
            currentUserId
          );

          // Update state locally instead of reloading entire questionnaire
          const { selectedQuestionnaire } = get();
          if (selectedQuestionnaire) {
            // Reconstruct the updated associations with full rating scale data
            const updatedAssociations = ratingScaleAssociations.map(
              (association) => {
                const ratingScale = selectedQuestionnaire.rating_scales.find(
                  (scale) => scale.id === association.ratingScaleId
                );
                return {
                  id: `temp-${Date.now()}-${Math.random()}`, // Temporary ID for UI
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  created_by: currentUserId,
                  questionnaire_question_id: questionId,
                  questionnaire_rating_scale_id: association.ratingScaleId,
                  description: association.description,
                  rating_scale: ratingScale!,
                };
              }
            );

            set({
              selectedQuestionnaire: {
                ...selectedQuestionnaire,
                sections: selectedQuestionnaire.sections.map((section) => ({
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
              },
            });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update question rating scales",
          });
        }
      },

      updateQuestionRoles: async (questionId, roleIds) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error("Question role updates are disabled in demo mode.");
        }
        try {
          const currentUserId = await questionnaireService.getCurrentUserId();
          await questionnaireService.updateQuestionRoles(
            questionId,
            roleIds,
            currentUserId
          );

          // Update state locally instead of reloading entire questionnaire
          const { selectedQuestionnaire, sharedRoles } = get();
          if (selectedQuestionnaire) {
            // Get full role data for the selected role IDs
            const selectedRoles = sharedRoles
              .filter((role) => roleIds.includes(role.id))
              .map((role) => ({
                id: `temp-${Date.now()}-${Math.random()}`, // Temporary ID for UI
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                created_by: currentUserId,
                questionnaire_question_id: questionId,
                shared_role_id: role.id,
                role: role,
              }));

            set({
              selectedQuestionnaire: {
                ...selectedQuestionnaire,
                sections: selectedQuestionnaire.sections.map((section) => ({
                  ...section,
                  steps: section.steps.map((step) => ({
                    ...step,
                    questions: step.questions.map((question) =>
                      question.id === questionId
                        ? {
                            ...question,
                            question_roles: selectedRoles,
                          }
                        : question
                    ),
                  })),
                })),
              },
            });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update question roles",
          });
          throw error;
        }
      },

      // Rating scale operations
      createRatingScale: async (questionnaireId, ratingData) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error("Rating scale creation is disabled in demo mode.");
        }
        try {
          // Check if questionnaire is in use before allowing rating scale creation
          const usage = await questionnaireService.checkQuestionnaireUsage(
            questionnaireId
          );
          if (usage.isInUse) {
            throw new Error(
              `This questionnaire is currently being used by ${usage.assessmentCount} assessment(s) and ${usage.interviewCount} interview(s). ` +
                `Rating scale creation is locked. Please duplicate the questionnaire to make changes.`
            );
          }

          const currentUserId = await questionnaireService.getCurrentUserId();
          const { selectedQuestionnaire } = get();

          const orderIndex = selectedQuestionnaire?.rating_scales?.length || 0;
          const newRatingScale = await questionnaireService.createRatingScale({
            ...ratingData,
            questionnaire_id: questionnaireId,
            order_index: orderIndex,
            created_by: currentUserId,
          });

          if (selectedQuestionnaire?.id === questionnaireId) {
            set({
              selectedQuestionnaire: {
                ...selectedQuestionnaire,
                rating_scales: [
                  ...selectedQuestionnaire.rating_scales,
                  newRatingScale,
                ],
              },
            });
          }

          return newRatingScale;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to create rating scale",
          });
          throw error;
        }
      },

      updateRatingScale: async (id, updates) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error("Rating scale editing is disabled in demo mode.");
        }
        try {
          // Check if questionnaire is in use before allowing rating scale updates
          const { selectedQuestionnaire } = get();
          if (selectedQuestionnaire) {
            const usage = await questionnaireService.checkQuestionnaireUsage(
              selectedQuestionnaire.id
            );
            if (usage.isInUse) {
              throw new Error(
                `This questionnaire is currently being used by ${usage.assessmentCount} assessment(s) and ${usage.interviewCount} interview(s). ` +
                  `Rating scale editing is locked. Please duplicate the questionnaire to make changes.`
              );
            }
          }

          await questionnaireService.updateRatingScale(id, updates);

          if (selectedQuestionnaire) {
            set({
              selectedQuestionnaire: {
                ...selectedQuestionnaire,
                rating_scales: selectedQuestionnaire.rating_scales.map(
                  (scale) =>
                    scale.id === id ? { ...scale, ...updates } : scale
                ),
              },
            });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update rating scale",
          });
          throw error; // Re-throw to let UI handle it
        }
      },

      deleteRatingScale: async (id) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error("Rating scale deletion is disabled in demo mode.");
        }
        try {
          // Check if questionnaire is in use before allowing rating scale deletion
          const { selectedQuestionnaire } = get();
          if (selectedQuestionnaire) {
            const usage = await questionnaireService.checkQuestionnaireUsage(
              selectedQuestionnaire.id
            );
            if (usage.isInUse) {
              throw new Error(
                `This questionnaire is currently being used by ${usage.assessmentCount} assessment(s) and ${usage.interviewCount} interview(s). ` +
                  `Rating scale deletion is locked. Please duplicate the questionnaire to make changes.`
              );
            }
          }

          await questionnaireService.deleteRatingScale(id);

          if (selectedQuestionnaire) {
            // Remove rating scale associations from all questions
            const updatedSections = selectedQuestionnaire.sections.map(
              (section) => ({
                ...section,
                steps: section.steps.map((step) => ({
                  ...step,
                  questions: step.questions,
                })),
              })
            );

            set({
              selectedQuestionnaire: {
                ...selectedQuestionnaire,
                rating_scales: selectedQuestionnaire.rating_scales.filter(
                  (scale) => scale.id !== id
                ),
                sections: updatedSections,
              },
            });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to delete rating scale",
          });
          throw error; // Re-throw to let UI handle it
        }
      },

      // Share q to another user
      shareQuestionnaire: async (
        questionnaireId: string,
        targetUserId: string
      ) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error("Questionnaire sharing is disabled in demo mode.");
        }

        set({ isLoading: true, error: null });
        try {
          await questionnaireService.shareQuestionnaireToUserId(
            questionnaireId,
            targetUserId
          );

          set({
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to share questionnaire",
            isLoading: false,
          });
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Store management
      reset: () => {
        set({
          questionnaires: [],
          selectedQuestionnaire: null,
          roles: [],
          sharedRoles: [],
          users: [],
          isLoading: false,
          isCreating: false,
          isLoadingUsers: false,
          error: null,
        });
      },
    }),
    { name: "questionnaire-store" }
  )
);
