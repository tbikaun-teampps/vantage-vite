import { FastifyInstance, FastifyRequest } from "fastify";
import { companySchemas } from "../../schemas/company";
import { commonResponseSchemas } from "../../schemas/common";
import { CompaniesService } from "../../services/CompaniesService";
import type { EntityType } from "../../services/CompaniesService";

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

export async function entitiesRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/:companyId/entities",
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

        const companiesService = new CompaniesService(request.supabaseClient, request.user.id);
        const entities = await companiesService.getCompanyEntities(
          companyId,
          type as any
        );

        return {
          success: true,
          data: entities,
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
  fastify.post(
    "/:companyId/entities",
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

        const companiesService = new CompaniesService(request.supabaseClient, request.user.id);
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
        console.log('error: ', error);
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );
  fastify.put(
    "/:companyId/entities/:entityId",
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

        const companiesService = new CompaniesService(request.supabaseClient, request.user.id);
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
    "/:companyId/entities/:entityId",
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

        const companiesService = new CompaniesService(request.supabaseClient, request.user.id);
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
}
