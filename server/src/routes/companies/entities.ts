import { FastifyInstance } from "fastify";
import { companySchemas } from "../../schemas/company";
import { commonResponseSchemas } from "../../schemas/common";
import type { EntityType } from "../../types/entities/companies";
import type {
  EntityInsertMap,
  EntityUpdateMap,
} from "../../services/CompaniesService";
import {
  companyRoleMiddleware,
  requireCompanyRole,
} from "../../middleware/companyRole";
import { NotFoundError, BadRequestError } from "../../plugins/errorHandler";

const query2tableMap: Record<string, string> = {
  "business-units": "business_units",
  regions: "regions",
  sites: "sites",
  "asset-groups": "asset_groups",
  "work-groups": "work_groups",
  roles: "roles",
};

export async function entitiesRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/:companyId/entities",
    {
      preHandler: [companyRoleMiddleware, requireCompanyRole("viewer")],
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
    async (request) => {
      const { companyId } = request.params as { companyId: string };
      const { type } = request.query as { type: string };

      if (!type || !query2tableMap[type]) {
        throw new BadRequestError("Invalid 'type' query parameter");
      }

      const entities = await request.companiesService!.getCompanyEntities(
        companyId,
        type as EntityType
      );

      return {
        success: true,
        data: entities,
      };
    }
  );
  fastify.post(
    "/:companyId/entities",
    {
      preHandler: [companyRoleMiddleware, requireCompanyRole("admin")],
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
    async (request) => {
      const { companyId } = request.params as { companyId: string };
      const { type } = request.query as { type: string };

      if (!type || !query2tableMap[type]) {
        throw new BadRequestError("Invalid 'type' query parameter");
      }

      const entity = await request.companiesService!.createCompanyEntity(
        companyId,
        type as EntityType,
        request.body as Omit<
          EntityInsertMap[EntityType],
          "company_id" | "created_by"
        >
      );

      return {
        success: true,
        data: [entity],
      };
    }
  );
  fastify.put(
    "/:companyId/entities/:entityId",
    {
      preHandler: [companyRoleMiddleware, requireCompanyRole("admin")],
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
    async (request) => {
      const { companyId, entityId } = request.params as {
        companyId: string;
        entityId: string;
      };
      const { type } = request.query as { type: string };

      if (!type || !query2tableMap[type]) {
        throw new BadRequestError("Invalid 'type' query parameter");
      }

      const entity = await request.companiesService!.updateCompanyEntity(
        companyId,
        entityId,
        type as EntityType,
        request.body as EntityUpdateMap[EntityType]
      );

      if (!entity) {
        throw new NotFoundError("Entity not found");
      }

      return {
        success: true,
        data: [entity],
      };
    }
  );
  fastify.delete(
    "/:companyId/entities/:entityId",
    {
      preHandler: [companyRoleMiddleware, requireCompanyRole("admin")],
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
    async (request) => {
      const { companyId, entityId } = request.params as {
        companyId: string;
        entityId: string;
      };
      const { type } = request.query as { type: EntityType };

      if (!type || !query2tableMap[type]) {
        throw new BadRequestError("Invalid 'type' query parameter");
      }

      const deleted = await request.companiesService!.deleteCompanyEntity(
        companyId,
        entityId,
        type
      );

      if (!deleted) {
        throw new NotFoundError("Entity not found");
      }

      return {
        success: true,
        message: "Entity deleted successfully",
      };
    }
  );
}
