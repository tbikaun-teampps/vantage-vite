import { Suspense } from "react";
import { DashboardPageContent } from "./dashboard-page-content";
import { DashboardLoadingSkeleton } from "./dashboard-loading-skeleton";

export function DashboardClientWrapper() {
  return (
    <Suspense fallback={<DashboardLoadingSkeleton />}>
      <DashboardPageContent />
    </Suspense>
  );
}