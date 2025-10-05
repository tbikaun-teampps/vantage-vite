import { FastifyInstance } from "fastify";
import { companySchemas } from "../../schemas/company.js";
import { commonResponseSchemas } from "../../schemas/common.js";
import { CompaniesService } from "../../services/CompaniesService.js";

export async function teamRoutes(fastify: FastifyInstance) {
  // Get all team members for a company
  fastify.get(
    "/:companyId/team",
    {
      schema: {
        description: "Get all team members for a company",
        params: companySchemas.params.companyId,
        response: {
          200: companySchemas.responses.teamMemberList,
          401: commonResponseSchemas.responses[401],
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const { companyId } = request.params as { companyId: string };
        const companiesService = new CompaniesService(
          request.supabaseClient,
          request.user.id,
          request.server.supabaseAdmin
        );

        const teamMembers = await companiesService.getTeamMembers(companyId);

        return {
          success: true,
          data: teamMembers,
        };
      } catch (error) {
        console.error("Get team members error:", error);
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );

  // Add a team member
  fastify.post(
    "/:companyId/team",
    {
      schema: {
        description: "Add a team member to a company",
        params: companySchemas.params.companyId,
        body: companySchemas.body.addTeamMember,
        response: {
          200: companySchemas.responses.teamMemberDetail,
          401: commonResponseSchemas.responses[401],
          403: commonResponseSchemas.responses[403],
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const { companyId } = request.params as { companyId: string };
        const companiesService = new CompaniesService(
          request.supabaseClient,
          request.user.id,
          request.server.supabaseAdmin
        );

        const teamMember = await companiesService.addTeamMember(
          companyId,
          request.body as any
        );

        return {
          success: true,
          data: teamMember,
        };
      } catch (error) {
        console.error("Add team member error:", error);

        // Return 403 for permission errors
        if (
          error instanceof Error &&
          (error.message.includes("Only owners and admins") ||
            error.message.includes("access denied"))
        ) {
          return reply.status(403).send({
            success: false,
            error: error.message,
          });
        }

        // Return 404 for not found errors
        if (
          error instanceof Error &&
          (error.message.includes("not found") ||
            error.message.includes("already a member"))
        ) {
          return reply.status(404).send({
            success: false,
            error: error.message,
          });
        }

        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );

  // Update a team member's role
  fastify.put(
    "/:companyId/team/:userId",
    {
      schema: {
        description: "Update a team member's role",
        params: companySchemas.params.teamMemberParams,
        body: companySchemas.body.updateTeamMember,
        response: {
          200: companySchemas.responses.teamMemberDetail,
          401: commonResponseSchemas.responses[401],
          403: commonResponseSchemas.responses[403],
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const { companyId, userId } = request.params as {
          companyId: string;
          userId: string;
        };
        const companiesService = new CompaniesService(
          request.supabaseClient,
          request.user.id,
          request.server.supabaseAdmin
        );

        const teamMember = await companiesService.updateTeamMember(
          companyId,
          userId,
          request.body as any
        );

        return {
          success: true,
          data: teamMember,
        };
      } catch (error) {
        console.error("Update team member error:", error);

        // Return 403 for permission errors
        if (
          error instanceof Error &&
          (error.message.includes("Only owners and admins") ||
            error.message.includes("Cannot change") ||
            error.message.includes("access denied"))
        ) {
          return reply.status(403).send({
            success: false,
            error: error.message,
          });
        }

        // Return 404 for not found errors
        if (error instanceof Error && error.message.includes("not found")) {
          return reply.status(404).send({
            success: false,
            error: error.message,
          });
        }

        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );

  // Remove a team member
  fastify.delete(
    "/:companyId/team/:userId",
    {
      schema: {
        description: "Remove a team member from a company",
        params: companySchemas.params.teamMemberParams,
        response: {
          200: commonResponseSchemas.messageResponse,
          401: commonResponseSchemas.responses[401],
          403: commonResponseSchemas.responses[403],
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const { companyId, userId } = request.params as {
          companyId: string;
          userId: string;
        };
        const companiesService = new CompaniesService(
          request.supabaseClient,
          request.user.id,
          request.server.supabaseAdmin
        );

        await companiesService.removeTeamMember(companyId, userId);

        return {
          success: true,
          message: "Team member removed successfully",
        };
      } catch (error) {
        console.error("Remove team member error:", error);

        // Return 403 for permission errors
        if (
          error instanceof Error &&
          (error.message.includes("Only owners and admins") ||
            error.message.includes("Cannot remove") ||
            error.message.includes("access denied"))
        ) {
          return reply.status(403).send({
            success: false,
            error: error.message,
          });
        }

        // Return 404 for not found errors
        if (error instanceof Error && error.message.includes("not found")) {
          return reply.status(404).send({
            success: false,
            error: error.message,
          });
        }

        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );
}
