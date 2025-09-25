import { FastifyInstance, FastifyRequest } from "fastify";
import { authMiddleware } from "../middleware/auth";
import { companySchemas } from "../schemas/company";
import { commonResponseSchemas } from "../schemas/common";
import { CompaniesService } from "../services/CompaniesService";
import { AssessmentsService } from "../services/AssessmentsService";

import type {
  EntityType,
  ContactEntityType,
} from "../services/CompaniesService.js";

const query2tableMap: Record<string, string> = {
  "business-units": "business_units",
  regions: "regions",
  sites: "sites",
  "asset-groups": "asset_groups",
  "work-groups": "work_groups",
  roles: "roles",
};

interface DeleteEntityParams {
  companyId: string;
  entityId: string;
}

interface DeleteEntityQuery {
  type: EntityType;
}

interface ContactsParams {
  companyId: string;
  entityType: ContactEntityType;
  entityId: string;
}

interface CreateContactParams {
  companyId: string;
  entityType: ContactEntityType;
  entityId: string;
}

interface CreateContactBody {
  full_name: string;
  email: string;
  phone?: string;
  title?: string;
}

interface UpdateContactParams {
  companyId: string;
  contactId: string;
}

interface UpdateContactBody {
  full_name?: string;
  email?: string;
  phone?: string;
  title?: string;
}

interface DeleteContactParams {
  companyId: string;
  entityType: ContactEntityType;
  entityId: string;
  contactId: string;
}

