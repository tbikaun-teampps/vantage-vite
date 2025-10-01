export const commonResponseSchemas = {
  successBoolean: {
    type: "object",
    properties: {
      success: { type: "boolean" },
    },
  },

  errorResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      error: { type: "string" },
    },
  },

  messageResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
    },
  },

  responses: {
    400: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        error: { type: "string" },
      },
    },
    401: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        error: { type: "string" },
      },
    },
    403: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        error: { type: "string" },
      },
    },
    404: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        error: { type: "string" },
      },
    },
    500: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        error: { type: "string" },
      },
    },
  },
} as const;