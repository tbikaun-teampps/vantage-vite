import fp from "fastify-plugin";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.js";

declare module "fastify" {
  interface FastifyInstance {
    supabase: SupabaseClient<Database>;
    supabaseAdmin: SupabaseClient<Database>;
    createSupabaseClient: (userToken?: string) => SupabaseClient<Database>;
  }
}

export default fp(async function (fastify) {
  // Create global Supabase client (for admin operations, health checks, etc.)
  const supabase = createClient<Database>(
    fastify.config.SUPABASE_URL,
    fastify.config.SUPABASE_ANON_KEY
  );

  // Create admin Supabase client with service role (bypasses RLS)
  const supabaseAdmin = createClient<Database>(
    fastify.config.SUPABASE_URL,
    fastify.config.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Function to create user-specific Supabase client with JWT token for RLS
  const createSupabaseClient = (
    userToken?: string
  ): SupabaseClient<Database> => {
    if (!userToken) {
      throw new Error("User token is required to create Supabase client");
    }

    return createClient<Database>(
      fastify.config.SUPABASE_URL,
      fastify.config.SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      }
    );
  };

  // Decorate fastify instance
  fastify.decorate("supabase", supabase);
  fastify.decorate("supabaseAdmin", supabaseAdmin);
  fastify.decorate("createSupabaseClient", createSupabaseClient);
});
