import { DashboardPage } from "@/components/dashboard-page";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAssessmentContext } from "@/hooks/useAssessmentContext";
import { useAssessments } from "@/hooks/useAssessments";
import { AssessmentsPageContent } from "@/pages/assessments/components/assessments-page-content";
import { AssessmentsEmptyState } from "@/pages/assessments/components/assessments-empty-state";
import { AssessmentsLoadingSkeleton } from "./components/assessments-loading-skeleton";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";

export function AssessmentsPage() {
  const companyId = useCompanyFromUrl();
  const { assessmentType } = useAssessmentContext();
  usePageTitle("Assessments");

  const {
    data: assessments = [],
    isLoading,
    error,
    refetch,
  } = useAssessments(companyId, {
    ...(assessmentType && { type: assessmentType }),
  });

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

  return (
    <DashboardPage
      title="Assessments"
      description={`Manage and view your ${assessmentType || ""} assessments`}
    >
      <AssessmentsPageContent assessments={assessments} isLoading={isLoading} />
    </DashboardPage>
  );
}
