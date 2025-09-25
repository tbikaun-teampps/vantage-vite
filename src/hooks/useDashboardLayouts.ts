import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useCurrentCompany } from "@/hooks/useCompany";
import { useEffect, useRef } from "react";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
  Json,
} from "@/types/database";
import type { Layout } from "react-grid-layout";
import type { WidgetType } from "@/pages/dashboard/components/widgets/types";

// Database types
export type DashboardRow = Tables<"dashboards">;
export type DashboardInsert = TablesInsert<"dashboards">;
export type DashboardUpdate = TablesUpdate<"dashboards">;

// Frontend types
export interface MetricConfig {
  metricType:
    | "generated-actions"
    | "generated-recommendations"
    | "worst-performing-domain"
    | "high-risk-areas"
    | "assessment-activity";
  title: string;
  description?: string; // Footer description
  value: number | string; // Main metric value
  trend?: number; // Percentage change (e.g., +15, -5)
  status?: "up" | "down" | "neutral"; // Trend direction
  badges?: Array<{
    text: string;
    color?: string;
    borderColor?: string;
    icon?: string;
  }>; // Action/status badges
  secondaryMetrics?: Array<{
    value: number | string;
    label: string;
    icon?: string;
  }>;
  subtitle?: string; // Text after main value
  phaseBadge?: {
    text: string;
    color?: string;
    borderColor?: string;
    icon?: string;
  }; // Like "discover", "improve", "monitor"
}

// Configuration for action and activity widgets
export interface EntityConfig {
  entityType: "interviews" | "assessments" | "programs";
}

export interface TableConfig {
  entityType: "actions" | "recommendations" | "comments";
}

// Generic widget configuration interface
export interface WidgetConfig {
  title?: string;
  metric?: MetricConfig;
  entity?: EntityConfig;
  table?: TableConfig;
  // Future widget configs can be added here
  // chart?: ChartConfig;
}

export interface DashboardItem {
  id: string;
  widgetType: WidgetType;
  config: WidgetConfig;
}

export interface Dashboard {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  widgets: DashboardItem[];
  layout: Layout[];
  companyId: string;
  createdBy: string;
}

export interface CreateDashboardInput {
  name: string;
  widgets: DashboardItem[];
  layout: Layout[];
}

// Default dashboard configuration
export const DEFAULT_LAYOUT = [
  { i: "metric-1", x: 0, y: 0, w: 3, h: 2 },
  { i: "chart-1", x: 3, y: 0, w: 6, h: 4 },
  { i: "activity-1", x: 9, y: 0, w: 3, h: 4 },
  { i: "actions-1", x: 0, y: 2, w: 3, h: 2 },
];

const createDefaultDashboard = (): CreateDashboardInput => ({
  name: "My Dashboard",
  widgets: [
    { id: "metric-1", widgetType: "metric", config: {} },
    { id: "chart-1", widgetType: "chart", config: {} },
    { id: "activity-1", widgetType: "activity", config: {} },
    { id: "actions-1", widgetType: "actions", config: {} },
  ],
  layout: DEFAULT_LAYOUT,
});

// Query key factory for cache management
export const dashboardLayoutKeys = {
  all: ["dashboard-layouts"] as const,
  lists: () => [...dashboardLayoutKeys.all, "list"] as const,
  list: (companyId: string) =>
    [...dashboardLayoutKeys.lists(), companyId] as const,
  detail: (id: number) => [...dashboardLayoutKeys.all, "detail", id] as const,
};

// Transform database row to frontend type
function transformDashboard(row: DashboardRow): Dashboard {
  return {
    id: row.id,
    name: row.name,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    widgets: (row.widgets as unknown as DashboardItem[]) || [],
    layout: (row.layout as unknown as Layout[]) || [],
    companyId: row.company_id,
    createdBy: row.created_by,
  };
}

// Transform frontend type to database insert
function transformDashboardForInsert(
  dashboard: Omit<Dashboard, "id" | "createdAt" | "updatedAt" | "createdBy">,
  companyId: string
): DashboardInsert {
  return {
    name: dashboard.name,
    company_id: companyId,
    layout: dashboard.layout as unknown as Json,
    widgets: dashboard.widgets as unknown as Json,
  };
}

// Transform frontend type to database update
function transformDashboardForUpdate(
  dashboard: Partial<Dashboard>
): DashboardUpdate {
  const update: DashboardUpdate = {};

  if (dashboard.name !== undefined) update.name = dashboard.name;
  if (dashboard.layout !== undefined)
    update.layout = dashboard.layout as unknown as Json;
  if (dashboard.widgets !== undefined)
    update.widgets = dashboard.widgets as unknown as Json;
  if (dashboard.updatedAt !== undefined)
    update.updated_at = dashboard.updatedAt.toISOString();

  return update;
}

/**
 * Hook to fetch all dashboards for a company
 */
