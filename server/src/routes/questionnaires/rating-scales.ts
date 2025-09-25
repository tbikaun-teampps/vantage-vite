import { FastifyInstance } from "fastify";
import { commonResponseSchemas } from "../../schemas/common.js";
import { QuestionnaireService } from "../../services/QuestionnaireService.js";

export async function ratingScalesRoutes(fastify: FastifyInstance) {
  // Get rating scales for a questionnaire
  fastify.get(
    "/:questionnaireId/rating-scales",
    {
      schema: {
        description: "Get rating scales for a questionnaire",
        params: {
          type: "object",
          properties: {
            questionnaireId: {
              type: "string",
            },
          },
          required: ["questionnaireId"],
        },
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
                    value: { type: "number" },
                    order_index: { type: "number" },
                    created_at: { type: "string", format: "date-time" },
                    updated_at: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      const { questionnaireId } = request.params as { questionnaireId: string };

      try {
        const questionnaireService = new QuestionnaireService(
          request.supabaseClient
        );
        const ratingScales =
          await questionnaireService.getRatingScalesByQuestionnaireId(
            parseInt(questionnaireId)
          );

        return {
          success: true,
          data: ratingScales,
        };
      } catch (error) {
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );

  // Add a rating scale to a questionnaire
  fastify.post(
    "/:questionnaireId/rating-scale",
    {
      schema: {
        description: "Add a rating scale to a questionnaire",
        params: {
          type: "object",
          properties: {
            questionnaireId: {
              type: "string",
            },
          },
          required: ["questionnaireId"],
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            value: { type: "number" },
            order_index: { type: "number" },
          },
          required: ["name", "value"],
        },
        response: {
          201: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "object" },
            },
          },
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      const { questionnaireId } = request.params as {
        questionnaireId: string;
      };

      try {
        const questionnaireService = new QuestionnaireService(
          request.supabaseClient
        );
        const ratingScale = await questionnaireService.createRatingScale(
          parseInt(questionnaireId),
          request.body as any
        );

        return {
          success: true,
          data: ratingScale,
        };
      } catch (error) {
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );

  // Update a rating scale
  fastify.put(
    "/rating-scale/:ratingScaleId",
    {
      schema: {
        description: "Update a rating scale in a questionnaire",
        params: {
          type: "object",
          properties: {
            ratingScaleId: { type: "string" },
          },
          required: ["ratingScaleId"],
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            value: { type: "number" },
            order_index: { type: "number" },
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
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      const { ratingScaleId } = request.params as {
        ratingScaleId: string;
      };

      try {
        const questionnaireService = new QuestionnaireService(
          request.supabaseClient
        );
        const ratingScale = await questionnaireService.updateRatingScale(
          parseInt(ratingScaleId),
          request.body as any
        );

        if (!ratingScale) {
          return reply.status(404).send({
            success: false,
            error: "Rating scale not found",
          });
        }

        return {
          success: true,
          data: ratingScale,
        };
      } catch (error) {
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );

  // Delete a rating scale
  fastify.delete(
    "/rating-scale/:ratingScaleId",
    {
      schema: {
        description: "Delete a rating scale from a questionnaire",
        params: {
          type: "object",
          properties: {
            ratingScaleId: { type: "string" },
          },
          required: ["ratingScaleId"],
        },
        response: {
          200: commonResponseSchemas.messageResponse,
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      const { ratingScaleId } = request.params as {
        ratingScaleId: string;
      };

      try {
        const questionnaireService = new QuestionnaireService(
          request.supabaseClient
        );
        await questionnaireService.deleteRatingScale(parseInt(ratingScaleId));

        return {
          success: true,
          message: "Rating scale deleted successfully",
        };
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