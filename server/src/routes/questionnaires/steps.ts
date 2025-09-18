import { FastifyInstance } from "fastify";
import { commonResponseSchemas } from "../../schemas/common.js";
import { QuestionnaireService } from "../../services/QuestionnaireService.js";

export async function stepsRoutes(fastify: FastifyInstance) {
  // Create a new step in a section
  fastify.post(
    "/questionnaires/steps",
    {
      schema: {
        description: "Create a new step in a section",
        body: {
          type: "object",
          properties: {
            section_id: { type: "number" },
            title: { type: "string" },
          },
          required: ["section_id", "title"],
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
        const step = await questionnaireService.createStep(
          parseInt(request.body.section_id),
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
    "/questionnaires/steps/:stepId",
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
            description: { type: "string" },
            order_index: { type: "number" },
            expanded: { type: "boolean" },
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
          request.supabaseClient
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
    "/questionnaires/steps/:stepId",
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
          request.supabaseClient
        );
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