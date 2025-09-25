import { useQuery } from "@tanstack/react-query";
import type { MetricConfig } from "@/hooks/useDashboardLayouts";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { WidgetService } from "@/lib/services/widget-service";

export function useMetricData(config?: MetricConfig) {
  const companyId = useCompanyFromUrl();

  return useQuery({
    queryKey: ['widget', 'metric', config, companyId],
    queryFn: async () => {
      const widgetService = new WidgetService(companyId);
      return await widgetService.getMetricData(config!);
    },
    enabled: !!config && !!companyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}