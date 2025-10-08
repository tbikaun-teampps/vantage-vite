import { NewAssessmentForm } from "../../new/components";
import { usePageTitle } from "@/hooks/usePageTitle";

export function NewDesktopAssessmentPage() {
  usePageTitle("New Desktop Assessment");
  return <NewAssessmentForm />;
}
