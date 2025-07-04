#!/usr/bin/env node

/**
 * Shared Roles Data Loader using Supabase JavaScript Client
 * Reads from shared_roles.json and inserts roles into the shared_roles table
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables from local .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, ".env");

config({ path: envPath });

class SharedRolesLoader {
  constructor(supabaseUrl, supabaseKey, adminUserId) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.adminUserId = adminUserId;
  }

  async loadSharedRolesData(filePath = "./shared_roles.json") {
    try {
      const data = await fs.readFile(filePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error loading shared roles data:", error.message);
      throw error;
    }
  }

  async checkExistingRole(name) {
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

  async insertSharedRole(role) {
    try {
      // First check if role already exists
      const existingRole = await this.checkExistingRole(role.name);

      if (existingRole) {
        console.log(
          `�  Role already exists: "${role.name}" (ID: ${existingRole.id})`
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
        console.error(`L Error inserting role "${role.name}":`, error.message);
        throw error;
      }

      console.log(` Inserted role: "${role.name}" (ID: ${data.id})`);
      return { skipped: false, role: data };
    } catch (error) {
      console.error(`L Failed to process role "${role.name}":`, error.message);
      throw error;
    }
  }

  async loadSharedRoles(filePath) {
    try {
      console.log("=� Starting shared roles data load...");

      const sharedRolesData = await this.loadSharedRolesData(filePath);

      console.log(`=� Found ${sharedRolesData.length} roles to process`);

      let insertedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      for (const role of sharedRolesData) {
        try {
          const result = await this.insertSharedRole(role);
          if (result.skipped) {
            skippedCount++;
          } else {
            insertedCount++;
          }
        } catch (error) {
          errorCount++;
          console.error(`Failed to process role: ${role.name}`);
        }
      }

      console.log("\n<� Shared roles loading completed!");
      console.log("\n=� Summary:");
      console.log(` Inserted: ${insertedCount} roles`);
      console.log(`�  Skipped: ${skippedCount} roles (already existed)`);
      console.log(`L Errors: ${errorCount} roles`);
      console.log(`=� Total processed: ${sharedRolesData.length} roles`);
    } catch (error) {
      console.error("L Error loading shared roles:", error);
      console.error("Stack trace:", error.stack);
      throw error;
    }
  }
}

// Usage
async function main() {
  // Configuration from environment variables
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

  if (!SUPABASE_URL) {
    console.error("L Missing SUPABASE_URL environment variable");
    process.exit(1);
  }

  if (!SUPABASE_KEY) {
    console.error(
      "L Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY environment variable"
    );
    process.exit(1);
  }

  if (!ADMIN_USER_ID) {
    console.error("L Missing ADMIN_USER_ID environment variable");
    console.log("=� You can set it in .env as ADMIN_USER_ID=your-user-id");
    process.exit(1);
  }

  console.log("=' Configuration:");
  console.log(`=� Supabase URL: ${SUPABASE_URL}`);
  console.log(
    `= Using key: ${SUPABASE_KEY.substring(0, 20)}... ${
      process.env.SUPABASE_SERVICE_ROLE_KEY ? "(service role)" : "(anon)"
    }`
  );
  console.log(`=d Admin User ID: ${ADMIN_USER_ID}`);

  const loader = new SharedRolesLoader(
    SUPABASE_URL,
    SUPABASE_KEY,
    ADMIN_USER_ID
  );

  // Get the script directory to resolve the path to shared_roles.json
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const sharedRolesPath = path.join(scriptDir, "shared_roles.json");

  await loader.loadSharedRoles(sharedRolesPath);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default SharedRolesLoader;
