import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import jwt from "jsonwebtoken";

/**
 * Middleware to authenticate public interview access via JWT
 * Decodes and validates JWT containing interview credentials
 * No database queries needed - all validation done at token generation
 */
export async function publicInterviewJWTAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(401).send({
        success: false,
        error: "Missing or invalid authorization header",
      });
    }

    const token = authHeader.substring(7);
    const fastify = request.server as FastifyInstance;

    // Verify and decode JWT
    let decoded: jwt.JwtPayload & {
      anonymousRole: string;
      interviewId: number;
      email: string;
      contactId: number;
      companyId: string;
      questionnaireId: number;
    };
    try {
      const verified = jwt.verify(
        token,
        fastify.config.SUPABASE_JWT_SIGNING_KEY
      );
      decoded = verified as typeof decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return reply.status(401).send({
          success: false,
          error: "Token expired. Please re-authenticate.",
        });
      }
      return reply.status(401).send({
        success: false,
        error: "Invalid token",
      });
    }

    // Verify it's a public interview token
    if (decoded.anonymousRole !== "public_interviewee") {
      return reply.status(403).send({
        success: false,
        error: "Invalid token type for public interview access",
      });
    }

    // Verify required claims are present
    if (
      !decoded.interviewId ||
      !decoded.email ||
      !decoded.contactId ||
      !decoded.companyId ||
      !decoded.questionnaireId
    ) {
      return reply.status(401).send({
        success: false,
        error: "Invalid token: missing required claims",
      });
    }

    // Set public interview context from JWT claims
    request.publicInterview = {
      interviewId: decoded.interviewId,
      contactEmail: decoded.email,
      contactId: decoded.contactId,
      companyId: decoded.companyId,
      questionnaireId: decoded.questionnaireId,
    };

    // Set user context for audit trails
    request.user = {
      id: null,
      email: decoded.email,
      role: "public_interviewee",
    };

    // CRITICAL SECURITY: Create JWT-scoped anon client for public interview access
    // This ensures RLS policies apply based on the JWT claims, not service role bypass
    request.supabaseClient = fastify.createSupabaseClient(token);

    request.log.info(
      `Public interview JWT auth successful: Interview ${decoded.interviewId}, Contact: ${decoded.email}`
    );
  } catch (error) {
    request.log.error(error, "Public interview JWT auth error");
    return reply.status(500).send({
      success: false,
      error: "Internal server error during authentication",
    });
  }
}
