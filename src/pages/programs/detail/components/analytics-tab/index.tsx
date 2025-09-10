import { ProgramMetricsLineChart } from "./program-metrics-line-chart";
import { PresiteInterviewsLineChart, OnsiteInterviewsLineChart } from "./presite-interviews-line-chart";

export function AnalyticsTab({ programId }: { programId: number }) {
  return (
    <div className="h-full space-y-6 mb-6">
      <ProgramMetricsLineChart programId={programId} />
      <PresiteInterviewsLineChart programId={programId} />
      <OnsiteInterviewsLineChart programId={programId} />
    </div>
  );
}
