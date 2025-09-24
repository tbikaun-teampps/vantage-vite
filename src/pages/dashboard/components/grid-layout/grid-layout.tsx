import { useState, useEffect, useCallback } from "react";
import RGL, { WidthProvider } from "react-grid-layout";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Edit, Save } from "lucide-react";
import { DashboardSelector } from "@/pages/dashboard/components/grid-layout/dashboard-selector";
import { CreateDashboardModal } from "@/pages/dashboard/components/grid-layout/create-dashboard-modal";
import { EmptyDashboardState } from "@/pages/dashboard/components/grid-layout/empty-dashboard-state";
import { WidgetsSidebar } from "@/pages/dashboard/components/grid-layout/widgets-sidebar";
import { DialogManagerProvider } from "@/components/dialog-manager";
import {
  useDashboardLayoutManager,
  type DashboardItem,
  type Dashboard,
  type WidgetConfig,
} from "@/hooks/useDashboardLayouts";
import {
  getWidget,
  WidgetContainer,
} from "@/pages/dashboard/components/widgets";

const ReactGridLayout = WidthProvider(RGL);

export function GridLayout() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentDashboardId, setCurrentDashboardId] = useState<number | null>(
    null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dashboardToDelete, setDashboardToDelete] = useState<number | null>(
    null
  );
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [dashboardToRename, setDashboardToRename] = useState<Dashboard | null>(
    null
  );
  const [newDashboardName, setNewDashboardName] = useState("");

  const {
    dashboards,
    isLoading,
    error,
    createDashboard,
    updateDashboardLayout,
    updateDashboardWidgets,
    renameDashboard,
    deleteDashboard,
  } = useDashboardLayoutManager();

  // Helper to get current dashboard
  const currentDashboard =
    dashboards.find((d) => d.id === currentDashboardId) || null;

  // Set initial dashboard if none selected
  useEffect(() => {
    if (dashboards.length > 0 && !currentDashboardId) {
      setCurrentDashboardId(dashboards[0].id);
    }
  }, [dashboards, currentDashboardId]);

  // Function to add a new widget
  const addWidget = useCallback((widgetId: string) => {
    if (!currentDashboard) return;

    const widget = getWidget(widgetId);
    if (!widget) return;

    const newId = `${widgetId}-${Date.now()}`;
    const newItem: DashboardItem = {
      id: newId,
      widgetId: widgetId,
    };

    // Calculate next available position
    const widgetWidth = widget.defaultSize?.w || 2;
    const widgetHeight = widget.defaultSize?.h || 2;

    // Find the bottom-most Y position of existing widgets
    const maxY = currentDashboard.layout.reduce(
      (max, item) => Math.max(max, item.y + item.h),
      0
    );

    // Create layout entry with defaultSize
    const newLayoutItem: RGL.Layout = {
      i: newId,
      x: 0, // Start at leftmost column
      y: maxY, // Place below existing widgets
      w: widgetWidth,
      h: widgetHeight,
    };

    const updatedWidgets = [...currentDashboard.widgets, newItem];
    const updatedLayout = [...currentDashboard.layout, newLayoutItem];

    // Update both widgets and layout
    updateDashboardWidgets(currentDashboard.id, updatedWidgets);
    updateDashboardLayout(currentDashboard.id, updatedLayout);
  }, [currentDashboard, updateDashboardWidgets, updateDashboardLayout]);

  // Dashboard management functions
  const handleCreateDashboard = async (name: string, templateId: string) => {
    const templates: Record<string, string[]> = {
      blank: [],
      analytics: ["metrics", "chart", "activity"],
      executive: ["metrics", "chart"],
      operations: ["activity", "actions", "metrics"],
      personal: ["actions", "metrics"],
    };

    const templateWidgets = templates[templateId] || [];
    const widgets: DashboardItem[] = templateWidgets.map((widgetId, index) => ({
      id: `${widgetId}-${Date.now()}-${index}`,
      widgetId,
    }));

    const newDashboard = {
      name,
      widgets,
      layout: [], // Start with empty layout; user can arrange later
    };

    const created = await createDashboard(newDashboard);
    if (created) {
      setCurrentDashboardId(created.id);
    }
  };

  const handleLayoutChange = (newLayout: RGL.Layout[]) => {
    if (!currentDashboard) return;
    updateDashboardLayout(currentDashboard.id, newLayout);
  };

  const handleDeleteDashboard = (dashboardId: number) => {
    if (dashboards.length <= 1) return; // Don't delete the last dashboard

    setDashboardToDelete(dashboardId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteDashboard = async () => {
    if (!dashboardToDelete) return;

    await deleteDashboard(dashboardToDelete);

    if (currentDashboardId === dashboardToDelete) {
      const remaining = dashboards.filter(
        (d: Dashboard) => d.id !== dashboardToDelete
      );
      setCurrentDashboardId(remaining[0]?.id || null);
    }

    setDeleteDialogOpen(false);
    setDashboardToDelete(null);
  };

  const cancelDeleteDashboard = () => {
    setDeleteDialogOpen(false);
    setDashboardToDelete(null);
  };

  const handleRenameDashboard = (dashboardId: number) => {
    const dashboard = dashboards.find((d: Dashboard) => d.id === dashboardId);
    if (!dashboard) return;

    setDashboardToRename(dashboard);
    setNewDashboardName(dashboard.name);
    setRenameDialogOpen(true);
  };

  const confirmRenameDashboard = async () => {
    if (!dashboardToRename || !newDashboardName.trim()) return;

    await renameDashboard(dashboardToRename.id, newDashboardName.trim());
    setRenameDialogOpen(false);
    setDashboardToRename(null);
    setNewDashboardName("");
  };

  const cancelRenameDashboard = () => {
    setRenameDialogOpen(false);
    setDashboardToRename(null);
    setNewDashboardName("");
  };

  const removeWidget = useCallback((widgetId: string) => {
    if (!currentDashboard) return;

    const updatedWidgets = currentDashboard.widgets.filter(
      (w: DashboardItem) => w.id !== widgetId
    );
    const updatedLayout = currentDashboard.layout.filter(
      (item: RGL.Layout) => item.i !== widgetId
    );

    updateDashboardWidgets(currentDashboard.id, updatedWidgets);
    updateDashboardLayout(currentDashboard.id, updatedLayout);
  }, [currentDashboard, updateDashboardWidgets, updateDashboardLayout]);

  // Widget configuration management
  const handleWidgetConfigChange = (
    widgetItemId: string,
    newConfig: WidgetConfig
  ) => {
    if (!currentDashboard) return;

    const updatedWidgets = currentDashboard.widgets.map((w: DashboardItem) =>
      w.id === widgetItemId ? { ...w, config: newConfig } : w
    );
    updateDashboardWidgets(currentDashboard.id, updatedWidgets);
  };
  return (
    <DialogManagerProvider>
      <div className="flex h-screen">
        {/* Sidebar - only visible in edit mode */}
        {isEditMode && <WidgetsSidebar onAddWidget={addWidget} />}

        {/* Main content */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Loading dashboards...</div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-destructive">
                Error loading dashboards: {error.message}
              </div>
            </div>
          )}

          {/* Dashboard content */}
          {!isLoading && !error && (
            <>
              <div className="mb-6 flex items-center justify-between">
                <DashboardSelector
                  dashboards={dashboards}
                  currentDashboard={currentDashboard}
                  onSelectDashboard={setCurrentDashboardId}
                  onCreateDashboard={() => setIsCreateModalOpen(true)}
                  onRenameDashboard={handleRenameDashboard}
                  onDeleteDashboard={handleDeleteDashboard}
                />
                <Button
                  variant={isEditMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsEditMode(!isEditMode)}
                  className="flex items-center gap-2"
                >
                  {isEditMode ? (
                    <>
                      <Save size={16} />
                      Done
                    </>
                  ) : (
                    <>
                      <Edit size={16} />
                      Edit
                    </>
                  )}
                </Button>
              </div>

              {currentDashboard && (
                <div className="grid-container">
                  {currentDashboard.widgets.length === 0 ? (
                    <EmptyDashboardState
                      onEnterEditMode={() => setIsEditMode(true)}
                    />
                  ) : (
                    <ReactGridLayout
                      className="layout"
                      layout={currentDashboard.layout}
                      rowHeight={60}
                      isDraggable={isEditMode}
                      isResizable={isEditMode}
                      margin={[16, 16]}
                      containerPadding={[0, 0]}
                      // draggableHandle=".drag-handle"
                      // isBounded={true}
                      verticalCompact={false}
                      onLayoutChange={handleLayoutChange}
                    >
                      {currentDashboard.widgets.map(
                        (dashboardItem: DashboardItem) => (
                          <div key={dashboardItem.id}>
                            <WidgetContainer
                              dashboardItem={dashboardItem}
                              isEditMode={isEditMode}
                              onConfigChange={(newConfig: WidgetConfig) =>
                                handleWidgetConfigChange(
                                  dashboardItem.id,
                                  newConfig
                                )
                              }
                              onRemove={() => removeWidget(dashboardItem.id)}
                            />
                          </div>
                        )
                      )}
                    </ReactGridLayout>
                  )}
                </div>
              )}

              <CreateDashboardModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreateDashboard={handleCreateDashboard}
              />

              <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Dashboard</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this dashboard? This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={cancelDeleteDashboard}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={confirmDeleteDashboard}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Dashboard
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Dialog
                open={renameDialogOpen}
                onOpenChange={setRenameDialogOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rename Dashboard</DialogTitle>
                    <DialogDescription>
                      Enter a new name for "{dashboardToRename?.name}".
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Input
                      value={newDashboardName}
                      onChange={(e) => setNewDashboardName(e.target.value)}
                      placeholder="Dashboard name"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          confirmRenameDashboard();
                        } else if (e.key === "Escape") {
                          cancelRenameDashboard();
                        }
                      }}
                      autoFocus
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={cancelRenameDashboard}>
                      Cancel
                    </Button>
                    <Button
                      onClick={confirmRenameDashboard}
                      disabled={!newDashboardName.trim()}
                    >
                      Rename
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>
    </DialogManagerProvider>
  );
}
