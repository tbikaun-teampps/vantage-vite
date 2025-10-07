import { useQuery } from "@tanstack/react-query";
import type { WidgetConfig } from "@/hooks/useDashboardLayouts";
import { WidgetService } from "@/lib/services/widget-service";
import { useCompanyFromUrl } from "../useCompanyFromUrl";

export function useTableData(config?: WidgetConfig) {
  const companyId = useCompanyFromUrl();
  return useQuery({
    queryKey: ["widget", "table", config],
    queryFn: async () => {
      const widgetService = new WidgetService(companyId);
      return await widgetService.getTableData(config!);
    },
    enabled: !!config,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