export function useDashboards(companyId?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: companyId ? dashboardLayoutKeys.list(companyId) : [],
    queryFn: async () => {
      if (!companyId) return [];

      const { data, error } = await supabase
        .from("dashboards")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map(transformDashboard);
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single dashboard
 */
export function useDashboard(dashboardId?: number) {
  const supabase = createClient();

  return useQuery({
    queryKey: dashboardId ? dashboardLayoutKeys.detail(dashboardId) : [],
    queryFn: async () => {
      if (!dashboardId) return null;

      const { data, error } = await supabase
        .from("dashboards")
        .select("*")
        .eq("is_deleted", false)
        .eq("id", dashboardId)
        .maybeSingle();

      if (error) throw error;

      return transformDashboard(data);
    },
    enabled: !!dashboardId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for dashboard CRUD operations with optimistic updates
 */
export function useDashboardActions() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { data: currentCompany } = useCurrentCompany();

  const createMutation = useMutation({
    mutationFn: async (dashboard: CreateDashboardInput) => {
      if (!currentCompany?.id) throw new Error("No company selected");

      const dashboardData = transformDashboardForInsert(
        { ...dashboard, companyId: currentCompany.id },
        currentCompany.id
      );

      const { data, error } = await supabase
        .from("dashboards")
        .insert(dashboardData)
        .select()
        .single();

      if (error) throw error;

      return transformDashboard(data);
    },
    onSuccess: (newDashboard) => {
      if (!currentCompany?.id) return;

      // Optimistic cache update for dashboards list
      queryClient.setQueryData(
        dashboardLayoutKeys.list(currentCompany.id),
        (old: Dashboard[] = []) => [newDashboard, ...old]
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      dashboardId,
      updates,
    }: {
      dashboardId: number;
      updates: Partial<Dashboard>;
    }) => {
      const updateData = transformDashboardForUpdate({
        ...updates,
        updatedAt: new Date(),
      });

      const { data, error } = await supabase
        .from("dashboards")
        .update(updateData)
        .eq("id", dashboardId)
        .select()
        .single();

      if (error) throw error;

      return transformDashboard(data);
    },
    onMutate: async ({ dashboardId, updates }) => {
      if (!currentCompany?.id) return;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: dashboardLayoutKeys.list(currentCompany.id),
      });

      // Snapshot previous value
      const previousDashboards = queryClient.getQueryData<Dashboard[]>(
        dashboardLayoutKeys.list(currentCompany.id)
      );

      // Optimistically update cache
      if (previousDashboards) {
        queryClient.setQueryData(
          dashboardLayoutKeys.list(currentCompany.id),
          previousDashboards.map((dashboard) =>
            dashboard.id === dashboardId
              ? { ...dashboard, ...updates, updatedAt: new Date() }
              : dashboard
          )
        );
      }

      return { previousDashboards };
    },
    onError: (_err, _variables, context) => {
      if (!currentCompany?.id || !context?.previousDashboards) return;

      // Rollback optimistic update
      queryClient.setQueryData(
        dashboardLayoutKeys.list(currentCompany.id),
        context.previousDashboards
      );
    },
    onSuccess: (updatedDashboard) => {
      if (!currentCompany?.id) return;

      // Update individual dashboard cache
      queryClient.setQueryData(
        dashboardLayoutKeys.detail(updatedDashboard.id),
        updatedDashboard
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (dashboardId: number) => {
      // Soft delete by setting is_deleted to true

      const { error } = await supabase
        .from("dashboards")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", dashboardId);

      if (error) throw error;

      return dashboardId;
    },
    onSuccess: (deletedId) => {
      if (!currentCompany?.id) return;

      // Remove from dashboards list
      queryClient.setQueryData(
        dashboardLayoutKeys.list(currentCompany.id),
        (old: Dashboard[] = []) => old.filter((d) => d.id !== deletedId)
      );

      // Remove individual dashboard cache
      queryClient.removeQueries({
        queryKey: dashboardLayoutKeys.detail(deletedId),
      });
    },
  });

  return {
    createDashboard: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,

    updateDashboard: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,

    deleteDashboard: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  };
}

/**
 * Main hook for dashboard layout management
 * Provides unified interface for dashboard state and operations
 */
export function useDashboardLayoutManager() {
  const { data: currentCompany } = useCurrentCompany();
  const companyId = currentCompany?.id;
  const hasCreatedDefaultRef = useRef(false);

  const { data: dashboards = [], isLoading, error } = useDashboards(companyId);

  const {
    createDashboard,
    isCreating,
    createError,
    updateDashboard,
    isUpdating,
    updateError,
    deleteDashboard,
    isDeleting,
    deleteError,
  } = useDashboardActions();

  // Auto-create default dashboard if none exist
  useEffect(() => {
    if (
      !isLoading &&
      dashboards.length === 0 &&
      companyId &&
      !hasCreatedDefaultRef.current
    ) {
      hasCreatedDefaultRef.current = true;
      createDashboard(createDefaultDashboard());
    }
  }, [dashboards.length, isLoading, companyId, createDashboard]);

  // Helper functions for common operations
  const updateDashboardLayout = async (
    dashboardId: number,
    layout: Layout[]
  ) => {
    return updateDashboard({
      dashboardId,
      updates: { layout },
    });
  };

  const updateDashboardWidgets = async (
    dashboardId: number,
    widgets: DashboardItem[]
  ) => {
    console.log("updating widgets", widgets);
    return updateDashboard({
      dashboardId,
      updates: { widgets },
    });
  };

  const renameDashboard = async (dashboardId: number, name: string) => {
    return updateDashboard({
      dashboardId,
      updates: { name },
    });
  };

  return {
    // Data
    dashboards,
    isLoading,
    error: error || createError || updateError || deleteError,

    // Actions
    createDashboard,
    updateDashboard,
    deleteDashboard,
    updateDashboardLayout,
    updateDashboardWidgets,
    renameDashboard,

    // Loading states
    isCreating,
    isUpdating,
    isDeleting,
    isProcessing: isCreating || isUpdating || isDeleting,
  };
}
