import { FastifyInstance } from "fastify";
import { commonResponseSchemas } from "../../schemas/common.js";
import { QuestionnaireService } from "../../services/QuestionnaireService.js";

export async function questionsRoutes(fastify: FastifyInstance) {
  // Create a new question in a step
  fastify.post(
    "/questionnaires/questions",
    {
      schema: {
        description: "Create a new question in a step",
        body: {
          type: "object",
          properties: {
            step_id: { type: "number" },
            title: { type: "string" },
            question_text: { type: "string" },
            context: { type: "string" },
            order_index: { type: "number" },
          },
          required: ["step_id", "question_text"],
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
      try {
        const questionnaireService = new QuestionnaireService(
          request.supabaseClient
        );
        const question = await questionnaireService.createQuestion(
          parseInt(request.body.step_id),
          request.body as any
        );
        return {
          success: true,
          data: question,
        };
      } catch (error) {
        console.log("error: ", error);
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );

  // Update a question in a questionnaire
  fastify.put(
    "/questionnaires/questions/:questionId",
    {
      schema: {
        description: "Update a question in a questionnaire",
        params: {
          type: "object",
          properties: {
            questionId: { type: "string" },
          },
          required: ["questionId"],
        },
        body: {
          type: "object",
          properties: {
            title: { type: "string" },
            question_text: { type: "string" },
            context: { type: "string" },
            order_index: { type: "number" },
          },
          required: ["question_text"],
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
      try {
        const { questionId } = request.params as {
          questionId: string;
        };

        const questionnaireService = new QuestionnaireService(
          request.supabaseClient
        );
        const question = await questionnaireService.updateQuestion(
          parseInt(questionId),
          request.body as any
        );

        if (!question) {
          return reply.status(404).send({
            success: false,
            error: "Question not found",
          });
        }

        return {
          success: true,
          data: question,
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

  // Delete a question in a questionnaire
  fastify.delete(
    "/questionnaires/questions/:questionId",
    {
      schema: {
        description: "Delete a question in a questionnaire",
        params: {
          type: "object",
          properties: {
            questionId: { type: "string" },
          },
          required: ["questionId"],
        },
        response: {
          200: commonResponseSchemas.messageResponse,
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const { questionId } = request.params as {
          questionId: string;
        };

        const questionnaireService = new QuestionnaireService(
          request.supabaseClient
        );
        const deleted = await questionnaireService.deleteQuestion(
          parseInt(questionId)
        );

        if (!deleted) {
          return reply.status(404).send({
            success: false,
            error: "Question not found",
          });
        }

        return {
          success: true,
          message: "Question deleted successfully",
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

  // Duplicate a question in a questionnaire
  fastify.post(
    "/questionnaires/questions/:questionId/duplicate",
    {
      schema: {
        description: "Duplicate a question in a questionnaire",
        params: {
          type: "object",
          properties: {
            questionId: { type: "string" },
          },
          required: ["questionId"],
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
      try {
        const { questionId } = request.params as {
          questionId: string;
        };

        const questionnaireService = new QuestionnaireService(
          request.supabaseClient
        );
        const duplicatedQuestion = await questionnaireService.duplicateQuestion(
          parseInt(questionId)
        );

        if (!duplicatedQuestion) {
          return reply.status(404).send({
            success: false,
            error: "Question not found",
          });
        }

        return {
          success: true,
          data: duplicatedQuestion,
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
  // Add rating scale to a question
  fastify.post(
    "/questionnaires/questions/:questionId/question-rating-scale",
    {
      schema: {
        description: "Add rating scale to a question",
        params: {
          type: "object",
          properties: {
            questionId: { type: "string" },
          },
          required: ["questionId"],
        },
        body: {
          type: "object",
          properties: {
            questionnaire_rating_scale_id: { type: "number" },
            description: { type: "string" },
          },
          required: ["questionnaire_rating_scale_id"],
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
      try {
        const { questionId } = request.params as {
          questionId: string;
        };

        const questionnaireService = new QuestionnaireService(
          request.supabaseClient
        );
        const ratingScale = await questionnaireService.addQuestionRatingScale(
          parseInt(questionId),
          parseInt(request.body.questionnaire_rating_scale_id),
          request.body as any
        );

        if (!ratingScale) {
          return reply.status(404).send({
            success: false,
            error: "Question not found",
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
  fastify.put(
    "/questionnaires/question-rating-scale/:questionRatingScaleId",
    {
      schema: {
        description: "Update a question rating scale",
        params: {
          type: "object",
          properties: {
            questionRatingScaleId: { type: "string" },
          },
          required: ["questionRatingScaleId"],
        },
        body: {
          type: "object",
          properties: {
            description: { type: "string" },
          },
          required: ["description"],
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
      try {
        const { questionRatingScaleId } = request.params as {
          questionRatingScaleId: string;
        };

        const questionnaireService = new QuestionnaireService(
          request.supabaseClient
        );
        const ratingScale =
          await questionnaireService.updateQuestionRatingScale(
            parseInt(questionRatingScaleId),
            request.body as any
          );

        if (!ratingScale) {
          return reply.status(404).send({
            success: false,
            error: "Question rating scale not found",
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
  fastify.delete(
    "/questionnaires/question-rating-scale/:questionRatingScaleId",
    {
      schema: {
        description: "Delete a question rating scale",
        params: {
          type: "object",
          properties: {
            questionRatingScaleId: { type: "string" },
          },
          required: ["questionRatingScaleId"],
        },
        response: {
          200: commonResponseSchemas.messageResponse,
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const { questionRatingScaleId } = request.params as {
          questionRatingScaleId: string;
        };

        const questionnaireService = new QuestionnaireService(
          request.supabaseClient
        );
        await questionnaireService.deleteQuestionRatingScale(
          parseInt(questionRatingScaleId)
        );

        return {
          success: true,
          message: "Question rating scale deleted successfully",
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
  fastify.post(
    "/questionnaires/:questionnaireId/questions/:questionId/add-questionnaire-rating-scales",
    {
      schema: {
        description:
          "Add all rating scales from the questionnaire to a question",
        params: {
          type: "object",
          properties: {
            questionnaireId: { type: "string" },
            questionId: { type: "string" },
          },
          required: ["questionnaireId", "questionId"],
        },
        response: {
          201: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "array", items: { type: "object" } },
            },
          },
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const { questionnaireId, questionId } = request.params as {
          questionnaireId: string;
          questionId: string;
        };

        const questionnaireService = new QuestionnaireService(
          request.supabaseClient
        );
        const ratingScales =
          await questionnaireService.addQuestionnaireRatingScaleToQuestion(
            parseInt(questionnaireId),
            parseInt(questionId)
          );

        if (!ratingScales) {
          return reply.status(404).send({
            success: false,
            error: "Question not found",
          });
        }

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
  fastify.put(
    "/questionnaires/questions/:questionId/associated-roles",
    {
      schema: {
        description: "Update associated roles for a question",
        params: {
          type: "object",
          properties: {
            questionId: { type: "string" },
          },
          required: ["questionId"],
        },
        body: {
          type: "object",
          properties: {
            role_ids: {
              type: "array",
              items: { type: "number" },
            },
          },
          required: ["role_ids"],
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
      try {
        const { questionId } = request.params as { questionId: string };
        const { role_ids } = request.body as { role_ids: number[] };

        const questionnaireService = new QuestionnaireService(
          request.supabaseClient
        );
        const updatedQuestion =
          await questionnaireService.updateQuestionAssociatedRoles(
            parseInt(questionId),
            role_ids
          );

        if (!updatedQuestion) {
          return reply.status(404).send({
            success: false,
            error: "Question not found",
          });
        }

        return {
          success: true,
          data: updatedQuestion,
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
