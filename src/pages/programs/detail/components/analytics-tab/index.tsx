import { ProgramMetricsLineChart } from "./program-metrics-line-chart";
import { PresiteInterviewsLineChart } from "./presite-interviews-line-chart";

export function AnalyticsTab({ programId }: { programId: number }) {
  return (
    <div className="h-full p-6 space-y-6">
      <ProgramMetricsLineChart programId={programId} />
      <PresiteInterviewsLineChart programId={programId} />
    </div>
  );
}
