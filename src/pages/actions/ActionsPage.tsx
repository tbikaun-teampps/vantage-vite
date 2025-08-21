import { usePageTitle } from "@/hooks/usePageTitle";
import { ActionsTable } from "./components/actions-table";

export function ActionsPage() {
  usePageTitle("Actions");
  return <ActionsTable />;
}