import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuestionnaireStore } from "@/stores/questionnaire-store";
import SettingsForm from "../components/settings-form";
import RatingsForm from "../components/ratings-form";
import FormEditor from "../components/form-editor";
import AddRatingDialog from "../components/add-rating-dialog";
import AddSectionDialog from "../components/add-section-dialog";
import QuestionnaireTemplateDialog from "../components/questionnaire-template-dialog";
import {
  IconCopy,
  IconDeviceFloppy,
  IconTrash,
  IconAlertCircle,
  IconCircleCheckFilled,
  IconPencil,
  IconUsersGroup,
  IconArchive,
  IconCheck,
  IconPlus,
  IconTemplate,
  IconMaximize,
  IconMinimize,
} from "@tabler/icons-react";
import { DashboardPage } from "@/components/dashboard-page";
import { Badge } from "@/components/ui/badge";
import { IconAlertCircle as IconAlert } from "@tabler/icons-react";
import { toast } from "sonner";

export function QuestionnaireDetailsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const questionnaireId = params.id as string;

  const {
    selectedQuestionnaire,
    isLoading,
    error,
    loadQuestionnaireById,
    loadSharedRoles,
    updateQuestionnaire,
    duplicateQuestionnaire,
    deleteQuestionnaire,
    clearError,
  } = useQuestionnaireStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [localQuestionnaire, setLocalQuestionnaire] = useState(
    selectedQuestionnaire
  );
  const [showAddRatingDialog, setShowAddRatingDialog] = useState(false);
  const [showAddSectionDialog, setShowAddSectionDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  // Update local questionnaire when selectedQuestionnaire changes from server
  useEffect(() => {
    if (selectedQuestionnaire) {
      setLocalQuestionnaire(selectedQuestionnaire);
      setHasUnsavedChanges(false);
    }
  }, [selectedQuestionnaire?.id, selectedQuestionnaire?.updated_at]);

  // Load questionnaire data
  useEffect(() => {
    const initializeData = async () => {
      if (!questionnaireId) return;

      try {
        await loadQuestionnaireById(questionnaireId);
        await loadSharedRoles();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load questionnaire. Please try refreshing the page."
        );
      }
    };

    initializeData();
  }, [questionnaireId, loadQuestionnaireById, loadSharedRoles]);

  // Fullscreen functionality
  const toggleFullscreen = async () => {
    try {
      if (!pageRef.current) return;

      if (!document.fullscreenElement) {
        await pageRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Redirect if questionnaire not found after loading - add delay to prevent race condition
  useEffect(() => {
    // Only redirect if we've actually attempted to load and failed
    if (!isLoading && !selectedQuestionnaire && !error && questionnaireId) {
      // Add a small delay to ensure the store has time to update
      const timeoutId = setTimeout(() => {
        // Double-check the questionnaire still isn't loaded
        const currentQuestionnaire =
          useQuestionnaireStore.getState().selectedQuestionnaire;
        if (
          !currentQuestionnaire ||
          currentQuestionnaire.id !== questionnaireId
        ) {
          navigate("/assessments/onsite/questionnaires");
        }
      }, 1000); // 1 second delay to prevent premature redirects

      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, selectedQuestionnaire, error, navigate, questionnaireId]);

  const handleQuestionnaireFieldChange = (field: string, value: string) => {
    if (!localQuestionnaire) return;

    setLocalQuestionnaire((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleDuplicateQuestionnaire = async () => {
    if (!selectedQuestionnaire) return;

    setIsProcessing(true);
    try {
      const duplicatedQuestionnaire = await duplicateQuestionnaire(
        selectedQuestionnaire.id
      );
      navigate(
        `/assessments/onsite/questionnaires/${duplicatedQuestionnaire.id}`
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to duplicate questionnaire. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveQuestionnaire = async () => {
    if (!localQuestionnaire) return;

    setIsProcessing(true);
    try {
      await updateQuestionnaire(localQuestionnaire.id, {
        name: localQuestionnaire.name,
        description: localQuestionnaire.description,
        guidelines: localQuestionnaire.guidelines,
        status: localQuestionnaire.status,
        updated_at: new Date().toISOString(),
      });
      setHasUnsavedChanges(false);
      toast.success("Questionnaire saved successfully");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save questionnaire. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteQuestionnaire = async () => {
    if (!selectedQuestionnaire) {
      toast.error("No questionnaire selected for deletion");
      return;
    }

    if (deleteConfirmationText.trim() !== selectedQuestionnaire.name) {
      toast.error(
        "Questionnaire name does not match. Please type the exact name to confirm deletion."
      );
      return;
    }

    setIsProcessing(true);
    try {
      await deleteQuestionnaire(selectedQuestionnaire.id);
      toast.success("Questionnaire deleted successfully");
      navigate("/assessments/onsite/questionnaires");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete questionnaire. Please try again."
      );
      setIsProcessing(false);
    }
  };

  const openDeleteDialog = () => {
    setDeleteConfirmationText("");
    setShowDeleteDialog(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setDeleteConfirmationText("");
    }
    setShowDeleteDialog(open);
  };

  const isDeleteAllowed =
    selectedQuestionnaire &&
    deleteConfirmationText.trim() === selectedQuestionnaire.name;

  // Section completion status helpers
  const getGeneralStatus = () => {
    const questionnaire = localQuestionnaire || selectedQuestionnaire;
    if (!questionnaire) return "incomplete";
    const hasRequiredFields =
      questionnaire.name?.trim() && questionnaire.description?.trim();
    return hasRequiredFields ? "complete" : "incomplete";
  };

  const getRatingsStatus = () => {
    if (!selectedQuestionnaire) return "incomplete";
    const hasRatings =
      selectedQuestionnaire.rating_scales &&
      selectedQuestionnaire.rating_scales.length > 0;
    return hasRatings ? "complete" : "incomplete";
  };

  const getQuestionsStatus = () => {
    if (!selectedQuestionnaire) return "incomplete";
    const hasQuestions =
      selectedQuestionnaire.sections &&
      selectedQuestionnaire.sections.some((section: any) =>
        section.steps?.some(
          (step: any) => step.questions && step.questions.length > 0
        )
      );
    return hasQuestions ? "complete" : "incomplete";
  };

  const getQuestionCount = () => {
    if (!selectedQuestionnaire?.sections) return 0;
    let count = 0;
    selectedQuestionnaire.sections.forEach((section: any) => {
      if (section.steps) {
        section.steps.forEach((step: any) => {
          if (step.questions) {
            count += step.questions.length;
          }
        });
      }
    });
    return count;
  };

  // Error display component
  const ErrorAlert = () => {
    if (!error) return null;

    return (
      <Alert variant="destructive" className="mb-4">
        <IconAlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={clearError}>
            ×
          </Button>
        </AlertDescription>
      </Alert>
    );
  };

  if (isLoading || !selectedQuestionnaire) {
    return (
      <DashboardPage
        title="Loading..."
        description="Loading questionnaire details"
        showBack
        backHref="/assessments/onsite/questionnaires"
      >
        <div className="space-y-6 h-full max-w-7xl mx-auto overflow-auto pb-6 px-6">
          <ErrorAlert />
          {/* General Settings Skeleton */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                <div className="h-5 w-20 bg-muted animate-pulse rounded" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-10 w-full bg-muted animate-pulse rounded" />
                <div className="h-24 w-full bg-muted animate-pulse rounded" />
              </div>
            </CardContent>
          </Card>

          {/* Rating Scales Skeleton */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                <div className="h-5 w-20 bg-muted animate-pulse rounded" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-16 w-full bg-muted animate-pulse rounded"
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Questions Skeleton */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                <div className="h-5 w-20 bg-muted animate-pulse rounded" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 w-full bg-muted animate-pulse rounded"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardPage>
    );
  }

  return (
    <DashboardPage
      title={selectedQuestionnaire.name}
      description={selectedQuestionnaire.description}
      showBack
      backHref="/assessments/onsite/questionnaires"
      headerActions={
        <div
          className="hidden md:flex items-center gap-2"
          data-tour="questionnaire-header-actions"
        >
          {/* Unsaved changes indicator */}
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span>Unsaved changes</span>
            </div>
          )}

          {/* Status Select */}
          <Select
            value={localQuestionnaire?.status || selectedQuestionnaire.status}
            onValueChange={(value) =>
              handleQuestionnaireFieldChange("status", value)
            }
            disabled={isProcessing}
          >
            <SelectTrigger className="w-auto min-w-[140px]" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">
                <div className="flex items-center gap-2">
                  <IconCircleCheckFilled className="h-4 w-4 fill-green-500 dark:fill-green-400" />
                  Active
                </div>
              </SelectItem>
              <SelectItem value="draft">
                <div className="flex items-center gap-2">
                  <IconPencil className="h-4 w-4 text-yellow-500" />
                  Draft
                </div>
              </SelectItem>
              <SelectItem value="under_review">
                <div className="flex items-center gap-2">
                  <IconUsersGroup className="h-4 w-4 text-blue-500" />
                  Under Review
                </div>
              </SelectItem>
              <SelectItem value="archived">
                <div className="flex items-center gap-2">
                  <IconArchive className="h-4 w-4 text-gray-500" />
                  Archived
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDuplicateQuestionnaire}
            disabled={isProcessing}
          >
            <IconCopy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
          <Button
            size="sm"
            onClick={handleSaveQuestionnaire}
            disabled={isProcessing || !hasUnsavedChanges}
            variant={hasUnsavedChanges ? "default" : "outline"}
          >
            <IconDeviceFloppy className="h-4 w-4 mr-2" />
            {isProcessing ? "Saving..." : "Save"}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={openDeleteDialog}
            disabled={isProcessing}
          >
            <IconTrash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      }
    >
      <div
        className={`space-y-6 max-w-7xl mx-auto h-full px-6 ${
          isFullscreen ? "overflow-hidden" : "overflow-auto pb-6"
        }`}
        data-tour="questionnaire-editor-main"
      >
        <ErrorAlert />
        {/* General Settings Section */}
        <Card data-tour="questionnaire-general-settings">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              General Settings
              {getGeneralStatus() === "complete" ? (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                >
                  <IconCheck className="h-3 w-3" />
                </Badge>
              ) : (
                <Badge variant="outline">
                  <IconAlert className="h-3 w-3" />
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Configure the basic questionnaire information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsForm
              selectedQuestionnaire={
                localQuestionnaire || selectedQuestionnaire
              }
              handleQuestionnaireFieldChange={handleQuestionnaireFieldChange}
              isLoading={false}
            />
          </CardContent>
        </Card>

        {/* Rating Scales Section */}
        <Card data-tour="questionnaire-rating-scales">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2  text-xl">
                  Rating Scales
                  {getRatingsStatus() === "complete" ? (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    >
                      <IconCheck className="h-3 w-3" />
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <IconAlert className="h-3 w-3" />
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Configure the rating scale for questionnaire responses
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddRatingDialog(true)}
                disabled={isProcessing}
                data-tour="questionnaire-rating-actions"
              >
                <IconPlus className="h-4 w-4 mr-2" />
                Add Rating
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <RatingsForm
              ratings={selectedQuestionnaire.rating_scales || []}
              questionnaireId={selectedQuestionnaire.id}
              isLoading={false}
              showActions={false}
            />
          </CardContent>
        </Card>

        {/* Questions Section */}
        <Card
          ref={pageRef}
          data-tour="questionnaire-questions"
          className={isFullscreen ? "bg-background flex flex-col h-full" : ""}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle
                  className={`flex items-center gap-2 ${
                    isFullscreen ? "text-2xl" : "text-xl"
                  }`}
                >
                  {isFullscreen
                    ? `Questions - ${selectedQuestionnaire.name}`
                    : "Questions"}
                  {getQuestionsStatus() === "complete" ? (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    >
                      <IconCheck className="h-3 w-3" />
                      <span className="ml-1">{getQuestionCount()}</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <IconAlert className="h-3 w-3" />
                      <span className="ml-1">{getQuestionCount()}</span>
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Configure the sections, steps, and questions for this
                  questionnaire
                </CardDescription>
              </div>
              <div
                className="flex gap-2"
                data-tour="questionnaire-question-actions"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="gap-2 w-[130px]"
                >
                  {isFullscreen ? (
                    <>
                      <IconMinimize className="h-4 w-4" />
                      Exit Fullscreen
                    </>
                  ) : (
                    <>
                      <IconMaximize className="h-4 w-4" />
                      Fullscreen
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTemplateDialog(true)}
                  disabled={isProcessing}
                >
                  <IconTemplate className="h-4 w-4 mr-2" />
                  Import from Library
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddSectionDialog(true)}
                  disabled={isProcessing}
                >
                  <IconPlus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className={isFullscreen ? "flex-1 min-h-0" : ""}>
            <FormEditor
              sections={selectedQuestionnaire.sections || []}
              selectedQuestionnaire={selectedQuestionnaire}
              isLoading={false}
              showSectionActions={false}
            />
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={handleDialogOpenChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Questionnaire</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the questionnaire{" "}
              <strong className="select-text">
                {selectedQuestionnaire.name}
              </strong>
              ?
              <br />
              <br />
              <strong>This action is permanent and cannot be undone</strong>. It
              will remove all associated data, including any child nodes.
              <br />
              <br />
              To confirm, please type the questionnaire name below:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div>
            <Label
              htmlFor="delete-confirmation"
              className="text-sm font-medium"
            >
              Questionnaire name
            </Label>
            <Input
              id="delete-confirmation"
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder={selectedQuestionnaire.name}
              className="mt-1"
              disabled={isProcessing}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isDeleteAllowed) {
                  handleDeleteQuestionnaire();
                }
              }}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteQuestionnaire}
              disabled={!isDeleteAllowed || isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Rating Dialog */}
      <AddRatingDialog
        open={showAddRatingDialog}
        onOpenChange={setShowAddRatingDialog}
        questionnaireId={selectedQuestionnaire.id}
        ratings={selectedQuestionnaire.rating_scales || []}
      />

      {/* Add Section Dialog */}
      <AddSectionDialog
        open={showAddSectionDialog}
        onOpenChange={setShowAddSectionDialog}
        questionnaireId={selectedQuestionnaire.id}
      />

      {/* Import from Library Dialog */}
      <QuestionnaireTemplateDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
        questionnaireId={selectedQuestionnaire.id}
      />
    </DashboardPage>
  );
}
