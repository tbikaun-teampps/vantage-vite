import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useInterviewStore } from "@/stores/interview-store";
import { interviewService } from "@/lib/supabase/interview-service";

// Zod schema for interview response
const responseSchema = z.object({
  rating_score: z.number().nullable().optional(),
  role_ids: z.array(z.number()).default([]),
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const interviewId = params.id as string;

  // Get store methods and state
  const {
    currentSession,
    roles,
    isLoading,
    error,
    isSubmitting,
    startInterviewSession,
    startPublicInterviewSession,
    endInterviewSession,
    loadRolesByAssessmentSite,
    updateInterviewResponse,
    createInterviewResponseAction,
    updateInterviewResponseAction,
    deleteInterviewResponseAction,
    navigateToQuestion,
    updateInterview,
    deleteInterview,
    clearError,
  } = useInterviewStore();

  // React Hook Form for current question response
  const form = useForm<ResponseFormData>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      rating_score: null,
      role_ids: [],
    },
  });

  // Local state management
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [tempComments, setTempComments] = useState("");
  const [questionRoles, setQuestionRoles] = useState<any[]>([]);
  const [allQuestionnaireRoles, setAllQuestionnaireRoles] = useState<any[]>([]);
  const [isLoadingQuestionRoles, setIsLoadingQuestionRoles] = useState(false);
  const [isLoadingAllQuestionnaireRoles, setIsLoadingAllQuestionnaireRoles] =
    useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  // Dialog states
  const [dialogs, setDialogs] = useState<DialogState>({
    showComplete: false,
    showSettings: false,
    showExit: false,
    showComments: false,
  });

  // Refs
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate derived state
  const allQuestions = useMemo(
    () =>
      currentSession?.questionnaire_structure?.flatMap((section) =>
        section.steps.flatMap((step) => step.questions)
      ) || [],
    [currentSession?.questionnaire_structure]
  );

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

  // Reset form when current question changes
  useEffect(() => {
    try {
      if (!currentQuestion || !currentSession) {
        return;
      }

      // Find existing response for current question (guaranteed to exist due to optimistic creation)
      const existingResponse = currentSession.interview.responses.find(
        (r) => r.questionnaire_question_id === currentQuestion.id
      );

      // Reset form with existing data (responses always exist, but may have null values)
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
  }, [currentQuestion?.id, currentSession?.interview.responses, form]);

  const totalQuestions = allQuestions.length;
  const answeredQuestions = useMemo(() => {
    if (!currentSession?.interview.responses || !allQuestions.length) return 0;

    // Count questions with valid ratings (responses are guaranteed to exist due to optimistic creation)
    return currentSession.interview.responses.filter((response) => {
      // A question is considered answered if it has a rating score
      // Role validation is handled by individual question validation (isQuestionAnswered)
      return (
        response.rating_score !== null && response.rating_score !== undefined
      );
    }).length;
  }, [currentSession?.interview.responses, allQuestions.length]);

  const progressPercentage =
    totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  // Check and update interview completion status (declared early to avoid hoisting issues)
  const checkAndUpdateInterviewCompletion = useCallback(async () => {
    if (!currentSession) return;

    // Count all questions that have valid responses (responses are guaranteed to exist)
    const validResponsesCount = currentSession.interview.responses.filter(
      (response) =>
        response.rating_score !== null && response.rating_score !== undefined
    ).length;

    const currentStatus = currentSession.interview.status;

    // Determine the correct status based on answered questions
    let newStatus: typeof currentStatus;

    if (validResponsesCount === totalQuestions) {
      newStatus = "completed";
    } else if (validResponsesCount === 0) {
      newStatus = "pending";
    } else {
      newStatus = "in_progress";
    }

    // Only update if status actually needs to change
    if (newStatus !== currentStatus) {
      try {
        await updateInterview(
          currentSession.interview.id.toString(),
          {
            status: newStatus,
          },
          isPublic
        );

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
        // No toast for other transitions (like in_progress -> in_progress)
      } catch (error) {
        console.error("Failed to update interview status:", error);
        toast.error("Failed to update interview status");
      }
    }
  }, [currentSession, totalQuestions, updateInterview, isPublic]);

  // Initialize responses from existing interview responses
  useEffect(() => {
    if (currentSession?.interview.responses) {
      const existingResponses: Record<string, any> = {};
      currentSession.interview.responses.forEach((response) => {
        existingResponses[response.questionnaire_question_id] = {
          id: response.id,
          question_id: response.questionnaire_question_id,
          rating_score: response.rating_score,
          comments: response.comments,
          role_ids:
            response.response_roles
              ?.filter(
                (role) =>
                  role !== null && role !== undefined && role.id !== null
              )
              ?.map((role) => role.id) || [],
        };
      });
      setResponses(existingResponses);
    }
  }, [currentSession?.interview.responses]);

  // Check status whenever responses change (but only after initial load)
  useEffect(() => {
    if (currentSession?.interview.responses && totalQuestions > 0) {
      // Delay slightly to avoid conflicts with save operations
      const timeoutId = setTimeout(() => {
        checkAndUpdateInterviewCompletion();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [
    currentSession?.interview.responses,
    totalQuestions,
    checkAndUpdateInterviewCompletion,
  ]);

  // Initialize session
  useEffect(() => {
    if (!interviewId) return;

    if (isPublic) {
      // For public interviews, validate access first
      const initializePublicSession = async () => {
        try {
          // Get access params
          const code = searchParams.get("code");
          const email = searchParams.get("email");

          if (!code || !email) {
            throw new Error("Missing access credentials");
          }

          // Validate access and load session
          const isValid = await interviewService.validatePublicInterviewAccess(
            interviewId,
            code,
            email
          );
          if (!isValid) {
            throw new Error("Invalid access credentials");
          }

          // Load session using public method
          await startPublicInterviewSession(interviewId, code, email);
        } catch (error) {
          console.error(
            "Failed to initialize public interview session:",
            error
          );
        }
      };

      initializePublicSession();
    } else {
      // Private interview logic
      const initializeSession = async () => {
        try {
          await startInterviewSession(interviewId);
        } catch (error) {
          console.error("Failed to initialize interview session:", error);
        }
      };

      initializeSession();
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      endInterviewSession();
    };
  }, [
    interviewId,
    isPublic,
    startInterviewSession,
    startPublicInterviewSession,
    endInterviewSession,
    searchParams,
  ]);

  // Initialize URL with first question if no question parameter is present
  useEffect(() => {
    const questionIdParam = searchParams.get("question");
    if (!questionIdParam && allQuestions.length > 0) {
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
  }, [searchParams, allQuestions, interviewId, navigate, isPublic]);

  // Load roles specific to the current question
  useEffect(() => {
    if (isPublic) return; // No role selection on public interviews.

    const loadQuestionRoles = async () => {
      if (!currentQuestion || !currentSession?.interview.assessment_id) {
        setQuestionRoles([]);
        return;
      }

      setIsLoadingQuestionRoles(true);
      try {
        const roles = await interviewService.getRolesIntersectionForQuestion(
          currentSession.interview.assessment_id.toString(),
          currentQuestion.id.toString()
        );
        setQuestionRoles(roles);
      } catch (error) {
        console.error("Failed to load question roles:", error);
        setQuestionRoles([]);
      } finally {
        setIsLoadingQuestionRoles(false);
      }
    };

    loadQuestionRoles();
  }, [
    currentQuestion?.id,
    currentSession?.interview.assessment_id,
    currentQuestion,
    isPublic
  ]);

  // Load all roles for the questionnaire
  useEffect(() => {
    if (isPublic) return; // No role selection on public interviews.
    const loadAllQuestionnaireRoles = async () => {
      if (!currentSession?.interview.assessment_id) {
        setAllQuestionnaireRoles([]);
        return;
      }

      setIsLoadingAllQuestionnaireRoles(true);
      try {
        const questionnaireId =
          await interviewService.getQuestionnaireIdForAssessment(
            currentSession.interview.assessment_id.toString()
          );

        if (!questionnaireId) {
          console.warn("Could not determine questionnaire ID from assessment");
          setAllQuestionnaireRoles([]);
          return;
        }

        const roles = await interviewService.getAllRolesForQuestionnaire(
          currentSession.interview.assessment_id.toString()
        );
        setAllQuestionnaireRoles(roles);
      } catch (error) {
        console.error("Failed to load all questionnaire roles:", error);
        setAllQuestionnaireRoles([]);
      } finally {
        setIsLoadingAllQuestionnaireRoles(false);
      }
    };

    loadAllQuestionnaireRoles();
  }, [currentSession?.interview.assessment_id, isPublic]);

  // Load assessment-specific roles
  useEffect(() => {
    if (isPublic) return; // No role selection on public interviews.
    if (currentSession?.interview.assessment_id && roles.length === 0) {
      loadRolesByAssessmentSite(
        currentSession.interview.assessment_id.toString()
      );
    }
  }, [
    currentSession?.interview.assessment_id,
    loadRolesByAssessmentSite,
    roles.length,
    isPublic
  ]);

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

  // Response management functions
  const updateResponse = useCallback(
    (field: string, value: any) => {
      if (!currentQuestion) return;

      setResponses((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          ...prev[currentQuestion.id],
          question_id: currentQuestion.id,
          [field]: value,
        },
      }));
    },
    [currentQuestion]
  );

  // Validation
  const validateResponse = useCallback(() => {
    if (!currentQuestion) return false;

    const currentResponse = responses[currentQuestion.id];

    if (!currentResponse?.rating_score) {
      toast.error("Please select a rating before saving");
      return false;
    }

    if (
      questionRoles.length > 0 &&
      (!currentResponse?.role_ids || currentResponse.role_ids.length === 0)
    ) {
      toast.error("Please select at least one applicable role");
      return false;
    }

    return true;
  }, [currentQuestion, responses, questionRoles]);

  // Save response using form data - always update since responses are pre-created
  const saveCurrentResponse = useCallback(
    async (data: ResponseFormData) => {
      if (!currentQuestion || !currentSession) return;

      setIsSaving(true);

      try {
        // Find the existing response (guaranteed to exist due to optimistic creation)
        const existingResponse = currentSession.interview.responses.find(
          (r) => r.questionnaire_question_id === currentQuestion.id
        );

        if (!existingResponse) {
          throw new Error(
            "Response not found - interview may not be properly initialized"
          );
        }

        await updateInterviewResponse(existingResponse.id.toString(), {
          rating_score: data.rating_score,
          role_ids: data.role_ids,
        });

        // Reset dirty state after successful save
        form.reset(data);
        toast.success("Response saved");

        // Check and update interview status after successful save
        await checkAndUpdateInterviewCompletion();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to save response"
        );
      } finally {
        setIsSaving(false);
      }
    },
    [
      currentQuestion,
      currentSession,
      updateInterviewResponse,
      form,
      checkAndUpdateInterviewCompletion,
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

          // Also call the store method for any internal state management
          navigateToQuestion(question.id.toString());
        }
      }
    },
    [
      totalQuestions,
      allQuestions,
      searchParams,
      navigate,
      interviewId,
      navigateToQuestion,
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
    if (!currentSession) return;

    try {
      await updateInterview(
        currentSession.interview.id.toString(),
        {
          status: "completed",
        },
        isPublic
      );

      toast.success("Interview completed successfully");
      endInterviewSession();
      navigate(`/assessments/onsite/${currentSession.interview.assessment_id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to complete interview"
      );
    }
  }, [currentSession, updateInterview, endInterviewSession, navigate, isPublic]);

  const handleSettingsSave = useCallback(
    async (updates: { name?: string; status?: string; notes?: string }) => {
      if (!currentSession) return;

      try {
        await updateInterview(currentSession.interview.id.toString(), updates, isPublic);
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
    [currentSession, updateInterview, toggleDialog, isPublic]
  );

  const handleSettingsDelete = useCallback(async () => {
    if (!currentSession) return;

    try {
      await deleteInterview(currentSession.interview.id.toString());
      toast.success("Interview deleted successfully");
      toggleDialog("showSettings", false);
      navigate("/assessments/onsite/interviews");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete interview"
      );
    }
  }, [currentSession, deleteInterview, navigate, toggleDialog]);

  const handleSettingsExport = useCallback(async () => {
    if (!currentSession) return;

    try {
      const dataToExport = {
        interview: currentSession.interview,
        responses: currentSession.interview.responses,
        questionnaire_structure: currentSession.questionnaire_structure,
        progress: currentSession.progress,
        exported_at: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `interview-${currentSession.interview.id}-${
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
  }, [currentSession]);

  const confirmExit = useCallback(() => {
    endInterviewSession();
    if (isPublic) {
      // For public interviews, go to home page
      navigate("/");
    } else {
      // For internal interviews, go to interviews list
      navigate("/assessments/onsite/interviews");
    }
  }, [endInterviewSession, navigate, isPublic]);

  // Action handlers
  const handleAddAction = useCallback(
    async (
      responseId: string,
      action: { title?: string; description: string }
    ) => {
      if (!currentSession) return;

      try {
        await createInterviewResponseAction({
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
    [currentSession, createInterviewResponseAction]
  );

  const handleUpdateAction = useCallback(
    async (
      actionId: string,
      action: { title?: string; description: string }
    ) => {
      try {
        await updateInterviewResponseAction(actionId, {
          title: action.title || undefined,
          description: action.description,
        });
        toast.success("Action updated successfully");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update action"
        );
      }
    },
    [updateInterviewResponseAction]
  );

  const handleDeleteAction = useCallback(
    async (actionId: string) => {
      try {
        await deleteInterviewResponseAction(actionId);
        toast.success("Action deleted successfully");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete action"
        );
      }
    },
    [deleteInterviewResponseAction]
  );

  // Get unique role names for filter
  const availableRoles = useMemo(() => {
    const roleNames = new Set<string>();
    allQuestionnaireRoles.forEach((role) => {
      if (role.shared_role?.name) {
        roleNames.add(role.shared_role.name);
      }
    });
    return Array.from(roleNames).sort();
  }, [allQuestionnaireRoles]);

  return {
    // Session data
    session: {
      current: currentSession,
      isLoading,
      error,
      isSubmitting,
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
    },

    // Form state and responses
    form,
    responses: {
      data: responses,
      currentResponse: responses[currentQuestion?.id] || {},
      updateResponse,
      saveResponse: form.handleSubmit(saveCurrentResponse),
      validateResponse,
      isSaving,
      isDirty: form.formState.isDirty,
    },

    // Roles
    roles: {
      questionRoles,
      allQuestionnaireRoles,
      availableRoles,
      selectedRoles,
      setSelectedRoles,
      isLoadingQuestionRoles,
      isLoadingAllQuestionnaireRoles,
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
      clearError,
      allQuestions,
    },
  };
}
