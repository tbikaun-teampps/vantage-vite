import { SimpleDesktopAssessmentForm } from "./components/SimpleDesktopAssessmentForm";
import { usePageTitle } from "@/hooks/usePageTitle";

export function NewDesktopAssessmentPage() {
  usePageTitle("New Desktop Assessment");
  return <SimpleDesktopAssessmentForm />;
}