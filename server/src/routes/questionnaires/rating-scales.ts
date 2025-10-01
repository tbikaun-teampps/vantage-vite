import { FastifyInstance } from "fastify";
import { commonResponseSchemas } from "../../schemas/common.js";
import { QuestionnaireService } from "../../services/QuestionnaireService.js";

const ratingScale = {
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
};

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
                items: ratingScale,
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
          request.supabaseClient,
          request.user.id
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

  // Add multiple rating scales to a questionnaire (batch)
  fastify.post(
    "/:questionnaireId/rating-scales/batch",
    {
      schema: {
        description: "Add multiple rating scales to a questionnaire at once",
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
            scales: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  value: { type: "number" },
                  order_index: { type: "number" },
                },
                required: ["name", "value"],
              },
            },
          },
          required: ["scales"],
        },
        response: {
          201: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "array",
                items: ratingScale,
              },
            },
          },
          403: commonResponseSchemas.responses[403],
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      const { questionnaireId } = request.params as {
        questionnaireId: string;
      };
      const { scales } = request.body as {
        scales: Array<{
          name: string;
          description: string;
          value: number;
          order_index: number;
        }>;
      };

      try {
        const questionnaireService = new QuestionnaireService(
          request.supabaseClient,
          request.user.id
        );

        // Check if questionnaire is in use
        const usageCheck = await questionnaireService.checkQuestionnaireInUse(
          parseInt(questionnaireId)
        );
        if (usageCheck.isInUse) {
          return reply.status(403).send({
            success: false,
            error: usageCheck.message,
          });
        }

        const ratingScales = await questionnaireService.createRatingScalesBatch(
          parseInt(questionnaireId),
          scales
        );

        return reply.status(201).send({
          success: true,
          data: ratingScales,
        });
      } catch (error) {
        console.log(error);
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
          403: commonResponseSchemas.responses[403],
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
          request.supabaseClient,
          request.user.id
        );

        // Check if questionnaire is in use
        const usageCheck = await questionnaireService.checkQuestionnaireInUse(
          parseInt(questionnaireId)
        );
        if (usageCheck.isInUse) {
          return reply.status(403).send({
            success: false,
            error: usageCheck.message,
          });
        }

        const ratingScale = await questionnaireService.createRatingScale(
          parseInt(questionnaireId),
          request.body as any
        );

        return {
          success: true,
          data: ratingScale,
        };
      } catch (error) {
        console.log(error);
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
    "/rating-scales/:ratingScaleId",
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
              data: ratingScale,
            },
          },
          403: commonResponseSchemas.responses[403],
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
          request.supabaseClient,
          request.user.id
        );

        // Get the rating scale to find its questionnaire_id
        const { data: existingRatingScale, error: fetchError } =
          await request.supabaseClient
            .from("questionnaire_rating_scales")
            .select("questionnaire_id")
            .eq("id", parseInt(ratingScaleId))
            .eq("is_deleted", false)
            .single();

        if (fetchError || !existingRatingScale) {
          return reply.status(404).send({
            success: false,
            error: "Rating scale not found",
          });
        }

        // Check if questionnaire is in use
        const usageCheck = await questionnaireService.checkQuestionnaireInUse(
          existingRatingScale.questionnaire_id
        );
        if (usageCheck.isInUse) {
          return reply.status(403).send({
            success: false,
            error: usageCheck.message,
          });
        }

        // Check if rating scale is being used by questions when modifying critical fields
        const body = request.body as any;
        const isCriticalUpdate = body.name !== undefined || body.value !== undefined;

        if (isCriticalUpdate) {
          const ratingScaleUsage = await questionnaireService.checkRatingScaleInUse(
            parseInt(ratingScaleId)
          );
          if (ratingScaleUsage.isInUse) {
            return reply.status(403).send({
              success: false,
              error: ratingScaleUsage.message,
            });
          }
        }

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
    "/rating-scales/:ratingScaleId",
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
          403: commonResponseSchemas.responses[403],
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
          request.supabaseClient,
          request.user.id
        );

        // Get the rating scale to find its questionnaire_id
        const { data: existingRatingScale, error: fetchError } =
          await request.supabaseClient
            .from("questionnaire_rating_scales")
            .select("questionnaire_id")
            .eq("id", parseInt(ratingScaleId))
            .eq("is_deleted", false)
            .single();

        if (fetchError || !existingRatingScale) {
          return reply.status(404).send({
            success: false,
            error: "Rating scale not found",
          });
        }

        // Check if questionnaire is in use
        const usageCheck = await questionnaireService.checkQuestionnaireInUse(
          existingRatingScale.questionnaire_id
        );
        if (usageCheck.isInUse) {
          return reply.status(403).send({
            success: false,
            error: usageCheck.message,
          });
        }

        // Check if rating scale is being used by questions
        const ratingScaleUsage = await questionnaireService.checkRatingScaleInUse(
          parseInt(ratingScaleId)
        );
        if (ratingScaleUsage.isInUse) {
          return reply.status(403).send({
            success: false,
            error: ratingScaleUsage.message,
          });
        }

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
