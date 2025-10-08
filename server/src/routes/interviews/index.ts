import { FastifyInstance } from "fastify";
import {
  InterviewsService,
  CreateInterviewData,
} from "../../services/InterviewsService.js";
import { EvidenceService } from "../../services/EvidenceService.js";
import { EmailService } from "../../services/EmailService.js";
import { createCustomSupabaseJWT } from "../../lib/jwt.js";

// Transform question data to include rating scales
function transformQuestionData(questionData: any): QuestionnaireQuestion {
  return {
    ...questionData,
    rating_scales:
      questionData.questionnaire_question_rating_scales
        ?.map((qrs: any) => ({
          id: qrs.id,
          description: qrs.description,
          ...qrs.questionnaire_rating_scale,
        }))
        ?.sort((a: any, b: any) => a.order_index - b.order_index) || [],
  };
}

function calculateInterviewProgress(
  interview: InterviewWithResponses
): InterviewProgress {
  // This would need access to the questionnaire structure to calculate total questions
  // For now, we'll use the responses to estimate progress
  const answeredQuestions = interview.responses.length;

  // You might want to fetch the total questions from the questionnaire
  // For now, we'll estimate based on typical questionnaires
  const estimatedTotalQuestions = Math.max(answeredQuestions, 20); // Minimum estimate

  const completionPercentage =
    estimatedTotalQuestions > 0
      ? Math.min((answeredQuestions / estimatedTotalQuestions) * 100, 100)
      : 0;

  return {
    interview_id: interview.id,
    total_questions: estimatedTotalQuestions,
    answered_questions: answeredQuestions,
    completion_percentage: Math.round(completionPercentage),
    current_step: undefined, // Would need questionnaire structure to determine
    current_section: undefined, // Would need questionnaire structure to determine
    next_question_id: undefined, // Would need questionnaire structure to determine
  };
}

