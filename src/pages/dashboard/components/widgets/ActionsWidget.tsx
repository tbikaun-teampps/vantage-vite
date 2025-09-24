import type { WidgetComponentProps } from "./types";

const ActionsWidget: React.FC<WidgetComponentProps> = () => (
  <div className="space-y-2">
    <button className="w-full text-left text-sm p-2 hover:bg-muted/50 rounded">
      Create Assessment
    </button>
    <button className="w-full text-left text-sm p-2 hover:bg-muted/50 rounded">
      View Reports
    </button>
  </div>
);

export default ActionsWidget;