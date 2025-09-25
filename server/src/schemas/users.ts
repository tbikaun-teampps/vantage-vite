import { commonResponseSchemas } from "./common.js";

export const usersSchemas = {
  params: {
    userId: {
      type: "object",
      properties: {
        userId: { type: "string" },
      },
      required: ["userId"],
    },
    subscriptionParams: {
      type: "object",
      properties: {
        subscription_tier: {
          type: "string",
          enum: ["demo", "consultant", "enterprise"],
        },
      },
      required: ["subscription_tier"],
    },
  },

  responses: {
    userProfile: {
      type: "object",
      properties: {
        user: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string" },
          },
        },
        profile: {
          type: "object",
          properties: {
            full_name: { type: "string" },
            is_admin: { type: "boolean" },
            subscription_tier: { type: "string" },
            subscription_features: {
              type: "object",
              properties: {
                maxCompanies: { type: "number" },
              },
            },
            onboarded: { type: "boolean" },
            onboarded_at: { type: "string" },
          },
        },
      },
    },

    ...commonResponseSchemas.responses,
  },
} as const;
