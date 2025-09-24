import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, X } from "lucide-react";
import { getWidget } from "./index";
import type { DashboardItem, WidgetConfig } from "@/hooks/useDashboardLayouts";
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

interface WidgetContainerProps {
  dashboardItem: DashboardItem;
  isEditMode: boolean;
  onConfigChange: (config: WidgetConfig) => void;
  onRemove: () => void;
  onConfigClick: () => void;
}

export function WidgetContainer({
  dashboardItem,
  isEditMode,
  onConfigChange,
  onRemove,
  onConfigClick,
}: WidgetContainerProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const widget = getWidget(dashboardItem.widgetType);
  if (!widget) return null;

  const WidgetComponent = widget.component;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base">{widget.title}</CardTitle>
        {isEditMode && (
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
        )}
      </CardHeader>
      <CardContent className="pt-0 h-full">
        <WidgetComponent
          widgetId={dashboardItem.id}
          config={dashboardItem.config}
          onConfigChange={onConfigChange}
          isEditMode={isEditMode}
        />
      </CardContent>

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
