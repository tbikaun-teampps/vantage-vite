import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./supabase";
import { CompaniesService } from "../services/CompaniesService";

declare module "fastify" {
  interface FastifyRequest {
    user: {
      id: string;
      email?: string;
      role?: string;
    };
    supabaseClient: SupabaseClient<Database>;
    supabaseAdmin?: SupabaseClient<Database>;
    subscriptionTier: "interview_only" | "demo" | "consultant" | "enterprise";
    companiesService?: CompaniesService;
  }
}
