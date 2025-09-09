import { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Loader2, TrendingUp } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useProgramById } from "@/hooks/useProgram";
import { metricsService } from "@/lib/supabase/metrics-service";
import type { CalculatedMetricWithDefinition } from "@/lib/supabase/metrics-service";
import { BRAND_COLORS } from "@/lib/brand";

interface ProgramMetricsLineChartProps {
  programId: number;
}

interface ChartDataPoint {
  phaseName: string;
  phaseSequence: number;
  [metricName: string]: string | number;
}

export function ProgramMetricsLineChart({ programId }: ProgramMetricsLineChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>("all");
  const [metricsData, setMetricsData] = useState<Record<number, CalculatedMetricWithDefinition[]>>({});
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState<Error | null>(null);

  // Fetch program data including phases
  const { data: program, isLoading: programLoading, error: programError } = useProgramById(programId);

  // Get all phases for this program
  const phases = program?.phases || [];

  // Fetch calculated metrics for all phases directly from Supabase
  useEffect(() => {
    if (!program || phases.length === 0) return;

    const fetchMetricsForAllPhases = async () => {
      setMetricsLoading(true);
      setMetricsError(null);
      
      try {
        const metricsMap: Record<number, CalculatedMetricWithDefinition[]> = {};
        
        // Fetch metrics for each phase
        await Promise.all(
          phases.map(async (phase) => {
            const metrics = await metricsService.getCalculatedMetrics(phase.id, program.company_id);
            metricsMap[phase.id] = metrics;
          })
        );
        
        setMetricsData(metricsMap);
      } catch (error) {
        console.error("Failed to fetch metrics data:", error);
        setMetricsError(error instanceof Error ? error : new Error("Failed to fetch metrics"));
      } finally {
        setMetricsLoading(false);
      }
    };

    fetchMetricsForAllPhases();
  }, [program, phases]);

  // Transform data for the line chart
  const chartData = useMemo((): ChartDataPoint[] => {
    if (!program || phases.length === 0 || Object.keys(metricsData).length === 0) return [];

    // Get all unique metric names across all phases
    const allMetrics = new Set<string>();
    Object.values(metricsData).forEach(phaseMetrics => {
      phaseMetrics.forEach(metric => {
        if (metric.metric_definition?.name) {
          allMetrics.add(metric.metric_definition.name);
        }
      });
    });

    // Create chart data points
    return phases
      .sort((a, b) => a.sequence_number - b.sequence_number)
      .map((phase) => {
        const phaseMetrics = metricsData[phase.id] || [];
        
        const dataPoint: ChartDataPoint = {
          phaseName: phase.name || `Phase ${phase.sequence_number}`,
          phaseSequence: phase.sequence_number,
        };

        // Add each metric value to the data point
        allMetrics.forEach(metricName => {
          const metric = phaseMetrics.find(m => m.metric_definition?.name === metricName);
          dataPoint[metricName] = metric?.calculated_value || 0;
        });

        return dataPoint;
      });
  }, [program, phases, metricsData]);

  // Get available metrics for the selector
  const availableMetrics = useMemo(() => {
    if (chartData.length === 0) return [];
    
    const metrics = new Set<string>();
    chartData.forEach(point => {
      Object.keys(point).forEach(key => {
        if (key !== 'phaseName' && key !== 'phaseSequence') {
          metrics.add(key);
        }
      });
    });
    
    return Array.from(metrics).sort();
  }, [chartData]);

  // Get colors for lines (cycling through brand colors)
  const getLineColor = (index: number) => {
    const colors = [
      BRAND_COLORS.royalBlue,
      BRAND_COLORS.mediumPurple,
      BRAND_COLORS.malibu,
      BRAND_COLORS.cyan,
      BRAND_COLORS.luckyPoint,
    ];
    return colors[index % colors.length];
  };

  if (programLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading program data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (programError) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load program data: {programError.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (metricsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading metrics data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (metricsError) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load metrics data: {metricsError.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (phases.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Phases Found</AlertTitle>
            <AlertDescription>
              This program doesn't have any phases yet. Create phases to see metrics over time.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (availableMetrics.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Metrics Data</AlertTitle>
            <AlertDescription>
              No calculated metrics found for this program's phases. Complete interviews and calculations to see trend data.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const metricsToShow = selectedMetric === "all" ? availableMetrics : [selectedMetric];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Program Metrics Trend
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Track metric values across program phases
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {phases.length} Phase{phases.length !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {availableMetrics.length} Metric{availableMetrics.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Metric:</label>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-[200px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Metrics</SelectItem>
              {availableMetrics.map(metric => (
                <SelectItem key={metric} value={metric}>
                  {metric}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="phaseName"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: 'Metric Value', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                }}
                labelStyle={{ color: 'var(--foreground)' }}
              />
              <Legend />
              
              {metricsToShow.map((metric, index) => (
                <Line
                  key={metric}
                  type="monotone"
                  dataKey={metric}
                  stroke={getLineColor(index)}
                  strokeWidth={2}
                  dot={{ fill: getLineColor(index), strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: getLineColor(index), strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}