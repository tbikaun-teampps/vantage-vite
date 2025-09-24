import { BarChart3, Activity, Clock, Zap } from "lucide-react";
import MetricsWidget from "./MetricsWidget";
import ChartWidget from "./ChartWidget";
import ActivityWidget from "./ActivityWidget";
import ActionsWidget from "./ActionsWidget";
import type { Widget } from "./types";

export const availableWidgets: Widget[] = [
  {
    id: "metrics",
    title: "Key Metrics",
    category: "Analytics",
    component: MetricsWidget,
    defaultSize: { w: 4, h: 3 },
    description: "Display key performance metrics",
    icon: BarChart3,
  },
  {
    id: "chart",
    title: "Analytics Chart",
    category: "Analytics",
    component: ChartWidget,
    defaultSize: { w: 8, h: 5 },
    description: "Interactive analytics visualization",
    icon: Activity,
  },
  {
    id: "activity",
    title: "Recent Activity",
    category: "Monitoring",
    component: ActivityWidget,
    defaultSize: { w: 4, h: 5 },
    description: "Show recent system activity",
    icon: Clock,
  },
  {
    id: "actions",
    title: "Quick Actions",
    category: "Actions",
    component: ActionsWidget,
    defaultSize: { w: 4, h: 3 },
    description: "Common action shortcuts",
    icon: Zap,
  },
];

// Helper function to get widget by ID
export const getWidget = (widgetId: string) =>
  availableWidgets.find((w) => w.id === widgetId);

// Export types and components
export type { Widget, WidgetComponentProps } from "./types";
export { MetricsWidget, ChartWidget, ActivityWidget, ActionsWidget };
export { WidgetContainer } from "./WidgetContainer";