import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { interviewService } from "@/lib/supabase/interview-service";
import { useAuthStore } from "./auth-store";
import { useCompanyStore } from "./company-store";
import type {
  Interview,
  InterviewWithResponses,
  InterviewSession,
  InterviewProgress,
  CreateInterviewData,
  UpdateInterviewData,
  CreateInterviewResponseData,
  UpdateInterviewResponseData,
  CreateInterviewResponseActionData,
  UpdateInterviewResponseActionData,
  InterviewFilters,
  Role,
  QuestionnaireQuestion,
} from "@/types/assessment";

interface InterviewStore {
  // State
  interviews: InterviewWithResponses[];
  selectedInterview: InterviewWithResponses | null;
  currentSession: InterviewSession | null;
  roles: Role[];
  filters: InterviewFilters;
  isLoading: boolean;
  isSubmitting: boolean;
  isSessionActive: boolean;
  error: string | null;

  // Actions
  loadInterviews: (filters?: InterviewFilters) => Promise<void>;
  loadInterviewsByAssessment: (assessmentId: string) => Promise<void>;
  loadInterviewById: (id: string) => Promise<void>;
  loadRoles: () => Promise<void>;
  loadRolesByAssessmentSite: (assessmentId: string) => Promise<void>;

  createInterview: (interviewData: CreateInterviewData) => Promise<Interview>;
  updateInterview: (id: string, updates: UpdateInterviewData) => Promise<void>;
  deleteInterview: (id: string) => Promise<void>;

  createInterviewResponse: (
    responseData: CreateInterviewResponseData
  ) => Promise<void>;
  updateInterviewResponse: (
    id: string,
    updates: UpdateInterviewResponseData
  ) => Promise<void>;
  deleteInterviewResponse: (id: string) => Promise<void>;

  // Interview Response Action operations
  createInterviewResponseAction: (
    actionData: CreateInterviewResponseActionData
  ) => Promise<void>;
  updateInterviewResponseAction: (
    id: string,
    updates: UpdateInterviewResponseActionData
  ) => Promise<void>;
  deleteInterviewResponseAction: (id: string) => Promise<void>;

  // Session management
  startInterviewSession: (interviewId: string) => Promise<void>;
  endInterviewSession: () => void;
  navigateToQuestion: (questionId: string) => void;
  getNextQuestion: () => QuestionnaireQuestion | null;
  getPreviousQuestion: () => QuestionnaireQuestion | null;

  // State management
  setSelectedInterview: (interview: InterviewWithResponses | null) => void;
  setFilters: (filters: Partial<InterviewFilters>) => void;
  clearFilters: () => void;
  clearError: () => void;

  // Utility actions
  refreshInterview: (id: string) => Promise<void>;
  getInterviewProgress: (interviewId: string) => InterviewProgress | null;
  bulkUpdateInterviewStatus: (
    interviewIds: string[],
    status: Interview["status"]
  ) => Promise<void>;

  // Store management
  reset: () => void;
}

const initialFilters: InterviewFilters = {
  assessment_id: undefined,
  status: undefined,
  interviewer_id: undefined,
  date_range: undefined,
};

