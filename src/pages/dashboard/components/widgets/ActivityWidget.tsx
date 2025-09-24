import type { WidgetComponentProps } from "./types";
import { mockEntityData } from "./types";
import { Badge } from "@/components/ui/badge";

type EntityType = "interviews" | "assessments" | "programs";

interface ActivityItem {
  label: string;
  count?: number;
  status?: string;
}

const ACTIVITY_SETS: Record<EntityType, ActivityItem[]> = {
  interviews: [
    { label: "Completed this week", count: 8, status: "success" },
    { label: "Scheduled today", count: 3, status: "pending" },
    { label: "Awaiting feedback", count: 12, status: "warning" },
  ],
  assessments: [
    { label: "Assessment completed", count: 24, status: "success" },
    { label: "New results available", count: 6, status: "info" },
    { label: "Pending reviews", count: 9, status: "warning" },
  ],
  programs: [
    { label: "Enrollments this month", count: 15, status: "success" },
    { label: "In progress", count: 22, status: "info" },
    { label: "Completion pending", count: 5, status: "warning" },
  ],
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "success":
      return "bg-green-100 text-green-800";
    case "warning":
      return "bg-yellow-100 text-yellow-800";
    case "info":
      return "bg-blue-100 text-blue-800";
    case "pending":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const ActivityWidget: React.FC<WidgetComponentProps> = ({
  widgetId,
  config,
}) => {
  const currentEntityType = config?.entity?.entityType || "assessments";
  const activities = ACTIVITY_SETS[currentEntityType];
  const entityData = mockEntityData[currentEntityType] || [];
  const totalCount = entityData.reduce((sum, entity) => sum + entity.count, 0);

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium capitalize">
            {currentEntityType}
          </span>
          <Badge variant="secondary">{totalCount} total</Badge>
        </div>

        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-sm"
          >
            <span>{activity.label}</span>
            <div className="flex items-center gap-2">
              {activity.count && (
                <span className="font-medium">{activity.count}</span>
              )}
              {activity.status && (
                <div
                  className={`w-2 h-2 rounded-full ${getStatusColor(activity.status).split(" ")[0]}`}
                />
              )}
            </div>
          </div>
        ))}

        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            Recent activity from {currentEntityType}
          </div>
        </div>
      </div>
    </>
  );
};

export default ActivityWidget;
