import { FastifyInstance } from "fastify";
import { RecommendationsService } from "../services/RecommendationsService";
import type { Tables } from "../types/database";

type Recommendation = Tables<"recommendations">;

export async function recommendationsRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) {
      routeOptions.schema.tags = ["Recommendations"];
    }
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
  fastify.post(
    "",
    {
      schema: {
        description: "Create a new recommendation",
        body: {
          type: "object",
          properties: {
            company_id: { type: "string" },
            content: { type: "string" },
            context: { type: "string" },
            priority: { type: "string", enum: ["low", "medium", "high"] },
            status: {
              type: "string",
              enum: ["open", "in_progress", "closed"],
            },
            program_id: { type: "number" },
          },
          required: ["company_id", "content", "priority", "status"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "object" },
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
        const data = request.body as Omit<
          Recommendation,
          "id" | "created_at" | "updated_at" | "deleted_at" | "is_deleted"
        >;
        
        // TODO: review this
        // const recommendationService = new RecommendationsService(
        //   request.supabaseClient
        // );

        // Note: Server RecommendationsService has createRecommendation commented out
        // This will need to be uncommented in the service file
        const newRecommendation = await request.supabaseClient
          .from("recommendations")
          .insert(data)
          .select()
          .single();

        if (newRecommendation.error) {
          throw new Error(newRecommendation.error.message);
        }

        return reply.status(200).send({
          success: true,
          data: newRecommendation.data,
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
    {
      schema: {
        description: "Update recommendation by ID",
        params: {
          type: "object",
          properties: {
            recommendationId: { type: "string" },
          },
          required: ["recommendationId"],
        },
        body: {
          type: "object",
          properties: {
            content: { type: "string" },
            context: { type: "string" },
            priority: { type: "string", enum: ["low", "medium", "high"] },
            status: {
              type: "string",
              enum: ["open", "in_progress", "closed"],
            },
            program_id: { type: "number" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "object" },
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
        const { recommendationId } = request.params as {
          recommendationId: string;
        };
        const updates = request.body as Partial<
          Pick<
            Recommendation,
            "content" | "context" | "priority" | "status" | "program_id"
          >
        >;

        const recommendationService = new RecommendationsService(
          request.supabaseClient
        );
        const updatedRecommendation =
          await recommendationService.updateRecommendation(
            parseInt(recommendationId),
            updates
          );

        return reply.status(200).send({
          success: true,
          data: updatedRecommendation,
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
