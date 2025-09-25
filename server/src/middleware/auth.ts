import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    user?: {
      id: string;
      email?: string;
      role?: string;
    };
    supabaseClient?: any; // TODO import proper Supabase client type
  }
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(401).send({
        error: "Unauthorized",
        message: "Missing or invalid authorization header",
      });
    }

    const token = authHeader.substring(7);

    // Access the Fastify instance through the request
    const fastify = request.server as FastifyInstance & {
      supabase: any;
    };

    const {
      data: { user },
      error,
    } = await fastify.supabase.auth.getUser(token);

    if (error || !user || !user.id) {
      return reply.status(401).send({
        error: "Unauthorized",
        message: error?.message || "Invalid or expired token",
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
        error: "Internal Server Error",
        message: "Failed to create client",
      });
    }

    request.supabaseClient = supabaseClient;
  } catch (error) {
    return reply.status(500).send({
      error: "Internal Server Error",
      message: "Authentication failed",
    });
  }
}
