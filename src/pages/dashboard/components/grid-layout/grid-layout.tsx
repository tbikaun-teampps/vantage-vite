import { useState, useEffect } from "react";
import { Responsive, WidthProvider, type Layout } from "react-grid-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  GripVertical,
  Edit,
  Save,
  BarChart3,
  Activity,
  Clock,
  Zap,
  Plus,
} from "lucide-react";
import { DashboardSelector } from "./dashboard-selector";
import { CreateDashboardModal } from "./create-dashboard-modal";
import { useDashboardLayoutManager, type DashboardItem, type Dashboard, DEFAULT_LAYOUTS } from "@/hooks/useDashboardLayouts";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface Widget {
  id: string;
  title: string;
  category: string;
  component: React.ComponentType;
  defaultSize: { w: number; h: number };
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

// Dashboard interfaces now imported from useDashboardLayouts

// Widget Components
const MetricsWidget = () => (
  <div className="space-y-2">
    <div className="text-2xl font-bold">24</div>
    <div className="text-sm text-muted-foreground">Active Assessments</div>
  </div>
);

const ChartWidget = () => (
  <div className="h-32 bg-muted/30 rounded flex items-center justify-center">
    <span className="text-muted-foreground">Chart Placeholder</span>
  </div>
);

const ActivityWidget = () => (
  <div className="space-y-2">
    <div className="text-sm">Assessment completed</div>
    <div className="text-sm">New action item created</div>
    <div className="text-sm">Report generated</div>
  </div>
);

const ActionsWidget = () => (
  <div className="space-y-2">
    <button className="w-full text-left text-sm p-2 hover:bg-muted/50 rounded">
      Create Assessment
    </button>
    <button className="w-full text-left text-sm p-2 hover:bg-muted/50 rounded">
      View Reports
    </button>
  </div>
);


export function GridLayout() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentDashboardId, setCurrentDashboardId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dashboardToDelete, setDashboardToDelete] = useState<number | null>(null);

  // Use the dashboard layout manager hook
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

  // Available widgets library
  const availableWidgets: Widget[] = [
    {
      id: "metrics",
      title: "Key Metrics",
      category: "Analytics",
      component: MetricsWidget,
      defaultSize: { w: 4, h: 3 },
      description: "Display key performance metrics",
      icon: BarChart3,
    },
    {
      id: "chart",
      title: "Analytics Chart",
      category: "Analytics",
      component: ChartWidget,
      defaultSize: { w: 8, h: 5 },
      description: "Interactive analytics visualization",
      icon: Activity,
    },
    {
      id: "activity",
      title: "Recent Activity",
      category: "Monitoring",
      component: ActivityWidget,
      defaultSize: { w: 4, h: 5 },
      description: "Show recent system activity",
      icon: Clock,
    },
    {
      id: "actions",
      title: "Quick Actions",
      category: "Actions",
      component: ActionsWidget,
      defaultSize: { w: 4, h: 3 },
      description: "Common action shortcuts",
      icon: Zap,
    },
  ];

  // Helper function to get widget by ID
  const getWidget = (widgetId: string) =>
    availableWidgets.find((w) => w.id === widgetId);


  const handleLayoutChange = (
    _layout: Layout[],
    layouts: { [key: string]: Layout[] }
  ) => {
    if (!currentDashboard) return;

    updateDashboardLayout(currentDashboard.id, layouts);
  };

  // Function to add a new widget
  const addWidget = (widgetId: string) => {
    if (!currentDashboard) return;

    const widget = getWidget(widgetId);
    if (!widget) return;

    const newId = `${widgetId}-${Date.now()}`;
    const newItem: DashboardItem = {
      id: newId,
      widgetId: widgetId,
    };

    const updatedWidgets = [...currentDashboard.widgets, newItem];
    updateDashboardWidgets(currentDashboard.id, updatedWidgets);
  };

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
      layouts: {},
    };

    const created = await createDashboard(newDashboard);
    if (created) {
      setCurrentDashboardId(created.id);
    }
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
      const remaining = dashboards.filter((d: Dashboard) => d.id !== dashboardToDelete);
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

    const newName = prompt("Enter new dashboard name:", dashboard.name);
    if (!newName?.trim()) return;

    renameDashboard(dashboardId, newName.trim());
  };

  const removeWidget = (widgetId: string) => {
    if (!currentDashboard) return;

    const updatedWidgets = currentDashboard.widgets.filter((w: DashboardItem) => w.id !== widgetId);
    updateDashboardWidgets(currentDashboard.id, updatedWidgets);
  };

  // Group widgets by category
  const widgetsByCategory = availableWidgets.reduce(
    (acc, widget) => {
      if (!acc[widget.category]) acc[widget.category] = [];
      acc[widget.category].push(widget);
      return acc;
    },
    {} as Record<string, Widget[]>
  );

  return (
    <div className="flex h-screen">
      {/* Sidebar - only visible in edit mode */}
      {isEditMode && (
        <div className="w-80 bg-card border-r border-border p-4 overflow-y-auto">
          <h3 className="font-semibold text-lg mb-4">Add Widgets</h3>
          <div className="space-y-4">
            {Object.entries(widgetsByCategory).map(([category, widgets]) => (
              <div key={category}>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  {category}
                </h4>
                <div className="space-y-2">
                  {widgets.map((widget) => (
                    <button
                      key={widget.id}
                      onClick={() => addWidget(widget.id)}
                      className="w-full p-3 text-left border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <widget.icon
                          size={20}
                          className="text-muted-foreground mt-0.5"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {widget.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {widget.description}
                          </div>
                        </div>
                        <Plus size={16} className="text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
            <ResponsiveGridLayout
              className="layout"
              layouts={
                Object.keys(currentDashboard.layouts).length > 0
                  ? currentDashboard.layouts
                  : DEFAULT_LAYOUTS
              }
              onLayoutChange={handleLayoutChange}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
              rowHeight={60}
              isDraggable={isEditMode}
              isResizable={isEditMode}
              margin={[16, 16]}
              containerPadding={[0, 0]}
              draggableHandle=".drag-handle"
              // isBounded={true}
              verticalCompact={false}
            >
              {currentDashboard.widgets.map((dashboardItem: DashboardItem) => {
                const widget = getWidget(dashboardItem.widgetId);
                if (!widget) return null;

                const WidgetComponent = widget.component;

                return (
                  <div key={dashboardItem.id}>
                    <Card className="h-full rounded-none">
                      <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-base">
                          {widget.title}
                        </CardTitle>
                        {isEditMode && (
                          <div className="flex items-center gap-1">
                            <button
                              className="opacity-50 hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-destructive"
                              onClick={() => removeWidget(dashboardItem.id)}
                            >
                              ×
                            </button>
                            <button className="drag-handle opacity-50 hover:opacity-100 cursor-grab active:cursor-grabbing p-1 rounded">
                              <GripVertical size={16} />
                            </button>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="pt-0">
                        <WidgetComponent />
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </ResponsiveGridLayout>
          </div>
        )}

        <CreateDashboardModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateDashboard={handleCreateDashboard}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Dashboard</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this dashboard? This action cannot be undone.
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
        </>
        )}
      </div>
    </div>
  );
}
