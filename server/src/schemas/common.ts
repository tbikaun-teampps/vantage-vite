import { Type } from "@sinclair/typebox";

export const commonResponseSchemas = {
  successBoolean: Type.Object({
    success: Type.Boolean(),
  }),

  errorResponse: Type.Object({
    success: Type.Boolean(),
    error: Type.String(),
  }),

  messageResponse: Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
  }),

  responses: {
    400: Type.Object({
      success: Type.Boolean(),
      error: Type.String(),
    }),
    401: Type.Object({
      success: Type.Boolean(),
      error: Type.String(),
    }),
    403: Type.Object({
      success: Type.Boolean(),
      error: Type.String(),
    }),
    404: Type.Object({
      success: Type.Boolean(),
      error: Type.String(),
    }),
    500: Type.Object({
      success: Type.Boolean(),
      error: Type.String(),
    }),
  },
};
