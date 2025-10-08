import { useMutation } from "@tanstack/react-query";
import { submitFeedback, type FeedbackData } from "@/lib/api/feedback";

// Hook for feedback mutations
export function useFeedbackActions() {
  const submitFeedbackMutation = useMutation({
    mutationFn: (data: FeedbackData) => submitFeedback(data),
    onError: (error) => {
      console.error("Failed to submit feedback:", error);
    },
  });

  return {
    // Actions
    submitFeedback: submitFeedbackMutation.mutateAsync,

    // Loading states
    isSubmitting: submitFeedbackMutation.isPending,

    // Error states
    feedbackError: submitFeedbackMutation.error,

    // Reset error states
    resetErrors: () => {
      submitFeedbackMutation.reset();
    },
  };
}
