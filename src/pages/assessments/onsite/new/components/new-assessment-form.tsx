import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IconArrowLeft, IconLoader } from "@tabler/icons-react";
import { DashboardPage } from "@/components/dashboard-page";
import { useAssessmentStore } from "@/stores/assessment-store";
import { useCompanyStore } from "@/stores/company-store";
import { useAssessmentForm } from "./use-assessment-form";
import { useAssessmentContext } from "@/hooks/useAssessmentContext";
import { QuestionnaireSelection } from "./questionnaire-selection";
import { LocationHierarchy } from "./location-hierarchy";
import { AssessmentObjectives } from "./assessment-objectives";
import ObjectivesDialog from "./objectives-dialog";

export function NewAssessmentForm() {
  const navigate = useNavigate();
  const [showObjectivesDialog, setShowObjectivesDialog] = useState(false);

  const {
    questionnaires,
    isLoading,
    isCreating,
    error,
    loadQuestionnaires,
    clearError,
  } = useAssessmentStore();

  const {
    selectedCompany,
    businessUnits,
    regions,
    sites,
    assetGroups,
    loadBusinessUnits,
    loadRegions,
    loadSites,
    loadAssetGroups,
  } = useCompanyStore();

  const {
    formData,
    formErrors,
    creationStep,
    isRedirecting,
    isFormValid,
    handleInputChange,
    addObjective,
    removeObjective,
    updateObjective,
    handleSubmit,
  } = useAssessmentForm();

  useEffect(() => {
    loadQuestionnaires();
    loadBusinessUnits();
    loadRegions();
    loadSites();
    loadAssetGroups();
    clearError();
  }, [
    loadQuestionnaires,
    clearError,
    loadBusinessUnits,
    loadRegions,
    loadSites,
    loadAssetGroups,
  ]);

  const { listRoute } = useAssessmentContext();
  const handleBack = () => navigate(listRoute);

  if (!selectedCompany) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <h2 className="text-lg font-semibold">No Company Selected</h2>
        <p className="text-sm text-muted-foreground">
          Please select a company to create an assessment.
        </p>
      </div>
    );
  }

  if (isLoading && questionnaires.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-6 px-6 py-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-destructive">
            Error Loading Questionnaires
          </h3>
          <p className="text-sm text-muted-foreground">{error}</p>
          <div className="flex gap-2">
            <Button onClick={() => loadQuestionnaires()} variant="outline">
              Try Again
            </Button>
            <Button onClick={handleBack} variant="outline">
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Back to Assessments
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const headerActions = (
    <div className="flex flex-col sm:flex-row gap-3 justify-end">
      <Button
        type="button"
        variant="outline"
        onClick={handleBack}
        disabled={isCreating || isRedirecting}
        className="sm:w-auto"
      >
        Cancel
      </Button>
      <Button
        form="assessment-form"
        type="submit"
        disabled={isCreating || isRedirecting || !isFormValid()}
        className="sm:w-auto"
        data-tour="assessment-actions"
      >
        {(isCreating || isRedirecting) && (
          <IconLoader className="mr-2 h-4 w-4 animate-spin" />
        )}
        {isCreating || isRedirecting
          ? creationStep || "Creating Assessment..."
          : "Create Assessment"}
      </Button>
    </div>
  );

  return (
    <DashboardPage
      title="Create New Onsite Assessment"
      description="Set up a new onsite assessment based on a questionnaire"
      showBack
      backHref="/assessments/onsite"
      tourId="assessment-creation-main"
      headerActions={headerActions}
    >
      <div className="px-6 space-y-6 max-w-7xl mx-auto overflow-auto h-full">
        <form
          id="assessment-form"
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* Top Section: Questionnaire and Basic Info */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <QuestionnaireSelection
              questionnaires={questionnaires}
              formData={formData}
              formErrors={formErrors}
              onInputChange={handleInputChange}
            />

            <LocationHierarchy
              formData={formData}
              formErrors={formErrors}
              businessUnits={businessUnits}
              regions={regions}
              sites={sites}
              assetGroups={assetGroups}
              onInputChange={handleInputChange}
            />
          </div>

          {/* Objectives Section */}
          <AssessmentObjectives
            objectives={formData.objectives || []}
            formErrors={formErrors}
            onAddObjective={() => addObjective()}
            onRemoveObjective={removeObjective}
            onUpdateObjective={updateObjective}
            onShowObjectivesDialog={() => setShowObjectivesDialog(true)}
          />
        </form>
      </div>

      {/* Objectives Selection Dialog */}
      <ObjectivesDialog
        open={showObjectivesDialog}
        onOpenChange={setShowObjectivesDialog}
        onObjectivesSelected={(selectedObjectives) => {
          selectedObjectives.forEach((objective) => addObjective(objective));
        }}
        existingObjectives={formData.objectives || []}
      />
    </DashboardPage>
  );
}
