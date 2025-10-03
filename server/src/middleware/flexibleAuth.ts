import { FastifyRequest, FastifyReply } from "fastify";
import { authMiddleware } from "./auth";
import { subscriptionTierMiddleware } from "./subscription";
import { publicInterviewAuthMiddleware } from "./publicInterviewAuth";

/**
 * Flexible authentication middleware that supports both:
 * 1. Standard authentication (JWT bearer token)
 * 2. Public interview authentication (interview_id + email + access_code)
 *
 * Automatically detects which auth method to use based on request headers
 */
export async function flexibleAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Check for public interview credentials in headers or query params
  const query = request.query as Record<string, string>;
  const hasPublicCreds =
    (request.headers["x-interview-id"] || query?.interview_id) &&
    (request.headers["x-interview-email"] || query?.email) &&
    (request.headers["x-interview-access-code"] || query?.access_code);

  if (hasPublicCreds) {
    // Use public interview authentication
    await publicInterviewAuthMiddleware(request, reply);

    // Mark request as public for downstream handlers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (request as any).isPublicAccess = true;
  } else {
    // Use standard authentication
    await authMiddleware(request, reply);
    await subscriptionTierMiddleware(request, reply);

    // Mark request as authenticated for downstream handlers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (request as any).isPublicAccess = false;
  }
}
