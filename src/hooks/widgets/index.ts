import type { WidgetType } from "@/pages/dashboard/components/widgets/types";
import { useCompanyFromUrl } from "../useCompanyFromUrl";
import { useQuery } from "@tanstack/react-query";
import { WidgetService } from "@/lib/services/widget-service";
import { fetchTableData } from "@/lib/api/widgets";
import type { WidgetConfig } from "../useDashboardLayouts";

export { useMetricData } from "./useMetricData";
export { useTableData } from "./useTableData";

export function useWidgetData(widgetType: WidgetType, config: WidgetConfig) {
  const companyId = useCompanyFromUrl();

  if (!companyId) {
    throw new Error("Company ID is required to fetch widget data");
  }

  if (!config) {
    throw new Error("Widget config is required to fetch widget data");
  }

  console.log("fetching widget data:", { widgetType, config, companyId });

  const widgetService = new WidgetService(companyId);

  const metricQuery = useQuery({
    queryKey: ["widget", "metric", config, companyId],
    queryFn: async () => {
      console.log("Query function starting");
      try {
        const result = await widgetService.getMetricData(config);
        console.log("Query function completed:", result);
        return result;
      } catch (error) {
        console.log("Query function error:", error);
        throw error;
      }
    },
    enabled: widgetType === "metric" && !!config && !!companyId,
    retry: false, // Disable retries to see errors faster,
  });

  const activityQuery = useQuery({
    queryKey: ["widget", "activity", config, companyId],
    queryFn: () => widgetService.getActivityData(config),
    enabled: widgetType === "activity" && !!config && !!companyId,
  });

  const actionsQuery = useQuery({
    queryKey: ["widget", "actions", config, companyId],
    queryFn: () => widgetService.getActionsData(config),
    enabled: widgetType === "actions" && !!config && !!companyId,
  });

  const tableQuery = useQuery({
    queryKey: ["widget", "table", config, companyId],
    queryFn: () => fetchTableData(config!),
    enabled: widgetType === "table" && !!config && !!companyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Return the appropriate query result based on widgetType;
  switch (widgetType) {
    case "metric":
      return metricQuery;
    case "activity":
      return activityQuery;
    case "table":
      return tableQuery;
    case "actions":
      return actionsQuery;
    default:
      throw new Error(`Unsupported widget type: ${widgetType}`);
  }
}
