import { FastifyInstance } from "fastify";
import { questionnaireSchemas } from "../../schemas/questionnaire.js";
import { commonResponseSchemas } from "../../schemas/common.js";
import { QuestionnaireService } from "../../services/QuestionnaireService.js";
import { ratingScalesRoutes } from "./rating-scales.js";
import { sectionsRoutes } from "./sections.js";
import { stepsRoutes } from "./steps.js";
import { questionsRoutes } from "./questions.js";

export async function questionnairesRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) routeOptions.schema.tags = [];
    routeOptions.schema.tags.push("Questionnaires");
  });

  // Register sub-routers
  await fastify.register(ratingScalesRoutes);
  await fastify.register(sectionsRoutes);
  await fastify.register(stepsRoutes);
  await fastify.register(questionsRoutes);
  fastify.get(
    "",
    {
      schema: {
        response: {
          200: questionnaireSchemas.responses.questionnaireList,
          401: commonResponseSchemas.responses[401],
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
        const questionnaires = await questionnaireService.getQuestionnaires();

        return {
          success: true,
          data: questionnaires,
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
  fastify.get(
    "/:questionnaireId",
    {
      schema: {
        description: "Get a questionnaire by ID",
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
          // 200: questionnaireSchemas.responses.questionnaireDetail,
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const { questionnaireId } = request.params as {
          questionnaireId: string;
        };

        const questionnaireService = new QuestionnaireService(
          request.supabaseClient,
          request.user.id
        );
        const questionnaire = await questionnaireService.getQuestionnaireById(
          parseInt(questionnaireId)
        );

        if (!questionnaire) {
          return reply.status(404).send({
            success: false,
            error: "Questionnaire not found",
          });
        }

        return {
          success: true,
          data: questionnaire,
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
    "",
    {
      schema: {
        description: "Create a new questionnaire",
        body: questionnaireSchemas.body.create,
        response: {
          200: questionnaireSchemas.responses.questionnaireCreate,
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
        const questionnaire = await questionnaireService.createQuestionnaire(
          request.body as any
        );

        return {
          success: true,
          data: [questionnaire],
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
    "/:questionnaireId",
    {
      schema: {
        description: "Soft delete a questionnaire by ID",
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
          200: commonResponseSchemas.messageResponse,
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const { questionnaireId } = request.params as {
          questionnaireId: string;
        };

        const questionnaireService = new QuestionnaireService(
          request.supabaseClient,
          request.user.id
        );
        const deleted = await questionnaireService.deleteQuestionnaire(
          parseInt(questionnaireId)
        );

        if (!deleted) {
          return reply.status(404).send({
            success: false,
            error: "Questionnaire not found",
          });
        }

        return {
          success: true,
          message: "Questionnaire deleted successfully",
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
    "/:questionnaireId",
    {
      schema: {
        description: "Update a questionnaire by ID",
        params: {
          type: "object",
          properties: {
            questionnaireId: {
              type: "string",
            },
          },
          required: ["questionnaireId"],
        },
        body: questionnaireSchemas.body.update,
        response: {
          200: questionnaireSchemas.responses.questionnaireCreate,
          403: commonResponseSchemas.responses[403],
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const { questionnaireId } = request.params as {
          questionnaireId: string;
        };

        const questionnaireService = new QuestionnaireService(
          request.supabaseClient,
          request.user.id
        );

        // Check if questionnaire is in use and if status is being changed
        const body = request.body as any;
        if (body.status !== undefined) {
          const usageCheck = await questionnaireService.checkQuestionnaireInUse(
            parseInt(questionnaireId)
          );
          if (usageCheck.isInUse) {
            return reply.status(403).send({
              success: false,
              error: "Cannot change questionnaire status while in use",
            });
          }
        }

        const questionnaire = await questionnaireService.updateQuestionnaire(
          parseInt(questionnaireId),
          request.body as any
        );

        if (!questionnaire) {
          return reply.status(404).send({
            success: false,
            error: "Questionnaire not found",
          });
        }

        return {
          success: true,
          data: [questionnaire],
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
    "/:questionnaireId/duplicate",
    {
      schema: {
        description: "Duplicate a questionnaire by ID",
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
          200: questionnaireSchemas.responses.questionnaireCreate,
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const { questionnaireId } = request.params as {
          questionnaireId: string;
        };

        const questionnaireService = new QuestionnaireService(
          request.supabaseClient,
          request.user.id
        );
        const questionnaire = await questionnaireService.duplicateQuestionnaire(
          parseInt(questionnaireId)
        );

        if (!questionnaire) {
          return reply.status(404).send({
            success: false,
            error: "Questionnaire not found",
          });
        }

        return {
          success: true,
          data: [questionnaire],
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
  fastify.get("/:questionnaireId/usage", {}, async (request, reply) => {
    const { questionnaireId } = request.params as {
      questionnaireId: string;
    };

    try {
      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );
      const usage = await questionnaireService.checkQuestionnaireUsage(
        parseInt(questionnaireId)
      );

      return {
        success: true,
        data: usage,
      };
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  });
}
