import { Suspense } from "react";
import { DashboardPageContent } from "@/pages/dashboard/components/dashboard-page-content";
import { DashboardLoadingSkeleton } from "@/pages/dashboard/components/dashboard-loading-skeleton";

export function DashboardClientWrapper() {
  return (
    <Suspense fallback={<DashboardLoadingSkeleton />}>
      <DashboardPageContent />
    </Suspense>
  );
}
