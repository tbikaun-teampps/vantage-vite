import { z } from "zod";

// Schema for interview response actions
export const interviewResponseActionSchema = z.object({
  id: z.string().optional(), // For existing actions
  title: z.string().min(1, "Action title is required"),
  description: z.string().optional(),
});

// Schema for interview response form
export const interviewResponseFormSchema = z.object({
  rating_score: z.number().min(1, "Rating is required"),
  comments: z.string().optional(),
  role_ids: z.array(z.string()).optional(),
  actions: z.array(interviewResponseActionSchema).optional(),
});

// Type inference
export type InterviewResponseAction = z.infer<
  typeof interviewResponseActionSchema
>;
export type InterviewResponseForm = z.infer<typeof interviewResponseFormSchema>;

// Schema with conditional validation for roles
export const createInterviewResponseSchema = (hasRoles: boolean) => {
  return interviewResponseFormSchema.refine(
    (data) => {
      if (hasRoles) {
        return data.role_ids && data.role_ids.length > 0;
      }
      return true;
    },
    {
      message: "At least one role must be selected",
      path: ["role_ids"],
    }
  );
};