// Helper method to calculate min/max rating values from questionnaire rating scales
function calculateRatingValueRange(
  questionnaire:
    | { questionnaire_rating_scales?: Array<{ value: number }> }
    | null
    | undefined
): { min: number; max: number } {
  const defaultRange = { min: 0, max: 5 };

  if (
    !questionnaire?.questionnaire_rating_scales ||
    questionnaire.questionnaire_rating_scales.length === 0
  ) {
    return defaultRange;
  }

  const values = questionnaire.questionnaire_rating_scales.map(
    (scale) => scale.value
  );
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

// Calculation methods
function calculateCompletionRate(responses: any[]): number {
  if (!responses || responses.length === 0) {
    return 0;
  }

  // Only consider applicable responses
  const applicableResponses = responses.filter(
    (response) => response.is_applicable !== false
  );

  if (applicableResponses.length === 0) {
    return 0;
  }

  const completedResponses = applicableResponses.filter(
    (response) =>
      response.rating_score !== null && response.rating_score !== undefined
  );

  return completedResponses.length / applicableResponses.length;
}

function calculateAverageScore(responses: any[]): number {
  if (!responses || responses.length === 0) {
    return 0;
  }

  // Only consider applicable responses with scores
  const scoredResponses = responses.filter(
    (response) =>
      response.is_applicable !== false &&
      response.rating_score !== null &&
      response.rating_score !== undefined
  );

  if (scoredResponses.length === 0) {
    return 0;
  }

  const totalScore = scoredResponses.reduce(
    (sum, response) => sum + response.rating_score,
    0
  );

  return totalScore / scoredResponses.length;
}

export async function interviewsRoutes(fastify: FastifyInstance) {
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
            assessment_id: { type: "number" },
            status: { type: "array", items: { type: "string" } },
            program_id: { type: "string" },
          },
          required: ["company_id"],
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
      const { company_id, assessment_id, status, program_id } =
        request.query as {
          company_id: string;
          assessment_id: number;
          status: string[];
          program_id: string;
        };

      try {
        console.log(
          "fetching interviews with: ",
          company_id,
          assessment_id,
          status,
          program_id
        );

        let query = request.supabaseClient
          .from("interviews")
          .select(
            `
          *,
          assessment:assessments!inner(
            id, 
            name, 
            company_id,
            questionnaire:questionnaires(
              id,
              questionnaire_rating_scales(
                id,
                value,
                order_index
              )
            )
          ),
          interviewer:profiles(id, full_name, email),
          interview_contact:contacts(
            id,
            full_name,
            email,
            title,
            phone
          ),
          assigned_role:roles(id, shared_role:shared_roles(id, name)),
          interview_roles(
            role:roles(
              id,
              shared_role:shared_roles(id, name),
              work_group:work_groups(
                id,
                name
              )
            )
          ),
          interview_responses(
            *,
            question:questionnaire_questions(
              id,
              title,
              question_text,
              context,
              order_index,
              questionnaire_question_rating_scales(
                id,
                description,
                questionnaire_rating_scale:questionnaire_rating_scales(
                  id,
                  name,
                  description,
                  order_index,
                  value
                )
              )
            ),
            interview_response_roles(
              role:roles(*)
            )
          )
        `
          )
          .eq("is_deleted", false)
          .eq("assessment.company_id", company_id);

        // Apply filters
        if (assessment_id) {
          query = query.eq("assessment_id", assessment_id);
        }
        if (program_id) {
          query = query.eq("program_id", program_id);
        }
        if (status && status.length > 0) {
          query = query.in("status", status);
        }

        const { data: interviews, error } = await query.order("created_at", {
          ascending: false,
        });

        if (error) throw error;

        // Transform interviews data
        const data =
          interviews?.map((interview: any) => {
            const ratingRange = calculateRatingValueRange(
              interview.assessment?.questionnaire
            );

            return {
              ...interview,
              assessment: {
                id: interview.assessment?.id,
                name: interview.assessment?.name,
                type: interview.assessment?.type,
                company_id: interview.assessment?.company_id,
              },
              completion_rate: calculateCompletionRate(
                interview.interview_responses || []
              ),
              average_score: calculateAverageScore(
                interview.interview_responses || []
              ),
              min_rating_value: ratingRange.min,
              max_rating_value: ratingRange.max,
              interviewee: {
                id: interview?.interview_contact?.id,
                full_name: interview?.interview_contact?.full_name,
                email: interview?.interview_contact?.email,
                title: interview?.interview_contact?.title,
                phone: interview?.interview_contact?.phone,
                role:
                  interview.interview_roles &&
                  interview.interview_roles.length > 0
                    ? interview.interview_roles
                        .map((ir: any) => ir.role?.shared_role?.name)
                        .filter(Boolean)
                        .join(", ")
                    : interview.assigned_role?.shared_role?.name,
              },
              interviewer: {
                id: interview.interviewer?.id || interview.interviewer_id,
                name:
                  interview.interviewer?.full_name ||
                  interview.interviewer?.email,
              },
              responses:
                interview.interview_responses?.map((response) => ({
                  ...response,
                  question: transformQuestionData(response.question),
                  response_roles:
                    response.interview_response_roles?.map((rr) => rr.role) ||
                    [],
                  actions: response.interview_response_actions || [],
                })) || [],
            };
          }) || [];

        if (error) throw error;

        return reply.send({
          success: true,
          data: data,
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
          // 200: {
          //   type: "object",
          //   properties: {
          //     success: { type: "boolean" },
          //     data: {
          //       type: "object",
          //       properties: {
          //         id: { type: "number" },
          //         assessment_id: { type: "number" },
          //         questionnaire_id: { type: "number" },
          //         interviewer_id: { type: "string" },
          //         name: { type: "string" },
          //         notes: { type: "string" },
          //         status: { type: "string" },
          //         is_public: { type: "boolean" },
          //         created_at: { type: "string" },
          //         updated_at: { type: "string" },
          //       },
          //     },
          //   },
          // },
          // 404: {
          //   type: "object",
          //   properties: {
          //     success: { type: "boolean" },
          //     error: { type: "string" },
          //   },
          // },
          // 500: {
          //   type: "object",
          //   properties: {
          //     success: { type: "boolean" },
          //     error: { type: "string" },
          //   },
          // },
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

  // Method for creating one or more public interviews that are scoped to individual
  // contacts via email and access code.
  fastify.post(
    "/public",
    {
      schema: {
        body: {
          type: "object",
          required: ["assessment_id", "name", "interview_contact_ids"],
          properties: {
            assessment_id: { type: "number" },
            interview_contact_ids: { type: "array", items: { type: "number" } },
            name: { type: "string" },
          },
        },
        response: {
          // 200: {
          //   type: "object",
          //   properties: {
          //     success: { type: "boolean" },
          //     data: {
          //       type: "array",
          //       items: {
          //         type: "object",
          //         properties: {
          //           id: { type: "number" },
          //           assessment_id: { type: "number" },
          //           questionnaire_id: { type: "number" },
          //           interviewer_id: { type: ["string", "null"] },
          //           name: { type: "string" },
          //           is_public: { type: "boolean" },
          //           access_code: { type: ["string", "null"] },
          //           interview_contact_id: { type: ["number", "null"] },
          //           created_at: { type: "string" },
          //           updated_at: { type: "string" },
          //         },
          //       },
          //     },
          //   },
          // },
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
      try {
        const { assessment_id, interview_contact_ids, name } = request.body as {
          assessment_id: number;
          interview_contact_ids: number[];
          name: string;
        };

        const interviewsService = new InterviewsService(
          request.supabaseClient,
          request.user.id,
          fastify.supabaseAdmin
        );

        const interviews = await interviewsService.createPublicInterviews({
          assessment_id,
          interview_contact_ids,
          name,
        });

        // Fetch assessment and sender details for emails
        const { data: assessment } = await request.supabaseClient
          .from("assessments")
          .select("name, company:companies(name)")
          .eq("id", assessment_id)
          .single();

        const { data: senderProfile } = await request.supabaseClient
          .from("profiles")
          .select("full_name, email")
          .eq("id", request.user.id)
          .single();

        // Initialize email service
        const emailService = new EmailService(
          fastify.config.RESEND_API_KEY,
          fastify.config.SITE_URL
        );

        // Send invitation emails to each contact
        const emailResults = await Promise.allSettled(
          interviews.map(async (interview) => {
            // In development mode, override email with test address
            const recipientEmail =
              fastify.config.NODE_ENV === "development" &&
              fastify.config.DEV_TEST_EMAIL
                ? fastify.config.DEV_TEST_EMAIL
                : interview.contact.email;

            return emailService.sendInterviewInvitation({
              interviewee_email: recipientEmail,
              interviewee_name: interview.contact.full_name,
              interview_name: interview.name,
              assessment_name: assessment?.name || "Assessment",
              access_code: interview.access_code || "",
              interview_id: interview.id,
              sender_email: senderProfile?.email || request.user.email || "",
              sender_name: senderProfile?.full_name,
              company_name: (assessment?.company as any)?.name,
            });
          })
        );

        // Log any email failures (but don't fail the request)
        const failedEmails = emailResults.filter(
          (result) => result.status === "rejected"
        );
        if (failedEmails.length > 0) {
          fastify.log.warn(
            `Failed to send ${failedEmails.length} invitation emails`,
            failedEmails
          );
        }

        return reply.status(200).send({
          success: true,
          data: interviews,
          emailsSent: emailResults.filter((r) => r.status === "fulfilled")
            .length,
          emailsFailed: failedEmails.length,
        });
      } catch (error) {
        console.error("Error creating public interviews:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to create public interviews";

        // Check if it's a validation error (no roles found)
        if (errorMessage.includes("No roles found")) {
          return reply.status(400).send({
            success: false,
            error: errorMessage,
          });
        }

        return reply.status(500).send({
          success: false,
          error: errorMessage,
        });
      }
    }
  );

  // Method for generating a short-lived JWT for interview access
  // This is used by public interviews to get a token for accessing the interview
  // (after validating email + access code)
  // Pre-authentication validation...
  fastify.post(
    "/auth",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            interviewId: { type: "number" },
            email: { type: "string" },
            accessCode: { type: "string" },
          },
          required: ["interviewId", "email", "accessCode"],
        },
      },
    },
    async (request, reply) => {
      const { interviewId, email, accessCode } = request.body as {
        interviewId: number;
        email: string;
        accessCode: string;
      };

      console.log(
        "Auth request for interviewId=",
        interviewId,
        "email=",
        email,
        "accessCode=",
        accessCode
      );

      try {
        // Validate interview exists, is public, enabled, and credentials match
        const { data: interview, error: interviewError } =
          await fastify.supabaseAdmin
            .from("interviews")
            .select(
              `
              id,
              is_public,
              enabled,
              access_code,
              interview_contact_id,
              interviewee_id,
              company_id,
              questionnaire_id,
              interview_contact:contacts(id, email)
            `
            )
            .eq("id", interviewId)
            .eq("is_deleted", false)
            .maybeSingle();

        if (interviewError) {
          console.log("Error fetching interview for auth");
          return reply.status(500).send({
            success: false,
            error: "Failed to validate interview access",
          });
        }

        if (!interview) {
          console.log("Interview not found");
          return reply.status(404).send({
            success: false,
            error: "Interview not found",
          });
        }

        if (
          !interview.interview_contact_id ||
          !interview.company_id ||
          !interview.questionnaire_id ||
          !interview.interviewee_id
        ) {
          console.log("Interview is not properly configured for public access");
          return reply.status(500).send({
            success: false,
            error: "Interview is not properly configured for public access",
          });
        }

        // Validate interview is public
        if (!interview.is_public) {
          console.log("This interview is not public");
          return reply.status(403).send({
            success: false,
            error: "This interview is not publicly accessible",
          });
        }

        // Validate interview is enabled
        if (!interview.enabled) {
          console.log("This interview is not enabled");
          return reply.status(403).send({
            success: false,
            error: "This interview has been disabled",
          });
        }

        // Validate access code
        if (interview.access_code!.trim() !== accessCode) {
          console.log("Invalid access code provided");
          console.log('Expected "', interview.access_code);
          return reply.status(401).send({
            success: false,
            error: "Invalid access code",
          });
        }

        // Validate email matches interview contact
        const interviewContact = interview.interview_contact as {
          id: number;
          email: string;
        } | null;
        if (!interviewContact || interviewContact.email!.trim() !== email) {
          return reply.status(403).send({
            success: false,
            error: "Email does not match interview contact",
          });
        }

        // All validation passed - generate JWT
        const token = createCustomSupabaseJWT(
          interview.interviewee_id,
          {
            interviewId,
            email,
            contactId: interview.interview_contact_id,
            companyId: interview.company_id,
            questionnaireId: interview.questionnaire_id,
            anonymousRole: "public_interviewee",
          },
          fastify.config.SUPABASE_JWT_SIGNING_KEY
        );

        fastify.log.info(
          `Generated public interview token for interviewId=${interviewId}, email=${email}`
        );

        return {
          success: true,
          data: { token },
        };
      } catch (error) {
        fastify.log.error(error, "Error in /auth endpoint");
        return reply.status(500).send({
          success: false,
          error: "Internal server error during authentication",
        });
      }
    }
  );

  // Method for fetching interview structure (questionnaire hierarchy)
  // Note: This endpoint supports both authenticated and public access via flexibleAuthMiddleware
  fastify.get(
    "/:interviewId/structure",
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
                  interview: {
                    type: "object",
                    properties: {
                      id: { type: "number" },
                      name: { type: "string" },
                      questionnaire_id: { type: "number" },
                      assessment_id: { type: "number" },
                      is_public: { type: "boolean" },
                    },
                  },
                  sections: { type: "array" },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { interviewId } = request.params as { interviewId: number };
      const interviewService = new InterviewsService(
        request.supabaseClient,
        request.user.id
      );

      console.log("Getting interview structure: interviewId=", interviewId);

      const structure =
        await interviewService.getInterviewStructure(interviewId);

      if (!structure) {
        return reply.status(404).send({
          success: false,
          error: "Interview not found",
        });
      }

      return reply.status(200).send({ success: true, data: structure });
    }
  );

  // Method for fetching interview summary (lightweight - for layout/settings)
  fastify.get(
    "/:interviewId/summary",
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
          // 200: {
          //   type: "object",
          //   properties: {
          //     success: { type: "boolean" },
          //     data: { type: "object" },
          //   },
          // },
        },
      },
    },
    async (request, reply) => {
      const { interviewId } = request.params as { interviewId: number };
      const interviewService = new InterviewsService(
        request.supabaseClient,
        request.user.id
      );

      const summary = await interviewService.getInterviewSummary(interviewId);

      if (!summary) {
        return reply.status(404).send({
          success: false,
          error: "Interview not found",
        });
      }

      return reply.status(200).send({ success: true, data: summary });
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
                required: [
                  "status",
                  "total_questions",
                  "answered_questions",
                  "progress_percentage",
                  "responses",
                ],
                properties: {
                  status: { type: "string" },
                  previous_status: { type: "string" },
                  total_questions: { type: "number" },
                  answered_questions: { type: "number" },
                  progress_percentage: { type: "number" },
                  responses: {
                    type: "object",
                    additionalProperties: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        rating_score: { type: ["number", "null"] },
                        is_applicable: { type: "boolean" },
                        has_rating_score: { type: "boolean" },
                        has_roles: { type: "boolean" },
                      },
                    },
                  },
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
            questionId: { type: "string" },
          },
          required: ["interviewId", "questionId"],
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
  // fastify.put(
  //   "/:interviewId/questions/:questionId",
  //   {
  //     schema: {
  //       params: {
  //         type: "object",
  //         properties: {
  //           interviewId: { type: "string" },
  //         },
  //         required: ["interviewId"],
  //       },
  //       body: {
  //         type: "object",
  //         properties: {
  //           rating_scale_value: { type: "number" },
  //           comments: { type: "string" },
  //           applicable_roles: { type: "array", items: { type: "number" } },
  //         },
  //       },
  //     },
  //   },
  //   async (request, reply) => {
  //     const { interviewId, questionId } = request.params as {
  //       interviewId: number;
  //       questionId: number;
  //     };
  //     return { success: true, data: { interviewId, questionId } };
  //   }
  // );
  // Method for updating interview details
  fastify.put(
    "/:interviewId",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            status: { type: "string" },
            notes: { type: "string" },
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
        },
      },
    },
    async (request, reply) => {
      try {
        const { interviewId } = request.params as { interviewId: number };
        const updates = request.body as {
          name?: string;
          status?: string;
          notes?: string;
        };

        const interviewsService = new InterviewsService(
          request.supabaseClient,
          request.user.id
        );

        // Update using service method
        const { data, error } = await request.supabaseClient
          .from("interviews")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", interviewId)
          .select()
          .single();

        if (error) throw error;

        return reply.status(200).send({
          success: true,
          data,
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to update interview",
        });
      }
    }
  );

  // Method for deleting an interview (soft delete)
  fastify.delete(
    "/:interviewId",
    {
      schema: {
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { interviewId } = request.params as { interviewId: number };

        const { error } = await request.supabaseClient
          .from("interviews")
          .update({
            is_deleted: true,
            deleted_at: new Date().toISOString(),
          })
          .eq("id", interviewId);

        if (error) throw error;

        return reply.status(200).send({ success: true });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to delete interview",
        });
      }
    }
  );

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

    const { data, error } = await request.supabaseClient
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

  // Method for updating interview response (rating and/or roles)
  fastify.put(
    "/responses/:responseId",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            rating_score: { type: ["number", "null"] },
            role_ids: {
              type: ["array", "null"],
              items: { type: "number" },
            },
          },
        },
        response: {
          // 200: {
          //   type: "object",
          //   properties: {
          //     success: { type: "boolean" },
          //     data: {
          //       type: "object",
          //       properties: {
          //         id: { type: "number" },
          //         rating_score: { type: ["number", "null"] },
          //         response_roles: {
          //           type: "array",
          //           items: {
          //             type: "object",
          //             properties: {
          //               id: { type: "number" },
          //               role: {
          //                 type: "object",
          //                 properties: {
          //                   id: { type: "number" },
          //                   name: { type: "string" },
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
      const { responseId } = request.params as {
        responseId: number;
      };

      const { rating_score, role_ids } = request.body as {
        rating_score?: number | null;
        role_ids?: number[] | null;
      };
      const interviewsService = new InterviewsService(
        request.supabaseClient,
        request.user.id
      );

      try {
        const updatedResponse = await interviewsService.updateInterviewResponse(
          responseId,
          rating_score,
          role_ids
        );

        return reply.status(200).send({
          success: true,
          data: updatedResponse,
        });
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

  // Method for fetching interview response comments
  fastify.get("/responses/:responseId/comments", async (request) => {
    const { responseId } = request.params as {
      responseId: number;
    };
    const { data, error } = await request.supabaseClient
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

  // ====== Interview Response Evidence ======

  // Method for fetching evidence files for a response
  fastify.get("/responses/:responseId/evidence", async (request) => {
    const { responseId } = request.params as {
      responseId: number;
    };
    const evidenceService = new EvidenceService(
      request.supabaseClient,
      request.user.id
    );

    const data = await evidenceService.getEvidenceForResponse(responseId);

    return { success: true, data };
  });

  // Method for uploading evidence for a response
  fastify.post(
    "/responses/:responseId/evidence",
    {
      schema: {
        consumes: ["multipart/form-data"],
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  evidence: { type: "object" },
                  publicUrl: { type: "string" },
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
        },
      },
    },
    async (request, reply) => {
      try {
        const { responseId } = request.params as {
          responseId: number;
        };

        // Get the uploaded file
        const file = await request.file();

        if (!file) {
          return reply.status(400).send({
            success: false,
            error: "No file provided",
          });
        }
        const evidenceService = new EvidenceService(
          request.supabaseClient,
          request.user.id
        );

        const data = await evidenceService.uploadEvidence(responseId, file);

        return reply.status(200).send({
          success: true,
          data,
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(400).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to upload file",
        });
      }
    }
  );

  // Method for deleting evidence
  fastify.delete(
    "/responses/:responseId/evidence/:evidenceId",
    async (request) => {
      const { evidenceId } = request.params as {
        evidenceId: number;
      };
      const evidenceService = new EvidenceService(
        request.supabaseClient,
        request.user.id
      );

      await evidenceService.deleteEvidence(evidenceId);

      return { success: true };
    }
  );

  // Method for fetching available roles associated with an assessment that can be used for
  // scoping an interview.
  fastify.get("/assessment-roles/:assessmentId", async (request) => {
    const { assessmentId } = request.params as {
      assessmentId: number;
    };

    const interviewsService = new InterviewsService(
      request.supabaseClient,
      request.user.id
    );

    const roles =
      await interviewsService.getRolesAssociatedWithAssessment(assessmentId);

    return { success: true, data: roles };
  });

  // Method for checking whether an assessments associated interview questionnaire has at least
  // one applicabel question for a set of scoped roles
  fastify.post("/assessment-roles/validate", async (request, reply) => {
    const { assessmentId, roleIds } = request.body as {
      assessmentId: number;
      roleIds: number[];
    };

    if (!assessmentId || !roleIds || roleIds.length === 0) {
      return reply.status(400).send({
        success: false,
        error: "assessmentId and roleIds are required",
      });
    }

    const interviewsService = new InterviewsService(
      request.supabaseClient,
      request.user.id
    );

    const isValid =
      await interviewsService.validateAssessmentRolesForQuestionnaire(
        assessmentId,
        roleIds
      );

    return { success: true, data: { isValid } };
  });
}
