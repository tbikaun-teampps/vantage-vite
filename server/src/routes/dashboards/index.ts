import { FastifyInstance } from "fastify";
import { commonResponseSchemas } from "../../schemas/common";
import { dashboardSchemas } from "../../schemas/dashboard";
import {
  DashboardService,
  type CreateDashboardInput,
  type UpdateDashboardInput,
} from "../../services/DashboardService";
import { widgetsRoutes } from "./widgets";

export async function dashboardsRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) {
      routeOptions.schema.tags = ["Dashboards"];
    }
  });

  // Register widgets sub-routes
  await fastify.register(widgetsRoutes, { prefix: "/widgets" });

  // GET all dashboards for a company
  fastify.get(
    "/:companyId",
    {
      schema: {
        description: "Get all dashboards for a company",
        params: {
          type: "object",
          properties: {
            companyId: { type: "string" },
          },
          required: ["companyId"],
        },
        response: {
          200: dashboardSchemas.responses.dashboardList,
          401: commonResponseSchemas.responses[401],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const { companyId } = request.params as { companyId: string };
        const dashboardService = new DashboardService(
          request.supabaseClient,
          request.user.id
        );
        const dashboards = await dashboardService.getDashboards(companyId);

        return {
          success: true,
          data: dashboards,
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );

  // GET a specific dashboard by ID
  fastify.get(
    "/:companyId/:dashboardId",
    {
      schema: {
        description: "Get a specific dashboard by ID",
        params: {
          type: "object",
          properties: {
            companyId: { type: "string" },
            dashboardId: { type: "number" },
          },
          required: ["companyId", "dashboardId"],
        },
        response: {
          200: dashboardSchemas.responses.dashboardSingle,
          404: commonResponseSchemas.responses[404],
          401: commonResponseSchemas.responses[401],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const { dashboardId } = request.params as {
          companyId: string;
          dashboardId: number;
        };
        const dashboardService = new DashboardService(
          request.supabaseClient,
          request.user.id
        );
        const dashboard = await dashboardService.getDashboardById(dashboardId);

        if (!dashboard) {
          return reply.status(404).send({
            success: false,
            error: "Dashboard not found",
          });
        }

        return {
          success: true,
          data: dashboard,
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );

  // POST create new dashboard
  fastify.post(
    "/:companyId",
    {
      schema: {
        description: "Create a new dashboard",
        params: {
          type: "object",
          properties: {
            companyId: { type: "string" },
          },
          required: ["companyId"],
        },
        body: dashboardSchemas.body.createDashboard,
        response: {
          200: dashboardSchemas.responses.dashboardSingle,
          401: commonResponseSchemas.responses[401],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const { companyId } = request.params as { companyId: string };
        const input = request.body as CreateDashboardInput;

        const dashboardService = new DashboardService(
          request.supabaseClient,
          request.user.id
        );
        const dashboard = await dashboardService.createDashboard(
          companyId,
          input
        );

        return {
          success: true,
          data: dashboard,
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );

  // PATCH update dashboard
  fastify.patch(
    "/:companyId/:dashboardId",
    {
      schema: {
        description: "Update a dashboard",
        params: {
          type: "object",
          properties: {
            companyId: { type: "string" },
            dashboardId: { type: "number" },
          },
          required: ["companyId", "dashboardId"],
        },
        body: dashboardSchemas.body.updateDashboard,
        response: {
          200: dashboardSchemas.responses.dashboardSingle,
          404: commonResponseSchemas.responses[404],
          401: commonResponseSchemas.responses[401],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const { dashboardId } = request.params as {
          companyId: string;
          dashboardId: number;
        };
        const updates = request.body as UpdateDashboardInput;

        const dashboardService = new DashboardService(
          request.supabaseClient,
          request.user.id
        );
        const dashboard = await dashboardService.updateDashboard(
          dashboardId,
          updates
        );

        return {
          success: true,
          data: dashboard,
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );

  // DELETE soft delete dashboard
  fastify.delete(
    "/:companyId/:dashboardId",
    {
      schema: {
        description: "Delete a dashboard (soft delete)",
        params: {
          type: "object",
          properties: {
            companyId: { type: "string" },
            dashboardId: { type: "number" },
          },
          required: ["companyId", "dashboardId"],
        },
        response: {
          200: dashboardSchemas.responses.dashboardDeleted,
          404: commonResponseSchemas.responses[404],
          401: commonResponseSchemas.responses[401],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const { dashboardId } = request.params as {
          companyId: string;
          dashboardId: number;
        };

        const dashboardService = new DashboardService(
          request.supabaseClient,
          request.user.id
        );
        await dashboardService.deleteDashboard(dashboardId);

        return {
          success: true,
          message: "Dashboard deleted successfully",
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );
}
