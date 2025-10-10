import { FastifyInstance } from "fastify";
import { InterviewsService } from "../services/InterviewsService";

export async function authRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) routeOptions.schema.tags = [];
    routeOptions.schema.tags.push("Auth");
  });

  // Method for generating a short-lived JWT for external interview access
  fastify.post(
    "/external/interview-token",
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

      try {
        const interviewsService = new InterviewsService(
          request.supabaseClient,
          null
        );

        const token = await interviewsService.createPublicInterviewJWT(
          interviewId,
          email,
          accessCode,
          fastify.supabaseAdmin,
          fastify.config.SUPABASE_JWT_SIGNING_KEY
        );

        return {
          success: true,
          data: { token },
        };
      } catch {
        return reply.status(500).send({
          success: false,
          error: "Internal server error during authentication",
        });
      }
    }
  );
}
