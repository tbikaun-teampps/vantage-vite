import { useQuery } from "@tanstack/react-query";
import { recommendationsService } from "@/lib/supabase/recommendations-service";

// Query key factory for cache management
export const recommendationsKeys = {
  all: ["recommendations"] as const,
  lists: () => [...recommendationsKeys.all, "list"] as const,
  list: (companyId: string) => [...recommendationsKeys.lists(), companyId] as const,
  detail: (id: number) => [...recommendationsKeys.all, "detail", id] as const,
};

// Data fetching hook for all recommendations
export function useRecommendations(companyId: string) {
  return useQuery({
    queryKey: recommendationsKeys.list(companyId),
    queryFn: () => recommendationsService.getAllRecommendations(companyId),
    staleTime: 2 * 60 * 1000, // 2 minutes - moderate changes during recommendation management
    enabled: !!companyId,
  });
}

// Data fetching hook for a single recommendation
export function useRecommendation(id: number) {
  return useQuery({
    queryKey: recommendationsKeys.detail(id),
    queryFn: () => recommendationsService.getRecommendation(id),
    staleTime: 5 * 60 * 1000, // 5 minutes - recommendations don't change frequently
    enabled: !!id,
  });
}