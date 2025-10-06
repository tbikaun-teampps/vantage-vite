import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

/**
 * Middleware to authenticate public interview access
 * Validates interview_id + email + access_code combination
 * Used for unauthenticated users accessing public interviews
 *
 * Note: Uses global Supabase client (no user token) since public interviews
 * don't require user-specific authentication
 */
export async function publicInterviewAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Extract credentials from headers (preferred) or query params (fallback)
    const query = request.query as Record<string, string>;
    const interviewId =
      request.headers["x-interview-id"] || query?.interview_id;
    const email = request.headers["x-interview-email"] || query?.email;
    const accessCode =
      request.headers["x-interview-access-code"] || query?.access_code;

    if (!interviewId || !email || !accessCode) {
      return reply.status(401).send({
        success: false,
        error:
          "Missing required credentials: interview_id, email, and access_code",
      });
    }

    // Validate interview exists, is public, enabled, and access code matches
    const interviewIdNum = parseInt(
      Array.isArray(interviewId) ? interviewId[0] : interviewId,
      10
    );

    if (isNaN(interviewIdNum)) {
      return reply.status(400).send({
        success: false,
        error: "Invalid interview ID format",
      });
    }

    // Use global Supabase client (no user token needed for public validation)
    const fastify = request.server as FastifyInstance;
    const { data: interview, error: interviewError } = await fastify.supabase
      .from("interviews")
      .select(
        `
          id,
          is_public,
          enabled,
          access_code,
          interview_contact_id,
          company_id,
          interview_contact:contacts(id, email)
        `
      )
      .eq("id", interviewIdNum)
      .eq("is_deleted", false)
      .maybeSingle();

    if (interviewError) {
      request.log.error(
        interviewError,
        "Error fetching interview for public access"
      );
      return reply.status(500).send({
        success: false,
        error: "Failed to validate interview access",
      });
    }

    if (!interview) {
      return reply.status(404).send({
        success: false,
        error: "Interview not found",
      });
    }

    // Validate interview is public
    if (!interview.is_public) {
      return reply.status(403).send({
        success: false,
        error: "This interview is not publicly accessible",
      });
    }

    // Validate interview is enabled
    if (!interview.enabled) {
      return reply.status(403).send({
        success: false,
        error: "This interview has been disabled",
      });
    }

    // Validate access code
    if (interview.access_code !== accessCode) {
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
    if (!interviewContact || interviewContact.email !== email) {
      return reply.status(403).send({
        success: false,
        error: "Email does not match interview contact",
      });
    }

    // Authentication successful - attach public interview context to request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (request as any).publicInterview = {
      interviewId: interview.id,
      contactEmail: email,
      contactId: interview.interview_contact_id,
      companyId: interview.company_id,
    };

    // Set user to null for public interviews (for audit trails)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (request as any).user = {
      id: null,
      email: email,
      role: "public_interviewee",
    };

    // Attach global Supabase client for downstream operations
    // Public interviews use the global client (no user-specific RLS)
    request.supabaseClient = fastify.supabase;

    request.log.info(
      `Public interview access granted: Interview ${interviewIdNum}, Contact: ${email}`
    );
  } catch (error) {
    console.log("error: ", error);
    request.log.error(error, "Public interview auth error");
    return reply.status(500).send({
      success: false,
      error: "Internal server error during authentication",
    });
  }
}
