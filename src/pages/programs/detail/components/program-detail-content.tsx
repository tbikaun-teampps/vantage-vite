import { useParams } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { IconArrowLeft, IconAlertCircle } from "@tabler/icons-react";
import { DashboardPage } from "@/components/dashboard-page";
import {
  useProgramById,
  useDeleteProgram,
  useUpdateProgramQuestionnaire,
  useUpdateProgram,
} from "@/hooks/useProgram";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";
import { useProgramAssessmentValidation } from "@/hooks/useProgramScope";
import { EditableProgramDetails } from "./editable-program-details";
import type { ProgramUpdateFormData } from "./program-update-schema";
import { ProgramObjectivesManager } from "./program-objectives-manager";
import { ProgramScopeSelection } from "./program-scope-selection";
import { ProgramQuestionnaireSelection } from "./program-questionnaire-selection";
// import { DesktopAssessments } from "./desktop-assessments";
import { OnsiteAssessments } from "./onsite-assessments";
import { DangerZone } from "./danger-zone";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { useCompanyRoutes } from "@/hooks/useCompanyRoutes";

export function ProgramDetailContent() {
  const params = useParams();
  const programId = parseInt(params.id!);
  const navigate = useCompanyAwareNavigate();
  const routes = useCompanyRoutes();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: program, isLoading, error } = useProgramById(programId);
  const deleteProgramMutation = useDeleteProgram();
  const updateProgramMutation = useUpdateProgram();
  const updateQuestionnaireMutation = useUpdateProgramQuestionnaire();
  const assessmentValidation = useProgramAssessmentValidation(program);

  // Set page title based on program name
  usePageTitle(program?.name || "Program Details");

  const handleBack = () => {
    navigate("/programs");
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (program) {
      try {
        await deleteProgramMutation.mutateAsync(program.id);
        navigate("/programs");
      } catch (error) {
        // Error handling is done in the hook
        console.error("Delete failed:", error);
      }
      setShowDeleteDialog(false);
    }
  };

  const handleProgramUpdate = async (updateData: ProgramUpdateFormData) => {
    if (program) {
      await updateProgramMutation.mutateAsync({
        programId: program.id,
        updateData,
      });
    }
  };

  const handleQuestionnaireUpdate = async (questionnaireId: number | null) => {
    if (program) {
      await updateQuestionnaireMutation.mutateAsync({
        programId: program.id,
        questionnaireId,
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardPage
        title={<Skeleton className="h-8 w-48" />}
        description={<Skeleton className="h-4 w-96" />}
      >
        <div className="flex flex-1 flex-col gap-6 px-6 py-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-6 w-20" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardPage>
    );
  }

  if (error || !program) {
    return (
      <DashboardPage
        title="Program Not Found"
        description="The requested program could not be found"
      >
        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <Card className="max-w-md mx-auto">
            <CardContent className="flex flex-col items-center text-center p-6 space-y-4">
              <IconAlertCircle className="h-12 w-12 text-destructive" />
              <div className="space-y-2">
                <h3 className="font-medium">Program Not Found</h3>
                <p className="text-sm text-muted-foreground">
                  {error?.message ||
                    "The program you're looking for doesn't exist or has been deleted."}
                </p>
              </div>
              <Button onClick={handleBack} variant="outline">
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Back to Programs
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardPage>
    );
  }

  return (
    <>
      <DashboardPage
        title={program.name}
        description={program.description || "Program details and objectives"}
        backHref={routes.programs()}
        showBack
      >
        <div
          className="max-w-7xl mx-auto h-full overflow-auto px-6"
          data-tour="program-detail-main"
        >
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-auto px-6 py-6">
              <div className="space-y-6">
                <EditableProgramDetails
                  program={program}
                  onUpdate={handleProgramUpdate}
                  isUpdating={updateProgramMutation.isPending}
                />
                <ProgramObjectivesManager programId={program.id} />

                {/* Program Scope Section */}
                <ProgramScopeSelection program={program} readOnly={true} />

                {/* Program Questionnaire Section */}
                <ProgramQuestionnaireSelection
                  program={program}
                  onQuestionnaireUpdate={handleQuestionnaireUpdate}
                  isUpdating={updateQuestionnaireMutation.isPending}
                />

                {/* Assessment Sections */}
                <div className="space-y-6">
                  {/* <DesktopAssessments
                    programId={program.id}
                    disabled={!scopeValidation.isValid}
                    disabledReason={scopeValidation.reason}
                  /> */}
                  <OnsiteAssessments
                    programId={program.id}
                    disabled={!assessmentValidation.isValid}
                    disabledReason={assessmentValidation.reason}
                    hasQuestionnaire={!!program.questionnaire}
                  />
                </div>

                <div className="mt-8">
                  <DangerZone
                    onDeleteClick={handleDeleteClick}
                    isDeleting={deleteProgramMutation.isPending}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardPage>

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        programName={program.name}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteProgramMutation.isPending}
      />
    </>
  );
}
