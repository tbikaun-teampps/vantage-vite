/**
 * Hook for fetching lightweight interview summary (for layout/settings)
 * Returns only essential metadata without responses or full questionnaire
 */

import { useQuery } from "@tanstack/react-query";
import { getInterviewSummary } from "@/lib/api/interviews";

export function useInterviewSummary(interviewId: number) {
  return useQuery({
    queryKey: ["interview-summary", interviewId],
    queryFn: () => getInterviewSummary(interviewId),
    staleTime: 30 * 1000, // 30 seconds - metadata changes infrequently
    enabled: !!interviewId,
  });
}
