import { DashboardPage } from "@/components/dashboard-page";
import { AssessmentsClientWrapper } from "./components/assessments-client-wrapper";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAssessmentContext } from "@/hooks/useAssessmentContext";

export function AssessmentsPage() {
  usePageTitle("Assessments");
  const { assessmentType } = useAssessmentContext();
  return (
    <DashboardPage
      title="Assessments"
      description={`Manage and view your ${assessmentType || ""} assessments`}
    >
      <AssessmentsClientWrapper />
    </DashboardPage>
  );
}
