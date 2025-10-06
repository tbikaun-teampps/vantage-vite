import { FastifyInstance } from "fastify";
import { commonResponseSchemas } from "../../schemas/common.js";
import { QuestionnaireService } from "../../services/QuestionnaireService.js";

export async function questionsRoutes(fastify: FastifyInstance) {
  // Create a new question in a step
  fastify.post(
    "/questions",
    {
      schema: {
        description: "Create a new question in a step",
        body: {
          type: "object",
          properties: {
            questionnaire_step_id: { type: "number" },
            title: { type: "string" },
            question_text: { type: "string" },
            context: { type: "string" },
            order_index: { type: "number" },
          },
          required: ["questionnaire_step_id", "question_text"],
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
      try {
        const questionnaireService = new QuestionnaireService(
          request.supabaseClient,
          request.user.id
        );

        // Get the step to find its questionnaire_id
        const { data: step, error: stepError } = await request.supabaseClient
          .from("questionnaire_steps")
          .select("questionnaire_id")
          .eq("id", parseInt(request.body.questionnaire_step_id))
          .eq("is_deleted", false)
          .single();

        if (stepError || !step) {
          return reply.status(404).send({
            success: false,
            error: "Step not found",
          });
        }

        // Check if questionnaire is in use
        const usageCheck = await questionnaireService.checkQuestionnaireInUse(
          step.questionnaire_id
        );
        if (usageCheck.isInUse) {
          return reply.status(403).send({
            success: false,
            error: usageCheck.message,
          });
        }

        const question = await questionnaireService.createQuestion(
          parseInt(request.body.questionnaire_step_id),
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
    "/questions/:questionId",
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
                  title: { type: "string" },
                  question_text: { type: "string" },
                  context: { type: "string" },
                  order_index: { type: "number" },
                  created_at: { type: "string", format: "date-time" },
                  updated_at: { type: "string", format: "date-time" },
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
    "/questions/:questionId",
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
          403: commonResponseSchemas.responses[403],
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
          request.supabaseClient,
          request.user.id
        );

        // Get the question to find its questionnaire_id
        const { data: question, error: questionError } =
          await request.supabaseClient
            .from("questionnaire_questions")
            .select("questionnaire_id")
            .eq("id", parseInt(questionId))
            .eq("is_deleted", false)
            .single();

        if (questionError || !question) {
          return reply.status(404).send({
            success: false,
            error: "Question not found",
          });
        }

        // Check if questionnaire is in use
        const usageCheck = await questionnaireService.checkQuestionnaireInUse(
          question.questionnaire_id
        );
        if (usageCheck.isInUse) {
          return reply.status(403).send({
            success: false,
            error: usageCheck.message,
          });
        }

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
    "/questions/:questionId/duplicate",
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
          403: commonResponseSchemas.responses[403],
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
          request.supabaseClient,
          request.user.id
        );

        // Get the question to find its questionnaire_id
        const { data: question, error: questionError } =
          await request.supabaseClient
            .from("questionnaire_questions")
            .select("questionnaire_id")
            .eq("id", parseInt(questionId))
            .eq("is_deleted", false)
            .single();

        if (questionError || !question) {
          return reply.status(404).send({
            success: false,
            error: "Question not found",
          });
        }

        // Check if questionnaire is in use
        const usageCheck = await questionnaireService.checkQuestionnaireInUse(
          question.questionnaire_id
        );
        if (usageCheck.isInUse) {
          return reply.status(403).send({
            success: false,
            error: usageCheck.message,
          });
        }

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
    "/questions/:questionId/rating-scales",
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
          required: ["questionnaire_rating_scale_id", "description"],
        },
        response: {
          // 201: {
          //   type: "object",
          //   properties: {
          //     success: { type: "boolean" },
          //     data: { type: "object" },
          //   },
          // },
          403: commonResponseSchemas.responses[403],
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
          request.supabaseClient,
          request.user.id
        );

        // Get the question to find its questionnaire_id
        const { data: question, error: questionError } =
          await request.supabaseClient
            .from("questionnaire_questions")
            .select("questionnaire_id")
            .eq("id", parseInt(questionId))
            .eq("is_deleted", false)
            .single();

        if (questionError || !question) {
          return reply.status(404).send({
            success: false,
            error: "Question not found",
          });
        }

        // Check if questionnaire is in use
        const usageCheck = await questionnaireService.checkQuestionnaireInUse(
          question.questionnaire_id
        );
        if (usageCheck.isInUse) {
          return reply.status(403).send({
            success: false,
            error: usageCheck.message,
          });
        }

        const ratingScale = await questionnaireService.addQuestionRatingScale(
          parseInt(questionId),
          parseInt(request.body.questionnaire_rating_scale_id),
          request.body.description as string
        );

        if (!ratingScale) {
          return reply.status(404).send({
            success: false,
            error: "Failed to associate rating scale to question",
          });
        }

        return {
          success: true,
          data: ratingScale,
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
  fastify.put(
    "/questions/:questionId/rating-scales/:questionRatingScaleId",
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
              data: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  description: { type: "string" },
                  created_at: { type: "string", format: "date-time" },
                  updated_at: { type: "string", format: "date-time" },
                  questionnaire_rating_scale_id: { type: "number" },
                  questionnaire_question_id: { type: "number" },
                  questionnaire_id: { type: "number" },
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
      try {
        const { questionRatingScaleId } = request.params as {
          questionRatingScaleId: string;
        };

        const questionnaireService = new QuestionnaireService(
          request.supabaseClient,
          request.user.id
        );
        const ratingScale =
          await questionnaireService.updateQuestionRatingScale(
            parseInt(questionRatingScaleId),
            request.body.description as string
          );

        if (!ratingScale) {
          return reply.status(404).send({
            success: false,
            error: "Failed to update question rating scale",
          });
        }

        return {
          success: true,
          data: ratingScale,
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
  fastify.delete(
    "/questions/:questionId/rating-scales/:questionRatingScaleId",
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
          403: commonResponseSchemas.responses[403],
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
          request.supabaseClient,
          request.user.id
        );

        // Get the question rating scale to find its questionnaire_id
        const { data: questionRatingScale, error: fetchError } =
          await request.supabaseClient
            .from("questionnaire_question_rating_scales")
            .select("questionnaire_id")
            .eq("id", parseInt(questionRatingScaleId))
            .eq("is_deleted", false)
            .single();

        if (fetchError || !questionRatingScale) {
          return reply.status(404).send({
            success: false,
            error: "Question rating scale not found",
          });
        }

        // Check if questionnaire is in use
        const usageCheck = await questionnaireService.checkQuestionnaireInUse(
          questionRatingScale.questionnaire_id
        );
        if (usageCheck.isInUse) {
          return reply.status(403).send({
            success: false,
            error: usageCheck.message,
          });
        }

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
    "/questions/:questionId/add-questionnaire-rating-scales",
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
          request.supabaseClient,
          request.user.id
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
    "/questions/:questionId/applicable-roles",
    {
      schema: {
        description: "Update applicable roles for a question",
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
            shared_role_ids: {
              type: "array",
              items: { type: "number" },
            },
          },
          required: ["shared_role_ids"],
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
                    shared_role_id: { type: "number" },
                    name: { type: "string" },
                    description: { type: "string" },
                    created_at: { type: "string", format: "date-time" },
                    updated_at: { type: "string", format: "date-time" },
                    questionnaire_question_id: { type: "number" },
                  },
                },
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
      try {
        const { questionId } = request.params as { questionId: string };
        const { shared_role_ids } = request.body as {
          shared_role_ids: number[];
        };

        const questionnaireService = new QuestionnaireService(
          request.supabaseClient,
          request.user.id
        );

        // Get the question to find its questionnaire_id
        const { data: question, error: questionError } =
          await request.supabaseClient
            .from("questionnaire_questions")
            .select("questionnaire_id")
            .eq("id", parseInt(questionId))
            .eq("is_deleted", false)
            .single();

        if (questionError || !question) {
          return reply.status(404).send({
            success: false,
            error: "Question not found",
          });
        }

        // Check if questionnaire is in use
        const usageCheck = await questionnaireService.checkQuestionnaireInUse(
          question.questionnaire_id
        );
        if (usageCheck.isInUse) {
          return reply.status(403).send({
            success: false,
            error: usageCheck.message,
          });
        }

        const updatedQuestion =
          await questionnaireService.updateQuestionApplicableRoles(
            parseInt(questionId),
            shared_role_ids
          );

        if (!updatedQuestion || updatedQuestion.length === 0) {
          throw new Error();
        }

        return {
          success: true,
          data: updatedQuestion,
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
}
