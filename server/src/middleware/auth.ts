import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    user?: {
      id: string;
      email?: string;
      role?: string;
    };
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
        message: "Missing or invalid authorization header"
      });
    }

    const token = authHeader.substring(7);
    
    // Access the Fastify instance through the request
    const fastify = request.server as FastifyInstance & {
      supabase: any;
    };
    
    const { data: { user }, error } = await fastify.supabase.auth.getUser(token);
    
    if (error || !user) {
      return reply.status(401).send({
        error: "Unauthorized",
        message: "Invalid or expired token"
      });
    }

    request.user = {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || user.app_metadata?.role
    };
    
  } catch (error) {
    return reply.status(500).send({
      error: "Internal Server Error",
      message: "Authentication failed"
    });
  }
}