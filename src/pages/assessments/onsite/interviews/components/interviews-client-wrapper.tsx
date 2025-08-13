import { Suspense } from "react";
import { useSelectedCompany } from "@/stores/company-client-store";
import { useInterviews } from "@/hooks/useInterviews";
import { InterviewsPageContent } from "./interviews-page-content";
import { InterviewsEmptyState } from "./interviews-empty-state";
import { InterviewsLoadingSkeleton } from "./interviews-loading-skeleton";

export function InterviewsClientWrapper() {
  const selectedCompany = useSelectedCompany();
  const {
    data: interviews = [],
    isLoading: interviewsLoading,
    error,
  } = useInterviews();

  // Show message when no company is selected
  if (!selectedCompany) {
    return <InterviewsEmptyState type="no-company" />;
  }

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
