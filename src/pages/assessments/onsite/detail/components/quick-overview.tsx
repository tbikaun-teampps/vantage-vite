
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { InterviewWithRelations } from "@/types/interview";

interface QuickOverviewProps {
  interviews: InterviewWithRelations[];
}

export function QuickOverview({ interviews }: QuickOverviewProps) {
  const completedCount = interviews.filter(
    (i) => i.status === "completed"
  ).length;
  const inProgressCount = interviews.filter(
    (i) => i.status === "in_progress"
  ).length;
  const pendingCount = interviews.filter((i) => i.status === "pending").length;

  return (
    <Card className="h-full" data-tour="quick-overview-card">
      <CardHeader>
        <CardTitle className="text-base">Quick Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Total Interviews
            </span>
            <Badge variant="outline">{interviews.length}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Completed</span>
            <Badge
              variant="outline"
              className="text-green-500 border-green-200  dark:border-green-800"
            >
              {completedCount}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">In Progress</span>
            <Badge
              variant="outline"
              className="text-blue-500 border-blue-200  dark:border-blue-800"
            >
              {inProgressCount}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Pending</span>
            <Badge
              variant="outline"
              className="text-yellow-500 border-yellow-200 dark:border-yellow-800"
            >
              {pendingCount}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
