import { z } from "zod";

export const createAssessmentSchema = z.object({
  questionnaire_id: z.string().min(1, "Please select a questionnaire template"),
  name: z.string().min(1, "Assessment name is required"),
  description: z.string().optional(),
  business_unit_id: z.string().optional(),
  region_id: z.string().optional(),
  site_id: z.string().optional(),
  asset_group_id: z.string().optional(),
  objectives: z
    .array(
      z.object({
        title: z.string().min(1, "Objective title is required"),
        description: z.string().optional(),
      })
    )
    .min(1, "At least one objective is required"),
});

export type CreateAssessmentFormData = z.infer<typeof createAssessmentSchema>;