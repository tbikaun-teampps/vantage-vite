import { FastifyInstance } from "fastify";

export async function companiesRoutes(fastify: FastifyInstance) {
  fastify.get("/api/companies", {}, {});
  fastify.get("/api/companies/:companyId", {}, {});
  fastify.post("/api/companies", {}, {});
  fastify.put("/api/companies/:companyId", {}, {});
  fastify.delete("/api/companies/:companyId", {}, {});
}
