#!/usr/bin/env node

/**
 * Metric definitions Loader using Supabase JavaScript Client
 * Reads from data/metric_definitions.ts and inserts definitions into the metric_definitions table
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";
import { metric_definitions, type MetricDefinition } from "../data/metric_definitions.ts";
import type { Database } from "../src/types/database.js";

// Load environment variables from local .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, ".env");

config({ path: envPath });

type MetricDefinitionRow = Database["public"]["Tables"]["metric_definitions"]["Row"];

interface MetricDefinitionInsertResult {
  skipped: boolean;
  definition: MetricDefinitionRow | Pick<MetricDefinitionRow, "id" | "name">;
}

class MetricDefinitionsLoader {
  private supabase: ReturnType<typeof createClient<Database>>;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  async checkExistingDefinition(
    name: string
  ): Promise<Pick<MetricDefinitionRow, "id" | "name"> | null> {
    const { data, error } = await this.supabase
      .from("metric_definitions")
      .select("id, name")
      .eq("name", name)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 means no rows returned, which is fine
      console.error(`Error checking definition "${name}":`, error.message);
      throw error;
    }

    return data;
  }

  async insertMetricDefinition(
    definition: MetricDefinition
  ): Promise<MetricDefinitionInsertResult> {
    try {
      // First check if definition already exists
      const existingDefinition = await this.checkExistingDefinition(definition.name);

      if (existingDefinition) {
        console.log(
          `❯  Definition already exists: "${definition.name}" (ID: ${existingDefinition.id})`
        );
        return { skipped: true, definition: existingDefinition };
      }

      // Insert new definition
      const { data, error } = await this.supabase
        .from("metric_definitions")
        .insert({
          name: definition.name,
          description: definition.description,
          objective: definition.objective,
          calculation: definition.calculation,
          required_csv_columns: definition.required_csv_columns,
          provider: definition.provider,
          calculation_type: definition.calculation_type,
        })
        .select()
        .single();

      if (error) {
        console.error(`✖ Error inserting definition "${definition.name}":`, error.message);
        throw error;
      }

      console.log(`✓ Inserted definition: "${definition.name}" (ID: ${data.id})`);
      return { skipped: false, definition: data as MetricDefinitionRow };
    } catch (error) {
      console.error(`✖ Failed to process definition "${definition.name}":`, error.message);
      throw error;
    }
  }

  async loadMetricDefinitions(): Promise<void> {
    try {
      console.log("━━ Starting metric definitions data load...");

      console.log(`━━ Found ${metric_definitions.length} definitions to process`);

      let insertedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      for (const definition of metric_definitions) {
        try {
          const result = await this.insertMetricDefinition(definition);
          if (result.skipped) {
            skippedCount++;
          } else {
            insertedCount++;
          }
        } catch {
          errorCount++;
          console.error(`Failed to process definition: ${definition.name}`);
        }
      }

      console.log("\n✅ Metric definitions loading completed!");
      console.log("\n━━ Summary:");
      console.log(`✓ Inserted: ${insertedCount} definitions`);
      console.log(`❯  Skipped: ${skippedCount} definitions (already existed)`);
      console.log(`✖ Errors: ${errorCount} definitions`);
      console.log(`━━ Total processed: ${metric_definitions.length} definitions`);
    } catch (error) {
      console.error("✖ Error loading metric definitions:", error);
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

  const loader = new MetricDefinitionsLoader(SUPABASE_URL, SUPABASE_KEY);

  await loader.loadMetricDefinitions();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default MetricDefinitionsLoader;
