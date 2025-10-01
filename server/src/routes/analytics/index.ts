import { FastifyInstance } from "fastify";
import { AnalyticsService } from "../../services/analytics/AnalyticsService";

export async function analyticsRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) routeOptions.schema.tags = [];
    routeOptions.schema.tags.push("Analytics");
  });
  fastify.get(
    "",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            company_id: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "array",
                items: { type: "object" },
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
        // Get

        return reply.send({
          success: true,
          data: [],
        });
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
  fastify.get(
    "/filters",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            analytics_type: {
              type: "string",
              enum: ["heatmap", "geographicalMap"],
            },
            companyId: { type: "string" },
          },
          required: ["analytics_type", "companyId"],
        },
        // response: {
        //   200: {
        //     type: "object",
        //     properties: {
        //       success: { type: "boolean" },
        //       data: { type: "object" },
        //     },
        //   },
        //   400: {
        //     type: "object",
        //     properties: {
        //       success: { type: "boolean" },
        //       error: { type: "string" },
        //     },
        //   },
        //   500: {
        //     type: "object",
        //     properties: {
        //       success: { type: "boolean" },
        //       error: { type: "string" },
        //     },
        //   },
        // },
      },
    },
    async (request, reply) => {
      try {
        const { analytics_type, companyId } = request.query as {
          analytics_type: "heatmap" | "geographicalMap";
          companyId: string;
        };

        const analyticsService = new AnalyticsService(companyId, request.supabaseClient);
        const data = await analyticsService.getFilters(analytics_type);

        console.log("data:", data);

        return reply.send({
          success: true,
          data,
        });
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
  fastify.get(
    "/overall/heatmap",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            companyId: { type: "string" },
            questionnaireId: { type: "string" },
          },
          required: ["companyId", "questionnaireId"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        value: { type: "number" },
                        x: { type: "string" },
                        y: { type: "string" },
                      },
                    },
                  },
                  xLabels: { type: "array", items: { type: "string" } },
                  yLabels: { type: "array", items: { type: "string" } },
                  values: { type: "array", items: { type: "number" } },
                },
              },
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
        const { companyId, questionnaireId } = request.query as {
          companyId: string;
          questionnaireId: number;
        };

        const analyticsService = new AnalyticsService(companyId, request.supabaseClient);
        const data = await analyticsService.getOverallHeatmapData({
          questionnaireId,
        });

        return reply.send({
          success: true,
          data,
        });
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