export async function companiesRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);

  // Add "Companies" tag to all routes in this router
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) routeOptions.schema.tags = [];
    routeOptions.schema.tags.push("Companies");
  });
  fastify.get(
    "/companies",
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
        const companiesService = new CompaniesService(request.supabaseClient);
        const companies = await companiesService.getCompanies();

        return {
          success: true,
          data: companies,
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
    "/companies/:companyId", //id is a string (uuid)
    {
      schema: {
        params: companySchemas.params.companyId,
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
        const companiesService = new CompaniesService(request.supabaseClient);
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
    "/companies",
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
        const companiesService = new CompaniesService(request.supabaseClient);
        const company = await companiesService.createCompany(
          request.body as any
        );

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
  fastify.put(
    "/companies/:companyId",
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
        const companiesService = new CompaniesService(request.supabaseClient);
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
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );
  fastify.delete(
    "/companies/:companyId",
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
        const companiesService = new CompaniesService(request.supabaseClient);
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
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );
  fastify.get(
    "/companies/:companyId/entities",
    {
      schema: {
        description: "Get all entities for a company",
        params: companySchemas.params.companyId,
        querystring: companySchemas.querystring.entityType,
        response: {
          200: companySchemas.responses.entityList,
          400: commonResponseSchemas.responses[400],
          401: commonResponseSchemas.responses[401],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const { companyId } = request.params as { companyId: string };
        const { type } = request.query as { type: string };

        if (!type || !query2tableMap[type]) {
          return reply.status(400).send({
            success: false,
            error: "Invalid 'type' query parameter",
          });
        }

        const companiesService = new CompaniesService(request.supabaseClient);
        const entities = await companiesService.getCompanyEntities(
          companyId,
          type as any
        );

        return {
          success: true,
          data: entities,
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
    "/companies/:companyId/entities",
    {
      schema: {
        description: "Create a new entity under the specified company",
        params: companySchemas.params.companyId,
        querystring: companySchemas.querystring.entityType,
        response: {
          200: companySchemas.responses.entityList,
          400: commonResponseSchemas.responses[400],
          401: commonResponseSchemas.responses[401],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const { companyId } = request.params as { companyId: string };
        const { type } = request.query as { type: string };

        if (!type || !query2tableMap[type]) {
          return reply.status(400).send({
            success: false,
            error: "Invalid 'type' query parameter",
          });
        }

        const companiesService = new CompaniesService(request.supabaseClient);
        const entity = await companiesService.createCompanyEntity(
          companyId,
          type as any,
          request.body
        );

        return {
          success: true,
          data: [entity],
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
  fastify.put(
    "/companies/:companyId/entities/:entityId",
    {
      schema: {
        description: "Update an entity under the specified company",
        params: companySchemas.params.entityParams,
        querystring: companySchemas.querystring.entityType,
        response: {
          200: companySchemas.responses.entityList,
          400: commonResponseSchemas.responses[400],
          401: commonResponseSchemas.responses[401],
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const { companyId, entityId } = request.params as {
          companyId: string;
          entityId: string;
        };
        const { type } = request.query as { type: string };

        if (!type || !query2tableMap[type]) {
          return reply.status(400).send({
            success: false,
            error: "Invalid 'type' query parameter",
          });
        }

        const companiesService = new CompaniesService(request.supabaseClient);
        const entity = await companiesService.updateCompanyEntity(
          companyId,
          entityId,
          type as any,
          request.body
        );

        if (!entity) {
          return reply.status(404).send({
            success: false,
            error: "Entity not found",
          });
        }

        return {
          success: true,
          data: [entity],
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
  fastify.delete(
    "/companies/:companyId/entities/:entityId",
    {
      schema: {
        description: "Delete an entity under the specified company",
        params: companySchemas.params.entityParams,
        querystring: companySchemas.querystring.entityType,
        response: {
          200: commonResponseSchemas.messageResponse,
          400: commonResponseSchemas.responses[400],
          401: commonResponseSchemas.responses[401],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: DeleteEntityParams;
        Querystring: DeleteEntityQuery;
      }>,
      reply
    ) => {
      try {
        const { companyId, entityId } = request.params;
        const { type } = request.query;

        if (!type || !query2tableMap[type]) {
          return reply.status(400).send({
            success: false,
            error: "Invalid 'type' query parameter",
          });
        }

        const companiesService = new CompaniesService(request.supabaseClient);
        const deleted = await companiesService.deleteCompanyEntity(
          companyId,
          entityId,
          type
        );

        if (!deleted) {
          return reply.status(404).send({
            success: false,
            error: "Entity not found",
          });
        }

        return {
          success: true,
          message: "Entity deleted successfully",
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
    "/companies/:companyId/tree",
    {
      schema: {
        description: "Get company tree structure",
        params: companySchemas.params.companyId,
        response: {
          200: companySchemas.responses.companyTree,
          401: commonResponseSchemas.responses[401],
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const { companyId } = request.params as { companyId: string };
        const companiesService = new CompaniesService(request.supabaseClient);
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
    "/companies/:companyId/contacts",
    {
      schema: {
        description: "Get all contacts for a company",
        params: companySchemas.params.companyId,
        response: {
          200: companySchemas.responses.contactList,
          401: commonResponseSchemas.responses[401],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const { companyId } = request.params as { companyId: string };
        const companiesService = new CompaniesService(request.supabaseClient);
        const contacts = await companiesService.getCompanyContacts(companyId);

        return {
          success: true,
          data: contacts,
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
    "/companies/:companyId/contacts/:entityType/:entityId",
    {
      schema: {
        description: "Get all contacts for a specific entity",
        params: companySchemas.params.contactParams,
        response: {
          200: companySchemas.responses.contactList,
          401: commonResponseSchemas.responses[401],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request: FastifyRequest<{ Params: ContactsParams }>, reply) => {
      try {
        const { companyId, entityType, entityId } = request.params;
        const companiesService = new CompaniesService(request.supabaseClient);
        const contacts = await companiesService.getEntityContacts(
          companyId,
          entityType,
          entityId
        );

        return {
          success: true,
          data: contacts,
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
    "/companies/:companyId/contacts/:entityType/:entityId",
    {
      schema: {
        description: "Create a new contact and link it to an entity",
        params: companySchemas.params.contactParams,
        body: companySchemas.body.createContact,
        response: {
          200: companySchemas.responses.contactDetail,
          400: commonResponseSchemas.responses[400],
          401: commonResponseSchemas.responses[401],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: CreateContactParams;
        Body: CreateContactBody;
      }>,
      reply
    ) => {
      try {
        const { companyId, entityType, entityId } = request.params;
        const contactData = request.body;

        const companiesService = new CompaniesService(request.supabaseClient);
        const contact = await companiesService.createEntityContact(
          companyId,
          entityType,
          entityId,
          contactData
        );

        return {
          success: true,
          data: contact,
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

  fastify.put(
    "/companies/:companyId/contacts/:contactId",
    {
      schema: {
        description: "Update an existing contact",
        params: companySchemas.params.contactUpdateParams,
        body: companySchemas.body.updateContact,
        response: {
          200: companySchemas.responses.contactDetail,
          400: commonResponseSchemas.responses[400],
          401: commonResponseSchemas.responses[401],
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: UpdateContactParams;
        Body: UpdateContactBody;
      }>,
      reply
    ) => {
      try {
        const { companyId, contactId } = request.params;
        const updateData = request.body;

        if (Object.keys(updateData).length === 0) {
          return reply.status(400).send({
            success: false,
            error: "No update data provided",
          });
        }

        const companiesService = new CompaniesService(request.supabaseClient);
        const contact = await companiesService.updateContact(
          companyId,
          contactId,
          updateData
        );

        if (!contact) {
          return reply.status(404).send({
            success: false,
            error: "Contact not found",
          });
        }

        return {
          success: true,
          data: contact,
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

  fastify.delete(
    "/companies/:companyId/contacts/:entityType/:entityId/:contactId",
    {
      schema: {
        description:
          "Unlink contact from entity and delete if no other links exist",
        params: companySchemas.params.contactDeleteParams,
        response: {
          200: commonResponseSchemas.messageResponse,
          400: commonResponseSchemas.responses[400],
          401: commonResponseSchemas.responses[401],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request: FastifyRequest<{ Params: DeleteContactParams }>, reply) => {
      try {
        const { companyId, entityType, entityId, contactId } = request.params;
        const companiesService = new CompaniesService(request.supabaseClient);
        const result = await companiesService.deleteEntityContact(
          companyId,
          entityType,
          entityId,
          contactId
        );

        return {
          success: result.success,
          message: result.message,
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
    "/companies/:companyId/assessments",
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

      const assessmentsService = new AssessmentsService(request.supabaseClient);
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
}
