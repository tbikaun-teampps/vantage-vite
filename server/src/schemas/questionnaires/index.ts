import { z } from "zod";

// Params and response schema for getting a questionnaire by ID
export const GetQuestionnaireByIdParamsSchema = z.object({
  questionnaireId: z.coerce.number(),
});

export const GetQuestionnaireByIdResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    guidelines: z.string().nullable(),
    status: z.enum(["draft", "active", "under_review", "archived"]),
    created_at: z.string(),
    updated_at: z.string(),
    section_count: z.number(),
    step_count: z.number(),
    question_count: z.number(),
  }),
});

// Body and response schema for creating a questionnaire
export const CreateQuestionnaireBodySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  guidelines: z.string().optional(),
  company_id: z.string(),
  status: z.enum(["draft", "active", "under_review", "archived"]).optional(),
});

export const CreateQuestionnaireResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    guidelines: z.string().nullable(),
    status: z.enum(["draft", "active", "under_review", "archived"]),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

// Param and response schema for deleting a questionnaire
export const DeleteQuestionnaireParamsSchema = z.object({
  questionnaireId: z.coerce.number(),
});

export const DeleteQuestionnaireResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Param, body and response schema for updating a questionnaire
export const UpdateQuestionnaireParamsSchema = z.object({
  questionnaireId: z.coerce.number(),
});

export const UpdateQuestionnaireBodySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  guidelines: z.string().optional(),
  status: z.enum(["draft", "active", "under_review", "archived"]).optional(),
});

export const UpdateQuestionnaireResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    guidelines: z.string().nullable(),
    status: z.enum(["draft", "active", "under_review", "archived"]),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

// Param and response schema for duplicating a questionnaire
export const DuplicateQuestionnaireParamsSchema = z.object({
  questionnaireId: z.coerce.number(),
});

export const DuplicateQuestionnaireResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    guidelines: z.string().nullable(),
    status: z.enum(["draft", "active", "under_review", "archived"]),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

// Param and response schema for checking questionnaire usage
export const CheckQuestionnaireUsageParamsSchema = z.object({
  questionnaireId: z.coerce.number(),
});

export const CheckQuestionnaireUsageResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    assessmentCount: z.number(),
    assessments: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
      })
    ),
    interviewCount: z.number(),
    programCount: z.number(),
    programs: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
      })
    ),
    isInUse: z.boolean(),
  }),
});
