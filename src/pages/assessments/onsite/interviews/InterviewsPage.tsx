import { DashboardPage } from "@/components/dashboard-page";
import { InterviewsClientWrapper } from "./components/interviews-client-wrapper";
import { usePageTitle } from "@/hooks/usePageTitle";

export function InterviewsPage() {
  usePageTitle("Interviews", "Onsite");
  return (
    <DashboardPage
      title="Interviews"
      description="Manage and view your interviews"
    >
      <InterviewsClientWrapper />
    </DashboardPage>
  );
}
