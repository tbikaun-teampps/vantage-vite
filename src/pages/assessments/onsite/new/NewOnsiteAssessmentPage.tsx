import { NewAssessmentForm } from "./components";
import { usePageTitle } from "@/hooks/usePageTitle";

export function NewOnsiteAssessmentPage() {
  usePageTitle("New Assessment");
  return <NewAssessmentForm />;
}
