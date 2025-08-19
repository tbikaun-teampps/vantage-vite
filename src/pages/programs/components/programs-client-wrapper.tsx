import { Suspense } from "react";
import { usePrograms } from "@/hooks/useProgram";
import { ProgramsPageContent } from "./programs-page-content";
import { ProgramsEmptyState } from "./programs-empty-state";
import { ProgramsLoadingSkeleton } from "./programs-loading-skeleton";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";

export function ProgramsClientWrapper() {
  const companyId = useCompanyFromUrl();

  const {
    data: programs = [],
    isLoading,
    error,
    refetch,
  } = usePrograms(companyId);

  // Show error state
  if (error) {
    const handleRetry = () => {
      refetch();
    };

    return (
      <ProgramsEmptyState
        type="error"
        error={error.message}
        onRetry={handleRetry}
      />
    );
  }

  // Show loading skeleton when initially loading
  if (isLoading && programs.length === 0) {
    return <ProgramsLoadingSkeleton />;
  }

  // Render main content with suspense boundary
  return (
    <Suspense fallback={<ProgramsLoadingSkeleton />}>
      <ProgramsPageContent programs={programs} isLoading={isLoading} />
    </Suspense>
  );
}