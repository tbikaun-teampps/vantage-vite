import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getInterviewQuestionById,
  //   updateInterviewResponseAction,
} from "@/lib/api/interviews";

export function useInterviewQuestion(interviewId: number, questionId: number) {
  const queryClient = useQueryClient();

  // Fetch actions for this response
  const {
    data: question = null,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["interview-question", interviewId, questionId],
    queryFn: () => getInterviewQuestionById(interviewId, questionId),
    enabled: !!interviewId || !!questionId,
  });

  // Update action mutation
  //   const updateMutation = useMutation({
  //     mutationFn: ({
  //       actionId,
  //       action,
  //     }: {
  //       actionId: number;
  //       action: { title?: string; description?: string };
  //     }) => updateInterviewResponseAction(responseId, actionId, action),
  //     onSuccess: () => {
  //       queryClient.invalidateQueries({
  //         queryKey: ["interview-response-actions", responseId],
  //       });
  //       toast.success("Action updated successfully");
  //     },
  //     onError: (error: Error) => {
  //       toast.error(error.message || "Failed to update action");
  //     },
  //   });

  return {
    // Data
    question,
    isLoading,
    error: error as Error | null,

    // Mutations
    // updateAction: (
    //   actionId: number,
    //   action: { title?: string; description?: string }
    // ) => updateMutation.mutateAsync({ actionId, action }),

    // Mutation states
    // isUpdating: updateMutation.isPending,
  };
}
