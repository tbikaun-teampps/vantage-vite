import { FastifyInstance } from "fastify";
import { InternalServerError } from "../../plugins/errorHandler";

export async function measurementsRoutes(fastify: FastifyInstance) {
  fastify.get("/measurement-definitions", async (request) => {
    const { data, error } = await request.supabaseClient
      .from("measurement_definitions")
      .select("*");

    if (error) {
      throw new InternalServerError("Failed to fetch measurements");
    }

    return { success: true, data };
  });
}
