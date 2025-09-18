import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middleware/auth";
import { questionnaireSchemas } from "../schemas/questionnaire.js";
import { commonResponseSchemas } from "../schemas/common.js";
import { QuestionnaireService } from "../services/QuestionnaireService.js";

export async function questionnairesRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);
  fastify.get(
    "/questionnaires",
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
          request.supabaseClient
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
    "/questionnaires/:questionnaireId",
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
          200: questionnaireSchemas.responses.questionnaireDetail,
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
          request.supabaseClient
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
    "/questionnaires",
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
          request.supabaseClient
        );
        const questionnaire = await questionnaireService.createQuestionnaire(
          request.body as any
        );

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

  fastify.delete(
    "/questionnaires/:questionnaireId",
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
          request.supabaseClient
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
    "/questionnaires/:questionnaireId",
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
          request.supabaseClient
        );
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
    "/questionnaires/:questionnaireId/duplicate",
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
          request.supabaseClient
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
  fastify.post(
    "/questionnaires/:questionnaireId/sections",
    {
      schema: {
        description: "Create a new section in a questionnaire",
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
            title: { type: "string" },
            description: { type: "string" },
          },
          required: ["title"],
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
        const { questionnaireId } = request.params as {
          questionnaireId: string;
        };

        const questionnaireService = new QuestionnaireService(
          request.supabaseClient
        );
        const section = await questionnaireService.createSection(
          parseInt(questionnaireId),
          request.body as any
        );

        return {
          success: true,
          data: section,
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
    "/questionnaires/:questionnaireId/sections/:sectionId", // TODO
    {
      schema: {
        description: "Update a section in a questionnaire",
        params: {
          type: "object",
          properties: {
            questionnaireId: { type: "string" },
            sectionId: { type: "string" },
          },
          required: ["questionnaireId", "sectionId"],
        },
        body: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
          },
          required: ["title"],
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
        const { questionnaireId, sectionId } = request.params as {
          questionnaireId: string;
          sectionId: string;
        };

        const questionnaireService = new QuestionnaireService(
          request.supabaseClient
        );
        const section = await questionnaireService.updateSection(
          parseInt(questionnaireId),
          parseInt(sectionId),
          request.body as any
        );

        if (!section) {
          return reply.status(404).send({
            success: false,
            error: "Section not found",
          });
        }

        return {
          success: true,
          data: section,
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
    "/questionnaires/:questionnaireId/sections/:sectionId", // TODO
    {
      schema: {
        description: "Delete a section in a questionnaire",
        params: {
          type: "object",
          properties: {
            questionnaireId: { type: "string" },
            sectionId: { type: "string" },
          },
          required: ["questionnaireId", "sectionId"],
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
        const { sectionId } = request.params as {
          sectionId: string;
        };

        const questionnaireService = new QuestionnaireService(
          request.supabaseClient
        );
        const deleted = await questionnaireService.deleteSection(
          parseInt(sectionId)
        );

        if (!deleted) {
          return reply.status(404).send({
            success: false,
            error: "Section not found",
          });
        }

        return {
          success: true,
          message: "Section deleted successfully",
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
    "/questionnaires/:questionnaireId/sections/:sectionId/steps", // TODO
    {
      schema: {
        description: "Create a new step in a section",
        params: {
          type: "object",
          properties: {
            questionnaireId: { type: "string" },
            sectionId: { type: "string" },
          },
          required: ["questionnaireId", "sectionId"],
        },
        body: {
          type: "object",
          properties: {
            text: { type: "string" },
          },
          required: ["text"],
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
        const { sectionId } = request.params as {
          sectionId: string;
        };

        const questionnaireService = new QuestionnaireService(
          request.supabaseClient
        );
        const step = await questionnaireService.createStep(
          parseInt(sectionId),
          request.body as any
        );

        return {
          success: true,
          data: step,
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
