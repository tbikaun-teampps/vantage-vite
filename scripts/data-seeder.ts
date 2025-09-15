#!/usr/bin/env node

/**
 * Unified Data Seeder
 * Consolidates shared roles, metric definitions, and questionnaires seeding into a single tool
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import type { Database } from "../src/types/database.js";

// Load environment variables from local .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, ".env");

config({ path: envPath });

type SupabaseClient = ReturnType<typeof createClient<Database>>;

interface SeedResult {
  inserted: number;
  skipped: number;
  errors: number;
  total: number;
}

interface SeedOptions {
  dryRun?: boolean;
  verbose?: boolean;
}

export class DataSeeder {
  private supabase: SupabaseClient;
  private adminUserId: string;
  private sharedRolesMap: Map<string, number> = new Map();
  private options: SeedOptions;

  constructor(supabaseUrl: string, supabaseKey: string, adminUserId: string, options: SeedOptions = {}) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
    this.adminUserId = adminUserId;
    this.options = options;
  }

  private log(message: string): void {
    if (this.options.verbose !== false) {
      console.log(message);
    }
  }

  private logDryRun(message: string): void {
    if (this.options.dryRun) {
      console.log(`🔍 DRY RUN: ${message}`);
    }
  }

  /**
   * Seed Shared Roles
   */
  async seedSharedRoles(): Promise<SeedResult> {
    this.log("━━ Starting shared roles seeding...");

    const { shared_roles } = await import("../data/shared_roles.js");
    this.log(`━━ Found ${shared_roles.length} roles to process`);

    const result: SeedResult = { inserted: 0, skipped: 0, errors: 0, total: shared_roles.length };

    for (const role of shared_roles) {
      try {
        // Check if role already exists
        const { data: existingRole, error } = await this.supabase
          .from("shared_roles")
          .select("id, name")
          .eq("name", role.name)
          .single();

        if (existingRole && !error) {
          this.log(`❯  Role already exists: "${role.name}" (ID: ${existingRole.id})`);
          this.sharedRolesMap.set(role.id, existingRole.id);
          result.skipped++;
          continue;
        }

        if (this.options.dryRun) {
          this.logDryRun(`Would create role: "${role.name}"`);
          result.inserted++;
          continue;
        }

        // Insert new role
        const { data, error: insertError } = await this.supabase
          .from("shared_roles")
          .insert({
            name: role.name,
            description: role.description,
            created_by: null,
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        this.log(`✓ Inserted role: "${role.name}" (ID: ${data.id})`);
        this.sharedRolesMap.set(role.id, data.id);
        result.inserted++;

      } catch (error: any) {
        this.log(`✖ Failed to process role "${role.name}": ${error.message}`);
        result.errors++;
      }
    }

    this.log(`\n✅ Shared roles seeding completed!`);
    this.printSummary("shared roles", result);
    return result;
  }

  /**
   * Seed Metric Definitions
   */
  async seedMetricDefinitions(): Promise<SeedResult> {
    this.log("━━ Starting metric definitions seeding...");

    const { metric_definitions } = await import("../data/metric_definitions.js");
    this.log(`━━ Found ${metric_definitions.length} definitions to process`);

    const result: SeedResult = { inserted: 0, skipped: 0, errors: 0, total: metric_definitions.length };

    for (const definition of metric_definitions) {
      try {
        // Check if definition already exists
        const { data: existingDefinition, error } = await this.supabase
          .from("metric_definitions")
          .select("id, name")
          .eq("name", definition.name)
          .single();

        if (existingDefinition && !error) {
          this.log(`❯  Definition already exists: "${definition.name}" (ID: ${existingDefinition.id})`);
          result.skipped++;
          continue;
        }

        if (this.options.dryRun) {
          this.logDryRun(`Would create metric definition: "${definition.name}"`);
          result.inserted++;
          continue;
        }

        // Insert new definition
        const { data, error: insertError } = await this.supabase
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

        if (insertError) {
          throw insertError;
        }

        this.log(`✓ Inserted definition: "${definition.name}" (ID: ${data.id})`);
        result.inserted++;

      } catch (error: any) {
        this.log(`✖ Failed to process definition "${definition.name}": ${error.message}`);
        result.errors++;
      }
    }

    this.log(`\n✅ Metric definitions seeding completed!`);
    this.printSummary("metric definitions", result);
    return result;
  }

  /**
   * Load shared roles mapping for questionnaire seeding
   */
  private async loadSharedRolesMapping(): Promise<void> {
    this.log("━━ Loading shared roles mapping...");

    const { data: dbSharedRoles, error } = await this.supabase
      .from("shared_roles")
      .select("id, name");

    if (error) {
      throw new Error(`Failed to load shared roles: ${error.message}`);
    }

    const { shared_roles } = await import("../data/shared_roles.js");
    
    shared_roles.forEach((refRole: any) => {
      const dbRole = dbSharedRoles.find((db) => db.name === refRole.name);
      if (dbRole) {
        this.sharedRolesMap.set(refRole.id, dbRole.id);
      } else {
        this.log(`⚠️ Warning: Shared role "${refRole.name}" not found in database`);
      }
    });

    this.log(`━━ Loaded ${this.sharedRolesMap.size} shared role mappings`);
  }

  /**
   * Seed Questionnaires
   */
  async seedQuestionnaires(): Promise<SeedResult> {
    this.log("━━ Starting questionnaires seeding...");

    // Load shared roles mapping first
    await this.loadSharedRolesMapping();

    const { allQuestionnaires } = await import("../data/demo/questionnaires/index.js");
    this.log(`━━ Found ${allQuestionnaires.length} questionnaires to process`);

    const result: SeedResult = { inserted: 0, skipped: 0, errors: 0, total: allQuestionnaires.length };

    for (const questionnaire of allQuestionnaires) {
      try {
        const questionnaireResult = await this.seedSingleQuestionnaire(questionnaire);
        if (questionnaireResult.skipped) {
          result.skipped++;
        } else {
          result.inserted++;
        }
      } catch (error: any) {
        this.log(`✖ Failed to process questionnaire "${questionnaire.name}": ${error.message}`);
        result.errors++;
      }
    }

    this.log(`\n✅ Questionnaires seeding completed!`);
    this.printSummary("questionnaires", result);
    return result;
  }

  private async seedSingleQuestionnaire(questionnaireData: any): Promise<{ skipped: boolean }> {
    // Check if questionnaire already exists
    const { data: existingQuestionnaire, error } = await this.supabase
      .from("questionnaires")
      .select("id, name")
      .eq("name", questionnaireData.name)
      .eq("is_deleted", false)
      .single();

    if (existingQuestionnaire && !error) {
      this.log(`❯  Questionnaire already exists: "${questionnaireData.name}" (ID: ${existingQuestionnaire.id})`);
      return { skipped: true };
    }

    if (this.options.dryRun) {
      this.logDryRun(`Would create questionnaire: "${questionnaireData.name}"`);
      return { skipped: false };
    }

    this.log(`📋 Creating questionnaire: "${questionnaireData.name}"`);

    // ID mappings to track relationships during insertion
    const idMappings = {
      questionnaire_rating_scales: new Map<string, number>(),
      questionnaire_sections: new Map<string, number>(),
      questionnaire_steps: new Map<string, number>(),
      questionnaire_questions: new Map<string, number>()
    };

    // 1. Create questionnaire
    const { data: questionnaire, error: questionnaireError } = await this.supabase
      .from("questionnaires")
      .insert({
        name: questionnaireData.name,
        description: questionnaireData.description,
        guidelines: questionnaireData.guidelines,
        status: "active",
        created_by: this.adminUserId,
        is_demo: true,
      })
      .select()
      .single();

    if (questionnaireError) throw questionnaireError;

    const questionnaireId = questionnaire.id;
    this.log(`   ✓ Created questionnaire with ID: ${questionnaireId}`);

    // 2. Create rating scales
    this.log(`   📏 Creating ${questionnaireData.rating_scales.length} rating scales...`);
    const ratingScaleInserts = questionnaireData.rating_scales.map((scale: any) => ({
      name: scale.name,
      description: scale.description,
      order_index: scale.order_index,
      value: scale.value,
      questionnaire_id: questionnaireId,
      created_by: this.adminUserId,
    }));

    const { data: ratingScalesData, error: ratingScalesError } = await this.supabase
      .from("questionnaire_rating_scales")
      .insert(ratingScaleInserts)
      .select();

    if (ratingScalesError) throw ratingScalesError;

    // Map rating scale reference IDs to database IDs
    questionnaireData.rating_scales.forEach((scale: any, index: number) => {
      idMappings.questionnaire_rating_scales.set(scale.id, ratingScalesData[index].id);
    });

    // 3. Create sections, steps, and questions
    let totalQuestions = 0;
    for (const section of questionnaireData.sections) {
      const { data: sectionData, error: sectionError } = await this.supabase
        .from("questionnaire_sections")
        .insert({
          title: section.title,
          order_index: section.order,
          expanded: true,
          questionnaire_id: questionnaireId,
          created_by: this.adminUserId,
        })
        .select()
        .single();

      if (sectionError) throw sectionError;

      const sectionId = sectionData.id;
      idMappings.questionnaire_sections.set(section.id, sectionId);

      // Create steps for this section
      for (const step of section.steps) {
        const { data: stepData, error: stepError } = await this.supabase
          .from("questionnaire_steps")
          .insert({
            title: step.title,
            order_index: step.order,
            expanded: true,
            questionnaire_id: questionnaireId,
            questionnaire_section_id: sectionId,
            created_by: this.adminUserId,
          })
          .select()
          .single();

        if (stepError) throw stepError;

        const stepId = stepData.id;
        idMappings.questionnaire_steps.set(step.id, stepId);

        // Create questions for this step
        const questionInserts = step.questions.map((question: any) => ({
          title: question.title,
          question_text: question.question_text,
          context: question.context,
          order_index: question.order,
          questionnaire_id: questionnaireId,
          questionnaire_step_id: stepId,
          created_by: this.adminUserId,
        }));

        const { data: questionsData, error: questionsError } = await this.supabase
          .from("questionnaire_questions")
          .insert(questionInserts)
          .select();

        if (questionsError) throw questionsError;

        // Map question reference IDs to database IDs
        step.questions.forEach((question: any, index: number) => {
          idMappings.questionnaire_questions.set(question.id, questionsData[index].id);
        });

        // Create rating scale associations and role associations for each question
        for (const question of step.questions) {
          const questionId = idMappings.questionnaire_questions.get(question.id);
          if (!questionId) continue;

          // Create rating scale associations
          const ratingScaleAssociations = questionnaireData.rating_scales
            .map((scale: any) => {
              const scaleId = idMappings.questionnaire_rating_scales.get(scale.id);
              if (!scaleId) return null;
              
              return {
                questionnaire_question_id: questionId,
                questionnaire_id: questionnaireId,
                questionnaire_rating_scale_id: scaleId,
                description: scale.description,
                created_by: this.adminUserId,
              };
            })
            .filter((assoc: any) => assoc !== null);

          const { error: scaleAssocError } = await this.supabase
            .from("questionnaire_question_rating_scales")
            .insert(ratingScaleAssociations);

          if (scaleAssocError) throw scaleAssocError;

          // Create role associations if applicable_roles exist
          if (question.applicable_roles && question.applicable_roles.length > 0) {
            const roleAssociations = [];
            const skippedRoles = [];

            for (const roleRefId of question.applicable_roles) {
              const dbSharedRoleId = this.sharedRolesMap.get(roleRefId);

              if (!dbSharedRoleId) {
                skippedRoles.push(roleRefId);
                continue;
              }

              roleAssociations.push({
                questionnaire_question_id: questionId,
                questionnaire_id: questionnaireId,
                shared_role_id: dbSharedRoleId,
                created_by: this.adminUserId,
              });
            }

            if (roleAssociations.length > 0) {
              const { error: roleAssocError } = await this.supabase
                .from("questionnaire_question_roles")
                .insert(roleAssociations);

              if (roleAssocError) throw roleAssocError;
            }
          }
        }

        totalQuestions += step.questions.length;
      }
    }

    this.log(`   ✓ Created ${questionnaireData.sections.length} sections, ${totalQuestions} questions`);
    this.log(`✓ Questionnaire "${questionnaireData.name}" created successfully`);
    
    return { skipped: false };
  }

  /**
   * Seed all data types in the correct order
   */
  async seedAll(): Promise<{ sharedRoles: SeedResult; metricDefinitions: SeedResult; questionnaires: SeedResult }> {
    this.log("━━ Starting complete data seeding...");

    const results = {
      sharedRoles: await this.seedSharedRoles(),
      metricDefinitions: await this.seedMetricDefinitions(),
      questionnaires: await this.seedQuestionnaires(),
    };

    this.log("\n🎉 Complete data seeding finished!");
    this.log("━━ Overall Summary:");
    
    const totalInserted = results.sharedRoles.inserted + results.metricDefinitions.inserted + results.questionnaires.inserted;
    const totalSkipped = results.sharedRoles.skipped + results.metricDefinitions.skipped + results.questionnaires.skipped;
    const totalErrors = results.sharedRoles.errors + results.metricDefinitions.errors + results.questionnaires.errors;
    const totalProcessed = results.sharedRoles.total + results.metricDefinitions.total + results.questionnaires.total;

    this.log(`✓ Total inserted: ${totalInserted}`);
    this.log(`❯  Total skipped: ${totalSkipped}`);
    this.log(`✖ Total errors: ${totalErrors}`);
    this.log(`━━ Total processed: ${totalProcessed}`);

    return results;
  }

  private printSummary(dataType: string, result: SeedResult): void {
    this.log(`\n━━ ${dataType} Summary:`);
    this.log(`✓ Inserted: ${result.inserted}`);
    this.log(`❯  Skipped: ${result.skipped} (already existed)`);
    this.log(`✖ Errors: ${result.errors}`);
    this.log(`━━ Total processed: ${result.total}`);
  }
}

// CLI Interface
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-n');
  const action = args.find(arg => !arg.startsWith('--') && arg !== '-n') || 'all';

  // Configuration from environment variables
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

  if (!SUPABASE_URL) {
    console.error("✖ Missing SUPABASE_URL environment variable");
    process.exit(1);
  }

  if (!SUPABASE_KEY) {
    console.error("✖ Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY environment variable");
    process.exit(1);
  }

  if (!ADMIN_USER_ID) {
    console.error("✖ Missing ADMIN_USER_ID environment variable");
    process.exit(1);
  }

  console.log("━━ Configuration:");
  console.log(`━━ Supabase URL: ${SUPABASE_URL}`);
  console.log(`━━ Using key: ${SUPABASE_KEY.substring(0, 20)}... ${
    process.env.SUPABASE_SERVICE_ROLE_KEY ? "(service role)" : "(anon)"
  }`);

  if (dryRun) {
    console.log("━━ DRY RUN MODE - No actual database operations will be performed");
  }

  const seeder = new DataSeeder(SUPABASE_URL, SUPABASE_KEY, ADMIN_USER_ID, { dryRun });

  try {
    switch (action) {
      case 'roles':
        await seeder.seedSharedRoles();
        break;
      case 'metrics':
        await seeder.seedMetricDefinitions();
        break;
      case 'questionnaires':
        await seeder.seedQuestionnaires();
        break;
      case 'all':
      default:
        await seeder.seedAll();
        break;
    }
  } catch (error) {
    console.error("✖ Seeding failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default DataSeeder;