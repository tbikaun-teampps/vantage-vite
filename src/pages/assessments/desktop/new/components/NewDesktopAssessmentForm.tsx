import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IconArrowLeft, IconLoader, IconAlertCircle } from "@tabler/icons-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DashboardPage } from "@/components/dashboard-page";
import { useSelectedCompany } from "@/stores/company-client-store";
import { useAssessmentContext } from "@/hooks/useAssessmentContext";
import { useDesktopAssessmentForm } from "../hooks/useDesktopAssessmentForm";
import { useMeasurementData } from "../hooks/useMeasurementData";
import { BasicInformation } from "./BasicInformation";
import { MeasurementSelection } from "./MeasurementSelection";
import { DataSourceMapping } from "./DataSourceMapping";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";

export function NewDesktopAssessmentForm() {
  const navigate = useCompanyAwareNavigate();
  const selectedCompany = useSelectedCompany();
  const { listRoute } = useAssessmentContext();
  const [currentStep, setCurrentStep] = useState<'basic' | 'measurements' | 'mapping' | 'review'>('basic');

  const {
    formData,
    validationState,
    isSubmitting,
    submitStep,
    handleInputChange,
    handleMeasurementSelection,
    handleFileUpload,
    handleColumnMapping,
    handleValidation,
    removeUploadedFile,
    handleSubmit,
    isFormValid,
    hasUnsavedChanges,
  } = useDesktopAssessmentForm();

  const {
    measurements,
    isLoading: measurementsLoading,
    error: measurementsError,
  } = useMeasurementData();

  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) return;
    }
    navigate(listRoute);
  };

  if (!selectedCompany) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <h2 className="text-lg font-semibold">No Company Selected</h2>
        <p className="text-sm text-muted-foreground">
          Please select a company to create a desktop assessment.
        </p>
      </div>
    );
  }

  if (measurementsLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 px-6 py-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (measurementsError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-destructive">
            Error Loading Measurements
          </h3>
          <p className="text-sm text-muted-foreground">{measurementsError}</p>
          <div className="flex gap-2">
            <Button onClick={() => window.location.reload()} variant="outline">
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
        disabled={isSubmitting}
        className="sm:w-auto"
      >
        Cancel
      </Button>
      <Button
        form="desktop-assessment-form"
        type="submit"
        disabled={isSubmitting || !isFormValid}
        className="sm:w-auto"
      >
        {isSubmitting && (
          <IconLoader className="mr-2 h-4 w-4 animate-spin" />
        )}
        {isSubmitting ? submitStep || "Creating Assessment..." : "Create Assessment"}
      </Button>
    </div>
  );

  const stepProgress = (
    <div className="flex items-center space-x-2 mb-6">
      <div className={`h-2 w-2 rounded-full ${currentStep === 'basic' ? 'bg-primary' : validationState.basic_info.name && validationState.basic_info.description ? 'bg-green-500' : 'bg-muted'}`} />
      <div className={`h-0.5 w-8 ${validationState.basic_info.name && validationState.basic_info.description ? 'bg-green-500' : 'bg-muted'}`} />
      <div className={`h-2 w-2 rounded-full ${currentStep === 'measurements' ? 'bg-primary' : validationState.measurements.has_selections ? 'bg-green-500' : 'bg-muted'}`} />
      <div className={`h-0.5 w-8 ${validationState.measurements.all_mapped ? 'bg-green-500' : 'bg-muted'}`} />
      <div className={`h-2 w-2 rounded-full ${currentStep === 'mapping' ? 'bg-primary' : validationState.measurements.all_validated ? 'bg-green-500' : 'bg-muted'}`} />
      <div className={`h-0.5 w-8 ${validationState.overall_valid ? 'bg-green-500' : 'bg-muted'}`} />
      <div className={`h-2 w-2 rounded-full ${currentStep === 'review' ? 'bg-primary' : validationState.overall_valid ? 'bg-green-500' : 'bg-muted'}`} />
    </div>
  );

  return (
    <DashboardPage
      title="Create New Desktop Assessment"
      description="Set up a new desktop assessment with data-driven measurements"
      showBack
      backHref={listRoute}
      headerActions={headerActions}
    >
      <div className="px-6 space-y-6 max-w-7xl mx-auto overflow-auto h-full">
        {stepProgress}
        
        {/* Validation Errors */}
        {Object.keys(validationState.errors).length > 0 && (
          <Alert variant="destructive">
            <IconAlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {Object.entries(validationState.errors).map(([field, fieldErrors]) =>
                  fieldErrors.map((error, index) => (
                    <div key={`${field}-${index}`}>• {error}</div>
                  ))
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <form
          id="desktop-assessment-form"
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* Step 1: Basic Information */}
          <BasicInformation
            formData={{
              name: formData.name,
              description: formData.description,
              status: formData.status,
            }}
            errors={validationState.errors}
            onInputChange={handleInputChange}
            onStepComplete={() => setCurrentStep('measurements')}
            isActive={currentStep === 'basic'}
          />

          {/* Step 2: Measurement Selection */}
          {(currentStep !== 'basic' || validationState.basic_info.name) && (
            <MeasurementSelection
              measurements={measurements}
              selectedMeasurements={formData.selected_measurements}
              onSelectionChange={handleMeasurementSelection}
              onStepComplete={() => setCurrentStep('mapping')}
              isActive={currentStep === 'measurements'}
            />
          )}

          {/* Step 3: Data Mapping */}
          {formData.selected_measurements.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Data Mapping & Validation</h3>
              <p className="text-sm text-muted-foreground">
                Upload and map your data files for each selected measurement
              </p>
              
              {formData.selected_measurements.map(measurementId => {
                const measurement = measurements.find(m => m.id === measurementId);
                const measurementData = formData.measurement_data[measurementId];
                
                if (!measurement) return null;

                return (
                  <DataSourceMapping
                    key={measurementId}
                    measurement={measurement}
                    measurementData={measurementData || {
                      measurement,
                      uploaded_files: [],
                      completion_status: 'not_started',
                    }}
                    onFileUpload={(files) => handleFileUpload(measurementId, files)}
                    onColumnMapping={(mappings) => handleColumnMapping(measurementId, mappings)}
                    onValidation={(isValid, errors) => handleValidation(measurementId, isValid, errors)}
                    onFileRemove={(fileId) => removeUploadedFile(measurementId, fileId)}
                  />
                );
              })}
            </div>
          )}

          {/* Step 4: Review */}
          {validationState.measurements.all_validated && (
            <Card>
              <CardHeader>
                <CardTitle>Review & Submit</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Review your assessment configuration before creating
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Assessment Details</h4>
                    <p className="text-sm text-muted-foreground">Name: {formData.name}</p>
                    <p className="text-sm text-muted-foreground">Description: {formData.description}</p>
                    <p className="text-sm text-muted-foreground">Status: {formData.status}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Selected Measurements</h4>
                    <p className="text-sm text-muted-foreground">
                      {formData.selected_measurements.length} measurement(s) selected
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </DashboardPage>
  );
}