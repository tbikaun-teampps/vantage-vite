import { z } from "zod";

// Submit feedback request body schema
export const SubmitFeedbackBodySchema = z.object({
  message: z.string(),
  type: z.enum(["bug", "feature", "general", "suggestion"]).optional(),
  page_url: z.string().optional(),
});

// Success response schema
export const FeedbackSuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Export all schemas as a collection
export const FeedbackSchemas = {
  SubmitFeedbackBodySchema,
  FeedbackSuccessResponseSchema,
};
