import { Suspense } from "react";
import { useAssessments, useQuestionnaires } from "@/hooks/useAssessments";
import { AssessmentsPageContent } from "./assessments-page-content";
import { AssessmentsEmptyState } from "./assessments-empty-state";
import { AssessmentsLoadingSkeleton } from "./assessments-loading-skeleton";
import { useAssessmentContext } from "@/hooks/useAssessmentContext";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";

export function AssessmentsClientWrapper() {
  const companyId = useCompanyFromUrl();
  const { assessmentType } = useAssessmentContext();

  // Build filters based on context and selected company
  const filters = {
    ...(assessmentType && { type: assessmentType }),
    ...(companyId && { company_id: companyId }),
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
  if (!companyId) {
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
      />
    </Suspense>
  );
}
