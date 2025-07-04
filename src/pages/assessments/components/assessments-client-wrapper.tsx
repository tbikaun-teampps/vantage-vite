import { Suspense, useEffect } from "react";
import { useCompanyStore } from "@/stores/company-store";
import { useAssessmentStore } from "@/stores/assessment-store";
import { AssessmentsPageContent } from "./assessments-page-content";
import { AssessmentsEmptyState } from "./assessments-empty-state";
import { AssessmentsLoadingSkeleton } from "./assessments-loading-skeleton";

export function AssessmentsClientWrapper() {
  const selectedCompany = useCompanyStore((state) => state.selectedCompany);
  const { assessments, isLoading, error } = useAssessmentStore();

  // Load data when component mounts or company changes
  useEffect(() => {
    if (selectedCompany) {
      const { loadAssessments, loadQuestionnaires } = useAssessmentStore.getState();
      loadAssessments(undefined, selectedCompany.id);
      loadQuestionnaires();
    }
  }, [selectedCompany?.id]);

  // Show message when no company is selected
  if (!selectedCompany) {
    return <AssessmentsEmptyState type="no-company" />;
  }

  // Show error state
  if (error) {
    const handleRetry = () => {
      const { loadAssessments } = useAssessmentStore.getState();
      loadAssessments(undefined, selectedCompany.id);
    };

    return (
      <AssessmentsEmptyState 
        type="error" 
        error={error}
        onRetry={handleRetry}
      />
    );
  }

  // Show loading skeleton when initially loading
  if (isLoading && assessments.length === 0) {
    return <AssessmentsLoadingSkeleton />;
  }

  // Render main content with suspense boundary
  return (
    <Suspense fallback={<AssessmentsLoadingSkeleton />}>
      <AssessmentsPageContent />
    </Suspense>
  );
}