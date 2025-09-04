import { Suspense } from "react";
import { useQuestionnaires } from "@/hooks/useQuestionnaires";
import { QuestionnairesPageContent } from "./questionnaires-page-content";
import { QuestionnairesEmptyState } from "./questionnaires-empty-state";
import { QuestionnairesLoadingSkeleton } from "./questionnaires-loading-skeleton";

export function QuestionnairesClientWrapper() {
  const { data: questionnaires = [], isLoading, error, refetch } = useQuestionnaires();

  // Show error state
  if (error) {
    return (
      <QuestionnairesEmptyState 
        type="error" 
        error={error.message}
        onRetry={() => refetch()}
      />
    );
  }

  // Show loading skeleton when initially loading
  if (isLoading && questionnaires.length === 0) {
    return <QuestionnairesLoadingSkeleton />;
  }

  // Render main content with suspense boundary
  return (
    <Suspense fallback={<QuestionnairesLoadingSkeleton />}>
      <QuestionnairesPageContent />
    </Suspense>
  );
}