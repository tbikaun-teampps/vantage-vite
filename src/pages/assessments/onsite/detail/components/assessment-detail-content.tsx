import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { IconArrowLeft } from "@tabler/icons-react";
import { DashboardPage } from "@/components/dashboard-page";
import { useAssessmentDetail } from "@/hooks/use-assessment-detail";
import { usePageTitle } from "@/hooks/usePageTitle";
import { AssessmentDetails } from "./assessment-details";
import { AssessmentObjectives } from "./assessment-objectives";
import { InterviewsList } from "./interviews-list";
import { QuestionnaireStructure } from "./questionnaire-structure";
import { AssessmentEvidence } from "./assessment-evidence";
import { AssessmentComments } from "./assessment-comments";
import { DangerZone } from "./danger-zone";
import { DuplicateAssessment } from "./duplicate-assessment";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";

export function AssessmentDetailContent() {
  const params = useParams();
  const assessmentId = parseInt(params.id!);
  const companyId = useCompanyFromUrl();

  const {
    selectedAssessment,
    isLoading,
    showDeleteDialog,
    isDeleting,
    handleBack,
    handleStatusChange,
    handleNameChange,
    handleDescriptionChange,
    setShowDeleteDialog,
    handleDelete,
    getStatusIcon,
  } = useAssessmentDetail(assessmentId);

  usePageTitle(selectedAssessment?.name || "Assessment Details", "Assessments");

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

  if (!selectedAssessment) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-destructive">
            Assessment not found
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
      backHref={`/${companyId}/assessments/onsite`}
      showBack
    >
      <div
        className="max-w-[1600px] mx-auto h-full overflow-auto px-6 pt-4"
        data-tour="assessment-detail-main"
      >
        <div className="space-y-8 mb-8">
          <AssessmentDetails
            assessment={selectedAssessment}
            onNameChange={handleNameChange}
            onDescriptionChange={handleDescriptionChange}
            onStatusChange={handleStatusChange}
            getStatusIcon={getStatusIcon}
          />

          <AssessmentObjectives
            objectives={selectedAssessment.objectives || []}
          />

          <InterviewsList
            companyId={companyId}
            assessmentId={assessmentId}
            assessment={selectedAssessment}
          />
          <QuestionnaireStructure
            questionnaire={selectedAssessment.questionnaire}
          />
          <AssessmentEvidence assessmentId={assessmentId} />
          <AssessmentComments assessmentId={assessmentId} />
          <DuplicateAssessment assessmentId={assessmentId} />
          <DangerZone
            onDeleteClick={() => setShowDeleteDialog(true)}
            isDeleting={isDeleting}
          />
        </div>
      </div>

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
