import { FastifyInstance } from "fastify";

export async function measurementsRoutes(fastify: FastifyInstance) {
  fastify.get("/measurement-definitions", async (request, reply) => {
    const { data, error } = await request.supabaseClient
      .from("measurement_definitions")
      .select("*");

    if (error) {
      request.log.error(error);
      return reply.status(500).send({ error: "Failed to fetch measurements" });
    }

    return { success: true, data };
  });
}
