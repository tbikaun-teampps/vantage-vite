import type { WidgetComponentProps } from "./types";

const ActivityWidget: React.FC<WidgetComponentProps> = () => (
  <div className="space-y-2">
    <div className="text-sm">Assessment completed</div>
    <div className="text-sm">New action item created</div>
    <div className="text-sm">Report generated</div>
  </div>
);

export default ActivityWidget;