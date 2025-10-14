import { usePageTitle } from "@/hooks/usePageTitle";
import { GridLayout } from "./components/grid-layout";

export function DashboardPage() {
  usePageTitle("Dashboard");
  return <GridLayout />;
}
