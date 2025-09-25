import { useActivityData } from "@/hooks/widgets/useActivityData";
import type { WidgetComponentProps } from "./types";
import { Badge } from "@/components/ui/badge";

const getStatusColor = (status: string) => {
  switch (status) {
    // Interview statuses
    case "pending":
      return "bg-amber-300 text-amber-800";
    case "in_progress":
      return "bg-blue-300 text-blue-800";
    case "completed":
      return "bg-green-300 text-green-800";
    case "cancelled":
      return "bg-red-300 text-red-800";
    // Assessment statuses
    case "draft":
      return "bg-gray-300 text-gray-800";
    case "active":
      return "bg-blue-300 text-blue-800";
    case "under_review":
      return "bg-orange-300 text-orange-800";
    case "archived":
      return "bg-slate-300 text-slate-800";
    default:
      return "bg-gray-300 text-gray-800";
  }
};

const ActivityWidget: React.FC<WidgetComponentProps> = ({ config }) => {
  const currentEntityType = config?.entity?.entityType || "assessments";
  const { data } = useActivityData(config?.entity);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between flex-shrink-0 mb-3">
        <span className="text-sm font-medium capitalize">
          {currentEntityType}
        </span>
        <Badge variant="secondary">{data?.total} total</Badge>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {data?.breakdown &&
          Object.entries(data.breakdown).map(([status, count], index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm flex-shrink-0"
            >
              <div className="flex items-center gap-2">
                <span className="capitalize">{status.replace(/_/g, " ")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{count}</span>
                <div
                  className={`w-2 h-2 rounded-full ${getStatusColor(status).split(" ")[0]}`}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ActivityWidget;
