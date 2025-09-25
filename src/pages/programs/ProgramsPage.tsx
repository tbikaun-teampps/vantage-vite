import { DashboardPage } from "@/components/dashboard-page";
import { usePageTitle } from "@/hooks/usePageTitle";
import { usePrograms } from "@/hooks/useProgram";
import { ProgramsPageContent } from "./components/programs-page-content";
import { ProgramsEmptyState } from "./components/programs-empty-state";
import { ProgramsLoadingSkeleton } from "./components/programs-loading-skeleton";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";

export function ProgramsPage() {
  usePageTitle("Programs");

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

  return (
    <DashboardPage
      title="Programs"
      description="Manage and view your programs and their objectives"
    >
      <ProgramsPageContent programs={programs} isLoading={isLoading} />
    </DashboardPage>
  );
}
