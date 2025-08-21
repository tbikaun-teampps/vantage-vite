#!/usr/bin/env node

/**
 * Shared Roles Data Loader using Supabase JavaScript Client
 * Reads from data/shared_roles.ts and inserts roles into the shared_roles table
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";
import { shared_roles, type DataSharedRole } from "../data/shared_roles.ts";
import type { Database } from "../src/types/database.js";

// Load environment variables from local .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, ".env");

config({ path: envPath });

type SharedRoleRow = Database["public"]["Tables"]["shared_roles"]["Row"];

interface SharedRoleInsertResult {
  skipped: boolean;
  role: SharedRoleRow | Pick<SharedRoleRow, "id" | "name">;
}

class SharedRolesLoader {
  private supabase: ReturnType<typeof createClient<Database>>;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  async checkExistingRole(
    name: string
  ): Promise<Pick<SharedRoleRow, "id" | "name"> | null> {
    const { data, error } = await this.supabase
      .from("shared_roles")
      .select("id, name")
      .eq("name", name)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 means no rows returned, which is fine
      console.error(`Error checking role "${name}":`, error.message);
      throw error;
    }

    return data;
  }

  async insertSharedRole(
    role: DataSharedRole
  ): Promise<SharedRoleInsertResult> {
    try {
      // First check if role already exists
      const existingRole = await this.checkExistingRole(role.name);

      if (existingRole) {
        console.log(
          `❯  Role already exists: "${role.name}" (ID: ${existingRole.id})`
        );
        return { skipped: true, role: existingRole };
      }

      // Insert new role
      const { data, error } = await this.supabase
        .from("shared_roles")
        .insert({
          name: role.name,
          description: role.description,
          created_by: null,
        })
        .select()
        .single();

      if (error) {
        console.error(`✖ Error inserting role "${role.name}":`, error.message);
        throw error;
      }

      console.log(`✓ Inserted role: "${role.name}" (ID: ${data.id})`);
      return { skipped: false, role: data as SharedRoleRow };
    } catch (error) {
      console.error(`✖ Failed to process role "${role.name}":`, error.message);
      throw error;
    }
  }

  async loadSharedRoles(): Promise<void> {
    try {
      console.log("━━ Starting shared roles data load...");

      console.log(`━━ Found ${shared_roles.length} roles to process`);

      let insertedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      for (const role of shared_roles) {
        try {
          const result = await this.insertSharedRole(role);
          if (result.skipped) {
            skippedCount++;
          } else {
            insertedCount++;
          }
        } catch {
          errorCount++;
          console.error(`Failed to process role: ${role.name}`);
        }
      }

      console.log("\n✅ Shared roles loading completed!");
      console.log("\n━━ Summary:");
      console.log(`✓ Inserted: ${insertedCount} roles`);
      console.log(`❯  Skipped: ${skippedCount} roles (already existed)`);
      console.log(`✖ Errors: ${errorCount} roles`);
      console.log(`━━ Total processed: ${shared_roles.length} roles`);
    } catch (error) {
      console.error("✖ Error loading shared roles:", error);
      console.error("Stack trace:", error.stack);
      throw error;
    }
  }
}

// Usage
async function main(): Promise<void> {
  // Configuration from environment variables
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL) {
    console.error("✖ Missing SUPABASE_URL environment variable");
    process.exit(1);
  }

  if (!SUPABASE_KEY) {
    console.error(
      "✖ Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY environment variable"
    );
    process.exit(1);
  }

  console.log("━━ Configuration:");
  console.log(`━━ Supabase URL: ${SUPABASE_URL}`);
  console.log(
    `━━ Using key: ${SUPABASE_KEY.substring(0, 20)}... ${
      process.env.SUPABASE_SERVICE_ROLE_KEY ? "(service role)" : "(anon)"
    }`
  );

  const loader = new SharedRolesLoader(SUPABASE_URL, SUPABASE_KEY);

  await loader.loadSharedRoles();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default SharedRolesLoader;
