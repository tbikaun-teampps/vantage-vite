import { Suspense, useEffect } from "react";
import { useCompanyStore } from "@/stores/company-store";
import { useAssessmentStore } from "@/stores/assessment-store";
import { AssessmentsPageContent } from "./assessments-page-content";
import { AssessmentsEmptyState } from "./assessments-empty-state";
import { AssessmentsLoadingSkeleton } from "./assessments-loading-skeleton";
import { useAssessmentContext } from "@/hooks/useAssessmentContext";

export function AssessmentsClientWrapper() {
  const selectedCompany = useCompanyStore((state) => state.selectedCompany);
  const { assessmentType } = useAssessmentContext();
  const { assessments, isLoading, error } = useAssessmentStore();

  // Load data when component mounts or company changes
  useEffect(() => {
    if (selectedCompany) {
      const { loadAssessments, loadQuestionnaires } =
        useAssessmentStore.getState();
      loadAssessments(
        assessmentType ? { type: assessmentType } : undefined,
        selectedCompany.id
      );
      loadQuestionnaires();
    }
  }, [selectedCompany?.id, assessmentType]);

  // Show message when no company is selected
  if (!selectedCompany) {
    return <AssessmentsEmptyState type="no-company" />;
  }

  // Show error state
  if (error) {
    const handleRetry = () => {
      const { loadAssessments } = useAssessmentStore.getState();
      loadAssessments(
        assessmentType ? { type: assessmentType } : undefined,
        selectedCompany.id
      );
    };

    return (
      <AssessmentsEmptyState type="error" error={error} onRetry={handleRetry} />
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
