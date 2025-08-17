import { useMutation } from "@tanstack/react-query";
import { feedbackService } from "@/lib/services/feedback-service";
import type { CreateInput } from "@/types";

// Hook for feedback mutations
export function useFeedbackActions() {
  const submitFeedbackMutation = useMutation({
    mutationFn: (data: CreateInput<"feedback">) =>
      feedbackService.submitFeedback(data),
    onError: (error) => {
      console.error("Failed to submit feedback:", error);
    },
  });

  const submitErrorReportMutation = useMutation({
    mutationFn: (data: CreateInput<"feedback">) =>
      feedbackService.submitErrorReport(data),
    onError: (error) => {
      console.error("Failed to submit error report:", error);
    },
  });

  return {
    // Actions
    submitFeedback: submitFeedbackMutation.mutateAsync,
    submitErrorReport: submitErrorReportMutation.mutateAsync,

    // Loading states
    isSubmittingFeedback: submitFeedbackMutation.isPending,
    isSubmittingErrorReport: submitErrorReportMutation.isPending,
    isSubmitting:
      submitFeedbackMutation.isPending || submitErrorReportMutation.isPending,

    // Error states
    feedbackError: submitFeedbackMutation.error,
    errorReportError: submitErrorReportMutation.error,

    // Reset error states
    resetErrors: () => {
      submitFeedbackMutation.reset();
      submitErrorReportMutation.reset();
    },
  };
}
