import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { IconArrowLeft } from "@tabler/icons-react";
import { DashboardPage } from "@/components/dashboard-page";
import { useAssessmentDetail } from "./use-assessment-detail";
import { usePageTitle } from "@/hooks/usePageTitle";
import { AssessmentDetails } from "./assessment-details";
import { QuickOverview } from "./quick-overview";
import { AssessmentObjectives } from "./assessment-objectives";
import { InterviewsList } from "./interviews-list";
import { QuestionnaireStructure } from "./questionnaire-structure";
import { DangerZone } from "./danger-zone";
import { DuplicateAssessment } from "./duplicate-assessment";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";

export function AssessmentDetailContent() {
  const params = useParams();
  const assessmentId = params.id as string;

  const {
    selectedAssessment,
    assessmentInterviews,
    selectedCompany,
    isLoading,
    error,
    assessmentName,
    assessmentDescription,
    isAssessmentDetailsDirty,
    isSavingAssessment,
    showDeleteDialog,
    isDeleting,
    handleBack,
    setAssessmentName,
    setAssessmentDescription,
    handleStatusChange,
    saveAssessmentDetails,
    handleCreateInterview,
    setShowDeleteDialog,
    handleDelete,
    getStatusIcon,
    getInterviewStatusIcon,
  } = useAssessmentDetail(assessmentId);

  // Set page title based on assessment name
  usePageTitle(selectedAssessment?.name || "Assessment Details", "Assessments");

  if (!selectedCompany) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">
          Please select a company to view assessments.
        </p>
      </div>
    );
  }

  if (isLoading && !selectedAssessment) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !selectedAssessment) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-destructive">
            {error || "Assessment not found"}
          </h3>
          <p className="text-sm text-muted-foreground">
            The assessment you&apos;re looking for doesn&apos;t exist or
            couldn&apos;t be loaded.
          </p>
          <Button onClick={handleBack} variant="outline">
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back to Assessments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardPage
      title={selectedAssessment.name}
      description={selectedAssessment.description || "No description provided"}
      backHref="/assessments/onsite"
      showBack
    >
      <div
        className="max-w-7xl mx-auto h-full overflow-auto px-6"
        data-tour="assessment-detail-main"
      >
        <div className="space-y-8">
          {/* Top Row: Assessment Details and Quick Overview */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <AssessmentDetails
                assessment={selectedAssessment}
                assessmentName={assessmentName}
                assessmentDescription={assessmentDescription}
                isAssessmentDetailsDirty={isAssessmentDetailsDirty}
                isSavingAssessment={isSavingAssessment}
                onNameChange={setAssessmentName}
                onDescriptionChange={setAssessmentDescription}
                onStatusChange={handleStatusChange}
                onSaveDetails={saveAssessmentDetails}
                getStatusIcon={getStatusIcon}
              />
            </div>
            <div>
              <QuickOverview interviews={assessmentInterviews} />
            </div>
          </div>

          {/* Objectives */}
          <AssessmentObjectives objectives={selectedAssessment.objectives || []} />

          {/* Interviews List */}
          <InterviewsList
            interviews={assessmentInterviews}
            isLoading={false} // We handle loading at the page level
            assessmentId={assessmentId}
            onCreateInterview={handleCreateInterview}
            getInterviewStatusIcon={getInterviewStatusIcon}
          />

          {/* Questionnaire Structure */}
          <QuestionnaireStructure questionnaire={selectedAssessment.questionnaire} />

          {/* Duplicate Assessment */}
          <DuplicateAssessment
            assessmentId={assessmentId}
            assessmentName={selectedAssessment.name}
          />

          {/* Danger Zone */}
          <DangerZone
            onDeleteClick={() => setShowDeleteDialog(true)}
            isDeleting={isDeleting}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        assessmentName={selectedAssessment.name}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </DashboardPage>
  );
}