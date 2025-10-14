import { FastifyInstance } from "fastify";
import { EmailService } from "../../services/EmailService";
import type {
  InviteTeamMemberData,
  TestEmailData,
  InterviewReminderData,
} from "../../services/EmailService";

export async function emailsRoutes(fastify: FastifyInstance) {
  // Initialise EmailService
  const emailService = new EmailService(
    fastify.config.RESEND_API_KEY,
    fastify.config.SITE_URL
  );

  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) {
      routeOptions.schema.tags = ["Emails"];
    }
  });

  // Send interview invitation email
  fastify.post(
    "/send-interview-invitation",
    {
      schema: {
        description: "Send an interview invitation email",
        querystring: {
          type: "object",
          required: ["interviewId"],
          properties: {
            interviewId: { type: "number" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              messageId: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
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
        const { interviewId } = request.query as { interviewId: number };

        const result = await emailService.sendInterviewInvitation(
          request.supabaseClient,
          request.user.id,
          interviewId
        );

        return reply.status(result.success ? 200 : 400).send(result);
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

  // Send interview reminder email
  fastify.post(
    "/send-interview-reminder",
    {
      schema: {
        description: "Send an interview reminder email",
        querystring: {
          type: "object",
          required: ["interviewId"],
          properties: {
            interviewId: { type: "number" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              messageId: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
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
        const { interviewId } = request.query as { interviewId: number };

        // Fetch interview details (same as invitation endpoint)
        const { data: interview, error: interviewError } =
          await request.supabaseClient
            .from("interviews")
            .select(`*, assessments(name), companies(name)`)
            .eq("id", interviewId)
            .single();

        if (interviewError || !interview) {
          fastify.log.error(interviewError || "Failed to fetch interview");
          return reply.status(400).send({
            success: false,
            message: "Failed to fetch interview details",
          });
        }

        // Validate interview has required contact ID
        if (!interview.interview_contact_id) {
          return reply.status(400).send({
            success: false,
            message: "Interview has no assigned contact",
          });
        }

        // Get contact assigned to the interview
        const { data: contact, error: contactError } =
          await request.supabaseClient
            .from("contacts")
            .select()
            .eq("id", interview.interview_contact_id)
            .single();

        if (contactError || !contact) {
          fastify.log.error(contactError || "Failed to fetch contact");
          return reply.status(400).send({
            success: false,
            message: "Failed to fetch interviewee contact details",
          });
        }

        // Fetch sender information
        const { data: profile, error: profileError } =
          await request.supabaseClient
            .from("profiles")
            .select()
            .eq("id", request.user.id)
            .single();

        if (profileError || !profile) {
          fastify.log.error(profileError || "Failed to fetch sender profile");
          return reply.status(400).send({
            success: false,
            message: "Failed to fetch sender profile",
          });
        }

        // Validate interview has required assessment and company data
        if (!interview.assessments || !interview.companies) {
          return reply.status(400).send({
            success: false,
            message: "Interview missing required assessment or company data",
          });
        }

        // Build reminder data
        const reminderData: InterviewReminderData = {
          interviewee_email: contact.email,
          interviewee_name: contact.full_name || contact.email.split("@")[0],
          interview_name: interview.name,
          assessment_name: interview.assessments.name,
          access_code: interview.access_code || "",
          interview_id: interview.id,
          sender_email: profile.email,
          sender_name: profile.full_name || profile.email.split("@")[0],
          company_name: interview.companies.name,
          // Optional: Add due_date logic here if needed
        };

        const result = await emailService.sendInterviewReminder(reminderData);

        return reply.status(result.success ? 200 : 400).send(result);
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

  // Send team member invite email
  fastify.post(
    "/send-team-member-invite",
    {
      schema: {
        description: "Send a team member invitation email",
        body: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email" },
            name: { type: "string" },
            role: { type: "string" },
            company_name: { type: "string" },
            invite_link: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              messageId: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
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
        const data = request.body as InviteTeamMemberData;

        const result = await emailService.sendTeamMemberInvite(data);

        return reply.status(result.success ? 200 : 400).send(result);
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

  // Send test email
  fastify.post(
    "/send-test-email",
    {
      schema: {
        description: "Send a test email to verify email service configuration",
        body: {
          type: "object",
          required: ["to"],
          properties: {
            to: { type: "string", format: "email" },
            message: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              messageId: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
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
        const data = request.body as TestEmailData;

        const result = await emailService.sendTestEmail(data);

        return reply.status(result.success ? 200 : 400).send(result);
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
}
