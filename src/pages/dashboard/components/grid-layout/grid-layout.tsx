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

interface DashboardItem {
  id: string;
  widgetId: string;
}

interface Dashboard {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  widgets: DashboardItem[];
  layouts: { [key: string]: Layout[] };
}

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
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [currentDashboardId, setCurrentDashboardId] = useState<string | null>(
    null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dashboardToDelete, setDashboardToDelete] = useState<string | null>(null);

  // Helper to get current dashboard
  const currentDashboard =
    dashboards.find((d) => d.id === currentDashboardId) || null;

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

  const defaultLayouts = {
    lg: [
      { i: "metrics-1", x: 0, y: 0, w: 3, h: 2 },
      { i: "chart-1", x: 3, y: 0, w: 6, h: 4 },
      { i: "activity-1", x: 9, y: 0, w: 3, h: 4 },
      { i: "actions-1", x: 0, y: 2, w: 3, h: 2 },
    ],
    md: [
      { i: "metrics-1", x: 0, y: 0, w: 4, h: 2 },
      { i: "chart-1", x: 4, y: 0, w: 6, h: 4 },
      { i: "activity-1", x: 0, y: 2, w: 4, h: 4 },
      { i: "actions-1", x: 4, y: 4, w: 6, h: 2 },
    ],
    sm: [
      { i: "metrics-1", x: 0, y: 0, w: 6, h: 2 },
      { i: "chart-1", x: 0, y: 2, w: 6, h: 4 },
      { i: "activity-1", x: 0, y: 6, w: 6, h: 4 },
      { i: "actions-1", x: 0, y: 10, w: 6, h: 2 },
    ],
  };

  // Initialize dashboards on mount
  useEffect(() => {
    const savedDashboards = localStorage.getItem("dashboards");
    if (savedDashboards) {
      const parsed = JSON.parse(savedDashboards);
      const dashboardsWithDates = parsed.map((d: any) => ({
        ...d,
        createdAt: new Date(d.createdAt),
        updatedAt: new Date(d.updatedAt),
      }));
      setDashboards(dashboardsWithDates);
      setCurrentDashboardId(dashboardsWithDates[0]?.id || null);
    } else {
      // Create default dashboard
      const defaultDashboard: Dashboard = {
        id: "default-" + Date.now(),
        name: "My Dashboard",
        createdAt: new Date(),
        updatedAt: new Date(),
        widgets: [
          { id: "metrics-1", widgetId: "metrics" },
          { id: "chart-1", widgetId: "chart" },
          { id: "activity-1", widgetId: "activity" },
          { id: "actions-1", widgetId: "actions" },
        ],
        layouts: defaultLayouts,
      };
      setDashboards([defaultDashboard]);
      setCurrentDashboardId(defaultDashboard.id);
    }
  }, []);

  // Save dashboards to localStorage whenever they change
  useEffect(() => {
    if (dashboards.length > 0) {
      localStorage.setItem("dashboards", JSON.stringify(dashboards));
    }
  }, [dashboards]);

  const handleLayoutChange = (
    _layout: Layout[],
    layouts: { [key: string]: Layout[] }
  ) => {
    if (!currentDashboard) return;

    setDashboards((prev) =>
      prev.map((dashboard) =>
        dashboard.id === currentDashboard.id
          ? { ...dashboard, layouts, updatedAt: new Date() }
          : dashboard
      )
    );
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

    setDashboards((prev) =>
      prev.map((dashboard) =>
        dashboard.id === currentDashboard.id
          ? {
              ...dashboard,
              widgets: [...dashboard.widgets, newItem],
              updatedAt: new Date(),
            }
          : dashboard
      )
    );
  };

  // Dashboard management functions
  const createDashboard = (name: string, templateId: string) => {
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

    const newDashboard: Dashboard = {
      id: "dashboard-" + Date.now(),
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
      widgets,
      layouts: {},
    };

    setDashboards((prev) => [...prev, newDashboard]);
    setCurrentDashboardId(newDashboard.id);
  };

  const handleDeleteDashboard = (dashboardId: string) => {
    if (dashboards.length <= 1) return; // Don't delete the last dashboard

    setDashboardToDelete(dashboardId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteDashboard = () => {
    if (!dashboardToDelete) return;

    setDashboards((prev) => prev.filter((d) => d.id !== dashboardToDelete));

    if (currentDashboardId === dashboardToDelete) {
      const remaining = dashboards.filter((d) => d.id !== dashboardToDelete);
      setCurrentDashboardId(remaining[0]?.id || null);
    }

    setDeleteDialogOpen(false);
    setDashboardToDelete(null);
  };

  const cancelDeleteDashboard = () => {
    setDeleteDialogOpen(false);
    setDashboardToDelete(null);
  };

  const renameDashboard = (dashboardId: string) => {
    const dashboard = dashboards.find((d) => d.id === dashboardId);
    if (!dashboard) return;

    const newName = prompt("Enter new dashboard name:", dashboard.name);
    if (!newName?.trim()) return;

    setDashboards((prev) =>
      prev.map((d) =>
        d.id === dashboardId
          ? { ...d, name: newName.trim(), updatedAt: new Date() }
          : d
      )
    );
  };

  const removeWidget = (widgetId: string) => {
    if (!currentDashboard) return;

    setDashboards((prev) =>
      prev.map((dashboard) =>
        dashboard.id === currentDashboard.id
          ? {
              ...dashboard,
              widgets: dashboard.widgets.filter((w) => w.id !== widgetId),
              updatedAt: new Date(),
            }
          : dashboard
      )
    );
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
        <div className="mb-6 flex items-center justify-between">
          <DashboardSelector
            dashboards={dashboards}
            currentDashboard={currentDashboard}
            onSelectDashboard={setCurrentDashboardId}
            onCreateDashboard={() => setIsCreateModalOpen(true)}
            onRenameDashboard={renameDashboard}
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
                  : defaultLayouts
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
              {currentDashboard.widgets.map((dashboardItem) => {
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
          onCreateDashboard={createDashboard}
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
      </div>
    </div>
  );
}
