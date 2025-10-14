import { FastifyInstance } from "fastify";
import { commonResponseSchemas } from "../../schemas/common.js";
import { QuestionnaireService } from "../../services/QuestionnaireService.js";
import { UpdateQuestionnaireSectionData } from "../../types/entities/questionnaires.js";
import {
  InternalServerError,
  NotFoundError,
} from "../../plugins/errorHandler.js";

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
    async (request) => {
      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      const { questionnaire_id, title } = request.body as {
        questionnaire_id: number;
        title: string;
      };

      await questionnaireService.checkQuestionnaireInUse(questionnaire_id);

      const section = await questionnaireService.createSection(
        questionnaire_id,
        { title }
      );

      return {
        success: true,
        data: section,
      };
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
                },
              },
            },
          },
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request) => {
      const { sectionId } = request.params as {
        sectionId: number;
      };

      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );
      const section = await questionnaireService.updateSection(
        sectionId,
        request.body as UpdateQuestionnaireSectionData
      );

      if (!section) {
        throw new InternalServerError("Failed to update section");
      }

      return {
        success: true,
        data: section,
      };
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
          403: commonResponseSchemas.responses[403],
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request) => {
      const { sectionId } = request.params as {
        sectionId: string;
      };

      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      // Get the section to find its questionnaire_id
      const { data: section, error: sectionError } =
        await request.supabaseClient
          .from("questionnaire_sections")
          .select("questionnaire_id")
          .eq("id", parseInt(sectionId))
          .eq("is_deleted", false)
          .single();

      if (sectionError || !section) {
        throw new NotFoundError("Section not found");
      }

      await questionnaireService.checkQuestionnaireInUse(
        section.questionnaire_id
      );

      const deleted = await questionnaireService.deleteSection(
        parseInt(sectionId)
      );

      if (!deleted) {
        throw new InternalServerError("Failed to delete section");
      }

      return {
        success: true,
        message: "Section deleted successfully",
      };
    }
  );
}
