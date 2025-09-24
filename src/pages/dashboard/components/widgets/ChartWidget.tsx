import type { WidgetComponentProps } from "./types";

const ChartWidget: React.FC<WidgetComponentProps> = ({ widgetId }) => (
  <div className="h-32 bg-muted/30 rounded flex items-center justify-center">
    <span className="text-muted-foreground">Chart Placeholder</span>
  </div>
);

export default ChartWidget;