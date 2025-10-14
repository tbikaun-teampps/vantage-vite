import { usePageTitle } from "@/hooks/usePageTitle";
import { RecommendationsTable } from "./components/recommendations-table";
import { DashboardPage } from "@/components/dashboard-page";

export function RecommendationsPage() {
  usePageTitle("Recommendations");

  return (
    <DashboardPage
      title="Recommendations"
      description="Review and manage recommendations"
      showBack
    >
      <RecommendationsTable />
    </DashboardPage>
  );
}
