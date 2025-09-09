import "dotenv/config";
import Fastify from "fastify";
import { supabase } from "./lib/supabase.js";
import { authMiddleware } from "./middleware/auth.js";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types/supabase.js";
import { programRoutes } from "./routes/programs.js";

const fastify = Fastify({
  logger: true,
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

fastify.get("/", async () => {
  return { hello: "world" };
});

fastify.get("/health", async () => {
  try {
    const { error } = await supabase.from("profiles").select("count").limit(1);
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
      const supabaseWithAuth = createClient<Database>(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        }
      );
      
      const { data, error } = await supabaseWithAuth
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return { 
          profile: null, 
          message: "Profile not found. Please create a profile first." 
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

// Register program routes
fastify.register(programRoutes);

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    console.log("Server is running on http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
