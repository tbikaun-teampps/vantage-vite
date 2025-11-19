import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateInterviewResponse } from "@/lib/api/interviews";
import { toast } from "sonner";
import type { GetInterviewProgressResponseData, UpdateInterviewResponseBodyData } from "@/types/api/interviews";

export function useSaveInterviewResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      responseId,
      rating_score,
      role_ids,
      is_unknown,
      question_part_answers,
    }: UpdateInterviewResponseBodyData) => {
      return updateInterviewResponse(responseId, {
        rating_score,
        role_ids,
        is_unknown,
        question_part_answers,
      });
    },
    onSuccess: async (_, variables) => {
      // Force immediate refetch of the question cache to ensure UI updates with saved values
      await queryClient.refetchQueries({
        queryKey: [
          "interviews",
          variables.interviewId,
          "questions",
          variables.questionId,
        ],
      });

      // Refetch progress to get status update with previous_status
      await queryClient.refetchQueries({
        queryKey: ["interviews", variables.interviewId, "progress"],
      });

      // Check for status change and show toast
      const progressData = queryClient.getQueryData<{
        success: boolean;
        data: GetInterviewProgressResponseData;
      }>(["interviews", variables.interviewId, "progress"]);

      if (progressData?.data?.previous_status) {
        const previousStatus = progressData.data.previous_status;
        const currentStatus = progressData.data.status;

        // Show appropriate toast based on status transition
        if (previousStatus === "pending" && currentStatus === "in_progress") {
          toast.success("Interview started! 🎯");
        } else if (
          previousStatus === "in_progress" &&
          currentStatus === "completed"
        ) {
          toast.success("Interview completed! ✅");
        } else if (
          previousStatus === "completed" &&
          currentStatus === "in_progress"
        ) {
          toast.info("Interview reopened");
        } else if (
          previousStatus === "in_progress" &&
          currentStatus === "pending"
        ) {
          toast.info("All responses cleared");
        } else {
          // No status change - regular save
          toast.success("Response saved");
        }
      } else {
        // Initial save or no status data available
        toast.success("Response saved");
      }
    },
    onError: (error) => {
      toast.error(
        error?.response?.data.error ??
          "Failed to save response. Please try again."
      );
    },
  });
}
