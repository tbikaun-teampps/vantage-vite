import { FastifyRequest, FastifyReply } from "fastify";
import { subscriptionWhitelist, authWhitelist } from "../lib/whitelist";
import "../types/fastify.js";

export async function subscriptionTierMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Skip for whitelisted routes
  const allWhitelist = [...authWhitelist, ...subscriptionWhitelist];
  if (allWhitelist.some((pattern) => request.url.startsWith(pattern))) {
    return;
  }

  try {
    const userId = request.user?.id;

    if (!userId) {
      return reply.status(401).send({
        error: "Unauthorized",
        message: "User ID not found",
      });
    }

    if (!request.supabaseClient) {
      return reply.status(500).send({
        error: "Internal Server Error",
        message: "Database client not available",
      });
    }

    // Fetch user profile with subscription tier
    const { data: profile, error } = await request.supabaseClient
      .from("profiles")
      .select("subscription_tier")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch user profile:", error);
      return reply.status(500).send({
        error: "Internal Server Error",
        message: "Failed to fetch user profile",
      });
    }

    if (!profile) {
      return reply.status(404).send({
        error: "Profile Not Found",
        message: "User profile not found",
      });
    }

    request.subscriptionTier = profile.subscription_tier;

    // If the user is a public interviewee (interview_only) only allow /api/interviews/* endpoints to be reached
    if (
      profile.subscription_tier === "interview_only" &&
      !request.url.startsWith("/api/interviews/")
    ) {
      return reply.status(403).send({
        error: "Access Denied",
        message: "Insufficient permissions",
      });
    }

    // Skip for GET requests
    if (request.method === "GET") {
      return;
    }

    // Check if user has demo subscription tier
    if (profile.subscription_tier === "demo") {
      return reply.status(403).send({
        error: "Subscription Upgrade Required",
        message:
          "This feature requires a higher subscription tier. Upgrade to unlock this feature.",
      });
    }
  } catch (err) {
    console.error("Subscription tier check failed:", err);
    return reply.status(500).send({
      error: "Internal Server Error",
      message: "Subscription check failed",
    });
  }
}
