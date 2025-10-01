import { FastifyInstance } from "fastify";
import {
  InterviewsService,
  CreateInterviewData,
} from "../../services/InterviewsService.js";

export async function interviewsRoutes(fastify: FastifyInstance) {
  // Note: Auth is handled at server level in index.ts
  // Public routes (/api/interviews/public) are excluded there
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) routeOptions.schema.tags = [];
    routeOptions.schema.tags.push("Interviews");
  });
  fastify.get(
    "",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            company_id: { type: "string" },
          },
        },
        response: {
          // 200: {
          //   type: "object",
          //   properties: {
          //     success: { type: "boolean" },
          //     data: {
          //       type: "array",
          //       items: { type: "object" },
          //     },
          //   },
          // },
          401: {
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
      try {
        const interviewService = new InterviewsService(
          request.supabaseClient,
          request.user.id
        );

        return reply.send({
          success: true,
          data: [],
        });
      } catch (error) {
        fastify.log.error(error);
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
        body: {
          type: "object",
          required: ["assessment_id", "name"],
          properties: {
            assessment_id: { type: "number" },
            interviewer_id: { type: ["string", "null"] },
            name: { type: "string" },
            notes: { type: ["string", "null"] },
            is_public: { type: "boolean", default: false },
            enabled: { type: "boolean", default: true },
            access_code: { type: ["string", "null"] },
            interview_contact_id: { type: ["number", "null"] },
            role_ids: {
              type: "array",
              items: { type: "number" },
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
                  assessment_id: { type: "number" },
                  questionnaire_id: { type: "number" },
                  interviewer_id: { type: "string" },
                  name: { type: "string" },
                  notes: { type: "string" },
                  status: { type: "string" },
                  is_public: { type: "boolean" },
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
      const body = request.body as CreateInterviewData;

      const interviewsService = new InterviewsService(
        request.supabaseClient,
        request.user.id
      );

      try {
        const interview = await interviewsService.createInterview(body);

        return reply.status(200).send({
          success: true,
          data: interview,
        });
      } catch (error) {
        console.log("error: ", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create interview";

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

  fastify.get(
    "/public",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            email: { type: "string" },
            access_code: { type: "string" },
            interview_id: { type: "string" },
          },
          required: ["email", "access_code", "interview_id"],
        },
      },
    },
    async (request, reply) => {
      const { email, access_code, interview_id } = request.query as {
        email: string;
        access_code: string;
        interview_id: string;
      };
      return reply
        .status(200)
        .send({ success: true, data: { email, access_code, interview_id } });
    }
  );

  // Method for fetching interview details by ID
  fastify.get(
    "/:interviewId",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            interviewId: { type: "string" },
          },
          required: ["interviewId"],
        },
      },
    },
    async (request, reply) => {
      const { interviewId } = request.params as { interviewId: number };
      const interviewService = new InterviewsService(
        request.supabaseClient,
        request.user.id
      );

      const interview = await interviewService.getInterviewById(interviewId);

      return reply.status(200).send({ success: true, data: interview });
    }
  );
  // Method for fetching interview progress by ID
  fastify.get(
    "/:interviewId/progress",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            interviewId: { type: "string" },
          },
          required: ["interviewId"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  status: { type: "string" },
                  total_questions: { type: "number" },
                  answered_questions: { type: "number" },
                  progress_percentage: { type: "number" },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { interviewId } = request.params as { interviewId: number };

        const interviewService = new InterviewsService(
          request.supabaseClient,
          request.user.id
        );

        const data = await interviewService.getInterviewProgress(interviewId);

        return reply.status(200).send({ success: true, data });
      } catch (error) {
        console.log("error: ", error);
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );
  // Method for fetching a specific question within an interview
  fastify.get(
    "/:interviewId/questions/:questionId",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            interviewId: { type: "string" },
          },
          required: ["interviewId"],
        },
      },
    },
    async (request) => {
      const { interviewId, questionId } = request.params as {
        interviewId: number;
        questionId: number;
      };

      const interviewService = new InterviewsService(
        request.supabaseClient,
        request.user.id
      );

      const data = await interviewService.getInterviewQuestionById(
        interviewId,
        questionId
      );

      return { success: true, data };
    }
  );
  // Method for updating a specific question within an interview
  fastify.put(
    "/:interviewId/questions/:questionId",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            interviewId: { type: "string" },
          },
          required: ["interviewId"],
        },
        body: {
          type: "object",
          properties: {
            rating_scale_value: { type: "number" },
            comments: { type: "string" },
            applicable_roles: { type: "array", items: { type: "number" } },
          },
        },
      },
    },
    async (request, reply) => {
      const { interviewId, questionId } = request.params as {
        interviewId: number;
        questionId: number;
      };
      return { success: true, data: { interviewId, questionId } };
    }
  );
  // Method for updating interview details
  fastify.put("/:interviewId", async (request, reply) => {
    const { interviewId } = request.params as { interviewId: number };
    return { success: true, data: { interviewId } };
  });
  // Method for deleting a specific question within an interview
  fastify.delete("/:interviewId/questions/:questionId", async (request) => {
    const { interviewId, questionId } = request.params as {
      interviewId: number;
      questionId: number;
    };
    return { success: true, data: { interviewId, questionId } };
  });

  // Method for fetching actions on a specific interview response
  fastify.get("/responses/:responseId/actions", async (request) => {
    const { responseId } = request.params as {
      responseId: number;
    };

    const { supabaseClient } = request;

    const { data, error } = await supabaseClient
      .from("interview_response_actions")
      .select("id, title, description, created_at, updated_at")
      .eq("interview_response_id", responseId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data };
  });
  // Method for recording an action on a specific interview response
  fastify.post(
    "/responses/:responseId/actions",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            title: { type: "string" },
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
                  title: { type: "string" },
                  description: { type: "string" },
                  created_at: { type: "string" },
                  updated_at: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    async (request) => {
      const { responseId } = request.params as {
        responseId: number;
      };

      const { data: response, error: respError } = await request.supabaseClient
        .from("interview_responses")
        .select("*")
        .eq("id", responseId)
        .single();

      if (respError || !response)
        throw new Error("Interview response not found");

      const { title, description } = request.body as {
        title?: string;
        description: string;
      };

      const { data, error } = await request.supabaseClient
        .from("interview_response_actions")
        .insert({
          company_id: response.company_id,
          interview_id: response.interview_id,
          interview_response_id: responseId,
          description: description,
          title: title ?? "",
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    }
  );
  // Method for updating an action on a specific interview response
  fastify.put(
    "/responses/:responseId/actions/:actionId",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
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
                  description: { type: "string" },
                  created_at: { type: "string" },
                  updated_at: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    async (request) => {
      const { responseId, actionId } = request.params as {
        responseId: number;
        actionId: number;
      };

      const { title, description } = request.body as {
        title?: string;
        description?: string;
      };

      const { data, error } = await request.supabaseClient
        .from("interview_response_actions")
        .update({
          title,
          description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", actionId)
        .eq("interview_response_id", responseId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    }
  );
  // Method for soft deleting an action on an interview response
  fastify.delete(
    "/responses/:responseId/actions/:actionId",
    async (request) => {
      const { responseId, actionId } = request.params as {
        responseId: number;
        actionId: number;
      };

      const { error } = await request.supabaseClient
        .from("interview_response_actions")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", actionId)
        .eq("interview_response_id", responseId)
        .select();

      if (error) throw error;

      return { success: true };
    }
  );

  fastify.post("/public", async (request, reply) => {
    return reply
      .status(200)
      .send({ success: false, error: "Public interview creation endpoint" });
  });

  // Method for fetching interview response comments
  fastify.get("/responses/:responseId/comments", async (request) => {
    const { responseId } = request.params as {
      responseId: number;
    };

    const { supabaseClient } = request;

    const { data, error } = await supabaseClient
      .from("interview_responses")
      .select("id, comments, created_at, updated_at")
      .eq("id", responseId)
      .order("created_at", { ascending: false })
      .single();

    if (error) throw error;

    return { success: true, data: data?.comments || "" };
  });
  // Method for updating interview response comments
  fastify.put(
    "/responses/:responseId/comments",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            comments: { type: "string" },
          },
          required: ["comments"],
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
                  comments: { type: "string" },
                  created_at: { type: "string" },
                  updated_at: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    async (request) => {
      const { responseId } = request.params as {
        responseId: number;
      };

      const { comments } = request.body as {
        comments: string;
      };

      // Update existing comment
      const { data, error } = await request.supabaseClient
        .from("interview_responses")
        .update({
          comments,
          updated_at: new Date().toISOString(),
        })
        .eq("id", responseId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    }
  );
}
