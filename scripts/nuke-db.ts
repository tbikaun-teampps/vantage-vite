#!/usr/bin/env node

/**
 * Database Nuke Script
 * Deletes all tables except 'profiles' and 'shared_roles'
 * Includes confirmation prompt for safety
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createInterface } from "readline";

// Load environment variables from local .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, ".env");

config({ path: envPath });

class DatabaseNuke {
  private supabase: SupabaseClient;
  private excludedTables: string[];

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.excludedTables = ['profiles', 'shared_roles'];
  }

  async getAllTables() {
    console.log("🔍 Fetching all table names...");
    
    // Query information_schema to get all user tables
    const { data, error } = await this.supabase
      .rpc('get_tables_in_schema', { schema_name: 'public' });
    
    if (error) {
      // Fallback: use known table list from demo script
      console.log("⚠️  Using fallback table list...");
      return [
        'interview_evidence',
        'interview_response_actions',
        'interview_response_roles', 
        'interview_responses',
        'interview_questions',
        'interview_roles',
        'interview_sections',
        'interview_steps',
        'interviews',
        'assessment_objectives',
        'assessments',
        'program_phases',
        'program_objectives', 
        'programs',
        'questionnaire_question_rating_scales',
        'questionnaire_question_roles',
        'questionnaire_questions',
        'questionnaire_steps',
        'questionnaire_sections',
        'questionnaire_rating_scales',
        'questionnaires',
        'role_contacts',
        'work_group_contacts',
        'asset_group_contacts',
        'site_contacts',
        'region_contacts',
        'business_unit_contacts',
        'company_contacts',
        'contacts',
        'roles',
        'work_groups',
        'asset_groups',
        'sites',
        'regions',
        'business_units',
        'companies',
        'feedback',
        "recommendations"
      ];
    }
    
    return data;
  }

  async confirmAction(tablesToDelete: string[]): Promise<boolean> {
    return new Promise((resolve) => {
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout
      });

      console.log("\n⚠️  WARNING: This will permanently delete data from the following tables:");
      console.log("📋 Tables to be nuked:");
      tablesToDelete.forEach((table: string) => console.log(`   - ${table}`));
      
      console.log("\n✅ Tables that will be preserved:");
      this.excludedTables.forEach((table: string) => console.log(`   - ${table}`));
      
      console.log("\n💥 This action CANNOT be undone!");
      
      rl.question("\nDo you want to continue? Type 'YES' to confirm: ", (answer) => {
        rl.close();
        resolve(answer === 'YES');
      });
    });
  }

  async nukeDatabase() {
    try {
      console.log("🚀 Starting database nuke process...");
      
      // Get all tables
      const allTables = await this.getAllTables();
      
      // Filter out excluded tables
      const tablesToDelete = allTables.filter((table: string) => 
        !this.excludedTables.includes(table)
      );
      
      if (tablesToDelete.length === 0) {
        console.log("✨ No tables to delete (only excluded tables found)");
        return;
      }
      
      // Ask for confirmation
      const confirmed = await this.confirmAction(tablesToDelete);
      
      if (!confirmed) {
        console.log("❌ Operation cancelled by user");
        return;
      }
      
      console.log("\n💥 Starting table deletion...");
      
      // Define deletion order to handle foreign key constraints
      const orderedDeletion = [
        // Most dependent tables first
        'interview_evidence',
        'interview_response_actions',
        'interview_response_roles',
        'interview_responses',
        'interview_questions',
        'interview_roles',
        'interview_sections',
        'interview_steps',
        'interviews',
        'assessment_objectives',
        'assessments',
        'program_phases',
        'program_objectives',
        'programs',
        'questionnaire_question_rating_scales',
        'questionnaire_question_roles',
        'questionnaire_questions',
        'questionnaire_steps',
        'questionnaire_sections',
        'questionnaire_rating_scales',
        'questionnaires',
        'role_contacts',
        'work_group_contacts',
        'asset_group_contacts',
        'site_contacts',
        'region_contacts',
        'business_unit_contacts',
        'company_contacts',
        'contacts',
        'roles',
        'work_groups',
        'asset_groups',
        'sites',
        'regions',
        'business_units',
        'companies',
        'feedback',
        // Add any remaining tables not in the ordered list
        ...tablesToDelete.filter((table: string) => ![
          'interview_evidence',
          'interview_response_actions',
          'interview_response_roles',
          'interview_responses',
          'interview_questions',
          'interview_roles',
          'interview_sections',
          'interview_steps',
          'interviews',
          'assessment_objectives',
          'assessments',
          'program_phases',
          'program_objectives',
          'programs',
          'questionnaire_question_rating_scales',
          'questionnaire_question_roles',
          'questionnaire_questions',
          'questionnaire_steps',
          'questionnaire_sections',
          'questionnaire_rating_scales',
          'questionnaires',
          'role_contacts',
          'work_group_contacts',
          'asset_group_contacts',
          'site_contacts',
          'region_contacts',
          'business_unit_contacts',
          'company_contacts',
          'contacts',
          'roles',
          'work_groups',
          'asset_groups',
          'sites',
          'regions',
          'business_units',
          'companies',
          'feedback'
        ].includes(table))
      ];
      
      let deletedCount = 0;
      let skippedCount = 0;
      
      for (const tableName of orderedDeletion) {
        if (!tablesToDelete.includes(tableName)) {
          continue;
        }
        
        console.log(`🗑️  Deleting all data from ${tableName}...`);
        
        try {
          // Define junction tables that don't have id columns
          const noIdJunctionTables = [
            'asset_group_contacts',
            'business_unit_contacts', 
            'company_contacts',
            'region_contacts',
            'role_contacts',
            'site_contacts',
            'work_group_contacts'
          ];
          
          // Tables with UUID ids (string)
          const uuidTables = ['companies'];
          
          let result: { error: unknown; count: number | null };
          if (noIdJunctionTables.includes(tableName)) {
            // For junction tables without id, delete all records using created_at
            result = await this.supabase
              .from(tableName)
              .delete()
              .gte('created_at', '1900-01-01T00:00:00Z'); // Delete all records
          } else if (uuidTables.includes(tableName)) {
            // For tables with UUID IDs
            result = await this.supabase
              .from(tableName)
              .delete()
              .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
          } else {
            // For tables with bigint IDs
            result = await this.supabase
              .from(tableName)
              .delete()
              .neq('id', -999999999); // Delete all rows
          }
          
          const { error, count } = result;
          
          if (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.log(`⚠️  Warning: Failed to delete from ${tableName}: ${errorMessage}`);
            skippedCount++;
          } else {
            console.log(`✅ Deleted ${count || 'unknown'} records from ${tableName}`);
            deletedCount++;
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          console.log(`⚠️  Warning: Error deleting from ${tableName}: ${errorMessage}`);
          skippedCount++;
        }
      }
      
      console.log("\n🎉 Database nuke completed!");
      console.log(`📊 Summary:`);
      console.log(`   ✅ Tables processed: ${deletedCount}`);
      console.log(`   ⚠️  Tables skipped: ${skippedCount}`);
      console.log(`   🛡️  Tables preserved: ${this.excludedTables.length} (${this.excludedTables.join(', ')})`);
      
    } catch (error) {
      console.error("❌ Error during database nuke:", error);
      console.error("Stack trace:", error.stack);
      throw error;
    }
  }
}

async function main() {
  // Configuration from environment variables
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!SUPABASE_URL) {
    console.error("❌ Missing SUPABASE_URL environment variable");
    process.exit(1);
  }
  
  if (!SUPABASE_KEY) {
    console.error("❌ Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY environment variable");
    process.exit(1);
  }
  
  console.log("🔧 Configuration:");
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
  console.log(`🔑 Using key: ${SUPABASE_KEY.substring(0, 20)}... ${process.env.SUPABASE_SERVICE_ROLE_KEY ? "(service role)" : "(anon)"}`);
  
  const nuke = new DatabaseNuke(SUPABASE_URL, SUPABASE_KEY);
  await nuke.nukeDatabase();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("💥 Fatal error:", error.message);
    process.exit(1);
  });
}

export default DatabaseNuke;