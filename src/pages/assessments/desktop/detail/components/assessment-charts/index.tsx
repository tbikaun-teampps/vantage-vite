import { ChartBarLabelCustom } from "./bar-chart";
import { useAssessmentMeasurementsBarChart } from "@/hooks/use-assessment-measurements";

export function AssessmentCharts({ assessmentId }: { assessmentId: number }) {
  const { data, isLoading, error } =
    useAssessmentMeasurementsBarChart(assessmentId);

  if (!assessmentId) {
    return null;
  }

  if (isLoading) {
    return <div>Loading chart data...</div>;
  }

  if (error) {
    return <div>Error loading chart data: {error.message}</div>;
  }

  if (!data || data.length === 0) {
    return <div>No chart data available</div>;
  }

  return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {data
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((chartData) => (
            <ChartBarLabelCustom
              key={chartData.name}
              title={chartData.name}
              data={chartData.data}
            />
          ))}
      </div>
  );
}
