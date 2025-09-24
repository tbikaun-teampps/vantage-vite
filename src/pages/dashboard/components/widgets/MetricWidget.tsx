import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings } from "lucide-react";
import type { WidgetComponentProps, MetricConfig } from "./types";

// Import mock data
import { mockEntityData as entityData } from "./types";

const MetricWidget: React.FC<WidgetComponentProps> = ({ widgetId, config }) => {
  const metricConfig = config?.metric;

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

  const value = metricConfig.entities === "all" ? "All" : Array.isArray(metricConfig.entities) ? metricConfig.entities.length : 0; // Placeholder logic
  const label = metricConfig.label || "Unnamed Metric";

  // Helper function to render entity badges
  const renderEntityBadges = (config: MetricConfig) => {
    if (config.entities === "all") {
      return (
        <Badge variant="secondary" className="text-xs">
          All {config.entityType}
        </Badge>
      );
    }

    const entityArray = Array.isArray(config.entities) ? config.entities : [];
    const data = entityData[config.entityType];
    const entityNames = entityArray
      .map((id) => data.find((entity) => entity.id === id)?.name || id)
      .filter(Boolean);

    if (entityNames.length === 0) {
      return (
        <Badge variant="secondary" className="text-xs">
          No entities
        </Badge>
      );
    }

    if (entityNames.length <= 2) {
      return (
        <>
          {entityNames.map((name, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {name}
            </Badge>
          ))}
        </>
      );
    }

    return (
      <>
        {entityNames.slice(0, 2).map((name, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {name}
          </Badge>
        ))}
        <Badge variant="secondary" className="text-xs">
          +{entityNames.length - 2} more
        </Badge>
      </>
    );
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
      <div className="flex flex-wrap gap-1">
        <Badge variant="outline" className="text-xs capitalize">
          {metricConfig.entityType}
        </Badge>
        {renderEntityBadges(metricConfig)}
      </div>
    </div>
  );
};

export default MetricWidget;
