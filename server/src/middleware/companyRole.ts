import { FastifyRequest, FastifyReply } from "fastify";
import type { Database } from "../types/supabase.js";

// Define the role hierarchy (lower number = higher privilege)
const ROLE_HIERARCHY: Record<CompanyRole, number> = {
  owner: 0,
  admin: 1,
  viewer: 2,
  interviewee: 3,
};

type CompanyRole = Database["public"]["Enums"]["company_role"];

declare module "fastify" {
  interface FastifyRequest {
    companyRole?: CompanyRole;
  }
}

/**
 * Middleware to fetch and attach the user's role for a specific company
 * This should be called before requireCompanyRole for routes that need role-based access control
 */
export async function companyRoleMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user?.id;

    if (!userId) {
      return reply.status(401).send({
        error: "Unauthorized",
        message: "User ID not found",
      });
    }

    // Extract companyId from route params
    const params = request.params as Record<string, unknown>;
    const companyId = params.companyId as string | undefined;

    if (!companyId) {
      return reply.status(400).send({
        error: "Bad Request",
        message: "Company ID is required in route parameters",
      });
    }

    if (!request.supabaseClient) {
      return reply.status(500).send({
        error: "Internal Server Error",
        message: "Database client not available",
      });
    }

    // Fetch user's role for this company
    const { data, error } = await request.supabaseClient
      .from("user_companies")
      .select("role")
      .eq("company_id", companyId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch user company role:", error);
      return reply.status(500).send({
        error: "Internal Server Error",
        message: "Failed to fetch user permissions",
      });
    }

    if (!data) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "You do not have access to this company",
      });
    }

    // Attach role to request for use in downstream handlers
    request.companyRole = data.role;
  } catch (err) {
    console.error("Company role middleware error:", err);
    return reply.status(500).send({
      error: "Internal Server Error",
      message: "Failed to verify company access",
    });
  }
}

/**
 * Creates a middleware that requires a minimum company role
 * Must be used after companyRoleMiddleware
 *
 * @param minRole - The minimum role required to access this route
 * @returns Fastify middleware function
 *
 * @example
 * fastify.get('/companies/:companyId', {
 *   preHandler: [companyRoleMiddleware, requireCompanyRole('viewer')]
 * }, handler)
 */
export function requireCompanyRole(minRole: CompanyRole) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const userRole = request.companyRole;

    if (!userRole) {
      return reply.status(500).send({
        error: "Internal Server Error",
        message:
          "Company role not found. Ensure companyRoleMiddleware is applied before requireCompanyRole.",
      });
    }

    const userRoleLevel = ROLE_HIERARCHY[userRole];
    const minRoleLevel = ROLE_HIERARCHY[minRole];

    if (userRoleLevel > minRoleLevel) {
      return reply.status(403).send({
        error: "Forbidden",
        message: `This action requires ${minRole} role or higher. You have ${userRole} role.`,
      });
    }
  };
}
