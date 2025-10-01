import { FastifyInstance } from "fastify";
import { companySchemas } from "../../schemas/company";
import { commonResponseSchemas } from "../../schemas/common";
import { CompaniesService } from "../../services/CompaniesService";
import { AssessmentsService } from "../../services/AssessmentsService";
import { entitiesRoutes } from "./entities";
import { contactsRoutes } from "./contacts";
import { rolesRoutes } from "./roles";

export async function companiesRoutes(fastify: FastifyInstance) {
  // Add "Companies" tag to all routes in this router
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) routeOptions.schema.tags = [];
    routeOptions.schema.tags.push("Companies");
  });
  //   Register sub-routers
  await fastify.register(entitiesRoutes);
  await fastify.register(contactsRoutes);
  await fastify.register(rolesRoutes);
  fastify.get(
    "",
    {
      schema: {
        description: "Get all companies",
        response: {
          200: companySchemas.responses.companyList,
          401: commonResponseSchemas.responses[401],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const companiesService = new CompaniesService(
          request.supabaseClient,
          request.user.id
        );
        const companies = await companiesService.getCompanies();

        return {
          success: true,
          data: companies,
        };
      } catch (error) {
        console.log(error);
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );
  fastify.get(
    "/:companyId",
    {
      schema: {
        params: companySchemas.params.companyId,
        response: {
          200: companySchemas.responses.companyWithRoleDetail,
          401: commonResponseSchemas.responses[401],
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const { companyId } = request.params as { companyId: string };
        const companiesService = new CompaniesService(request.supabaseClient, request.user.id);
        const company = await companiesService.getCompanyById(companyId);

        if (!company) {
          return reply.status(404).send({
            success: false,
            error: "Company not found",
          });
        }

        return {
          success: true,
          data: company,
        };
      } catch (error) {
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );
  fastify.post(
    "",
    {
      schema: {
        body: companySchemas.body.createCompany,
        response: {
          200: companySchemas.responses.companyDetail,
          401: commonResponseSchemas.responses[401],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const companiesService = new CompaniesService(request.supabaseClient, request.user.id);
        const company = await companiesService.createCompany(
          request.body as any
        );

        return {
          success: true,
          data: company,
        };
      } catch (error) {
        console.log("error: ", error);
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );
  fastify.put(
    "/:companyId",
    {
      schema: {
        params: companySchemas.params.companyId,
        body: companySchemas.body.updateCompany,
        response: {
          200: companySchemas.responses.companyDetail,
          401: commonResponseSchemas.responses[401],
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const { companyId } = request.params as { companyId: string };
        const companiesService = new CompaniesService(request.supabaseClient, request.user.id);
        const company = await companiesService.updateCompany(
          companyId,
          request.body as any
        );

        if (!company) {
          return reply.status(404).send({
            success: false,
            error: "Company not found",
          });
        }

        return {
          success: true,
          data: company,
        };
      } catch (error) {
        console.log('error: ', error);
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );
  fastify.delete(
    "/:companyId",
    {
      schema: {
        params: companySchemas.params.companyId,
        response: {
          200: commonResponseSchemas.messageResponse,
          401: commonResponseSchemas.responses[401],
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const { companyId } = request.params as { companyId: string };
        const companiesService = new CompaniesService(request.supabaseClient, request.user.id);
        const deleted = await companiesService.deleteCompany(companyId);

        if (!deleted) {
          return reply.status(404).send({
            success: false,
            error: "Company not found",
          });
        }

        return {
          success: true,
          message: "Company deleted successfully",
        };
      } catch (error) {
        console.log('error: ', error);
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );
  fastify.get(
    "/:companyId/tree",
    {
      schema: {
        description: "Get company tree structure",
        params: companySchemas.params.companyId,
        response: {
          // 200: companySchemas.responses.companyTree,
          401: commonResponseSchemas.responses[401],
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const { companyId } = request.params as { companyId: string };
        const companiesService = new CompaniesService(request.supabaseClient, request.user.id);
        const treeData = await companiesService.getCompanyTree(companyId);

        if (!treeData) {
          return reply.status(404).send({
            success: false,
            error: "Company not found",
          });
        }

        return {
          success: true,
          data: treeData,
        };
      } catch (error) {
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );
  fastify.get(
    "/:companyId/assessments",
    {
      schema: {
        description:
          "Get all assessments for a given company with optional filters",
        summary: "Retrieve a list of assessments",
        querystring: {
          type: "object",
          properties: {
            type: {
              type: "string",
              description: "Filter by assessment type",
              enum: ["onsite", "desktop"],
            },
            status: {
              type: "array",
              items: {
                type: "string",
                enum: ["draft", "in_progress", "completed"],
              },
              description: "Filter by assessment status",
            },
            search: {
              type: "string",
              description: "Search assessments by name or description",
            },
          },
        },
        params: {
          type: "object",
          properties: {
            companyId: { type: "string", description: "ID of the company" },
          },
          required: ["companyId"],
        },
      },
    },
    async (request, reply) => {
      const { companyId } = request.params as { companyId: string };
      const { type, status, search } = request.query;

      const filters = {
        type: type as string | undefined,
        status: status as string[] | undefined,
        search: search as string | undefined,
      };

      const assessmentsService = new AssessmentsService(request.supabaseClient, request.user.id);
      const assessments = await assessmentsService.getAssessments(
        companyId,
        filters
      );

      return {
        success: true,
        data: assessments,
      };
    }
  );
  fastify.get("/:companyId/recommendations", async (request, reply) => {
    const { companyId } = request.params as { companyId: string };
    return {
      success: true,
      data: [],
    };
  });
}
