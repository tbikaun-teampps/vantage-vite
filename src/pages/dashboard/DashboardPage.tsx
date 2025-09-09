import { usePageTitle } from "@/hooks/usePageTitle";
import { DashboardPageContent } from "./components/dashboard-page-content";

export function DashboardPage() {
  usePageTitle("Dashboard");
  return <DashboardPageContent />;
}
