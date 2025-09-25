import Fastify from "fastify";
import { authMiddleware } from "./middleware/auth";
import { programRoutes } from "./routes/programs";
import { companiesRoutes } from "./routes/companies";
import { sharedRoutes } from "./routes/shared";
import { questionnairesRoutes } from "./routes/questionnaires";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import envPlugin from "./plugins/env";
import supabasePlugin from "./plugins/supabase";
import { usersRoutes } from "./routes/users";
import { assessmentsRouter } from "./routes/assessments";

const fastify = Fastify({
  logger: true,
});

// Register plugins
await fastify.register(envPlugin);
await fastify.register(supabasePlugin);

// Register Swagger
await fastify.register(swagger, {
  openapi: {
    openapi: "3.0.0",
    info: {
      title: "Vantage Server API",
      description: "API documentation for Vantage application server",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    security: [{ Bearer: [] }],
    components: {
      securitySchemes: {
        Bearer: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
});

// Register Swagger UI
await fastify.register(swaggerUI, {
  routePrefix: "/documentation",
  uiConfig: {
    deepLinking: false,
  },
  uiHooks: {
    onRequest: function (request, reply, next) {
      next();
    },
    preHandler: function (request, reply, next) {
      next();
    },
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  transformSpecification: (swaggerObject, request, reply) => {
    return swaggerObject;
  },
  transformSpecificationClone: true,
});

// Register CORS
await fastify.register(cors, {
  origin: true, // Configure based on your needs
});

// Register rate limiting
fastify.register(import("@fastify/rate-limit"), {
  max: 100, // Allow 100 requests per window
  timeWindow: "1 minute", // 1 minute window
  keyGenerator: (request) => {
    // Use IP address as the key
    return request.ip;
  },
  errorResponseBuilder: (_, context) => {
    return {
      error: "Too Many Requests",
      message: `Rate limit exceeded, retry in ${Math.round(
        context.ttl / 1000
      )} seconds`,
      expiresIn: Math.round(context.ttl / 1000),
    };
  },
});

fastify.get("/health", async () => {
  try {
    const { error } = await fastify.supabase
      .from("profiles")
      .select("count")
      .limit(1);
    if (error) throw error;
    return { status: "healthy", database: "connected" };
  } catch (error) {
    return {
      status: "unhealthy",
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});

// Stricter rate limit for authenticated endpoints
const authRateLimit = {
  config: {
    rateLimit: {
      max: 50, // Lower limit for auth endpoints
      timeWindow: "1 minute",
    },
  },
};

fastify.get(
  "/protected",
  {
    preHandler: authMiddleware,
    ...authRateLimit,
  },
  async (request) => {
    return {
      message: "This is a protected route",
      user: request.user,
    };
  }
);

fastify.get(
  "/profile",
  {
    preHandler: authMiddleware,
    ...authRateLimit,
  },
  async (request) => {
    const userId = request.user?.id;

    if (!userId) {
      throw new Error("User ID not found");
    }

    // Get the JWT token from the request header
    const token = request.headers.authorization?.substring(7); // Remove "Bearer "

    if (!token) {
      throw new Error("No JWT token found");
    }

    try {
      // Create Supabase client with user JWT for RLS to work properly
      const supabaseWithAuth = fastify.createSupabaseClient(token);

      const { data, error } = await supabaseWithAuth
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return {
          profile: null,
          message: "Profile not found. Please create a profile first.",
        };
      }

      return { profile: data };
    } catch (error) {
      throw new Error(
        `Failed to fetch profile: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
);

const apiPrefix = "/api";
// Register program routes
fastify.register(programRoutes, {
  prefix: apiPrefix
});
fastify.register(companiesRoutes, {
  prefix: apiPrefix
});
fastify.register(sharedRoutes, {
  prefix: apiPrefix,
});
fastify.register(questionnairesRoutes, {
  prefix: apiPrefix,
});
fastify.register(usersRoutes, {
  prefix: apiPrefix,
});
fastify.register(assessmentsRouter, {
  prefix: apiPrefix,
});

const start = async () => {
  try {
    await fastify.listen({
      port: fastify.config.PORT,
      host: fastify.config.HOST,
    });
    console.log(
      `Server is running on http://${fastify.config.HOST}:${fastify.config.PORT}`
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
