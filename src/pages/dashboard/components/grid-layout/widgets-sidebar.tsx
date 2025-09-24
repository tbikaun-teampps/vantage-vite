import { Plus } from "lucide-react";
import {
  availableWidgets,
  type Widget,
} from "@/pages/dashboard/components/widgets";

interface WidgetsSidebarProps {
  onAddWidget: (widgetId: string) => void;
}

export const WidgetsSidebar: React.FC<WidgetsSidebarProps> = ({
  onAddWidget,
}) => {
  // Group widgets by category
  const widgetsByCategory = availableWidgets.reduce(
    (acc: Record<string, Widget[]>, widget: Widget) => {
      if (!acc[widget.category]) acc[widget.category] = [];
      acc[widget.category].push(widget);
      return acc;
    },
    {} as Record<string, Widget[]>
  );

  return (
    <div className="w-80 border-r border-border p-4 overflow-y-auto">
      <h3 className="font-semibold text-lg mb-4">Add Widgets</h3>
      <div className="space-y-4">
        {Object.entries(widgetsByCategory).map(([category, widgets]) => (
          <div key={category}>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">
              {category}
            </h4>
            <div className="space-y-2">
              {widgets.map((widget: Widget) => (
                <button
                  key={widget.id}
                  onClick={() => onAddWidget(widget.id)}
                  className="w-full p-3 bg-card text-left border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <widget.icon
                      size={20}
                      className="text-muted-foreground mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{widget.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {widget.description}
                      </div>
                    </div>
                    <Plus size={16} className="text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
