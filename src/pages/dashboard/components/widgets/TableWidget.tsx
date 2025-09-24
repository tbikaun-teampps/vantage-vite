import type { WidgetComponentProps } from "./types";

// Actions
// Recommendations
// Comments

const TableWidget: React.FC<WidgetComponentProps> = ({ widgetId }) => (
  <div className="h-full bg-muted/30 rounded flex items-center justify-center">
    <span className="text-muted-foreground">Table Placeholder</span>
  </div>
);

export default TableWidget;