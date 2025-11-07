import { z } from "zod";

const BaseErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
});

export const Error500Schema = BaseErrorSchema;
export const Error400Schema = BaseErrorSchema;
export const Error401Schema = BaseErrorSchema;
export const Error403Schema = BaseErrorSchema;
