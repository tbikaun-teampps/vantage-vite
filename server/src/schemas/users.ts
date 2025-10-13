import { Type } from "@sinclair/typebox";
import { commonResponseSchemas } from "./common.js";

export const usersSchemas = {
  params: {
    userId: Type.Object({
      userId: Type.String(),
    }),

    subscriptionParams: Type.Object({
      subscription_tier: Type.Union([
        Type.Literal("demo"),
        Type.Literal("consultant"),
        Type.Literal("enterprise"),
      ]),
    }),
  },

  responses: {
    userProfile: Type.Object({
      user: Type.Object({
        id: Type.String(),
        email: Type.String(),
      }),
      profile: Type.Object({
        full_name: Type.String(),
        is_admin: Type.Boolean(),
        subscription_tier: Type.String(),
        subscription_features: Type.Object({
          maxCompanies: Type.Number(),
        }),
        onboarded: Type.Boolean(),
        onboarded_at: Type.String(),
      }),
    }),

    ...commonResponseSchemas.responses,
  },
};
