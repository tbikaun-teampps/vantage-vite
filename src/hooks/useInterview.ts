import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  useInterviewById,
  useInterviewActions,
  useInterviewResponseActions,
  useInterviewResponseActionMutations,
  usePublicInterviewResponseActions,
  useInterviewRolesByAssessment,
} from "@/hooks/useInterviews";
import { useCompanyAwareNavigate } from "./useCompanyAwareNavigate";

// Zod schema for interview response
const responseSchema = z.object({
  rating_score: z.number().nullable().optional(),
  role_ids: z.array(z.number()).optional().default([]),
});

type ResponseFormData = z.infer<typeof responseSchema>;

interface DialogState {
  showComplete: boolean;
  showSettings: boolean;
  showExit: boolean;
  showComments: boolean;
}

export function useInterview(isPublic: boolean = false) {
  const params = useParams();
  const navigate = useCompanyAwareNavigate();
  const [searchParams] = useSearchParams();
  const interviewId = typeof params.id === 'string' ? params.id : '';

  // React Query hooks for server state
  const { data: interviewData, isLoading: isLoadingInterview } = useInterviewById(interviewId || "");
  const { updateInterview, deleteInterview } = useInterviewActions();
  const { updateResponse: updateInterviewResponse } = useInterviewResponseActions();
  
  // Simple local state for public credentials (if needed)
  const [publicAccessCredentials, setPublicAccessCredentials] = useState<{
    interviewId: string;
    accessCode: string;
    email: string;
  } | null>(null);

  // Get roles for assessment (only if not public and we have an assessment)
  const { data: assessmentRoles = [] } = useInterviewRolesByAssessment(
    interviewData?.assessment_id?.toString() || ""
  );

  // Determine which mutation hooks to use based on public/private
  const responseMutations = useInterviewResponseActionMutations(
    publicAccessCredentials || undefined
  );
  
  // Public response actions if needed - always call hook to maintain consistent order
  const publicResponseActions = usePublicInterviewResponseActions(
    publicAccessCredentials?.interviewId || "",
    publicAccessCredentials?.accessCode || "",
    publicAccessCredentials?.email || ""
  );

  // React Hook Form for current question response
  const form = useForm<ResponseFormData>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      rating_score: null,
      role_ids: [],
    },
  });

  // Local UI state
  const [tempComments, setTempComments] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [dialogs, setDialogs] = useState<DialogState>({
    showComplete: false,
    showSettings: false,
    showExit: false,
    showComments: false,
  });

  // Derived loading states from React Query
  const isLoading = isLoadingInterview;
  const isReady = !isLoading;

  // Calculate derived state from interview responses
  const allQuestions = useMemo(() => {
    if (!interviewData?.responses) return [];
    
    // Extract unique questions from responses and sort by order
    const questionMap = new Map();
    interviewData.responses.forEach((response) => {
      if (response.question && !questionMap.has(response.question.id)) {
        questionMap.set(response.question.id, response.question);
      }
    });
    
    return Array.from(questionMap.values()).sort((a, b) => a.order_index - b.order_index);
  }, [interviewData?.responses]);

  // Get current question from URL parameter with validation and fallback
  const currentQuestionIndex = useMemo(() => {
    const questionIdParam = searchParams.get("question");
    if (!questionIdParam || allQuestions.length === 0) {
      return 0; // Default to first question
    }

    const questionId = parseInt(questionIdParam, 10);
    const questionIndex = allQuestions.findIndex((q) => q.id === questionId);

    return questionIndex >= 0 ? questionIndex : 0; // Fallback to first question if not found
  }, [searchParams, allQuestions]);

  const currentQuestion = useMemo(
    () => allQuestions[currentQuestionIndex],
    [allQuestions, currentQuestionIndex]
  );

  // Reset form when current question changes (only when ready)
  useEffect(() => {
    try {
      if (!currentQuestion || !interviewData || !isReady) {
        return;
      }

      // Don't reset if form is currently dirty (user has unsaved changes)
      // This prevents the flash when saving
      if (form.formState.isDirty) {
        return;
      }

      // Find existing response for current question
      const existingResponse = interviewData.responses.find(
        (r) => r.questionnaire_question_id === currentQuestion.id
      );

      // Reset form with existing data
      const formData = {
        rating_score: existingResponse?.rating_score ?? null,
        // For public interviews, role is auto-assigned, so we don't need role_ids
        role_ids: isPublic
          ? []
          : existingResponse?.response_roles
              ?.filter(
                (role) =>
                  role !== null && role !== undefined && role.id !== null
              )
              ?.map((role) => role.id) || [],
      };
      form.reset(formData);
    } catch {
      // Fallback: reset form with empty data
      form.reset({
        rating_score: null,
        role_ids: [],
      });
    }
  }, [
    currentQuestion?.id,
    interviewData?.responses,
    form,
    isReady,
    isPublic,
  ]);

  const totalQuestions = allQuestions.length;

  // Count answered questions based on interview data
  const answeredQuestions = useMemo(() => {
    if (!interviewData?.responses || !allQuestions.length) return 0;

    return interviewData.responses.filter((response) => {
      // Must have rating_score
      const hasRating = response.rating_score !== null && response.rating_score !== undefined;
      
      if (isPublic) {
        // For public interviews, only check rating_score
        return hasRating;
      } else {
        // For private interviews, must have both rating_score AND at least one role
        const hasRoles = response.response_roles && response.response_roles.length > 0;
        return hasRating && hasRoles;
      }
    }).length;
  }, [interviewData?.responses, allQuestions.length, isPublic]);

  const progressPercentage =
    totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  // Check and update interview completion status
  const checkAndUpdateInterviewCompletion = useCallback(async () => {
    if (!interviewData) return;

    const currentStatus = interviewData.status;

    // Determine the correct status based on answered questions
    let newStatus: typeof currentStatus;

    if (answeredQuestions === totalQuestions && totalQuestions > 0) {
      newStatus = "completed";
    } else if (answeredQuestions === 0) {
      newStatus = "pending";
    } else {
      newStatus = "in_progress";
    }

    // Only update if status actually needs to change
    if (newStatus !== currentStatus) {
      try {
        await updateInterview({
          id: interviewData.id.toString(),
          updates: { status: newStatus },
          isPublic,
        });

        // Show toast only for specific meaningful transitions
        if (currentStatus === "pending" && newStatus === "in_progress") {
          toast.success("Interview started");
        } else if (currentStatus === "in_progress" && newStatus === "pending") {
          toast.info("Interview reset to pending");
        } else if (newStatus === "completed") {
          toast.success("Interview completed!");
        } else if (
          currentStatus === "completed" &&
          newStatus === "in_progress"
        ) {
          toast.info("Interview status changed to in progress");
        }
      } catch (error) {
        console.error("Failed to update interview status:", error);
        toast.error("Failed to update interview status");
      }
    }
  }, [interviewData, answeredQuestions, totalQuestions, updateInterview, isPublic]);

  // Check status whenever answered questions change (only when ready)
  useEffect(() => {
    if (isReady && totalQuestions > 0) {
      checkAndUpdateInterviewCompletion();
    }
  }, [
    answeredQuestions, // Only depends on rating changes
    totalQuestions,
    isReady,
    checkAndUpdateInterviewCompletion,
  ]);

  // Initialize public credentials if needed
  useEffect(() => {
    if (!interviewId || !isPublic) return;

    const code = searchParams.get("code");
    const email = searchParams.get("email");

    if (code && email) {
      setPublicAccessCredentials({ 
        interviewId, 
        accessCode: code, 
        email 
      });
    } else if (isPublic) {
      toast.error("Missing access credentials");
    }
  }, [interviewId, isPublic, searchParams]);

  // Initialize URL with first question if no question parameter is present (only when ready)
  useEffect(() => {
    const questionIdParam = searchParams.get("question");
    if (!questionIdParam && allQuestions.length > 0 && isReady) {
      // Navigate to first question to establish clean URL structure
      // Using replace to not add an extra history entry
      const basePath = isPublic
        ? `/external/interview/${interviewId}`
        : `/assessments/onsite/interviews/${interviewId}`;

      // Preserve existing search parameters (especially code and email for public interviews)
      const searchString = searchParams.toString();
      const fullPath = searchString ? `${basePath}?${searchString}` : basePath;

      navigate(fullPath, {
        replace: true,
      });
    }
  }, [
    searchParams,
    allQuestions,
    interviewId,
    navigate,
    isPublic,
    isReady,
  ]);

  // Question-specific roles (using React Query)
  const questionRoles = useMemo(() => {
    if (isPublic || !currentQuestion?.id || !interviewData?.assessment_id) {
      return [];
    }
    
    // For now, return assessment roles. This could be enhanced to filter by question
    return assessmentRoles;
  }, [isPublic, currentQuestion?.id, interviewData?.assessment_id, assessmentRoles]);

  // Dialog management
  const toggleDialog = useCallback(
    (dialog: keyof DialogState, value?: boolean) => {
      setDialogs((prev) => ({
        ...prev,
        [dialog]: value !== undefined ? value : !prev[dialog],
      }));
    },
    []
  );

  // Current response data from interview
  const currentResponse = useMemo(() => {
    if (!currentQuestion || !interviewData) return null;
    
    return interviewData.responses.find(
      (r) => r.questionnaire_question_id === currentQuestion.id
    );
  }, [currentQuestion, interviewData]);

  // Validation based on form data
  const validateResponse = useCallback(() => {
    const data = form.getValues();

    if (!data.rating_score) {
      toast.error("Please select a rating before saving");
      return false;
    }

    if (
      questionRoles.length > 0 &&
      (!data.role_ids || data.role_ids.length === 0)
    ) {
      toast.error("Please select at least one applicable role");
      return false;
    }

    return true;
  }, [form, questionRoles]);

  // Save response using appropriate mutation based on public/private
  const saveCurrentResponse = useCallback(
    async (data: ResponseFormData) => {
      if (!currentQuestion || !currentResponse) return;

      try {
        if (isPublic && publicAccessCredentials) {
          // Use public response actions - only when we have valid credentials
          await publicResponseActions.updateResponse({
            responseId: currentResponse.id.toString(),
            updates: {
              rating_score: data.rating_score,
              role_ids: data.role_ids,
            },
          });
        } else {
          // Use private response actions
          await updateInterviewResponse({
            id: currentResponse.id.toString(),
            updates: {
              rating_score: data.rating_score,
              role_ids: data.role_ids,
            },
          });
        }

        // Reset dirty state after successful save
        form.reset(data);
        toast.success("Response saved");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to save response"
        );
      }
    },
    [
      currentQuestion,
      currentResponse,
      isPublic,
      publicAccessCredentials,
      publicResponseActions,
      updateInterviewResponse,
      form,
    ]
  );

  // Navigation functions
  const goToQuestion = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalQuestions) {
        const question = allQuestions[index];
        if (question) {
          // Update URL with question parameter
          const params = new URLSearchParams(searchParams.toString());
          if (index === 0) {
            // Remove question param for first question to keep URL clean
            params.delete("question");
          } else {
            params.set("question", question.id.toString());
          }

          const queryString = params.toString();
          navigate(
            `${
              isPublic
                ? "/external/interview"
                : "/assessments/onsite/interviews"
            }/${interviewId}${queryString ? `?${queryString}` : ""}`
          );

          // Navigation handled by URL parameter only
        }
      }
    },
    [
      totalQuestions,
      allQuestions,
      searchParams,
      navigate,
      interviewId,
      isPublic,
    ]
  );

  const goToPreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      goToQuestion(currentQuestionIndex - 1);
    }
  }, [currentQuestionIndex, goToQuestion]);

  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < totalQuestions - 1) {
      goToQuestion(currentQuestionIndex + 1);
    }
  }, [currentQuestionIndex, totalQuestions, goToQuestion]);

  // Interview actions
  const confirmComplete = useCallback(async () => {
    if (!interviewData) return;

    try {
      await updateInterview({
        id: interviewData.id.toString(),
        updates: { status: "completed" },
        isPublic,
      });

      toast.success("Interview completed successfully");
      navigate(`/assessments/onsite/${interviewData.assessment_id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to complete interview"
      );
    }
  }, [
    interviewData,
    updateInterview,
    navigate,
    isPublic,
  ]);

  const handleSettingsSave = useCallback(
    async (updates: { name?: string; status?: string; notes?: string }) => {
      if (!interviewData) return;

      try {
        await updateInterview({
          id: interviewData.id.toString(),
          updates,
          isPublic,
        });
        toast.success("Interview settings updated successfully");
        toggleDialog("showSettings", false);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to update interview settings"
        );
      }
    },
    [interviewData, updateInterview, toggleDialog, isPublic]
  );

  const handleSettingsDelete = useCallback(async () => {
    if (!interviewData) return;

    try {
      await deleteInterview(interviewData.id.toString());
      toast.success("Interview deleted successfully");
      toggleDialog("showSettings", false);
      navigate("/assessments/onsite/interviews");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete interview"
      );
    }
  }, [interviewData, deleteInterview, navigate, toggleDialog]);

  const handleSettingsExport = useCallback(async () => {
    if (!interviewData) return;

    try {
      const dataToExport = {
        interview: interviewData,
        responses: interviewData.responses,
        progress: {
          total_questions: totalQuestions,
          answered_questions: answeredQuestions,
          completion_percentage: progressPercentage,
        },
        exported_at: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `interview-${interviewData.id}-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Interview data exported successfully");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to export interview data"
      );
    }
  }, [interviewData, totalQuestions, answeredQuestions, progressPercentage]);

  const confirmExit = useCallback(() => {
    if (isPublic) {
      // For public interviews, go to home page
      navigate("/");
    } else {
      // For internal interviews, go to interviews list
      navigate("/assessments/onsite/interviews");
    }
  }, [navigate, isPublic]);

  // Action handlers
  const handleAddAction = useCallback(
    async (
      responseId: string,
      action: { title?: string; description: string }
    ) => {
      try {
        await responseMutations.createAction({
          interview_response_id: responseId,
          title: action.title || undefined,
          description: action.description,
        });
        toast.success("Action added successfully");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to add action"
        );
      }
    },
    [responseMutations]
  );

  const handleUpdateAction = useCallback(
    async (
      actionId: string,
      action: { title?: string; description: string }
    ) => {
      try {
        await responseMutations.updateAction({
          id: actionId,
          updates: {
            title: action.title || undefined,
            description: action.description,
          },
        });
        toast.success("Action updated successfully");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update action"
        );
      }
    },
    [responseMutations]
  );

  const handleDeleteAction = useCallback(
    async (actionId: string) => {
      try {
        await responseMutations.deleteAction(actionId);
        toast.success("Action deleted successfully");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete action"
        );
      }
    },
    [responseMutations]
  );

  // Get unique role names for filter  
  const availableRoles = useMemo(() => {
    const roleNames = new Set<string>();
    assessmentRoles.forEach((role) => {
      if (role.shared_role?.name) {
        roleNames.add(role.shared_role.name);
      }
    });
    return Array.from(roleNames).sort();
  }, [assessmentRoles]);

  return {
    // Interview data - using React Query states
    interview: {
      data: interviewData,
      isLoading,
      error: null, // React Query handles errors automatically
      isSubmitting: false,
      isReady,
    },

    // Navigation
    navigation: {
      currentQuestionIndex,
      currentQuestion,
      totalQuestions,
      answeredQuestions,
      progressPercentage,
      isFirstQuestion,
      isLastQuestion,
      goToNext: goToNextQuestion,
      goToPrevious: goToPreviousQuestion,
      goToQuestion,
      allQuestions,
    },

    // Form state and responses - simplified
    form,
    responses: {
      currentResponse,
      saveResponse: form.handleSubmit(saveCurrentResponse as any),
      validateResponse,
      isSaving: false, // React Query provides loading states via mutations
      isDirty: form.formState.isDirty,
    },

    // Roles - now using React Query data
    roles: {
      questionRoles,
      allQuestionnaireRoles: assessmentRoles,
      availableRoles,
      selectedRoles,
      setSelectedRoles,
      isLoading: false, // Handled by React Query
    },

    // Interview actions
    actions: {
      complete: confirmComplete,
      updateSettings: handleSettingsSave,
      delete: handleSettingsDelete,
      export: handleSettingsExport,
      exit: confirmExit,
      addAction: handleAddAction,
      updateAction: handleUpdateAction,
      deleteAction: handleDeleteAction,
    },

    // UI state
    ui: {
      dialogs,
      toggleDialog,
      tempComments,
      setTempComments,
    },

    // Utilities
    utils: {
      allQuestions,
    },
  };
}
