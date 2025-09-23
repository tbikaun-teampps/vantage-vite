import { useAssessments } from "@/hooks/useAssessments";
import { AssessmentsPageContent } from "@/pages/assessments/components/assessments-page-content";
import { AssessmentsEmptyState } from "@/pages/assessments/components/assessments-empty-state";
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

  // Render main content
  return (
    <AssessmentsPageContent assessments={assessments} isLoading={isLoading} />
  );
}
