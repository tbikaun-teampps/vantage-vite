import { usePageTitle } from "@/hooks/usePageTitle";
// import { DashboardPageContent } from "./components/dashboard-page-content";
import { GridLayout } from "./components/grid-layout";

export function DashboardPage() {
  usePageTitle("Dashboard");
  // return <DashboardPageContent />;
  return <GridLayout />;
}
