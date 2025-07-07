import { useEffect, useState } from "react";
import {
  useParams,
  useNavigate,
  Link,
  useSearchParams,
} from "react-router-dom";
import {
  IconDeviceFloppy,
  IconAlertCircle,
  IconPlus,
  IconEdit,
  IconTrash,
  IconClipboardList,
  IconInfoCircle,
  IconCircle,
  IconCircleCheckFilled,
  IconGripVertical,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useInterviewStore } from "@/stores/interview-store";
import { DashboardPage } from "@/components/dashboard-page";
import { interviewService } from "@/lib/supabase/interview-service";
import { QuestionTreeNavigation } from "./components/question-tree-navigation";
import { InterviewTabSwitcher } from "./components/interview-tab-switcher";
import { InterviewSettings } from "./components/interview-settings";

export default function InterviewPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const interviewId = params.id as string;

  const {
    currentSession,
    roles,
    isLoading,
    isSubmitting,
    error,
    startInterviewSession,
    endInterviewSession,
    loadRolesByAssessmentSite,
    createInterviewResponse,
    updateInterviewResponse,
    createInterviewResponseAction,
    updateInterviewResponseAction,
    deleteInterviewResponseAction,
    navigateToQuestion,
    updateInterview,
    clearError,
  } = useInterviewStore();

  // Tab management
  const tabParam = searchParams.get("tab");
  const activeTab = ["settings", "responses"].includes(tabParam || "")
    ? tabParam!
    : "responses"; // Default to responses

  const handleTabChange = (newTab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newTab === "responses") {
      params.delete("tab"); // Default tab, no need in URL
    } else {
      params.set("tab", newTab);
    }
    const queryString = params.toString();
    navigate(
      `/assessments/onsite/interviews/${interviewId}${
        queryString ? `?${queryString}` : ""
      }`
    );
  };

  // State management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingAction, setEditingAction] = useState<any>(null);
  const [actionForm, setActionForm] = useState({ title: "", description: "" });
  const [targetResponseId, setTargetResponseId] = useState<string | null>(null);
  const [interviewName, setInterviewName] = useState("");
  const [originalInterviewName, setOriginalInterviewName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [questionRoles, setQuestionRoles] = useState<any[]>([]);
  const [isLoadingQuestionRoles, setIsLoadingQuestionRoles] = useState(false);
  const [allQuestionnaireRoles, setAllQuestionnaireRoles] = useState<any[]>([]);
  const [isLoadingAllQuestionnaireRoles, setIsLoadingAllQuestionnaireRoles] =
    useState(false);

  // Panel resizing
  const [leftPanelWidth, setLeftPanelWidth] = useState(40);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate interview progress
  const allQuestions =
    currentSession?.questionnaire_structure?.flatMap((section) =>
      section.steps.flatMap((step) => step.questions)
    ) || [];

  const currentQuestion = allQuestions[currentQuestionIndex];
  const totalQuestions = allQuestions.length;
  const answeredQuestions = currentSession?.interview.responses.length || 0;
  const progressPercentage =
    totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

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
          role_ids: response.response_roles?.map((role) => role.id) || [],
        };
      });
      setResponses(existingResponses);
    }
  }, [currentSession?.interview.responses]);

  // Initialize session
  useEffect(() => {
    const initialiseSession = async () => {
      try {
        await startInterviewSession(interviewId);
        if (currentSession?.interview.assessment_id) {
          await loadRolesByAssessmentSite(
            currentSession.interview.assessment_id.toString()
          );
        }
      } catch (error) {
        console.error("Failed to initialise interview session:", error);
      }
    };

    initialiseSession();

    return () => {
      endInterviewSession();
    };
  }, [
    interviewId,
    startInterviewSession,
    endInterviewSession,
    loadRolesByAssessmentSite,
  ]);

  // Load all roles for the questionnaire
  useEffect(() => {
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
          currentSession.interview.assessment_id.toString(),
          questionnaireId
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
  }, [currentSession?.interview.assessment_id]);

  // Load assessment-specific roles
  useEffect(() => {
    if (currentSession?.interview.assessment_id && roles.length === 0) {
      loadRolesByAssessmentSite(
        currentSession.interview.assessment_id.toString()
      );
    }
  }, [
    currentSession?.interview.assessment_id,
    loadRolesByAssessmentSite,
    roles.length,
  ]);

  // Load roles specific to the current question
  useEffect(() => {
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
  }, [currentQuestion?.id, currentSession?.interview.assessment_id]);

  // Initialize interview name
  useEffect(() => {
    if (currentSession?.interview.name) {
      setInterviewName(currentSession.interview.name);
      setOriginalInterviewName(currentSession.interview.name);
    }
  }, [currentSession?.interview.name]);

  // Drag handlers for panel resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const container = document.querySelector(
      "[data-resize-container]"
    ) as HTMLElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const newLeftWidth =
      ((e.clientX - containerRect.left) / containerRect.width) * 100;

    const constrainedWidth = Math.min(Math.max(newLeftWidth, 25), 65);
    setLeftPanelWidth(constrainedWidth);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging]);

  // Event handlers
  const handleBack = () => {
    setShowExitDialog(true);
  };

  const confirmExit = () => {
    endInterviewSession();
    navigate('/assessments/onsite/interviews');
  };

  const updateResponse = (field: string, value: any) => {
    if (!currentQuestion) return;

    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        question_id: currentQuestion.id,
        [field]: value,
      },
    }));
  };

  const handleRatingChange = (rating: string) => {
    const ratingValue = parseInt(rating);
    const currentResponse = responses[currentQuestion?.id || ""];

    if (currentResponse?.rating_score === ratingValue) {
      updateResponse("rating_score", null);
    } else {
      updateResponse("rating_score", ratingValue);
    }
  };

  const handleCommentsChange = (comments: string) => {
    updateResponse("comments", comments);
  };

  const handleRoleToggle = (roleId: number) => {
    if (!currentQuestion) return;

    const currentRoles = responses[currentQuestion.id]?.role_ids || [];
    const newRoles = currentRoles.includes(roleId)
      ? currentRoles.filter((id: number) => id !== roleId)
      : [...currentRoles, roleId];
    updateResponse("role_ids", newRoles);
  };

  const validateResponse = () => {
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
  };

  const saveCurrentResponse = async () => {
    if (!currentQuestion || !currentSession) return;

    if (!validateResponse()) return;

    const currentResponse = responses[currentQuestion.id];

    try {
      const existingResponse = currentSession.interview.responses.find(
        (r) => r.questionnaire_question_id === currentQuestion.id
      );

      if (existingResponse) {
        await updateInterviewResponse(existingResponse.id.toString(), {
          rating_score: currentResponse.rating_score,
          comments: currentResponse.comments,
          role_ids: currentResponse.role_ids,
        });
      } else {
        await createInterviewResponse({
          interview_id: currentSession.interview.id.toString(),
          questionnaire_question_id: currentQuestion.id.toString(),
          rating_score: currentResponse.rating_score,
          comments: currentResponse.comments,
          role_ids: currentResponse.role_ids,
          company_id: currentSession.interview.company.id.toString(),
        });
      }

      toast.success("Response saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save response"
      );
    }
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestionIndex(index);
      const question = allQuestions[index];
      if (question) {
        navigateToQuestion(question.id.toString());
      }
    }
  };

  const completeInterview = () => {
    if (!currentSession) return;

    if (answeredQuestions < totalQuestions) {
      setShowCompleteDialog(true);
    } else {
      confirmComplete();
    }
  };

  const confirmComplete = async () => {
    if (!currentSession) return;

    try {
      await useInterviewStore
        .getState()
        .updateInterview(currentSession.interview.id.toString(), {
          status: "completed",
        });

      toast.success("Interview completed successfully");
      endInterviewSession();
      navigate(`/assessments/onsite/${currentSession.interview.assessment_id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to complete interview"
      );
    }
  };

  const openActionDialog = (responseId: string, action?: any) => {
    setTargetResponseId(responseId);
    setEditingAction(action);
    setActionForm({
      title: action?.title || "",
      description: action?.description || "",
    });
    setShowActionDialog(true);
  };

  const closeActionDialog = () => {
    setShowActionDialog(false);
    setEditingAction(null);
    setTargetResponseId(null);
    setActionForm({ title: "", description: "" });
  };

  const handleActionSubmit = async () => {
    if (!targetResponseId || !actionForm.description.trim()) {
      toast.error("Please provide a description for the action");
      return;
    }

    try {
      if (editingAction) {
        await updateInterviewResponseAction(editingAction.id.toString(), {
          title: actionForm.title.trim() || undefined,
          description: actionForm.description.trim(),
        });
        toast.success("Action updated successfully");
      } else {
        await createInterviewResponseAction({
          interview_response_id: targetResponseId,
          title: actionForm.title.trim() || undefined,
          description: actionForm.description.trim(),
          company_id: currentSession!.interview.company.id.toString(),
        });
        toast.success("Action created successfully");
      }
      closeActionDialog();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save action"
      );
    }
  };

  const handleDeleteAction = async (actionId: string) => {
    try {
      await deleteInterviewResponseAction(actionId);
      toast.success("Action deleted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete action"
      );
    }
  };

  const saveInterviewSettings = async (updates: {
    name?: string;
    status?: string;
    notes?: string;
  }) => {
    if (!currentSession) {
      toast.error("No active interview session");
      return;
    }

    setIsSavingName(true);
    try {
      await updateInterview(currentSession.interview.id.toString(), updates);

      // Update local state if name was changed
      if (updates.name) {
        setInterviewName(updates.name);
        setOriginalInterviewName(updates.name);
      }

      toast.success("Interview updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update interview"
      );
    } finally {
      setIsSavingName(false);
    }
  };

  const handleDeleteInterview = () => {
    setShowDeleteDialog(true);
  };

  const confirmDeleteInterview = async () => {
    if (!currentSession) return;

    try {
      // Note: You'll need to implement deleteInterview in the store
      // await deleteInterview(currentSession.interview.id.toString());
      toast.success("Interview deleted successfully");
      endInterviewSession();
      navigate(`/assessments/onsite/${currentSession.interview.assessment_id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete interview"
      );
    }
  };

  // Loading state
  if (isLoading || !currentSession) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => clearError()}>Try Again</Button>
      </div>
    );
  }

  const currentResponse = responses[currentQuestion?.id] || {};

  // Find current section
  let currentSection = null;
  let sectionQuestionIndex = 0;
  for (const section of currentSession.questionnaire_structure) {
    const sectionQuestions = section.steps.flatMap((step) => step.questions);
    if (sectionQuestionIndex + sectionQuestions.length > currentQuestionIndex) {
      currentSection = section;
      break;
    }
    sectionQuestionIndex += sectionQuestions.length;
  }

  const renderResponsesTab = () => (
    <div className="flex flex-1 min-h-0 pb-4" data-resize-container>
      {/* Left Column: Question Navigation Sidebar */}
      <div
        className="min-h-0 flex-shrink-0"
        style={{ width: `${leftPanelWidth}%` }}
      >
        <QuestionTreeNavigation
          questionnaireStructure={currentSession.questionnaire_structure}
          currentQuestionIndex={currentQuestionIndex}
          responses={responses}
          allQuestionnaireRoles={allQuestionnaireRoles}
          onQuestionSelect={goToQuestion}
          answeredQuestions={answeredQuestions}
          totalQuestions={totalQuestions}
          progressPercentage={progressPercentage}
          onCompleteInterview={completeInterview}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* Resize Handle */}
      <div
        className={`relative w-px mx-3 hover:w-2 bg-border hover:bg-blue-500 dark:hover:bg-blue-400 cursor-col-resize flex-shrink-0 transition-all duration-200 group ${
          isDragging ? "w-2 bg-blue-500 dark:bg-blue-400" : ""
        }`}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200">
          <div className="bg-background dark:bg-background border border-border dark:border-border rounded-sm p-1 shadow-sm">
            <IconGripVertical className="h-3 w-3 text-muted-foreground dark:text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Right Column: Main Question Area */}
      <div className="flex-1 min-h-0">
        <div data-tour="interview-question" className="h-full flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </CardTitle>
                <CardDescription>{currentSection?.title}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {(() => {
                  const existingResponse =
                    currentSession.interview.responses.find(
                      (r) => r.questionnaire_question_id === currentQuestion.id
                    );
                  const actionsCount = existingResponse?.actions?.length || 0;

                  return (
                    <>
                      {actionsCount > 0 && (
                        <Badge
                          variant="outline"
                          className="text-blue-600 border-blue-200"
                        >
                          {actionsCount} Action
                          {actionsCount !== 1 ? "s" : ""}
                        </Badge>
                      )}
                      <Badge
                        variant={
                          currentResponse.rating_score ? "default" : "secondary"
                        }
                        className={
                          currentResponse.rating_score
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : ""
                        }
                      >
                        {currentResponse.rating_score ? "Answered" : "Pending"}
                      </Badge>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span tabIndex={0}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={saveCurrentResponse}
                              disabled={
                                isSubmitting ||
                                !currentResponse.rating_score ||
                                (questionRoles.length > 0 &&
                                  !currentResponse.role_ids?.length)
                              }
                            >
                              <IconDeviceFloppy className="mr-1 h-3 w-3" />
                              Save Response
                            </Button>
                          </span>
                        </TooltipTrigger>
                        {(!currentResponse.rating_score ||
                          (questionRoles.length > 0 &&
                            !currentResponse.role_ids?.length)) && (
                          <TooltipContent>
                            <div className="space-y-1">
                              {!currentResponse.rating_score && (
                                <p>• Select a rating score</p>
                              )}
                              {questionRoles.length > 0 &&
                                !currentResponse.role_ids?.length && (
                                  <p>• Select applicable role(s)</p>
                                )}
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </>
                  );
                })()}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 flex-1 min-h-0 overflow-y-auto">
            {/* Question Text */}
            <div className="space-y-2">
              <h3 className="font-semibold">{currentQuestion.title}</h3>
              {currentQuestion.context && (
                <div className="text-sm text-muted-foreground italic border-l-2 border-muted pl-3 whitespace-pre-wrap">
                  {currentQuestion.context}
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap">
                {currentQuestion.question_text}
              </p>
            </div>

            {/* Response Requirements Alert */}
            {(!currentResponse.rating_score ||
              (questionRoles.length > 0 &&
                !currentResponse.role_ids?.length)) && (
              <Alert>
                <IconInfoCircle className="h-4 w-4" />
                <AlertTitle>Complete Your Response</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">
                    To save this response and add follow-up actions:
                  </p>
                  <ul className="space-y-1">
                    {!currentResponse.rating_score && (
                      <li className="flex items-center gap-2">
                        <IconCircle className="h-3 w-3 text-muted-foreground" />
                        <span>Select a rating score</span>
                      </li>
                    )}
                    {questionRoles.length > 0 &&
                      !currentResponse.role_ids?.length && (
                        <li className="flex items-center gap-2">
                          <IconCircle className="h-3 w-3 text-muted-foreground" />
                          <span>Select at least one applicable role</span>
                        </li>
                      )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <Separator />

            {/* Rating */}
            <div className="space-y-3" data-tour="interview-rating">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold">Rating *</Label>
                {currentResponse.rating_score && (
                  <IconCircleCheckFilled className="h-4 w-4 text-green-600" />
                )}
              </div>
              <div className="space-y-2">
                {currentQuestion.rating_scales
                  .sort((a, b) => a.value - b.value)
                  .map((rating) => {
                    const isSelected =
                      currentResponse.rating_score === rating.value;
                    return (
                      <Button
                        key={rating.id}
                        variant={isSelected ? "default" : "outline"}
                        onClick={() =>
                          handleRatingChange(rating.value.toString())
                        }
                        className="w-full h-auto p-4 justify-start text-left"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="text-lg font-bold flex-shrink-0">
                            {rating.value}
                          </div>
                          <div className="font-bold flex-shrink-0">
                            {rating.name}
                          </div>
                          <div className="text-sm flex-1">
                            {rating.description || "No description"}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-2" data-tour="interview-comments">
              <Label htmlFor="comments" className="text-base font-semibold">
                Comments & Evidence
              </Label>
              <Textarea
                id="comments"
                placeholder="Provide specific examples and evidence to support your rating..."
                value={currentResponse.comments || ""}
                onChange={(e) => handleCommentsChange(e.target.value)}
                rows={4}
              />
            </div>

            {/* Applicable Roles */}
            <div className="space-y-3" data-tour="interview-roles">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-semibold">
                    Applicable Roles *
                  </Label>
                  {questionRoles.length > 0 &&
                    currentResponse.role_ids?.length > 0 && (
                      <IconCircleCheckFilled className="h-4 w-4 text-green-600" />
                    )}
                </div>
                {questionRoles.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const allRoleIds = questionRoles.map((role) => role.id);
                      const currentRoles = currentResponse.role_ids || [];
                      const allSelected = allRoleIds.every((id) =>
                        currentRoles.includes(id)
                      );

                      if (allSelected) {
                        updateResponse("role_ids", []);
                      } else {
                        updateResponse("role_ids", allRoleIds);
                      }
                    }}
                  >
                    {(() => {
                      const allRoleIds = questionRoles.map((role) => role.id);
                      const currentRoles = currentResponse.role_ids || [];
                      const allSelected = allRoleIds.every((id) =>
                        currentRoles.includes(id)
                      );
                      return allSelected ? "Deselect All" : "Select All";
                    })()}
                  </Button>
                )}
              </div>

              {isLoadingQuestionRoles ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : questionRoles.length === 0 ? (
                <Alert variant="destructive">
                  <IconAlertCircle className="h-4 w-4" />
                  <AlertTitle>No Applicable Roles</AlertTitle>
                  <AlertDescription>
                    No roles are available for this question. This may be
                    because:
                    <ul className="mt-2 list-disc list-inside space-y-1">
                      <li>The question has no configured roles</li>
                      <li>
                        There are no roles defined for this assessment site
                      </li>
                      <li>
                        The intersection of question roles and site roles is
                        empty
                      </li>
                    </ul>
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    // Group roles by org chart
                    const groupedRoles = questionRoles.reduce((acc, role) => {
                      const orgChartName =
                        role.org_chart?.name || "Unknown Org Chart";
                      if (!acc[orgChartName]) {
                        acc[orgChartName] = [];
                      }
                      acc[orgChartName].push(role);
                      return acc;
                    }, {} as Record<string, typeof questionRoles>);

                    return Object.entries(groupedRoles).map(
                      ([orgChartName, orgRoles]) => (
                        <div key={orgChartName} className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">
                            Org Chart: {orgChartName}
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {(orgRoles as typeof questionRoles).map((role) => {
                              const isSelected =
                                currentResponse.role_ids?.includes(role.id) ||
                                false;
                              return (
                                <Button
                                  key={role.id}
                                  variant={isSelected ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleRoleToggle(role.id)}
                                  className="justify-start h-auto p-3"
                                >
                                  <div className="text-left py-1 w-full">
                                    <div className="font-medium leading-tight break-words">
                                      {role.shared_role?.name}
                                    </div>
                                    <div className="text-xs opacity-75 mt-1 break-words whitespace-normal">
                                      {role.shared_role?.description ||
                                        role.level ||
                                        "No description"}
                                    </div>
                                  </div>
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      )
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Actions*/}
            <div className="space-y-3" data-tour="interview-actions">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Follow-up Actions
                </Label>
                {currentSession.interview.responses.find(
                  (r) => r.questionnaire_question_id === currentQuestion.id
                ) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const existingResponse =
                        currentSession.interview.responses.find(
                          (r) =>
                            r.questionnaire_question_id === currentQuestion.id
                        );
                      if (existingResponse) {
                        openActionDialog(existingResponse.id.toString());
                      }
                    }}
                  >
                    <IconPlus className="h-4 w-4 mr-2" />
                    Add Action
                  </Button>
                )}
              </div>
              {(() => {
                const existingResponse =
                  currentSession.interview.responses.find(
                    (r) => r.questionnaire_question_id === currentQuestion.id
                  );
                return !existingResponse ? (
                  <Alert>
                    <IconAlertCircle className="h-4 w-4" />
                    <AlertTitle>Save your response first</AlertTitle>
                    <AlertDescription>
                      <p className="mb-2">
                        You need to complete and save your response before
                        adding follow-up actions.
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <div className="flex items-center gap-2">
                          {currentResponse.rating_score ? (
                            <IconCircleCheckFilled className="h-4 w-4 text-green-600" />
                          ) : (
                            <IconCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span
                            className={
                              currentResponse.rating_score
                                ? "text-green-600"
                                : ""
                            }
                          >
                            Rating selected
                          </span>
                        </div>
                        {questionRoles.length > 0 && (
                          <div className="flex items-center gap-2">
                            {currentResponse.role_ids?.length ? (
                              <IconCircleCheckFilled className="h-4 w-4 text-green-600" />
                            ) : (
                              <IconCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span
                              className={
                                currentResponse.role_ids?.length
                                  ? "text-green-600"
                                  : ""
                              }
                            >
                              Role(s) selected
                            </span>
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : existingResponse.actions &&
                  existingResponse.actions.length > 0 ? (
                  <div className="space-y-2">
                    {existingResponse.actions.map((action) => (
                      <Card key={action.id} className="p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            {action.title && (
                              <h4 className="font-medium text-sm truncate">
                                {action.title}
                              </h4>
                            )}
                            <p className="text-sm text-muted-foreground mt-1">
                              {action.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Created{" "}
                              {new Date(action.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                openActionDialog(
                                  existingResponse.id.toString(),
                                  action
                                )
                              }
                            >
                              <IconEdit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleDeleteAction(action.id.toString())
                              }
                            >
                              <IconTrash className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <IconClipboardList className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No actions yet</p>
                  </div>
                );
              })()}
            </div>
          </CardContent>
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="max-w-7xl mx-auto p-6">
      <h2>Interview Settings Coming Soon</h2>
      {/* <InterviewSettings
        currentInterview={currentSession.interview}
        // onSave={saveInterviewName}
        isSaving={isSavingName}
      /> */}
    </div>
  );

  return (
    <DashboardPage
      title={
        interviewName || currentSession.interview.name || "Interview Session"
      }
      description={
        <span>
          <Link
            to={`/assessments/onsite/${currentSession.interview.assessment_id}`}
            className="text-primary hover:text-primary/80 underline"
          >
            {currentSession.interview.assessment?.name || "Assessment"}
          </Link>
          {" • Interviewer: "}
          {currentSession.interview.interviewer?.name || "Unknown"}
        </span>
      }
      onBack={handleBack}
      showBack
      headerActions={
        <InterviewTabSwitcher
          activeTab={activeTab}
          onTabChange={handleTabChange}
          answeredQuestions={answeredQuestions}
          totalQuestions={totalQuestions}
          progressPercentage={progressPercentage}
        />
      }
    >
      <div
        className="flex flex-1 mx-auto h-full px-6"
        data-tour="interview-main"
      >
        {activeTab === "responses" ? renderResponsesTab() : renderSettingsTab()}
      </div>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="z-[9999]">
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Interview Session?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave? Your progress will be saved and
              you can continue later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={confirmExit}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Interview Dialog */}
      <AlertDialog
        open={showCompleteDialog}
        onOpenChange={setShowCompleteDialog}
      >
        <AlertDialogContent className="z-[9999]">
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Interview?</AlertDialogTitle>
            <AlertDialogDescription>
              You have only answered {answeredQuestions} of {totalQuestions}{" "}
              questions. Are you sure you want to complete the interview? You
              can always come back to finish the remaining questions later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Interview</AlertDialogCancel>
            <AlertDialogAction onClick={confirmComplete}>
              Complete Interview
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="max-w-lg z-[9999]">
          <DialogHeader>
            <DialogTitle>
              {editingAction ? "Edit Action" : "Add Action"}
            </DialogTitle>
            <DialogDescription>
              {editingAction
                ? "Update the follow-up action for this response."
                : "Add a follow-up action for this response."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="action-title">Title (Optional)</Label>
              <Input
                id="action-title"
                placeholder="e.g., Follow up on safety training"
                value={actionForm.title}
                onChange={(e) =>
                  setActionForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="action-description">Description *</Label>
              <Textarea
                id="action-description"
                placeholder="Describe the action that needs to be taken..."
                value={actionForm.description}
                onChange={(e) =>
                  setActionForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeActionDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleActionSubmit}
              disabled={!actionForm.description.trim()}
            >
              {editingAction ? "Update Action" : "Add Action"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPage>
  );
}
