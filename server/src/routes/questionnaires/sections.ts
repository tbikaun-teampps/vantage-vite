import { FastifyInstance } from "fastify";
import { commonResponseSchemas } from "../../schemas/common.js";
import { QuestionnaireService } from "../../services/QuestionnaireService.js";

export async function sectionsRoutes(fastify: FastifyInstance) {
  // Create a new section in a questionnaire
  fastify.post(
    "/sections",
    {
      schema: {
        description: "Create a new section in a questionnaire",
        body: {
          type: "object",
          properties: {
            questionnaire_id: { type: "number" },
            title: { type: "string" },
          },
          required: ["questionnaire_id", "title"],
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
        const section = await questionnaireService.createSection(
          parseInt(request.body.questionnaire_id),
          request.body as any
        );

        return {
          success: true,
          data: section,
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

  // Update a section in a questionnaire
  fastify.put(
    "/sections/:sectionId",
    {
      schema: {
        description: "Update a section in a questionnaire",
        params: {
          type: "object",
          properties: {
            sectionId: { type: "string" },
          },
          required: ["sectionId"],
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
        const { sectionId } = request.params as {
          sectionId: string;
        };

        const questionnaireService = new QuestionnaireService(
          request.supabaseClient
        );
        const section = await questionnaireService.updateSection(
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

  // Delete a section in a questionnaire
  fastify.delete(
    "/sections/:sectionId",
    {
      schema: {
        description: "Delete a section in a questionnaire",
        params: {
          type: "object",
          properties: {
            sectionId: { type: "string" },
          },
          required: ["sectionId"],
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
}