import {
  IconClock,
  IconTrendingDown,
  IconTrendingUp,
  IconUserCheck,
  IconClipboardCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type DashboardMetrics } from "@/stores/dashboard-store";
import { BRAND_COLORS } from "@/lib/brand";

export function SectionCards({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Combined Assessment Activity Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Assessment Activity</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics.assessments?.total ?? "-"}
            <span className="text-base font-normal text-muted-foreground ml-2">
              assessments
            </span>
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              style={{
                color: BRAND_COLORS.pinkFlamingo,
                borderColor: BRAND_COLORS.pinkFlamingo,
              }}
            >
              Discover
            </Badge>
            {metrics.assessments?.trend !== undefined &&
              metrics.assessments?.status && (
                <Badge
                  variant="outline"
                  style={{
                    color: BRAND_COLORS.mediumPurple,
                    borderColor: BRAND_COLORS.mediumPurple,
                  }}
                  className="ml-2"
                >
                  {metrics.assessments.status === "up" ? (
                    <IconTrendingUp
                      style={{ color: BRAND_COLORS.mediumPurple }}
                    />
                  ) : (
                    <IconTrendingDown style={{ color: "#EA580C" }} />
                  )}
                  {metrics.assessments.status === "up" ? "+" : ""}
                  {metrics.assessments.trend}%
                </Badge>
              )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-3 w-full">
            <div className="flex items-center gap-1">
              <IconUserCheck className="size-4 text-muted-foreground" />
              <span className="font-medium">
                {metrics.peopleInterviewed?.total ?? "-"}
              </span>
              <span className="text-muted-foreground">interviewed</span>
            </div>
            {metrics.peopleInterviewed?.trend !== undefined &&
              metrics.peopleInterviewed?.status && (
                <div className="flex items-center gap-1">
                  {metrics.peopleInterviewed.status === "up" ? (
                    <IconTrendingUp
                      className="size-3"
                      style={{ color: BRAND_COLORS.mediumPurple }}
                    />
                  ) : (
                    <IconTrendingDown
                      className="size-3"
                      style={{ color: "#EA580C" }}
                    />
                  )}
                  <span className="text-xs">
                    {metrics.peopleInterviewed.status === "up" ? "+" : ""}
                    {metrics.peopleInterviewed.trend}%
                  </span>
                </div>
              )}
          </div>
          <div className="text-muted-foreground">
            Strong engagement across assessment programs
          </div>
        </CardFooter>
      </Card>

      {/* Generated Actions Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Generated Actions</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics.generatedActions?.total ?? "-"}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              style={{
                color: BRAND_COLORS.pinkFlamingo,
                borderColor: BRAND_COLORS.pinkFlamingo,
              }}
            >
              Improve
            </Badge>
            <Badge
              variant="outline"
              style={{
                color: BRAND_COLORS.mediumPurple,
                borderColor: BRAND_COLORS.mediumPurple,
              }}
              className="ml-2"
            >
              <IconClipboardCheck className="size-3 mr-1" />
              {metrics.generatedActions?.fromLastWeek ?? "-"} This Week
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-3 w-full">
            <div className="flex items-center gap-1">
              <IconAlertTriangle className="size-4 text-muted-foreground" />
              <span className="font-medium">
                {metrics.generatedActions?.highPriority ?? "-"}
              </span>
              <span className="text-muted-foreground">high priority</span>
            </div>
            <div className="flex items-center gap-1">
              <IconUserCheck className="size-4 text-muted-foreground" />
              <span className="font-medium">
                {metrics.generatedActions?.fromInterviews ?? "-"}
              </span>
              <span className="text-muted-foreground">from interviews</span>
            </div>
          </div>
          <div className="text-muted-foreground">
            Actions identified from assessment responses
          </div>
        </CardFooter>
      </Card>

      {/* Worst Performing Domain Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Worst Performing Domain</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics.worstPerformingArea?.name || "-"}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              style={{
                color: BRAND_COLORS.mediumPurple,
                borderColor: BRAND_COLORS.mediumPurple,
              }}
            >
              Monitor
            </Badge>
            {metrics.worstPerformingArea?.trend !== undefined &&
              metrics.worstPerformingArea?.status && (
                <Badge variant="outline" className="ml-2">
                  {metrics.worstPerformingArea.status === "up" ? (
                    <IconTrendingUp />
                  ) : (
                    <IconTrendingDown />
                  )}
                  {metrics.worstPerformingArea.trend}%
                </Badge>
              )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {metrics.worstPerformingArea?.status ? (
              <>
                Performance decline detected{" "}
                {metrics.worstPerformingArea.status === "up" ? (
                  <IconTrendingUp className="size-4" />
                ) : (
                  <IconTrendingDown className="size-4" />
                )}
              </>
            ) : (
              "Domain performance monitoring"
            )}
          </div>
          <div className="text-muted-foreground">
            {metrics.worstPerformingArea?.name
              ? "Critical performance gaps identified across multiple sites"
              : "Monitoring performance metrics across all domains"}
          </div>
        </CardFooter>
      </Card>

      {/* High Risk Assets Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>High Risk Assets</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics.criticalAssets?.count ?? "-"} Sites
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              style={{
                color: BRAND_COLORS.mediumPurple,
                borderColor: BRAND_COLORS.mediumPurple,
              }}
            >
              Monitor
            </Badge>
            <Badge
              variant="outline"
              className="ml-2"
              style={{ color: "#EA580C", borderColor: "#EA580C" }}
            >
              <IconClock className="size-3 mr-1" />
              {metrics.criticalAssets?.overdue ?? "-"} Overdue
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-3 w-full">
            <div className="flex items-center gap-1">
              <span className="font-medium">
                {metrics.criticalAssets?.avgCompliance ?? "-"}%
              </span>
              <span className="text-muted-foreground">avg compliance</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">
                {metrics.criticalAssets?.riskBreakdown?.critical ?? "-"}
              </span>
              <span className="text-muted-foreground">critical risk</span>
            </div>
          </div>
          <div className="text-muted-foreground">
            Assets requiring prioritised remediation efforts
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
