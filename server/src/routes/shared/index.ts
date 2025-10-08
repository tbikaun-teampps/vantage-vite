import { FastifyInstance } from "fastify";
import { SharedRolesService } from "../../services/SharedRolesService.js";
import { measurementsRoutes } from "./measurements.js";

export async function sharedRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) routeOptions.schema.tags = [];
    routeOptions.schema.tags.push("Shared");
  });
  measurementsRoutes(fastify);

  // GET /shared/roles - Get all shared roles
  fastify.get(
    "/roles",
    {
      schema: {
        description: "Get all shared roles (system roles + user-created roles)",
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
                    description: { type: ["string", "null"] },
                    read_only: { type: "boolean" },
                    created_at: { type: "string" },
                    updated_at: { type: "string" },
                    created_by: { type: ["string", "null"] },
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
      try {
        const userId = request.user.id;
        const service = new SharedRolesService(request.supabaseClient, userId);

        const roles = await service.getAllRoles();

        // Add readOnly property if the requesting user didn't create the role
        const rolesWithReadOnly = roles.map((role) => ({
          ...role,
          read_only: role.created_by !== userId,
        }));

        return { data: rolesWithReadOnly, success: true };
      } catch (error) {
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // POST /shared/roles - Create a new shared role
  fastify.post(
    "/roles",
    {
      schema: {
        description: "Create a new shared role",
        body: {
          type: "object",
          required: ["name", "companyId"],
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            companyId: { type: "string" },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  name: { type: "string" },
                  description: { type: ["string", "null"] },
                  created_at: { type: "string" },
                  updated_at: { type: "string" },
                  created_by: { type: ["string", "null"] },
                  is_deleted: { type: "boolean" },
                },
              },
            },
          },
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
      try {
        const userId = request.user.id;
        const body = request.body as {
          name: string;
          description?: string;
          companyId: string;
        };

        const service = new SharedRolesService(request.supabaseClient, userId);
        const newRole = await service.createRole({
          name: body.name,
          description: body.description || null,
          company_id: body.companyId,
        });

        return reply.status(201).send({ data: newRole, success: true });
      } catch (error) {
        const statusCode =
          error instanceof Error &&
          error.message.includes("role with this name already exists")
            ? 400
            : 500;

        return reply.status(statusCode).send({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // PUT /shared/roles/:roleId - Update an existing shared role
  fastify.put(
    "/roles/:roleId",
    {
      schema: {
        description: "Update an existing shared role",
        params: {
          type: "object",
          properties: {
            roleId: { type: "string" },
          },
          required: ["roleId"],
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  name: { type: "string" },
                  description: { type: ["string", "null"] },
                  created_at: { type: "string" },
                  updated_at: { type: "string" },
                  created_by: { type: ["string", "null"] },
                  is_deleted: { type: "boolean" },
                },
              },
            },
          },
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
      },
    },
    async (request, reply) => {
      try {
        const userId = request.user.id;
        const params = request.params as { roleId: string };
        const body = request.body as { name?: string; description?: string };

        const roleId = parseInt(params.roleId, 10);
        if (isNaN(roleId)) {
          return reply.status(400).send({
            success: false,
            error: "Invalid role ID",
          });
        }

        const service = new SharedRolesService(request.supabaseClient, userId);
        const updatedRole = await service.updateRole(roleId, {
          name: body.name,
          description: body.description,
        });

        return { data: updatedRole, success: true };
      } catch (error) {
        let statusCode = 500;
        if (
          error instanceof Error &&
          error.message.includes("not found or you do not have permission")
        ) {
          statusCode = 404;
        } else if (
          error instanceof Error &&
          error.message.includes("role with this name already exists")
        ) {
          statusCode = 400;
        }

        return reply.status(statusCode).send({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // DELETE /shared/roles/:roleId - Delete a shared role
  fastify.delete(
    "/roles/:roleId",
    {
      schema: {
        description: "Delete a shared role (soft delete)",
        params: {
          type: "object",
          properties: {
            roleId: { type: "string" },
          },
          required: ["roleId"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
            },
          },
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
      try {
        const userId = request.user.id;
        const params = request.params as { roleId: string };

        const roleId = parseInt(params.roleId, 10);
        if (isNaN(roleId)) {
          return reply.status(400).send({
            success: false,
            error: "Invalid role ID",
          });
        }

        const service = new SharedRolesService(request.supabaseClient, userId);
        await service.deleteRole(roleId);

        return { success: true };
      } catch (error) {
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
}
