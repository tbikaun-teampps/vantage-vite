import { z } from "zod";

export const createAssessmentSchema = z.object({
  questionnaire_id: z.string().min(1, "Please select a questionnaire template"),
  name: z.string().min(1, "Assessment name is required"),
  description: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  business_unit_id: z.string().min(1, "Please select a business unit"),
  region_id: z.string().min(1, "Please select a region"),
  site_id: z.string().min(1, "Please select a site"),
  asset_group_id: z.string().min(1, "Please select an asset group"),
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