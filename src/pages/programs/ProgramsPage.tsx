import { DashboardPage } from "@/components/dashboard-page";
import { ProgramsClientWrapper } from "./components/programs-client-wrapper";
import { usePageTitle } from "@/hooks/usePageTitle";

export function ProgramsPage() {
  usePageTitle("Programs");
  
  return (
    <DashboardPage
      title="Programs"
      description="Manage and view your programs and their objectives"
    >
      <ProgramsClientWrapper />
    </DashboardPage>
  );
}
