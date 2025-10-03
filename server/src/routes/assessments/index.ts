import { FastifyInstance } from "fastify";
import {
  AssessmentsService,
  CreateAssessmentData,
} from "../../services/AssessmentsService.js";

export async function assessmentsRouter(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) routeOptions.schema.tags = [];
    routeOptions.schema.tags.push("Assessments");
  });

  fastify.get(
    "/:assessmentId",
    {
      schema: {
        response: {
          // 200: {
          //   type: "object",
          //   properties: {
          //     success: { type: "boolean" },
          //     data: {
          //       type: "object",
          //       properties: {
          //         id: { type: "number" },
          //         created_at: { type: "string", format: "date-time" },
          //         updated_at: { type: "string", format: "date-time" },
          //         name: { type: "string" },
          //         description: { type: "string" },
          //         type: { type: "string" },
          //         status: { type: "string" },
          //         objectives: {
          //           type: "array",
          //           items: {
          //             type: "object",
          //             properties: {
          //               title: { type: "string" },
          //               description: { type: "string" },
          //             },
          //           },
          //         },
          //         questionnaire: {
          //           type: "object",
          //           properties: {
          //             id: { type: "number" },
          //             name: { type: "string" },
          //             description: { type: "string" },
          //             section_count: { type: "number" },
          //             step_count: { type: "number" },
          //             question_count: { type: "number" },
          //             sections: {
          //               type: "array",
          //               items: {
          //                 type: "object",
          //                 properties: {
          //                   id: { type: "number" },
          //                   title: { type: "string" },
          //                   order_index: { type: "number" },
          //                   step_count: { type: "number" },
          //                   question_count: { type: "number" },
          //                   steps: {
          //                     type: "array",
          //                     items: {
          //                       type: "object",
          //                       properties: {
          //                         id: { type: "number" },
          //                         title: { type: "string" },
          //                         order_index: { type: "number" },
          //                         question_count: { type: "number" },
          //                         questions: {
          //                           type: "array",
          //                           items: {
          //                             type: "object",
          //                             properties: {
          //                               id: { type: "number" },
          //                               title: { type: "string" },
          //                               context: { type: "string" },
          //                               order_index: { type: "number" },
          //                               question_text: { type: "string" },
          //                             },
          //                           },
          //                         },
          //                       },
          //                     },
          //                   },
          //                 },
          //               },
          //             },
          //           },
          //         },
          //       },
          //     },
          //   },
          // },
        },
      },
    },
    async (request, reply) => {
      const { assessmentId } = request.params as { assessmentId: number };

      const assessmentService = new AssessmentsService(
        request.supabaseClient,
        request.user.id
      );

      const assessment =
        await assessmentService.getAssessmentById(assessmentId);

      if (!assessment) {
        return reply.status(404).send({
          success: false,
          error: "Assessment not found",
        });
      }

      return {
        success: true,
        data: assessment,
      };
    }
  );

  fastify.get("/:assessmentId/interviews", async (request, reply) => {
    const { assessmentId } = request.params as { assessmentId: number };
    const assessmentService = new AssessmentsService(
      request.supabaseClient,
      request.user.id
    );

    const interviews =
      await assessmentService.getInterviewsByAssessmentId(assessmentId);

    if (!interviews) {
      return reply.status(404).send({
        success: false,
        error: "Assessment interviews not found",
      });
    }

    return {
      success: true,
      data: interviews,
    };
  });
  fastify.get("/:assessmentId/comments", async (request, reply) => {
    const { assessmentId } = request.params as { assessmentId: number };
    const assessmentService = new AssessmentsService(
      request.supabaseClient,
      request.user.id
    );

    const comments =
      await assessmentService.getCommentsByAssessmentId(assessmentId);

    if (!comments) {
      return reply.status(404).send({
        success: false,
        error: "Assessment comments not found",
      });
    }

    return {
      success: true,
      data: comments,
    };
  });
  fastify.get("/:assessmentId/evidence", async (request, reply) => {
    const { assessmentId } = request.params as { assessmentId: number };
    const assessmentService = new AssessmentsService(
      request.supabaseClient,
      request.user.id
    );

    const evidence =
      await assessmentService.getEvidenceByAssessmentId(assessmentId);

    if (!evidence) {
      return reply.status(404).send({
        success: false,
        error: "Assessment evidence not found",
      });
    }

    return {
      success: true,
      data: evidence,
    };
  });

  fastify.put(
    "/:assessmentId",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: ["string", "null"] },
            status: { type: "string" },
            business_unit_id: { type: ["number", "null"] },
            region_id: { type: ["number", "null"] },
            site_id: { type: ["number", "null"] },
            asset_group_id: { type: ["number", "null"] },
            scheduled_at: { type: ["string", "null"], format: "date-time" },
            started_at: { type: ["string", "null"], format: "date-time" },
            completed_at: { type: ["string", "null"], format: "date-time" },
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
                  name: { type: "string" },
                  description: { type: "string" },
                  status: { type: "string" },
                  type: { type: "string" },
                  questionnaire_id: { type: "number" },
                  company_id: { type: "string" },
                  business_unit_id: { type: "number" },
                  region_id: { type: "number" },
                  site_id: { type: "number" },
                  asset_group_id: { type: "number" },
                  created_at: { type: "string" },
                  updated_at: { type: "string" },
                },
              },
            },
          },
          404: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
          500: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { assessmentId } = request.params as { assessmentId: string };
      const updates = request.body as any;

      const assessmentService = new AssessmentsService(
        request.supabaseClient,
        request.user.id
      );

      try {
        const assessment = await assessmentService.updateAssessment(
          Number(assessmentId),
          updates
        );

        return reply.status(200).send({
          success: true,
          data: assessment,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to update assessment";

        // Check if it's a not found error
        if (
          errorMessage.includes("not found") ||
          errorMessage.includes("No rows")
        ) {
          return reply.status(404).send({
            success: false,
            error: "Assessment not found",
          });
        }

        return reply.status(500).send({
          success: false,
          error: errorMessage,
        });
      }
    }
  );
  fastify.post(
    "/onsite",
    {
      schema: {
        body: {
          type: "object",
          required: ["name", "questionnaire_id", "objectives", "company_id"],
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            questionnaire_id: { type: "number" },
            company_id: { type: "string" },
            business_unit_id: { type: ["number", "null"], default: null },
            region_id: { type: ["number", "null"], default: null },
            site_id: { type: ["number", "null"], default: null },
            asset_group_id: { type: ["number", "null"], default: null },
            objectives: {
              type: "array",
              items: {
                type: "object",
                required: ["title"],
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                },
              },
            },
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
                  name: { type: "string" },
                  description: { type: "string" },
                  status: { type: "string" },
                  type: { type: "string" },
                  questionnaire_id: { type: "number" },
                  company_id: { type: "string" },
                  business_unit_id: { type: "number" },
                  region_id: { type: "number" },
                  site_id: { type: "number" },
                  asset_group_id: { type: "number" },
                  created_at: { type: "string" },
                  updated_at: { type: "string" },
                },
              },
            },
          },
          500: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const body = request.body as Omit<CreateAssessmentData, "type">;

      const assessmentService = new AssessmentsService(
        request.supabaseClient,
        request.user.id
      );

      try {
        // Create assessment with type "onsite"
        const assessment = await assessmentService.createAssessment({
          ...body,
          type: "onsite",
        });

        return reply.status(200).send({
          success: true,
          data: assessment,
        });
      } catch (error) {
        console.log("error: ", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to create assessment";

        return reply.status(500).send({
          success: false,
          error: errorMessage,
        });
      }
    }
  );

  fastify.delete(
    "/:assessmentId",
    {
      schema: {
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
          500: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { assessmentId } = request.params as { assessmentId: string };

      const assessmentService = new AssessmentsService(
        request.supabaseClient,
        request.user.id
      );

      try {
        await assessmentService.deleteAssessment(Number(assessmentId));

        return reply.status(200).send({
          success: true,
          message: "Assessment deleted successfully",
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to delete assessment";

        // Check if it's a not found error
        if (
          errorMessage.includes("not found") ||
          errorMessage.includes("No rows")
        ) {
          return reply.status(404).send({
            success: false,
            error: "Assessment not found",
          });
        }

        return reply.status(500).send({
          success: false,
          error: errorMessage,
        });
      }
    }
  );
  fastify.post(
    "/:assessmentId/duplicate",
    {
      schema: {
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  name: { type: "string" },
                  description: { type: "string" },
                  status: { type: "string" },
                  type: { type: "string" },
                  questionnaire_id: { type: "number" },
                  company_id: { type: "string" },
                  business_unit_id: { type: "number" },
                  region_id: { type: "number" },
                  site_id: { type: "number" },
                  asset_group_id: { type: "number" },
                  created_at: { type: "string" },
                  updated_at: { type: "string" },
                },
              },
            },
          },
          404: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
          500: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { assessmentId } = request.params as { assessmentId: string };

      const assessmentService = new AssessmentsService(
        request.supabaseClient,
        request.user.id
      );

      try {
        const duplicatedAssessment =
          await assessmentService.duplicateAssessment(Number(assessmentId));

        return reply.status(200).send({
          success: true,
          data: duplicatedAssessment,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to duplicate assessment";

        // Check if it's a not found error
        if (
          errorMessage.includes("not found") ||
          errorMessage.includes("Assessment not found")
        ) {
          return reply.status(404).send({
            success: false,
            error: "Assessment not found",
          });
        }

        return reply.status(500).send({
          success: false,
          error: errorMessage,
        });
      }
    }
  );
}
