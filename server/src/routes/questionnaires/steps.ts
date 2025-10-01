import { FastifyInstance } from "fastify";
import { commonResponseSchemas } from "../../schemas/common.js";
import { QuestionnaireService } from "../../services/QuestionnaireService.js";

export async function stepsRoutes(fastify: FastifyInstance) {
  // Create a new step in a section
  fastify.post(
    "/steps",
    {
      schema: {
        description: "Create a new step in a section",
        body: {
          type: "object",
          properties: {
            questionnaire_section_id: { type: "number" },
            title: { type: "string" },
          },
          required: ["questionnaire_section_id", "title"],
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
          request.supabaseClient, request.user.id
        );

        // Get the section to find its questionnaire_id
        const { data: section, error: sectionError } =
          await request.supabaseClient
            .from("questionnaire_sections")
            .select("questionnaire_id")
            .eq("id", parseInt(request.body.questionnaire_section_id))
            .eq("is_deleted", false)
            .single();

        if (sectionError || !section) {
          return reply.status(404).send({
            success: false,
            error: "Section not found",
          });
        }

        // Check if questionnaire is in use
        const usageCheck = await questionnaireService.checkQuestionnaireInUse(
          section.questionnaire_id
        );
        if (usageCheck.isInUse) {
          return reply.status(403).send({
            success: false,
            error: usageCheck.message,
          });
        }

        const step = await questionnaireService.createStep(
          parseInt(request.body.questionnaire_section_id),
          request.body as any
        );

        return {
          success: true,
          data: step,
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

  // Update a step in a questionnaire
  fastify.put(
    "/steps/:stepId",
    {
      schema: {
        description: "Update a step in a questionnaire",
        params: {
          type: "object",
          properties: {
            stepId: { type: "string" },
          },
          required: ["stepId"],
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
        const { stepId } = request.params as {
          stepId: string;
        };
        const questionnaireService = new QuestionnaireService(
          request.supabaseClient, request.user.id
        );
        const step = await questionnaireService.updateStep(
          parseInt(stepId),
          request.body as any
        );

        if (!step) {
          return reply.status(404).send({
            success: false,
            error: "Step not found",
          });
        }

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

  // Delete a step in a questionnaire
  fastify.delete(
    "/steps/:stepId",
    {
      schema: {
        description: "Delete a step in a questionnaire",
        params: {
          type: "object",
          properties: {
            stepId: { type: "string" },
          },
          required: ["stepId"],
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
        const { stepId } = request.params as {
          stepId: string;
        };

        const questionnaireService = new QuestionnaireService(
          request.supabaseClient,
          request.user.id
        );

        // Get the step to find its questionnaire_id
        const { data: step, error: stepError } = await request.supabaseClient
          .from("questionnaire_steps")
          .select("questionnaire_id")
          .eq("id", parseInt(stepId))
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

        const deleted = await questionnaireService.deleteStep(parseInt(stepId));

        if (!deleted) {
          return reply.status(404).send({
            success: false,
            error: "Step not found",
          });
        }

        return {
          success: true,
          message: "Step deleted successfully",
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