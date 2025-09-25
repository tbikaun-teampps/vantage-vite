import { useQuery } from "@tanstack/react-query";
import type { EntityConfig } from "@/hooks/useDashboardLayouts";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { WidgetService } from "@/lib/services/widget-service";

export function useActivityData(config?: EntityConfig) {
  const companyId = useCompanyFromUrl();

  return useQuery({
    queryKey: ["widget", "activity", config, companyId],
    queryFn: async () => {
      const widgetService = new WidgetService(companyId);
      return await widgetService.getActivityData(config!);
    },
    enabled: !!config && !!companyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
