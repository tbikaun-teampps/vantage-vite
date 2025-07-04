import { Suspense, useEffect } from "react";
import { useQuestionnaireStore } from "@/stores/questionnaire-store";
import { QuestionnairesPageContent } from "./questionnaires-page-content";
import { QuestionnairesEmptyState } from "./questionnaires-empty-state";
import { QuestionnairesLoadingSkeleton } from "./questionnaires-loading-skeleton";

export function QuestionnairesClientWrapper() {
  const { questionnaires, isLoading, error } = useQuestionnaireStore();

  // Load data when component mounts
  useEffect(() => {
    const { loadQuestionnaires } = useQuestionnaireStore.getState();
    loadQuestionnaires();
  }, []);

  // Show error state
  if (error) {
    const handleRetry = () => {
      const { loadQuestionnaires, clearError } = useQuestionnaireStore.getState();
      clearError();
      loadQuestionnaires();
    };

    return (
      <QuestionnairesEmptyState 
        type="error" 
        error={error}
        onRetry={handleRetry}
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