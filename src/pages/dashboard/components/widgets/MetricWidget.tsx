import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, Loader2 } from "lucide-react";
import type { WidgetComponentProps } from "./types";
import { useMetricData } from "@/hooks/widgets";

const MetricWidget: React.FC<WidgetComponentProps> = ({ config }) => {
  const metricConfig = config?.metric;
  // const { data, isLoading, isFetching, error } = useMetricData(metricConfig);

  // If no config exists, show muted alert
  if (!metricConfig) {
    return (
      <div className="space-y-2">
        <div className="text-2xl font-bold text-muted-foreground">-</div>
        <Alert className="bg-muted/30 border-muted">
          <Settings className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm">Configure this metric to see data</span>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Loading state (initial load or refresh)
  // if (isLoading || (isFetching && !data)) {
  //   return (
  //     <div className="space-y-3">
  //       <div className="space-y-1">
  //         <div className="text-2xl font-bold flex items-center gap-2">
  //           <Loader2 className="h-5 w-5 animate-spin" />
  //           Loading...
  //         </div>
  //         <div className="text-sm text-muted-foreground">
  //           Loading metric data
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // Error state
  // if (error) {
  //   return (
  //     <div className="space-y-2">
  //       <div className="text-2xl font-bold text-destructive">Error</div>
  //       <Alert className="bg-destructive/10 border-destructive">
  //         <AlertDescription className="text-sm">
  //           Failed to load metric data
  //         </AlertDescription>
  //       </Alert>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-3 relative">
      {/* {isFetching && data && (
        <div className="absolute top-0 right-0">
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        </div>
      )} */}
      <div className="space-y-1">
        {/* <div className="text-2xl font-bold">{data?.value}</div>
        <div className="text-sm text-muted-foreground">{data?.label}</div> */}
      </div>
      <Badge variant="outline" className="text-xs capitalize">
        {metricConfig.metricType.replace(/-/g, " ")}
      </Badge>
    </div>
  );
};

export default MetricWidget;
