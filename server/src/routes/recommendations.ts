import { FastifyInstance } from "fastify";
import { RecommendationsService } from "../services/RecommendationsService";

export async function recommendationsRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) routeOptions.schema.tags = [];
    routeOptions.schema.tags.push("Recommendations");
  });
  fastify.get(
    "/:recommendationId",
    {
      schema: {
        description: "Get recommendation by ID",
        params: {
          type: "object",
          properties: {
            recommendationId: { type: "string" },
          },
          required: ["recommendationId"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  content: { type: "string" },
                  context: { type: "string" },
                  priority: { type: "string", enum: ["low", "medium", "high"] },
                  status: {
                    type: "string",
                    enum: ["open", "in_progress", "closed"],
                  },
                  program_id: { type: "number" },
                  created_at: { type: "string", format: "date-time" },
                  updated_at: { type: "string", format: "date-time" },
                },
              },
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
      const { recommendationId } = request.params as {
        recommendationId: string;
      };

      try {
        const recommendationService = new RecommendationsService(
          request.supabaseClient
        );
        const recommendation =
          await recommendationService.getRecommendationById(
            parseInt(recommendationId)
          );

        return reply.status(200).send({
          success: true,
          data: recommendation,
        });
      } catch (error) {
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );
  fastify.put(
    "/:recommendationId",
    {},
    async (request, reply) => {
      const { recommendationId } = request.params as {
        recommendationId: string;
      };
      const updates = request.body as {
        content?: string;
        context?: string;
        priority?: "low" | "medium" | "high";
        status?: "open" | "in_progress" | "closed";
        program_id?: number;
      };
      return {
        success: true,
        data: {
          id: recommendationId,
          ...updates,
          updated_at: new Date().toISOString(),
        },
      };
    }
  );
  fastify.delete(
    "/:recommendationId",
    {
      schema: {
        description: "Delete recommendation by ID",
        params: {
          type: "object",
          properties: {
            recommendationId: { type: "string" },
          },
          required: ["recommendationId"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
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
      const { recommendationId } = request.params as {
        recommendationId: string;
      };
      try {
        const recommendationService = new RecommendationsService(
          request.supabaseClient
        );
        await recommendationService.deleteRecommendation(
          parseInt(recommendationId)
        );

        return reply.status(200).send({
          success: true,
          message: "Recommendation deleted successfully",
        });
      } catch (error) {
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );
}
