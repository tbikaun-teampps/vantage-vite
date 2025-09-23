import { usePageTitle } from "@/hooks/usePageTitle";
import { RecommendationsTable } from "./components/recommendations-table";

export function RecommendationsPage() {
  usePageTitle("Recommendations");
  return <RecommendationsTable />;
}