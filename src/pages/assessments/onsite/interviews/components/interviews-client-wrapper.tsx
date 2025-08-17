import { Suspense } from "react";
import { useInterviews } from "@/hooks/useInterviews";
import { InterviewsPageContent } from "./interviews-page-content";
import { InterviewsEmptyState } from "./interviews-empty-state";
import { InterviewsLoadingSkeleton } from "./interviews-loading-skeleton";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";

export function InterviewsClientWrapper() {
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

  // Render main content with suspense boundary
  return (
    <Suspense fallback={<InterviewsLoadingSkeleton />}>
      <InterviewsPageContent />
    </Suspense>
  );
}
