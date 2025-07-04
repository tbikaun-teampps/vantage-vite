import { DashboardClientWrapper } from "./components/dashboard-client-wrapper";
import { usePageTitle } from "@/hooks/usePageTitle";

export function DashboardPage() {
  usePageTitle("Dashboard");
  return <DashboardClientWrapper />;
}
