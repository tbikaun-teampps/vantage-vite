import { FastifyInstance, FastifyRequest } from "fastify";
import { companySchemas } from "../../schemas/company";
import { commonResponseSchemas } from "../../schemas/common";
import { CompaniesService } from "../../services/CompaniesService";
import type { ContactEntityType } from "../../services/CompaniesService";
import {
  companyRoleMiddleware,
  requireCompanyRole,
} from "../../middleware/companyRole";

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

export async function contactsRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/:companyId/contacts",
    {
      preHandler: [companyRoleMiddleware, requireCompanyRole("viewer")],
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
        const contacts =
          await request.companiesService!.getCompanyContacts(companyId);

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
    "/:companyId/contacts/:entityType/:entityId",
    {
      preHandler: [companyRoleMiddleware, requireCompanyRole("viewer")],
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
        const contacts = await request.companiesService!.getEntityContacts(
          companyId,
          entityType,
          entityId
        );

        return {
          success: true,
          data: contacts,
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

  fastify.post(
    "/:companyId/contacts/:entityType/:entityId",
    {
      preHandler: [companyRoleMiddleware, requireCompanyRole("admin")],
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
        const { companyId, entityType, entityId } = request.params as {
          companyId: string;
          entityType: ContactEntityType;
          entityId: string;
        };
        const contactData = request.body;
        const contact = await request.companiesService!.createEntityContact(
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
    "/:companyId/contacts/:contactId",
    {
      preHandler: [companyRoleMiddleware, requireCompanyRole("admin")],
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

        const contact = await request.companiesService!.updateContact(
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
    "/:companyId/contacts/:entityType/:entityId/:contactId",
    {
      preHandler: [companyRoleMiddleware, requireCompanyRole("admin")],
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
        const result = await request.companiesService!.deleteEntityContact(
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
}
