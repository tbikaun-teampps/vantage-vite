import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateInterviewResponse } from "@/lib/api/interviews";

interface SaveResponseData {
  interviewId: number;
  responseId: number;
  questionId: number;
  rating_score?: number | null;
  role_ids?: number[] | null;
}

export function useSaveInterviewResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      interviewId,
      responseId,
      rating_score,
      role_ids,
    }: SaveResponseData) => {
      return updateInterviewResponse(interviewId, responseId, {
        rating_score,
        role_ids,
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate both the question and progress caches
      queryClient.invalidateQueries({
        queryKey: [
          "interviews",
          variables.interviewId,
          "questions",
          variables.questionId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["interviews", variables.interviewId, "progress"],
      });
    },
  });
}
