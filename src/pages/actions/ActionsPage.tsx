import { usePageTitle } from "@/hooks/usePageTitle";
import { ActionsTable } from "./components/actions-table";
import { DashboardPage } from "@/components/dashboard-page";

export function ActionsPage() {
  usePageTitle("Actions");
  return (
    <DashboardPage
      title="Actions"
      description="Review and manage action items"
      showBack
    >
      <ActionsTable />
    </DashboardPage>
  );
}
