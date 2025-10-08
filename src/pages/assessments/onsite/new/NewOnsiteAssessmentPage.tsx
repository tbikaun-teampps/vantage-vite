import { NewAssessmentForm } from "@/pages/assessments/new/components/new-assessment-form";
import { usePageTitle } from "@/hooks/usePageTitle";

export function NewOnsiteAssessmentPage() {
  usePageTitle("New Assessment");
  return <NewAssessmentForm />;
}
