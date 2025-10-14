import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import "../types/fastify.js";

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(401).send({
        success: false,
        error: "Unauthorized",
        message: "Missing or invalid authorization header",
      });
    }

    const token = authHeader.substring(7);

    // Access the Fastify instance through the request
    const fastify = request.server as FastifyInstance;

    const {
      data: { user },
      error,
    } = await fastify.supabase.auth.getUser(token);

    if (error || !user) {
      return reply.status(401).send({
        success: false,
        error: "Unauthorized",
        message: error?.message || "Invalid or expired token",
      });
    }

    // Ensure user.id is present - this is required for all downstream endpoints
    if (!user.id) {
      return reply.status(401).send({
        success: false,
        error: "Unauthorized",
        message: "User ID is missing from token",
      });
    }

    request.user = {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || user.app_metadata?.role,
    };

    // Create authenticated Supabase client and attach to request
    const supabaseClient = fastify.createSupabaseClient(token);

    if (!supabaseClient) {
      return reply.status(500).send({
        success: false,
        error: "Internal Server Error",
        message: "Failed to create client",
      });
    }

    request.supabaseClient = supabaseClient;
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return reply.status(500).send({
      success: false,
      error: "Internal Server Error",
      message: "Authentication failed",
    });
  }
}
