import { useAssessmentStore } from "@/stores/assessment-store";
import { useCompanyStore } from "@/stores/company-store";
import { AssessmentsDataTable } from "./assessments-data-table";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAssessmentContext } from "@/hooks/useAssessmentContext";

export function AssessmentsPageContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { assessments, isLoading, error, loadAssessments } =
    useAssessmentStore();
  const selectedCompany = useCompanyStore((state) => state.selectedCompany);
  const { createRoute, listRoute } = useAssessmentContext();

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
      ? `${listRoute}?${currentParams.toString()}`
      : listRoute;

    navigate(newUrl);
  };

  return (
    <div
      className="flex flex-1 flex-col h-full overflow-auto mx-auto px-6"
      data-tour="assessments-main"
    >
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="mt-1" data-tour="assessments-table">
          <AssessmentsDataTable
            data={assessments}
            isLoading={isLoading}
            error={error}
            defaultTab={defaultTab}
            onTabChange={handleTabChange}
            onCreateAssessment={() => navigate(createRoute)}
            onRetry={() =>
              selectedCompany && loadAssessments(undefined, selectedCompany.id)
            }
          />
        </div>
      </div>
    </div>
  );
}
