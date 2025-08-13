import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
// import { ChartAreaInteractive } from "./chart-area-interactive";
import { DashboardDataTable } from "./data-table";
import { SectionCards } from "./section-cards";
import { QuickActions } from "./quick-actions";
import {
  useQuestionAnalytics,
  useDashboardMetricsWithAnalytics,
} from "@/hooks/useDashboard";
import { useAssessments } from "@/hooks/useAssessments";
import { useCompanyStore } from "@/stores/company-store";
import { useTourManager } from "@/lib/tours";

export function DashboardPageContent() {
  const selectedCompany = useCompanyStore((state) => state.selectedCompany);
  const { data: assessments = [], isLoading: assessmentsLoading } =
    useAssessments(
      selectedCompany ? { company_id: selectedCompany.id } : undefined
    );

  // Get assessment IDs for dashboard queries
  const assessmentIds = useMemo(
    () => assessments.map((a) => a.id),
    [assessments]
  );

  // Load dashboard metrics with analytics enhancement
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
  } = useDashboardMetricsWithAnalytics(selectedCompany?.id, assessmentIds);

  // Load question analytics separately for the table
  const {
    data: questionAnalytics = [],
    isLoading: questionAnalyticsLoading,
    error: questionAnalyticsError,
  } = useQuestionAnalytics({ assessmentIds, limit: 20 });

  // Unified loading state
  const isLoading = metricsLoading || questionAnalyticsLoading;

  const { startTour } = useTourManager();
  const [searchParams] = useSearchParams();

  // Calculate assessment counts
  const { activeCount, completedCount } = useMemo(() => {
    const active = assessments.filter((a) => a.status === "active").length;
    const completed = assessments.filter(
      (a) => a.status === "completed"
    ).length;
    return { activeCount: active, completedCount: completed };
  }, [assessments]);

  // Check for tour parameter from welcome flow
  useEffect(() => {
    if (searchParams.get("tour") === "true" && !isLoading) {
      // Start dashboard tour after a brief delay to ensure content is loaded
      const timer = setTimeout(() => {
        startTour("platform-overview", true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [searchParams, startTour, isLoading]);

  return (
    <div
      className="flex flex-1 flex-col overflow-auto pb-6"
      data-tour="dashboard-main"
    >
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="@container/main" data-tour="dashboard-cards">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-32 bg-muted/50 border rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              <SectionCards metrics={metrics || {}} />
            )}
          </div>

          {/* Quick Actions Section */}
          <div data-tour="dashboard-quick-actions">
            {isLoading || assessmentsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 lg:px-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-10 bg-card border rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              <QuickActions
                activeCount={activeCount}
                completedCount={completedCount}
              />
            )}
          </div>

          {/* <div className="px-4 lg:px-6" data-tour="dashboard-chart">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-64 bg-muted/50 border rounded-lg"></div>
              </div>
            ) : (
              <ChartAreaInteractive />
            )}
          </div> */}
          <div data-tour="dashboard-table">
            {isLoading ? (
              <div className="animate-pulse space-y-4 p-6">
                <div className="h-8 bg-muted/50 rounded w-1/3"></div>
                <div className="border rounded-lg">
                  <div className="h-12 bg-muted/30 border-b"></div>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 border-b last:border-b-0 bg-muted/20"
                    ></div>
                  ))}
                </div>
              </div>
            ) : (
              <DashboardDataTable
                data={questionAnalytics}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
