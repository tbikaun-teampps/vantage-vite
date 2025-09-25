import { useQuery } from "@tanstack/react-query";
import type { TableConfig } from "@/hooks/useDashboardLayouts";
import { fetchTableData } from "@/lib/api/widgets";

export function useTableData(config?: TableConfig) {
  return useQuery({
    queryKey: ['widget', 'table', config],
    queryFn: () => fetchTableData(config!),
    enabled: !!config,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}