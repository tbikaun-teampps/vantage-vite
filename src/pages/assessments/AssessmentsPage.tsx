import { DashboardPage } from "@/components/dashboard-page";
import { AssessmentsClientWrapper } from "./components/assessments-client-wrapper";
import { usePageTitle } from "@/hooks/usePageTitle";

export function AssessmentsPage() {
  usePageTitle("Assessments");
  return (
    <DashboardPage
      title="Assessments"
      description="Manage and view your assessments"
    >
      <AssessmentsClientWrapper />
    </DashboardPage>
  );
}
