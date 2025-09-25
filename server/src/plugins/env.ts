import fp from "fastify-plugin";
import env from "@fastify/env";

const envSchema = {
  type: "object",
  required: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
  properties: {
    SUPABASE_URL: {
      type: "string",
      description: "Supabase project URL",
    },
    SUPABASE_ANON_KEY: {
      type: "string",
      description: "Supabase anonymous/public key",
    },
    NODE_ENV: {
      type: "string",
      default: "development",
    },
    PORT: {
      type: "number",
      default: 3000,
    },
    HOST: {
      type: "string",
      default: "0.0.0.0",
    },
  },
};

declare module "fastify" {
  interface FastifyInstance {
    config: {
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
      NODE_ENV: string;
      PORT: number;
      HOST: string;
    };
  }
}

export default fp(async function (fastify) {
  await fastify.register(env, {
    confKey: "config",
    schema: envSchema,
    dotenv: true,
  });
});