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
  fastify.get("/:assessmentId/actions", async (request, reply) => {
    const { assessmentId } = request.params as { assessmentId: number };
    const assessmentService = new AssessmentsService(
      request.supabaseClient,
      request.user.id
    );

    const actions =
      await assessmentService.getActionsByAssessmentId(assessmentId);

    if (!actions) {
      return reply.status(404).send({
        success: false,
        error: "Assessment actions not found",
      });
    }

    return {
      success: true,
      data: actions,
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
    "/",
    {
      schema: {
        body: {
          type: "object",
          required: ["name", "type", "company_id"],
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            type: { type: "string", enum: ["onsite", "desktop"] },
            questionnaire_id: { type: ["number", "null"], default: null },
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
          400: {
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
      const body = request.body as CreateAssessmentData;

      // Validate onsite-specific requirements
      if (body.type === "onsite" && !body.questionnaire_id) {
        return reply.status(400).send({
          success: false,
          error: "questionnaire_id is required for onsite assessments",
        });
      }

      const assessmentService = new AssessmentsService(
        request.supabaseClient,
        request.user.id
      );

      try {
        const assessment = await assessmentService.createAssessment(body);

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
  // Method for getting measurements associated with an assessment
  fastify.get("/:assessmentId/measurements", async (request, reply) => {
    const { assessmentId } = request.params as { assessmentId: number };
    // const assessmentService = new AssessmentsService(
    //   request.supabaseClient,
    //   request.user.id
    // );

    // Check assessment is 'desktop' type
    const { data: assessment, error: assessmentError } =
      await request.supabaseClient
        .from("assessments")
        .select("id, type")
        .eq("id", assessmentId)
        .single();

    if (assessmentError || !assessment) {
      return reply.status(404).send({
        success: false,
        error: "Assessment not found",
      });
    }

    if (assessment.type !== "desktop") {
      return reply.status(400).send({
        success: false,
        error: "Measurements are only available for desktop assessments",
      });
    }

    // Fetch measurements associated with the assessment
    const { data: measurements, error: measurementsError } =
      await request.supabaseClient
        .from("calculated_measurements")
        .select(
          `
          *,
          business_unit:business_unit_id(name),
          region:region_id(name),
          site:site_id(name),
          asset_group:asset_group_id(name),
          work_group:work_group_id(name),
          role:role_id(shared_role_id(name))
          `
        )
        .eq("assessment_id", assessmentId);

    if (measurementsError) {
      console.log("measurementsError: ", measurementsError);
      return reply.status(500).send({
        success: false,
        error: "Failed to fetch measurements",
      });
    }

    // Hoist up shared_role_id.name to role.name for easier access
    const hoistedMeasurements = measurements?.map((m) => {
      if (m.role && m.role.shared_role_id) {
        return {
          ...m,
          role: {
            name: m.role.shared_role_id.name,
          },
        };
      }
      return m;
    });

    return { success: true, data: hoistedMeasurements };
  });
  // Method for manually adding a measurement to an assessment
  fastify.post(
    "/:assessmentId/measurements",
    {
      schema: {
        body: {
          type: "object",
          required: ["measurement_definition_id", "calculated_value"],
          properties: {
            measurement_definition_id: { type: "number" },
            calculated_value: { type: "number" },
            location: {
              type: "object",
              properties: {
                business_unit_id: { type: "number" },
                region_id: { type: "number" },
                site_id: { type: "number" },
                asset_group_id: { type: "number" },
                work_group_id: { type: "number" },
                role_id: { type: "number" },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { assessmentId } = request.params as { assessmentId: number };
      const { measurement_definition_id, calculated_value, location } =
        request.body as {
          measurement_definition_id: number;
          calculated_value: number;
          location: {
            business_unit_id?: number;
            region_id?: number;
            site_id?: number;
            asset_group_id?: number;
            work_group_id?: number;
            role_id?: number;
          };
        };

      if (!measurement_definition_id) {
        return reply.status(400).send({
          success: false,
          error: "measurement_definition_id is required",
        });
      }

      if (!calculated_value) {
        return reply.status(400).send({
          success: false,
          error: "calculated_value is required",
        });
      }

      // Check assessment is 'desktop' type
      const { data: assessment, error: assessmentError } =
        await request.supabaseClient
          .from("assessments")
          .select(
            "id, type, company_id, business_unit_id, region_id, site_id, asset_group_id"
          )
          .eq("id", assessmentId)
          .single();

      if (assessmentError || !assessment) {
        return reply.status(404).send({
          success: false,
          error: "Assessment not found",
        });
      }

      if (assessment.type !== "desktop") {
        return reply.status(400).send({
          success: false,
          error: "Measurements can only be added to desktop assessments",
        });
      }

      // Check measurement definition exists
      const { data: measurementDef, error: measurementDefError } =
        await request.supabaseClient
          .from("measurement_definitions")
          .select("*")
          .eq("id", measurement_definition_id)
          .single();

      if (measurementDefError || !measurementDef) {
        return reply.status(404).send({
          success: false,
          error: "Measurement definition not found",
        });
      }

      // Check measurement isn't already associated with the assessment

      let existenceCheckQuery = request.supabaseClient
        .from("calculated_measurements")
        .select("*")
        .eq("assessment_id", assessmentId)
        .eq("measurement_definition_id", measurement_definition_id);

      if (location) {
        if (location.business_unit_id) {
          existenceCheckQuery = existenceCheckQuery.eq(
            "business_unit_id",
            location.business_unit_id
          );
          if (location.region_id) {
            existenceCheckQuery = existenceCheckQuery.eq(
              "region_id",
              location.region_id
            );
            if (location.site_id) {
              existenceCheckQuery = existenceCheckQuery.eq(
                "site_id",
                location.site_id
              );
              if (location.asset_group_id) {
                existenceCheckQuery = existenceCheckQuery.eq(
                  "asset_group_id",
                  location.asset_group_id
                );
                if (location.work_group_id) {
                  existenceCheckQuery = existenceCheckQuery.eq(
                    "work_group_id",
                    location.work_group_id
                  );
                  if (location.role_id) {
                    existenceCheckQuery = existenceCheckQuery.eq(
                      "role_id",
                      location.role_id
                    );
                  }
                }
              }
            }
          }
        }
      }

      const { data: existingMeasurement, error: existingMeasurementError } =
        await existenceCheckQuery.single();

      if (existingMeasurement && !existingMeasurementError) {
        return reply.status(400).send({
          success: false,
          error:
            "Measurement already associated with this location on the assessment",
        });
      }

      // Add measurement to assessment
      const { data: newMeasurement, error: newMeasurementError } =
        await request.supabaseClient
          .from("calculated_measurements")
          .insert({
            company_id: assessment.company_id,
            assessment_id: assessmentId,
            measurement_id: measurement_definition_id,
            calculated_value: calculated_value,
            ...location,
            // business_unit_id: assessment.business_unit_id,
            // region_id: assessment.region_id,
            // site_id: assessment.site_id,
            // asset_group_id: assessment.asset_group_id,
          })
          .select()
          .single();

      if (newMeasurementError || !newMeasurement) {
        console.log("newMeasurementError: ", newMeasurementError);
        return reply.status(500).send({
          success: false,
          error: "Failed to add measurement to assessment",
        });
      }

      return { success: true, data: newMeasurement };
    }
  );
  // Method for updating a measurement associated with an assessment
  fastify.put(
    "/:assessmentId/measurements/:measurementId",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            calculated_value: { type: "number" },
          },
        },
      },
    },
    async (request, reply) => {
      const { measurementId } = request.params as {
        measurementId: number;
      };
      const updates = request.body as {
        calculated_value?: number;
      };
      if (!updates.calculated_value) {
        return reply.status(400).send({
          success: false,
          error: "No updates provided",
        });
      }

      // Update the measurement
      const { data: updatedMeasurement, error: updateError } =
        await request.supabaseClient
          .from("calculated_measurements")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", measurementId)
          .select()
          .single();

      if (updateError || !updatedMeasurement) {
        console.log("updateError: ", updateError);
        return reply.status(500).send({
          success: false,
          error: "Failed to update measurement",
        });
      }

      return { success: true, data: updatedMeasurement };
    }
  );
  // Method for removing a measurement from an assessment
  fastify.delete(
    "/:assessmentId/measurements/:measurementId",
    async (request, reply) => {
      const { measurementId } = request.params as {
        measurementId: number;
      };

      // Delete the measurement
      const { error: deleteError } = await request.supabaseClient
        .from("calculated_measurements")
        .delete()
        .eq("id", measurementId);

      if (deleteError) {
        console.log("deleteError: ", deleteError);
        return reply.status(500).send({
          success: false,
          error: "Failed to delete measurement",
        });
      }

      return {
        success: true,
        message: "Measurement deleted successfully",
      };
    }
  );
}
