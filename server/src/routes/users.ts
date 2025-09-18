import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middleware/auth.js";
import { usersSchemas } from "../schemas/users.js";
import { UsersService } from "../services/UsersService.js";

export async function usersRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);

  fastify.get(
    "/users/me",
    {
      schema: {
        description: "Get current authenticated user and profile",
        response: {
          200: usersSchemas.responses.userProfile,
          401: usersSchemas.responses[401],
          500: usersSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      const { user } = request;
      if (!user) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      try {
        const usersService = new UsersService(request.supabaseClient);
        const profile = await usersService.getUserProfile(user.id);

        if (!profile) {
          return reply.status(500).send({ error: "Failed to fetch profile" });
        }

        return {
          user,
          profile,
        };
      } catch (error) {
        console.error("Error fetching profile:", error);
        return reply.status(500).send({ error: "Failed to fetch profile" });
      }
    }
  );
  fastify.put(
    "/users/subscription/:subscription_tier",
    {
      schema: {
        description: "Update user subscription",
        params: usersSchemas.params.subscriptionParams,
        response: {
          200: { type: "object", properties: { success: { type: "boolean" } } },
          401: usersSchemas.responses[401],
          500: usersSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      const { user } = request;
      if (!user) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const { subscription_tier } = request.params as {
        subscription_tier: "demo" | "consultant" | "enterprise";
      };

      try {
        const usersService = new UsersService(request.supabaseClient);
        await usersService.updateSubscription(user.id, subscription_tier);
        return { success: true };
      } catch (error) {
        console.error("Error updating subscription:", error);
        return reply
          .status(500)
          .send({ success: false, error: (error as Error).message });
      }
    }
  );
  fastify.put(
    "/users/onboarded",
    {
      schema: {
        description: "Mark user as onboarded",
        response: {
          200: { type: "object", properties: { success: { type: "boolean" } } },
          401: usersSchemas.responses[401],
          500: usersSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      const { user } = request;
      if (!user) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      try {
        const usersService = new UsersService(request.supabaseClient);
        await usersService.markUserAsOnboarded(user.id);
        return { success: true };
      } catch (error) {
        console.error("Error marking user as onboarded:", error);
        return reply
          .status(500)
          .send({ success: false, error: (error as Error).message });
      }
    }
  );
}
