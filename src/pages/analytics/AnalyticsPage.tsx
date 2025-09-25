import { usePageTitle } from "@/hooks/usePageTitle";
import { useSearchParams } from "react-router-dom";
import { DashboardPage } from "@/components/dashboard-page";
import { TabSwitcher } from "./assessments/components/page-components/tab-switcher";
import { MetricsView } from "./assessments/components/page-components/metrics-view";
import { GeographyView } from "./assessments/components/page-components/geography-view";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";

export function AnalyticsPage() {
  usePageTitle("Analytics");
  const navigate = useCompanyAwareNavigate();
  const [searchParams] = useSearchParams();

  // Derive active tab directly from URL
  const viewParam = searchParams.get("view");
  const activeTab = viewParam === "geography" ? "geography" : "metrics";

  // Update URL when tab changes
  const handleTabChange = (newTab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newTab === "metrics") {
      params.delete("view"); // Default view, no need in URL
    } else {
      params.set("view", newTab);
    }
    const queryString = params.toString();
    navigate(`/analytics${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <DashboardPage
      title="Analytics"
      description="Performance metrics and geographic distribution analysis"
      headerActions={
        <TabSwitcher activeTab={activeTab} onTabChange={handleTabChange} />
      }
      tourId="analytics-main"
    >
      {activeTab === "metrics" ? <MetricsView /> : <GeographyView />}
    </DashboardPage>
  );
}
