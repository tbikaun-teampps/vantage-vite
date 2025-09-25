import { DashboardPage } from "@/components/dashboard-page";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useInterviews } from "@/hooks/useInterviews";
import { InterviewsPageContent } from "./components/interviews-page-content";
import { InterviewsEmptyState } from "./components/interviews-empty-state";
import { InterviewsLoadingSkeleton } from "./components/interviews-loading-skeleton";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";

export function InterviewsPage() {
  usePageTitle("Interviews", "Onsite");
  const companyId = useCompanyFromUrl();
  const {
    data: interviews = [],
    isLoading: interviewsLoading,
    error,
  } = useInterviews(companyId);

  // Show error state
  if (error) {
    return (
      <InterviewsEmptyState
        type="error"
        error={error.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Show loading skeleton when initially loading
  if (interviewsLoading && interviews.length === 0) {
    return <InterviewsLoadingSkeleton />;
  }

  return (
    <DashboardPage
      title="Interviews"
      description="Manage and view your interviews"
    >
      <InterviewsPageContent />
    </DashboardPage>
  );
}