export const useInterviewStore = create<InterviewStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      interviews: [],
      selectedInterview: null,
      currentSession: null,
      roles: [],
      filters: initialFilters,
      isLoading: false,
      isSubmitting: false,
      isSessionActive: false,
      error: null,

      // Load interviews with optional filtering
      loadInterviews: async (filters?: InterviewFilters) => {
        set({ isLoading: true, error: null });
        try {
          const appliedFilters: InterviewFilters = {
            ...(filters || get().filters),
          };
          const interviews = await interviewService.getInterviews(
            appliedFilters
          );
          set({
            interviews,
            isLoading: false,
            filters: appliedFilters,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to load interviews",
            isLoading: false,
          });
        }
      },

      // Load interviews for a specific assessment
      loadInterviewsByAssessment: async (assessmentId: string) => {
        set({ isLoading: true, error: null });
        try {
          const filters: InterviewFilters = {
            assessment_id: parseInt(assessmentId),
          };
          const interviews = await interviewService.getInterviews(filters);
          set({
            interviews,
            isLoading: false,
            filters,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to load interviews for assessment",
            isLoading: false,
          });
        }
      },

      // Load specific interview with responses
      loadInterviewById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const interview = await interviewService.getInterviewById(id);
          set({ selectedInterview: interview, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to load interview",
            isLoading: false,
          });
        }
      },

      // Load roles for response associations
      loadRoles: async () => {
        try {
          const roles = await interviewService.getRoles();
          set({ roles });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to load roles",
          });
        }
      },

      // Load roles filtered by assessment site context
      loadRolesByAssessmentSite: async (assessmentId: string) => {
        try {
          const roles = await interviewService.getRolesByAssessmentSite(assessmentId);
          set({ roles });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to load roles for assessment site",
          });
        }
      },

      // Create interview
      createInterview: async (interviewData) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error("Interview creation is disabled in demo mode.");
        }

        set({ isSubmitting: true, error: null });
        try {
          const newInterview = await interviewService.createInterview(
            interviewData
          );

          // Reload interviews if they match the current filters
          const { filters } = get();
          if (
            !filters.assessment_id ||
            filters.assessment_id === parseInt(interviewData.assessment_id)
          ) {
            await get().loadInterviews();
          }

          set({ isSubmitting: false });
          return newInterview;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to create interview",
            isSubmitting: false,
          });
          throw error;
        }
      },

      // Update interview
      updateInterview: async (id, updates) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error("Interview editing is disabled in demo mode.");
        }

        try {
          await interviewService.updateInterview(id, updates);

          // Update local state
          const { interviews, selectedInterview, currentSession } = get();

          const updatedInterview = interviews.find(
            (i) => i.id.toString() === id
          );
          if (updatedInterview) {
            const merged = { ...updatedInterview, ...updates };

            set({
              interviews: interviews.map((i) =>
                i.id.toString() === id ? merged : i
              ),
              selectedInterview:
                selectedInterview?.id.toString() === id
                  ? merged
                  : selectedInterview,
              currentSession:
                currentSession?.interview.id.toString() === id
                  ? { ...currentSession, interview: merged }
                  : currentSession,
            });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update interview",
          });
          throw error;
        }
      },

      // Delete interview
      deleteInterview: async (id) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error("Interview deletion is disabled in demo mode.");
        }

        set({ isSubmitting: true, error: null });
        try {
          await interviewService.deleteInterview(id);

          const { interviews, selectedInterview, currentSession } = get();

          // End session if deleting current session interview
          if (currentSession?.interview.id.toString() === id) {
            get().endInterviewSession();
          }

          set({
            interviews: interviews.filter((i) => i.id.toString() !== id),
            selectedInterview:
              selectedInterview?.id.toString() === id
                ? null
                : selectedInterview,
            isSubmitting: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to delete interview",
            isSubmitting: false,
          });
          throw error;
        }
      },

      // Create interview response
      createInterviewResponse: async (responseData) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error(
            "Interview response creation is disabled in demo mode."
          );
        }

        set({ isSubmitting: true, error: null });
        try {
          await interviewService.createInterviewResponse(responseData);

          // Refresh the interview to get updated responses
          await get().refreshInterview(responseData.interview_id.toString());

          set({ isSubmitting: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to create interview response",
            isSubmitting: false,
          });
          throw error;
        }
      },

      // Update interview response
      updateInterviewResponse: async (id, updates) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error(
            "Interview response editing is disabled in demo mode."
          );
        }

        set({ isSubmitting: true, error: null });
        try {
          await interviewService.updateInterviewResponse(id, updates);

          // Find which interview this response belongs to and refresh it
          const { selectedInterview, currentSession } = get();

          if (selectedInterview) {
            const hasResponse = selectedInterview.responses.some(
              (r) => r.id.toString() === id
            );
            if (hasResponse) {
              await get().refreshInterview(selectedInterview.id.toString());
            }
          }

          if (
            currentSession &&
            currentSession.interview.id !== selectedInterview?.id
          ) {
            const hasResponse = currentSession.interview.responses.some(
              (r) => r.id.toString() === id
            );
            if (hasResponse) {
              await get().refreshInterview(
                currentSession.interview.id.toString()
              );
            }
          }

          set({ isSubmitting: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update interview response",
            isSubmitting: false,
          });
          throw error;
        }
      },

      // Delete interview response
      deleteInterviewResponse: async (id) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error(
            "Interview response deletion is disabled in demo mode."
          );
        }

        set({ isSubmitting: true, error: null });
        try {
          await interviewService.deleteInterviewResponse(id);

          // Update local state by removing the response
          const { selectedInterview, currentSession } = get();

          if (selectedInterview) {
            set({
              selectedInterview: {
                ...selectedInterview,
                responses: selectedInterview.responses.filter(
                  (r) => r.id.toString() !== id
                ),
              },
            });
          }

          if (currentSession) {
            set({
              currentSession: {
                ...currentSession,
                interview: {
                  ...currentSession.interview,
                  responses: currentSession.interview.responses.filter(
                    (r) => r.id.toString() !== id
                  ),
                },
              },
            });
          }

          set({ isSubmitting: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to delete interview response",
            isSubmitting: false,
          });
          throw error;
        }
      },

      // Create interview response action
      createInterviewResponseAction: async (actionData) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error(
            "Interview response action creation is disabled in demo mode."
          );
        }

        set({ isSubmitting: true, error: null });
        try {
          const newAction = await interviewService.createInterviewResponseAction(
            actionData
          );

          // Update local state immediately
          const { selectedInterview, currentSession } = get();
          
          const updateResponsesWithAction = (responses: any[]) => {
            return responses.map((response) => {
              if (response.id.toString() === actionData.interview_response_id.toString() || 
                  response.id === actionData.interview_response_id || 
                  response.id === parseInt(actionData.interview_response_id)) {
                return {
                  ...response,
                  actions: [...(response.actions || []), newAction],
                };
              }
              return response;
            });
          };

          if (selectedInterview) {
            set({
              selectedInterview: {
                ...selectedInterview,
                responses: updateResponsesWithAction(selectedInterview.responses),
              },
            });
          }

          if (currentSession) {
            set({
              currentSession: {
                ...currentSession,
                interview: {
                  ...currentSession.interview,
                  responses: updateResponsesWithAction(currentSession.interview.responses),
                },
              },
            });
          }

          set({ isSubmitting: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to create interview response action",
            isSubmitting: false,
          });
          throw error;
        }
      },

      // Update interview response action
      updateInterviewResponseAction: async (id, updates) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error(
            "Interview response action editing is disabled in demo mode."
          );
        }

        set({ isSubmitting: true, error: null });
        try {
          const updatedAction = await interviewService.updateInterviewResponseAction(id, updates);

          // Update local state immediately with the returned data
          const { selectedInterview, currentSession } = get();
          
          const updateResponsesWithUpdatedAction = (responses: any[]) => {
            return responses.map((response) => {
              if (response.actions && response.actions.length > 0) {
                // Check both string and number comparisons
                const hasAction = response.actions.some((action: any) => {
                  return action.id.toString() === id.toString() || action.id === id || action.id === parseInt(id);
                });
                if (hasAction) {
                  return {
                    ...response,
                    actions: response.actions.map((action: any) => {
                      if (action.id.toString() === id.toString() || action.id === id || action.id === parseInt(id)) {
                        return updatedAction;
                      }
                      return action;
                    }),
                  };
                }
              }
              return response;
            });
          };

          if (selectedInterview) {
            set({
              selectedInterview: {
                ...selectedInterview,
                responses: updateResponsesWithUpdatedAction(selectedInterview.responses),
              },
            });
          }

          if (currentSession) {
            set({
              currentSession: {
                ...currentSession,
                interview: {
                  ...currentSession.interview,
                  responses: updateResponsesWithUpdatedAction(currentSession.interview.responses),
                },
              },
            });
          }

          set({ isSubmitting: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update interview response action",
            isSubmitting: false,
          });
          throw error;
        }
      },

      // Delete interview response action
      deleteInterviewResponseAction: async (id) => {
        // Check if user is in demo mode
        const authState = useAuthStore.getState();
        if (authState.isDemoMode) {
          throw new Error(
            "Interview response action deletion is disabled in demo mode."
          );
        }

        set({ isSubmitting: true, error: null });
        try {
          await interviewService.deleteInterviewResponseAction(id);

          // Update local state immediately
          const { selectedInterview, currentSession } = get();
          
          const updateResponsesWithDeletedAction = (responses: any[]) => {
            return responses.map((response) => {
              if (response.actions && response.actions.length > 0) {
                return {
                  ...response,
                  actions: response.actions.filter((action: any) => {
                    return !(action.id.toString() === id.toString() || action.id === id || action.id === parseInt(id));
                  }),
                };
              }
              return response;
            });
          };

          if (selectedInterview) {
            set({
              selectedInterview: {
                ...selectedInterview,
                responses: updateResponsesWithDeletedAction(selectedInterview.responses),
              },
            });
          }

          if (currentSession) {
            set({
              currentSession: {
                ...currentSession,
                interview: {
                  ...currentSession.interview,
                  responses: updateResponsesWithDeletedAction(currentSession.interview.responses),
                },
              },
            });
          }

          set({ isSubmitting: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to delete interview response action",
            isSubmitting: false,
          });
          throw error;
        }
      },

      // Start interview session
      startInterviewSession: async (interviewId: string) => {
        set({ isLoading: true, error: null });
        try {
          const session = await interviewService.getInterviewSession(
            interviewId
          );
          set({
            currentSession: session,
            isSessionActive: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to start interview session",
            isLoading: false,
          });
        }
      },

      // End interview session
      endInterviewSession: () => {
        set({
          currentSession: null,
          isSessionActive: false,
        });
      },

      // Navigate to specific question in session
      navigateToQuestion: (questionId: string) => {
        const { currentSession } = get();
        if (!currentSession) return;

        // Find the question in the questionnaire structure
        let foundQuestion: QuestionnaireQuestion | null = null;
        for (const section of currentSession.questionnaire_structure) {
          for (const step of section.steps) {
            const question = step.questions.find(
              (q) => q.id.toString() === questionId
            );
            if (question) {
              foundQuestion = question;
              break;
            }
          }
          if (foundQuestion) break;
        }

        if (foundQuestion) {
          set({
            currentSession: {
              ...currentSession,
              current_question: foundQuestion,
            },
          });
        }
      },

      // Get next question in session
      getNextQuestion: () => {
        const { currentSession } = get();
        if (!currentSession || !currentSession.current_question) return null;

        const currentQuestionId = currentSession.current_question.id;
        let foundCurrent = false;

        for (const section of currentSession.questionnaire_structure) {
          for (const step of section.steps) {
            for (const question of step.questions) {
              if (foundCurrent) {
                return question;
              }
              if (question.id === currentQuestionId) {
                foundCurrent = true;
              }
            }
          }
        }

        return null;
      },

      // Get previous question in session
      getPreviousQuestion: () => {
        const { currentSession } = get();
        if (!currentSession || !currentSession.current_question) return null;

        const currentQuestionId = currentSession.current_question.id;
        let previousQuestion: QuestionnaireQuestion | null = null;

        for (const section of currentSession.questionnaire_structure) {
          for (const step of section.steps) {
            for (const question of step.questions) {
              if (question.id === currentQuestionId) {
                return previousQuestion;
              }
              previousQuestion = question;
            }
          }
        }

        return null;
      },

      // Set selected interview
      setSelectedInterview: (interview) => {
        set({ selectedInterview: interview });
      },

      // Filter management
      setFilters: (newFilters) => {
        const currentFilters = get().filters;
        const updatedFilters = { ...currentFilters, ...newFilters };
        set({ filters: updatedFilters });

        // Auto-reload interviews with new filters
        get().loadInterviews(updatedFilters);
      },

      clearFilters: () => {
        set({ filters: initialFilters });
        get().loadInterviews(initialFilters);
      },

      clearError: () => set({ error: null }),

      // Utility actions
      refreshInterview: async (id: string) => {
        try {
          const interview = await interviewService.getInterviewById(id);
          if (!interview) return;

          const { interviews, selectedInterview, currentSession } = get();

          // Update interviews list
          set({
            interviews: interviews.map((i) =>
              i.id.toString() === id ? interview : i
            ),
            selectedInterview:
              selectedInterview?.id.toString() === id
                ? interview
                : selectedInterview,
            currentSession:
              currentSession?.interview.id.toString() === id
                ? { ...currentSession, interview }
                : currentSession,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to refresh interview",
          });
        }
      },

      getInterviewProgress: (interviewId: string) => {
        const { interviews, currentSession } = get();

        const interview =
          interviews.find((i) => i.id.toString() === interviewId) ||
          (currentSession?.interview.id.toString() === interviewId
            ? currentSession.interview
            : null);

        if (!interview) return null;

        return interviewService.calculateInterviewProgress(interview);
      },

      bulkUpdateInterviewStatus: async (interviewIds, status) => {
        set({ isSubmitting: true, error: null });
        try {
          await interviewService.bulkUpdateInterviewStatus(
            interviewIds,
            status
          );

          // Update local state
          const { interviews } = get();
          set({
            interviews: interviews.map((interview) =>
              interviewIds.includes(interview.id.toString())
                ? { ...interview, status }
                : interview
            ),
            isSubmitting: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update interview status",
            isSubmitting: false,
          });
          throw error;
        }
      },

      // Store management
      reset: () => {
        set({
          interviews: [],
          selectedInterview: null,
          currentSession: null,
          roles: [],
          filters: initialFilters,
          isLoading: false,
          isSubmitting: false,
          isSessionActive: false,
          error: null,
        });
      },
    }),
    { name: "interview-store" }
  )
);
