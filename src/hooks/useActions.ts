import { useQuery } from "@tanstack/react-query";
import { interviewService } from "@/lib/supabase/interview-service";

// Query key factory for cache management
export const actionsKeys = {
  all: ["actions"] as const,
  lists: () => [...actionsKeys.all, "list"] as const,
  list: (companyId: string) => [...actionsKeys.lists(), companyId] as const,
};

// Data fetching hook for all actions
export function useActions(companyId: string) {
  return useQuery({
    queryKey: actionsKeys.list(companyId),
    queryFn: () => interviewService.getAllInterviewResponseActions(companyId),
    staleTime: 2 * 60 * 1000, // 2 minutes - moderate changes during action management
    enabled: !!companyId,
  });
}