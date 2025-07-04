import { Suspense, useEffect } from "react";
import { useCompanyStore } from "@/stores/company-store";
import { useInterviewStore } from "@/stores/interview-store";
import { InterviewsPageContent } from "./interviews-page-content";
import { InterviewsEmptyState } from "./interviews-empty-state";
import { InterviewsLoadingSkeleton } from "./interviews-loading-skeleton";

export function InterviewsClientWrapper() {
  const selectedCompany = useCompanyStore((state) => state.selectedCompany);
  const { interviews, isLoading: interviewsLoading, error } = useInterviewStore();

  // Load data when component mounts or company changes
  useEffect(() => {
    if (selectedCompany) {
      const { loadInterviews } = useInterviewStore.getState();
      loadInterviews();
    }
  }, [selectedCompany?.id]);

  // Show message when no company is selected
  if (!selectedCompany) {
    return <InterviewsEmptyState type="no-company" />;
  }

  // Show error state
  if (error) {
    const handleRetry = () => {
      const { loadInterviews, clearError } = useInterviewStore.getState();
      clearError();
      loadInterviews();
    };

    return (
      <InterviewsEmptyState 
        type="error" 
        error={error}
        onRetry={handleRetry}
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