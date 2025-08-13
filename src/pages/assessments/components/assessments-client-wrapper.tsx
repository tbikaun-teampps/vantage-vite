import { Suspense } from "react";
import { useSelectedCompany } from "@/stores/company-client-store";
import { useAssessments, useQuestionnaires } from "@/hooks/useAssessments";
import { AssessmentsPageContent } from "./assessments-page-content";
import { AssessmentsEmptyState } from "./assessments-empty-state";
import { AssessmentsLoadingSkeleton } from "./assessments-loading-skeleton";
import { useAssessmentContext } from "@/hooks/useAssessmentContext";

export function AssessmentsClientWrapper() {
  const selectedCompany = useSelectedCompany();
  const { assessmentType } = useAssessmentContext();

  // Build filters based on context and selected company
  const filters = {
    ...(assessmentType && { type: assessmentType }),
    ...(selectedCompany && { company_id: selectedCompany.id }),
  };

  const {
    data: assessments = [],
    isLoading,
    error,
    refetch,
  } = useAssessments(filters);
  // Pre-fetch questionnaires for potential assessment creation
  useQuestionnaires();

  // Show message when no company is selected
  if (!selectedCompany) {
    return <AssessmentsEmptyState type="no-company" />;
  }

  // Show error state
  if (error) {
    const handleRetry = () => {
      refetch();
    };

    return (
      <AssessmentsEmptyState
        type="error"
        error={error.message}
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
      <AssessmentsPageContent
        assessments={assessments}
        isLoading={isLoading}
        error={error?.message}
        onRetry={() => refetch()}
      />
    </Suspense>
  );
}
