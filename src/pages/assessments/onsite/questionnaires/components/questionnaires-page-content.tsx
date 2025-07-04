import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuestionnaireStore } from "@/stores/questionnaire-store";
import { QuestionnairesDataTable } from "./questionnaires-data-table";

export function QuestionnairesPageContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { questionnaires, isLoading, error, loadQuestionnaires } =
    useQuestionnaireStore();

  // Get the tab from query params (e.g., ?tab=active)
  const tabParam = searchParams.get("tab");
  const defaultTab = tabParam || "all";

  // Handle tab changes - update URL with new tab parameter
  const handleTabChange = (newTab: string) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    if (newTab === "all") {
      currentParams.delete("tab");
    } else {
      currentParams.set("tab", newTab);
    }

    const newUrl = currentParams.toString()
      ? `/assessments/onsite/questionnaires?${currentParams.toString()}`
      : "/assessments/onsite/questionnaires";

    navigate(newUrl);
  };

  return (
    <div
      className="flex flex-1 flex-col mx-auto h-full overflow-auto px-6"
      data-tour="questionnaires-main"
    >
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="mt-1" data-tour="questionnaires-table">
          <QuestionnairesDataTable
            questionnaires={questionnaires}
            isLoading={isLoading}
            error={error}
            defaultTab={defaultTab}
            onTabChange={handleTabChange}
            onRetry={() => loadQuestionnaires()}
          />
        </div>
      </div>
    </div>
  );
}
