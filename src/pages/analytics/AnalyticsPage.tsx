import { usePageTitle } from "@/hooks/usePageTitle";
import { AnalyticsWrapper } from "./assessments/components/page-components";

export function AnalyticsPage() {
  usePageTitle("Analytics");
  return (
    <AnalyticsWrapper/>
  );
}
