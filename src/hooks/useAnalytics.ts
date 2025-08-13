import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/lib/supabase/analytics-service";
// import type { AssessmentProgress, AssessmentMetrics } from "@/types/domains/assessment";

// Query key factory for consistent cache management
export const analyticsKeys = {
  all: ['analytics'] as const,
  assessmentProgress: (assessmentId: string) => [...analyticsKeys.all, 'progress', assessmentId] as const,
  assessmentMetrics: (assessmentId: string) => [...analyticsKeys.all, 'metrics', assessmentId] as const,
  siteMapData: (filters?: { assessmentId?: string; questionnaireId?: string }) => 
    [...analyticsKeys.all, 'sitemap', filters] as const,
};

/**
 * Hook to fetch assessment progress data
 * @param assessmentId - The assessment ID to fetch progress for
 * @returns React Query result with progress data, loading states, and error handling
 */
export function useAssessmentProgress(assessmentId: string) {
  return useQuery({
    queryKey: analyticsKeys.assessmentProgress(assessmentId),
    queryFn: () => analyticsService.getAssessmentProgress(assessmentId),
    staleTime: 2 * 60 * 1000, // 2 minutes - progress changes moderately fast
    enabled: !!assessmentId,
  });
}

/**
 * Hook to fetch comprehensive assessment metrics
 * @param assessmentId - The assessment ID to fetch metrics for
 * @returns React Query result with detailed metrics data, loading states, and error handling
 */
export function useAssessmentMetrics(assessmentId: string) {
  return useQuery({
    queryKey: analyticsKeys.assessmentMetrics(assessmentId),
    queryFn: () => analyticsService.getAssessmentMetrics(assessmentId),
    staleTime: 5 * 60 * 1000, // 5 minutes - complex metrics change less frequently
    enabled: !!assessmentId,
  });
}

/**
 * Hook to fetch site map data for geographic visualization
 * @param filters - Optional filters for assessment and questionnaire
 * @returns React Query result with map data, loading states, and error handling
 */
export function useSiteMapData(filters?: { assessmentId?: string; questionnaireId?: string }) {
  return useQuery({
    queryKey: analyticsKeys.siteMapData(filters),
    queryFn: () => analyticsService.getSiteMapData(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes - site data changes infrequently
    enabled: true, // Always enabled since filters are optional
  });
}