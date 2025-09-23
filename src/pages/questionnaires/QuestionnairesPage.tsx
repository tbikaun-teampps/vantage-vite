import { DashboardPage } from "@/components/dashboard-page";
import { QuestionnairesClientWrapper } from "./components/questionnaires-client-wrapper";
import { usePageTitle } from "@/hooks/usePageTitle";

export function QuestionnairesPage() {
  usePageTitle("Questionnaires", "Onsite");
  return (
    <DashboardPage
      title="Questionnaires"
      description="Manage and view your questionnaires"
    >
      <QuestionnairesClientWrapper />
    </DashboardPage>
  );
}
