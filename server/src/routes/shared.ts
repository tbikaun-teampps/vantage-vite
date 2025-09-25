import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middleware/auth";

export async function sharedRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) routeOptions.schema.tags = [];
    routeOptions.schema.tags.push("Shared");
  });
  fastify.get(
    "/roles",
    {
      schema: {
        description: "Get all shared roles",
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "number" },
                    name: { type: "string" },
                    description: { type: "string" },
                    read_only: { type: "boolean" },
                    created_at: { type: "string" },
                    updated_at: { type: "string" },
                  },
                },
              },
            },
          },
          401: {
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
      },
    },
    async (request, reply) => {
      const userId = request.user.id;
      const { data, error } = await request.supabaseClient
        .from("shared_roles")
        .select("id, name, description, created_by, created_at, updated_at")
        .or(`created_by.is.null,created_by.eq.${userId}`) // Include system roles (null) or user-created roles
        .eq("is_deleted", false) // Exclude soft-deleted roles
        .order("name", { ascending: true });

      if (error) {
        return reply.status(500).send({
          success: false,
          error: error.message,
        });
      }

      // If no roles found, return empty array
      if (!data || data.length === 0) {
        return reply.status(200).send({
          success: true,
          data: [],
        });
      }

      // Add readOnly property if the requesting user didn't create the role, e.g. it's system created.
      const rolesWithReadOnly = data.map((role) => ({
        ...role,
        read_only: role.created_by !== userId,
      }));

      return { data: rolesWithReadOnly, success: true };
    }
  );
  fastify.post(
    "/roles",
    {
      schema: {
        description: "Create a new shared role",
      },
    },
    async (request, reply) => {
      return { data: [], success: true };
    }
  );
  fastify.put(
    "/shared/roles/:roleId",
    {
      schema: {
        description: "Update an existing shared role",
      },
    },
    async (request, reply) => {
      return { data: [], success: true };
    }
  );
}
