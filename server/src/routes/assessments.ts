import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middleware/auth.js";

export async function assessmentsRouter(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) routeOptions.schema.tags = [];
    routeOptions.schema.tags.push("Assessments");
  });
  fastify.get("/assessments/:assessmentId", async (request, reply) => {
    const { assessmentId } = request.params as { assessmentId: string };
    // Implement logic to fetch a specific assessment by ID
    return reply.send({ message: `Details of assessment ${assessmentId}` });
  });
  fastify.put("/assessments/:assessmentId", async (request, reply) => {
    const { assessmentId } = request.params as { assessmentId: string };
    // Implement logic to update a specific assessment by ID
    return reply.send({ message: `Updated assessment ${assessmentId}` });
  });
  fastify.post("/assessments", async (request, reply) => {
    // Implement logic to create a new assessment
    return reply.send({ message: "Created new assessment" });
  });
  fastify.delete("/assessments/:assessmentId", async (request, reply) => {
    const { assessmentId } = request.params as { assessmentId: string };
    // Implement logic to delete a specific assessment by ID
    return reply.send({ message: `Deleted assessment ${assessmentId}` });
  });
  fastify.post(
    "/assessments/:assessmentId/duplicate",
    async (request, reply) => {
      const { assessmentId } = request.params as { assessmentId: string };
      // Implement logic to duplicate a specific assessment by ID
      return reply.send({ message: `Duplicated assessment ${assessmentId}` });
    }
  );
}
