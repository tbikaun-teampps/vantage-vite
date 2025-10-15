import { usePageTitle } from "@/hooks/usePageTitle";
import { DashboardPage } from "@/components/dashboard-page";
import { TabSwitcher } from "./assessments/components/page-components/tab-switcher";
import { GeographyView } from "./assessments/components/page-components/geography-view";
import AssessmentHeatmap from "./assessments/heatmap";
import { AnalyticsProvider, useAnalytics } from "./context/AnalyticsContext";

function AnalyticsPageContent() {
  const { activeView } = useAnalytics();

  return (
    <DashboardPage
      title="Analytics"
      description="Performance metrics and geographic distribution analysis"
      headerActions={<TabSwitcher />}
      tourId="analytics-main"
    >
      {activeView === "metrics" ? <AssessmentHeatmap /> : <GeographyView />}
    </DashboardPage>
  );
}

export function AnalyticsPage() {
  usePageTitle("Analytics");

  return (
    <AnalyticsProvider>
      <AnalyticsPageContent />
    </AnalyticsProvider>
  );
}
