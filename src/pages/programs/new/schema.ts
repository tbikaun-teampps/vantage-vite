import { z } from "zod";
import { Constants } from "@/types/database";

export const programObjectiveSchema = z.object({
  name: z.string().min(1, "Objective name is required"),
  description: z.string().optional(),
});

export const programFormSchema = z.object({
  name: z.string().min(1, "Program name is required"),
  description: z.string().optional(),
  scope_level: z.enum(Constants.public.Enums.scope_levels as readonly [string, ...string[]], {
    required_error: "Scope level is required",
  }),
  frequency_weeks: z.number().min(1, "Frequency must be at least 1 week").optional(),
  objectives: z.array(programObjectiveSchema).min(1, "At least one objective is required"),
  selected_scope_ids: z.array(z.number()).optional(),
}).refine((data) => {
  // For company level, no scope selection is required
  if (data.scope_level === "company") {
    return true;
  }
  // For other scope levels, at least one scope item must be selected
  return data.selected_scope_ids && data.selected_scope_ids.length > 0;
}, {
  message: "At least one scope item must be selected for this scope level",
  path: ["selected_scope_ids"],
});

export type ProgramObjective = z.infer<typeof programObjectiveSchema>;
export type ProgramFormData = z.infer<typeof programFormSchema>;