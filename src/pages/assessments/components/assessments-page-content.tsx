import { AssessmentsDataTable } from "./assessments-data-table";
import { useSearchParams } from "react-router-dom";
import { useAssessmentContext } from "@/hooks/useAssessmentContext";
import type { AssessmentWithCounts } from "@/types/assessment";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";

interface AssessmentsPageContentProps {
  assessments: AssessmentWithCounts[];
  isLoading: boolean;
  error?: string;
  onRetry: () => void;
}

export function AssessmentsPageContent({
  assessments,
  isLoading,
  error,
  onRetry,
}: AssessmentsPageContentProps) {
  const navigate = useCompanyAwareNavigate();
  const [searchParams] = useSearchParams();
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
            onRetry={onRetry}
          />
        </div>
      </div>
    </div>
  );
}
