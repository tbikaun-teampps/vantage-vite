import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  useQuestionnaireById,
  useQuestionnaireActions,
  useQuestionnaireUsage,
} from "@/hooks/useQuestionnaires";
import Settings from "../components/settings";
import { TabSwitcher } from "../components/tab-switcher";
import RatingsForm from "../components/ratings-form";
import FormEditor from "../components/form-editor";
import AddRatingDialog from "../components/add-rating-dialog";
import AddSectionDialog from "../components/add-section-dialog";
import QuestionnaireTemplateDialog from "../components/questionnaire-template-dialog";
import {
  IconAlertCircle,
  IconPlus,
  IconCheck,
  IconLock,
} from "@tabler/icons-react";
import { DashboardPage } from "@/components/dashboard-page";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { QuestionnaireUsageAlert } from "../components/questionnaire-usage-alert";
import { ShareQuestionnaireModal } from "../components/share-modal";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";
import type {
  QuestionnaireStatusEnum,
  SectionWithSteps,
  StepWithQuestions,
} from "@/types/assessment";

export interface QuestionnaireUsage {
  isInUse: boolean;
  assessmentCount: number;
  interviewCount: number;
}

export function QuestionnaireDetailPage() {
  const params = useParams();
  const navigate = useCompanyAwareNavigate();
  const [searchParams] = useSearchParams();
  const questionnaireId = parseInt(params.id!);

  // React Query hooks
  const {
    data: selectedQuestionnaire,
    isLoading,
    error,
  } = useQuestionnaireById(questionnaireId);
  const { data: questionnaireUsageData } =
    useQuestionnaireUsage(questionnaireId);
  const {
    updateQuestionnaire,
    duplicateQuestionnaire,
    deleteQuestionnaire,
    isUpdating,
    isDuplicating,
    isDeleting,
  } = useQuestionnaireActions();

  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [deleteConfirmationText, setDeleteConfirmationText] =
    useState<string>("");
  const [showAddRatingDialog, setShowAddRatingDialog] =
    useState<boolean>(false);
  const [showAddSectionDialog, setShowAddSectionDialog] =
    useState<boolean>(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  // Use React Query data for questionnaire usage
  const questionnaireUsage = questionnaireUsageData;

  // Derive processing state from React Query mutations
  const isProcessing = isUpdating || isDuplicating || isDeleting;
  // Derive active tab from URL, default to settings
  const tabParam = searchParams.get("tab");
  const activeTab = ["settings", "rating-scales", "questions"].includes(
    tabParam || ""
  )
    ? tabParam!
    : "settings";

  // Update URL when tab changes
  const handleTabChange = (newTab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newTab === "settings") {
      params.delete("tab"); // Default tab, no need in URL
    } else {
      params.set("tab", newTab);
    }
    const queryString = params.toString();
    navigate(
      `/assessments/onsite/questionnaires/${questionnaireId}${
        queryString ? `?${queryString}` : ""
      }`
    );
  };

  // Redirect if questionnaire not found after loading
  useEffect(() => {
    if (!isLoading && !selectedQuestionnaire && !error && questionnaireId) {
      const timeoutId = setTimeout(() => {
        navigate("/assessments/onsite/questionnaires");
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, selectedQuestionnaire, error, navigate, questionnaireId]);

  const handleDuplicateQuestionnaire = async () => {
    if (!selectedQuestionnaire) return;

    try {
      const duplicatedQuestionnaire = await duplicateQuestionnaire(
        selectedQuestionnaire.id
      );
      navigate(
        `/assessments/onsite/questionnaires/${duplicatedQuestionnaire.id}`
      );
      toast.success("Questionnaire duplicated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to duplicate questionnaire. Please try again."
      );
    }
  };

  const handleShareQuestionnaire = () => {
    setShowShareModal(true);
  };

  const handleUpdateQuestionnaire = async (
    updates: Partial<{
      name: string;
      description: string;
      guidelines: string;
      status: QuestionnaireStatusEnum;
    }>
  ) => {
    if (!selectedQuestionnaire) return;

    try {
      await updateQuestionnaire({
        id: selectedQuestionnaire.id,
        updates,
      });
      toast.success("Questionnaire updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update questionnaire. Please try again."
      );
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
    if (!selectedQuestionnaire) return "incomplete";
    const hasRequiredFields =
      selectedQuestionnaire.name?.trim() &&
      selectedQuestionnaire.description?.trim();
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
      selectedQuestionnaire.sections.some((section: SectionWithSteps) =>
        section.steps.some(
          (step: StepWithQuestions) =>
            step.questions && step.questions.length > 0
        )
      );
    return hasQuestions ? "complete" : "incomplete";
  };

  const getQuestionCount = () => {
    if (!selectedQuestionnaire?.sections) return 0;
    let count = 0;
    selectedQuestionnaire.sections.forEach((section: SectionWithSteps) => {
      if (section.steps) {
        section.steps.forEach((step: StepWithQuestions) => {
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
        <AlertDescription>
          <span>{error.message}</span>
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
        headerActions={
          <div className="flex items-center gap-4">
            {/* Loading tab switcher skeleton */}
            <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="inline-flex items-center justify-center rounded-md px-3 py-1 gap-2"
                >
                  <div className="h-4 w-4 bg-muted-foreground/20 animate-pulse rounded" />
                  <div className="h-4 w-16 bg-muted-foreground/20 animate-pulse rounded" />
                  <div className="h-4 w-6 bg-muted-foreground/20 animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>
        }
      >
        <div className="h-full flex flex-col">
          <ErrorAlert />
          {/* Main content skeleton */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 min-h-0 px-6">
              {/* Settings tab skeleton (default) */}
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                        <div className="h-5 w-20 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="h-4 w-64 bg-muted animate-pulse rounded" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                      <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Form fields skeleton */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                      <div className="h-10 w-full bg-muted animate-pulse rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                      <div className="h-24 w-full bg-muted animate-pulse rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                      <div className="h-24 w-full bg-muted animate-pulse rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                      <div className="h-10 w-full bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardPage>
    );
  }

  return (
    <DashboardPage
      title={
        <div className="flex items-center gap-2">
          {selectedQuestionnaire.name}
          {questionnaireUsage?.isInUse && (
            <Badge
              variant="secondary"
              className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
            >
              <IconLock className="h-3 w-3 mr-1" />
              In Use
            </Badge>
          )}
        </div>
      }
      description={selectedQuestionnaire.description}
      showBack
      backHref="/assessments/onsite/questionnaires"
      headerActions={
        <TabSwitcher
          activeTab={activeTab}
          onTabChange={handleTabChange}
          getGeneralStatus={getGeneralStatus}
          getQuestionCount={getQuestionCount}
          selectedQuestionnaire={selectedQuestionnaire}
        />
      }
    >
      <div className="h-full flex flex-col">
        <div className="flex-shrink-0 px-6">
          {questionnaireUsage?.isInUse && (
            <QuestionnaireUsageAlert questionnaireUsage={questionnaireUsage} />
          )}
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsContent value="settings" className="flex-1 min-h-0 px-6">
            <Settings
              selectedQuestionnaire={selectedQuestionnaire}
              onUpdate={handleUpdateQuestionnaire}
              onDuplicate={handleDuplicateQuestionnaire}
              onDelete={openDeleteDialog}
              onShare={handleShareQuestionnaire}
              isProcessing={isProcessing}
              getGeneralStatus={getGeneralStatus}
              questionnaireIsInUse={questionnaireUsage?.isInUse}
            />
          </TabsContent>

          <TabsContent value="rating-scales" className="flex-1 min-h-0 px-6">
            <Card
              data-tour="questionnaire-rating-scales"
              className="h-full overflow-hidden mt-4"
            >
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
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
                          <AlertTriangle className="h-3 w-3" />
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
              <CardContent className="flex-1 overflow-auto">
                <RatingsForm
                  ratings={selectedQuestionnaire.rating_scales || []}
                  questionnaireId={selectedQuestionnaire.id}
                  isLoading={false}
                  showActions={false}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions" className="flex-1 min-h-0 px-6">
            <FormEditor
              sections={selectedQuestionnaire.sections || []}
              selectedQuestionnaire={selectedQuestionnaire}
              isLoading={false}
              showSectionActions={false}
              onImportFromLibrary={() => setShowTemplateDialog(true)}
              onAddSection={() => setShowAddSectionDialog(true)}
              isProcessing={isUpdating || isDuplicating || isDeleting}
              getQuestionCount={getQuestionCount}
              getQuestionsStatus={getQuestionsStatus}
            />
          </TabsContent>
        </Tabs>
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
              disabled={
                !isDeleteAllowed || isProcessing || questionnaireUsage?.isInUse
              }
              className="bg-destructive  hover:bg-destructive/90"
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

      {/* Share Questionnaire Modal */}
      <ShareQuestionnaireModal
        questionnaireId={selectedQuestionnaire.id}
        questionnaireName={selectedQuestionnaire.name}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </DashboardPage>
  );
}
