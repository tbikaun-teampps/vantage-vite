import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

/**
 * Validates that public interview users can only access resources
 * belonging to their interview
 *
 * This middleware should run AFTER flexibleAuthMiddleware
 * Uses global Supabase client for validation queries
 */
export async function validateInterviewScopeMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Skip validation for non-public access (authenticated users have RLS)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isPublicAccess = (request as any).isPublicAccess;
  if (!isPublicAccess) {
    return; // Authenticated users are protected by RLS
  }

  // Get public interview context
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const publicInterview = (request as any).publicInterview;
  if (!publicInterview) {
    return reply.status(401).send({
      success: false,
      error: "Public interview context not found",
    });
  }

  const params = request.params as Record<string, string>;
  const { interviewId, responseId } = params;

  // Validate interview ID matches
  if (interviewId) {
    const requestedInterviewId = parseInt(interviewId, 10);
    if (requestedInterviewId !== publicInterview.interviewId) {
      return reply.status(403).send({
        success: false,
        error: "Access denied: You can only access your assigned interview",
      });
    }
  }

  // Validate response belongs to the public interview
  if (responseId) {
    const responseIdNum = parseInt(responseId, 10);

    try {
      // Use global Supabase client for validation (same as auth middleware)
      const fastify = request.server as FastifyInstance;
      const { data: response, error } = await fastify.supabase
        .from("interview_responses")
        .select("interview_id")
        .eq("id", responseIdNum)
        .maybeSingle();

      if (error) {
        request.log.error(error, "Error validating response scope");
        return reply.status(500).send({
          success: false,
          error: "Failed to validate response access",
        });
      }

      if (!response) {
        return reply.status(404).send({
          success: false,
          error: "Response not found",
        });
      }

      if (response.interview_id !== publicInterview.interviewId) {
        return reply.status(403).send({
          success: false,
          error:
            "Access denied: This response does not belong to your interview",
        });
      }
    } catch (error) {
      request.log.error(error, "Error in scope validation");
      return reply.status(500).send({
        success: false,
        error: "Internal error during scope validation",
      });
    }
  }

  // Validation passed - allow request to proceed
}
