import { useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings, X } from "lucide-react";
import { getWidget } from "./index";
import type { DashboardItem } from "@/hooks/useDashboardLayouts";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useWidgetData } from "@/hooks/widgets";
import { Badge } from "@/components/ui/badge";

interface WidgetContainerProps {
  dashboardItem: DashboardItem;
  isEditMode: boolean;
  onRemove: () => void;
  onConfigClick: () => void;
}

export function WidgetContainer({
  dashboardItem,
  isEditMode,
  onRemove,
  onConfigClick,
}: WidgetContainerProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data, isFetching, isLoading, error } = useWidgetData(
    dashboardItem.widgetType,
    dashboardItem.config
  );

  const widget = getWidget(dashboardItem.widgetType);
  if (!widget) return null;

  const WidgetComponent = widget.component;

  const isMetricWidget = dashboardItem.widgetType === "metric" ? data : null;

  return (
    <Card className="@container/card">
      <CardHeader>
        {isMetricWidget && <CardDescription>{data?.title}</CardDescription>}

        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {data?.value || widget.title}
        </CardTitle>
        {isEditMode ? (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onConfigClick();
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              title="Configure widget"
            >
              <Settings />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              size="sm"
              variant="destructive"
              title="Remove widget"
            >
              <X />
            </Button>
          </div>
        ) : isMetricWidget ? (
          <CardAction className="flex items-center">
            {data?.phaseBadge && (
              <Badge
                className="text-xs capitalize"
                variant="outline"
                style={{
                  color: data.phaseBadge.color,
                  borderColor: data.phaseBadge.borderColor,
                }}
              >
                {data.phaseBadge.text}
              </Badge>
            )}
            {data?.badges && (
              <>
                {data.badges.map((badge, index) => (
                  <Badge
                    key={index}
                    className="text-xs capitalize"
                    variant="outline"
                    className="ml-2"
                    style={{
                      color: badge.color,
                      borderColor: badge.borderColor,
                    }}
                  >
                    {badge.text}
                  </Badge>
                ))}
              </>
            )}
          </CardAction>
        ) : null}
      </CardHeader>
      {!isMetricWidget && (
        <CardContent className="pt-0 flex-1 min-h-0">
          <WidgetComponent config={dashboardItem.config} />
        </CardContent>
      )}
      {isMetricWidget && (
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-3 w-full">
            <div className="flex items-center gap-1">
              {/* <IconAlertTriangle className="size-4 text-muted-foreground" /> */}
              {/* <span className="font-medium">
                {metrics.generatedActions?.highPriority ?? "-"}
              </span> */}
              <span className="text-muted-foreground">high priority</span>
            </div>
            <div className="flex items-center gap-1">
              {/* <IconUserCheck className="size-4 text-muted-foreground" /> */}
              {/* <span className="font-medium">
                {metrics.generatedActions?.fromInterviews ?? "-"}
              </span> */}
              <span className="text-muted-foreground">from interviews</span>
            </div>
          </div>
          <div className="text-muted-foreground">
            Actions identified from interview responses
          </div>
        </CardFooter>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Widget</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the "{widget.title}" widget? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onRemove();
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove Widget
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
