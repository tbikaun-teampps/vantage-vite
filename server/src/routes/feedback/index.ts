import { FastifyInstance } from "fastify";
import { FeedbackService } from "../../services/FeedbackService";
import type { SubmitFeedbackData } from "../../services/FeedbackService";
import type { Database } from "../../types/database";

export async function feedbackRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) {
      routeOptions.schema.tags = ["Feedback"];
    }
  });

  // Submit feedback
  fastify.post<{
    Body: SubmitFeedbackData;
  }>(
    "/",
    {
      schema: {
        description: "Submit user feedback or error report",
        body: {
          type: "object",
          required: ["message"],
          properties: {
            message: { type: "string" },
            type: {
              type: "string",
              enum: ["bug", "feature", "general", "suggestion"],
            },
            page_url: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
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
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { message, type, page_url } = request.body;

      // Get page URL from request if not provided
      const feedbackPageUrl =
        page_url || request.headers.referer || request.headers.origin || "";

      const feedbackService = new FeedbackService(
        request.supabaseClient,
        request.user.id
      );

      await feedbackService.submitFeedback({
        message,
        type: type as Database["public"]["Enums"]["feedback_types"],
        page_url: feedbackPageUrl,
      });

      return reply.status(200).send({
        success: true,
        message: "Feedback submitted successfully",
      });
    }
  );
}
