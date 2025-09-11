import inquirer from "inquirer";
import { DataGenerator } from "./data-generator.ts";
import { DataSeeder } from "./data-seeder.ts";
import SupabaseDemoGenerator from "../demo/generate.ts";

class CLI {
  dataGenerator: DataGenerator;

  constructor() {
    // Will be initialized in run() with proper parameters
    this.dataGenerator = new DataGenerator(true, undefined, "deterministic");
  }

  async selectAction(): Promise<string> {
    const { selectedAction } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedAction",
        message: "What would you like to do?",
        choices: [
          {
            name: "Create Company - Create a new company with full organizational structure",
            value: "create_company",
            short: "Create Company",
          },
          {
            name: "Create Assessment - Create an assessment for an existing company",
            value: "create_assessment",
            short: "Create Assessment",
          },
          {
            name: "Create Interview - Create interviews for an existing assessment",
            value: "create_interview",
            short: "Create Interview",
          },
          {
            name: "Create Program - Create a new program with phases and objectives",
            value: "create_program",
            short: "Create Program",
          },
          {
            name: "Add Data to Program - Add metric data to an existing program phase",
            value: "add_program_data",
            short: "Add Program Data",
          },
          {
            name: "Create Recommendations - Generate actionable recommendations from interview insights",
            value: "create_recommendations",
            short: "Create Recommendations",
          },
          {
            name: "Seed Shared Roles - Load shared role definitions into database",
            value: "seed_shared_roles",
            short: "Seed Shared Roles",
          },
          {
            name: "Seed Metric Definitions - Load metric definitions into database",
            value: "seed_metric_definitions",
            short: "Seed Metric Definitions",
          },
          {
            name: "Seed Questionnaires - Load questionnaire templates into database",
            value: "seed_questionnaires",
            short: "Seed Questionnaires",
          },
          {
            name: "Seed All Data - Load all reference data (roles, metrics, questionnaires)",
            value: "seed_all_data",
            short: "Seed All Data",
          },
          {
            name: "Generate Complete Demo Data - Create full company structure with assessments and interviews",
            value: "generate_demo_data",
            short: "Generate Demo Data",
          },
        ],
        pageSize: 10,
      },
    ]);

    return selectedAction;
  }

  async promptForCompanyDetails(): Promise<{
    name: string;
    description: string;
    isDemo: boolean;
  }> {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "Enter company name:",
        default: "Vantage Resources",
        validate: (input: string) =>
          input.trim().length > 0 || "Company name is required",
      },
      {
        type: "input",
        name: "description",
        message: "Enter company description:",
        default: "Leading Australian mining company specialising in X.",
      },
      {
        type: "confirm",
        name: "isDemo",
        message: "Mark this company as a demo company?",
        default: true,
      },
    ]);

    return answers;
  }

  async promptForDryRun(): Promise<boolean> {
    const { dryRun } = await inquirer.prompt([
      {
        type: "confirm",
        name: "dryRun",
        message:
          "Run in dry-run mode? (No actual changes will be made to the database)",
        default: true,
      },
    ]);

    return dryRun;
  }

  async promptForContentGeneration(): Promise<"llm" | "deterministic"> {
    const { contentMode } = await inquirer.prompt([
      {
        type: "list",
        name: "contentMode",
        message: "How would you like to generate content?",
        choices: [
          {
            name: "🤖 LLM-Generated - Use AI to create realistic, varied content (requires API key)",
            value: "llm",
            short: "LLM-Generated",
          },
          {
            name: "🎲 Deterministic - Use predefined templates and random selection (faster, no API required)",
            value: "deterministic",
            short: "Deterministic",
          },
        ],
        default: "deterministic",
      },
    ]);

    return contentMode;
  }

  async promptForInterviewDetails(): Promise<{
    numberOfInterviews: number;
    isPublic: boolean;
  }> {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "numberOfInterviews",
        message: "How many interviews would you like to create?",
        default: "1",
        validate: (input: string) => {
          const num = parseInt(input);
          return (
            (Number.isInteger(num) && num > 0 && num <= 10) ||
            "Please enter a number between 1 and 10"
          );
        },
        filter: (input: string) => parseInt(input),
      },
      {
        type: "confirm",
        name: "isPublic",
        message: "Should these interviews be public (accessible via access code)?",
        default: false,
      },
    ]);

    return answers;
  }

  async promptForProgramDetails(): Promise<{
    name?: string;
    isDemo: boolean;
    includeOnsiteQuestionnaire: boolean;
    includePresiteQuestionnaire: boolean;
    phaseConfig: {
      phaseUnit: "weeks" | "months" | "years";
      frequency: number;
      numberOfPhases?: number;
    };
  }> {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "Enter program name (optional):",
        validate: (input: string) => {
          if (input.trim().length > 100) {
            return "Program name must be 100 characters or less";
          }
          return true;
        },
      },
      {
        type: "confirm",
        name: "isDemo",
        message: "Mark this program as a demo program?",
        default: true,
      },
      {
        type: "confirm",
        name: "includeOnsiteQuestionnaire",
        message: "Link an onsite questionnaire to this program? (Optional)",
        default: false,
      },
      {
        type: "confirm",
        name: "includePresiteQuestionnaire",
        message: "Link a presite questionnaire to this program? (Optional)",
        default: false,
      },
    ]);

    // Ask for phase configuration
    const phaseConfig = await inquirer.prompt([
      {
        type: "list",
        name: "phaseUnit",
        message: "What time unit should be used between phases?",
        choices: [
          { name: "Weeks", value: "weeks" },
          { name: "Months", value: "months" },
          { name: "Years", value: "years" },
        ],
        default: "months",
      },
      {
        type: "input",
        name: "frequency",
        message: "How many units between each phase?",
        default: "3",
        validate: (input: string) => {
          const num = parseInt(input);
          return (
            (Number.isInteger(num) && num > 0 && num <= 100) ||
            "Please enter a number between 1 and 100"
          );
        },
        filter: (input: string) => parseInt(input),
      },
      {
        type: "input",
        name: "numberOfPhases",
        message: "How many phases should this program have? (leave empty for random 3-5)",
        validate: (input: string) => {
          if (input.trim() === "") return true; // Allow empty for random
          const num = parseInt(input);
          return (
            (Number.isInteger(num) && num >= 1 && num <= 10) ||
            "Please enter a number between 1 and 10, or leave empty for random"
          );
        },
        filter: (input: string) => input.trim() === "" ? undefined : parseInt(input),
      },
    ]);

    return { ...answers, phaseConfig };
  }

  async promptForUser(): Promise<string> {
    const userOptions = [
      {
        name: "demo@teampps.com.au",
        id: "dbc895ba-b397-46ff-a90d-309214c68003",
      },
      {
        name: "mark@teampps.com.au",
        id: "43883349-2152-4484-a092-175152d3d84e",
      },
      {
        name: "tbikaun@teampps.com.au",
        id: "4d34ba47-221d-4fd3-a278-1414e04e28bb",
      },
    ];

    const choices = userOptions.map((user) => ({
      name: `${user.name} (${user.id})`,
      value: user.id,
    }));

    const { userId } = await inquirer.prompt([
      {
        type: "list",
        name: "userId",
        message: "Select user to impersonate:",
        choices: choices,
        default: "dbc895ba-b397-46ff-a90d-309214c68003",
      },
    ]);

    const selectedUser = userOptions.find((user) => user.id === userId);
    console.log(`Selected user: ${selectedUser?.name} (${userId})\n`);
    return userId;
  }

  async handleDataSeeding(seedType: "roles" | "metrics" | "questionnaires" | "all"): Promise<void> {
    console.log(`\n🌱 Starting ${seedType === "all" ? "complete data" : seedType} seeding...`);

    // Get environment variables for DataSeeder
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

    if (!SUPABASE_URL || !SUPABASE_KEY || !ADMIN_USER_ID) {
      console.error("❌ Missing required environment variables for data seeding:");
      if (!SUPABASE_URL) console.error("   - SUPABASE_URL");
      if (!SUPABASE_KEY) console.error("   - SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY");
      if (!ADMIN_USER_ID) console.error("   - ADMIN_USER_ID");
      return;
    }

    // Ask if user wants dry run for seeding
    const { dryRun } = await inquirer.prompt([
      {
        type: "confirm",
        name: "dryRun",
        message: "Would you like to run in dry-run mode (preview only, no changes)?",
        default: false,
      },
    ]);

    if (dryRun) {
      console.log("🧪 DRY RUN MODE: No changes will be made to the database\n");
    }

    const seeder = new DataSeeder(SUPABASE_URL, SUPABASE_KEY, ADMIN_USER_ID, { dryRun });

    try {
      switch (seedType) {
        case "roles":
          await seeder.seedSharedRoles();
          break;
        case "metrics":
          await seeder.seedMetricDefinitions();
          break;
        case "questionnaires":
          await seeder.seedQuestionnaires();
          break;
        case "all":
          await seeder.seedAll();
          break;
      }
    } catch (error) {
      console.error("❌ Data seeding failed:", error instanceof Error ? error.message : error);
      throw error;
    }
  }

  async handleDemoDataGeneration(selectedUserId: string): Promise<void> {
    console.log("\n🎬 Demo Data Generation\n");
    
    // Step 1: Ask about demo mode (affects is_demo flag)
    const { isDemoMode } = await inquirer.prompt([
      {
        type: "confirm",
        name: "isDemoMode",
        message: "Should this be marked as demo data?",
        default: true,
      },
    ]);

    // Step 2: Ask about data scope
    const { dataScope } = await inquirer.prompt([
      {
        type: "list",
        name: "dataScope",
        message: "What scope of data would you like to generate?",
        choices: [
          {
            name: "Minimal - Single business unit, region, site, and asset group with limited questionnaires",
            value: "minimal",
            short: "Minimal",
          },
          {
            name: "Complete - Full organizational structure with all questionnaires and assessments",
            value: "complete", 
            short: "Complete",
          },
        ],
        default: "minimal",
      },
    ]);

    const useMinimalData = dataScope === "minimal";

    console.log(`\n📋 Demo Generation Settings:`);
    console.log(`Selected User ID: ${selectedUserId}`);
    console.log(`Demo Mode: ${isDemoMode ? "Yes" : "No"}`);
    console.log(`Data Scope: ${dataScope === "minimal" ? "Minimal" : "Complete"}`);
    console.log();

    // Get environment variables for DemoGenerator
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.error("❌ Missing required environment variables for demo generation:");
      if (!SUPABASE_URL) console.error("   - SUPABASE_URL");
      if (!SUPABASE_KEY) console.error("   - SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY");
      return;
    }

    // Create and configure the DemoGenerator
    const demoGenerator = new SupabaseDemoGenerator(SUPABASE_URL, SUPABASE_KEY, selectedUserId, isDemoMode);
    
    try {
      await demoGenerator.generateDemoData(useMinimalData);
      console.log(`✅ Demo data generation completed successfully!`);
    } catch (error) {
      console.error(`❌ Error during demo data generation:`, error instanceof Error ? error.message : error);
      throw error;
    }
  }

  async run() {
    console.log("🚀 Data Generator CLI\n");

    try {
      // Step 1: Ask about dry-run mode
      const dryRun = await this.promptForDryRun();

      if (dryRun) {
        console.log(
          "🧪 DRY RUN MODE: No changes will be made to the database\n"
        );
      } else {
        console.log("⚠️  LIVE MODE: Changes will be made to the database\n");
      }

      // Step 2: Ask about content generation mode
      const contentMode = await this.promptForContentGeneration();

      if (contentMode === "llm") {
        console.log(
          "🤖 LLM MODE: AI will generate realistic, varied content\n"
        );
      } else {
        console.log(
          "🎲 DETERMINISTIC MODE: Using predefined templates and random selection\n"
        );
      }

      // Step 3: Select user to impersonate
      const selectedUserId = await this.promptForUser();

      // Initialize DataGenerator with the selected settings
      this.dataGenerator = new DataGenerator(
        dryRun,
        selectedUserId,
        contentMode
      );

      // Step 3: Select what action to perform
      const action = await this.selectAction();

      if (action === "create_company") {
        // Get company details from user
        const companyDetails = await this.promptForCompanyDetails();

        console.log("\n📢 Creating company with the following details:");
        console.log(`Name: ${companyDetails.name}`);
        console.log(`Description: ${companyDetails.description}`);
        console.log(`Demo: ${companyDetails.isDemo ? "Yes" : "No"}\n`);

        // Create the company
        const companyId = await this.dataGenerator.createCompany(
          companyDetails.name,
          companyDetails.description,
          companyDetails.isDemo
        );

        if (companyId) {
          console.log(
            `\n🎉 Successfully created company with ID: ${companyId}`
          );
        }
      } else if (action === "create_assessment") {
        // Step 1: Select company
        await this.dataGenerator.selectCompany();

        // Step 2: Select asset group
        const selectedAssetGroupId =
          await this.dataGenerator.selectAssetGroup();

        // Step 3: Select questionnaire
        const selectedQuestionnaireId =
          await this.dataGenerator.selectQuestionnaire();

        // Step 4: Ask for optional custom name
        const { provideCustomName } = await inquirer.prompt([
          {
            type: "confirm",
            name: "provideCustomName",
            message: "Would you like to provide a custom name for this assessment?",
            default: false,
          },
        ]);

        let customName: string | undefined;
        if (provideCustomName) {
          const { assessmentName } = await inquirer.prompt([
            {
              type: "input",
              name: "assessmentName",
              message: "Enter the assessment name:",
              validate: (input: string) => {
                return input.trim().length > 0 || "Assessment name cannot be empty";
              },
              filter: (input: string) => input.trim(),
            },
          ]);
          customName = assessmentName;
        }

        // Step 5: Create assessment
        console.log("Creating assessment...");
        const assessmentResult = await this.dataGenerator.createAssessment(
          selectedAssetGroupId,
          selectedQuestionnaireId,
          customName
        );
        if (!assessmentResult) {
          console.error("Failed to create assessment.");
          return;
        }

        console.log(
          `✅ Assessment created with ID: ${assessmentResult.id}, Status: ${assessmentResult.status}`
        );
      } else if (action === "create_interview") {
        // Step 1: Select company
        await this.dataGenerator.selectCompany();

        // Step 2: Select assessment
        const selectedAssessmentId =
          await this.dataGenerator.selectAssessment();

        // Step 3: Ask if this should be a public interview
        const { isPublic } = await inquirer.prompt([
          {
            type: "confirm",
            name: "isPublic",
            message: "Should this interview be public (accessible via access code)?",
            default: false,
          },
        ]);

        let selectedRoleIds: number[] = [];
        // let selectedContactIds: number[] = [];

        if (isPublic) {
          // Step 4a: For public interviews, show contacts with full context
          const contactSelection = await this.dataGenerator.selectContactsForAssessment(selectedAssessmentId);
          
          if (contactSelection.length === 0) {
            console.log("❌ No contacts found for this assessment. Cannot create public interview.");
            return;
          }

          console.log(`\n✅ Selected ${contactSelection.length} contact(s) for public interviews.`);
          
          // Step 5: Create one interview per selected contact
          console.log(`Creating ${contactSelection.length} public interview(s) for assessment...`);

          for (const contact of contactSelection) {
            console.log(`Creating interview for ${contact.fullName}...`);
            
            // Generate a unique access code for each public interview
            const accessCode = `PUB-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`.toUpperCase();
            
            const publicConfig = {
              access_code: accessCode,
              enabled: true,
              interview_contact_id: contact.contactId
            };

            await this.dataGenerator.createInterviewForAssessmentWithPublicConfig(
              selectedAssessmentId,
              contact.roleIds, // Use this contact's specific role IDs
              publicConfig
            );
          }

          console.log(`✅ Successfully created ${contactSelection.length} public interview(s)!`);
        } else {
          // Step 4b: For private interviews, show applicable roles
          const roleIds = await this.dataGenerator.selectApplicableRoles(selectedAssessmentId);

          if (roleIds.length === 0) {
            console.log("❌ No applicable roles selected. Cannot create interview without roles.");
            return;
          }

          selectedRoleIds = roleIds;
          console.log(`\n✅ Selected ${selectedRoleIds.length} role(s) for private interviews.`);

          // Step 5: Get number of interviews for private mode
          const { numberOfInterviews } = await inquirer.prompt([
            {
              type: "input",
              name: "numberOfInterviews",
              message: "How many interviews would you like to create?",
              default: "1",
              validate: (input: string) => {
                const num = parseInt(input);
                return (
                  (Number.isInteger(num) && num > 0 && num <= 10) ||
                  "Please enter a number between 1 and 10"
                );
              },
              filter: (input: string) => parseInt(input),
            },
          ]);

          // Step 6: Create private interviews
          console.log(`Creating ${numberOfInterviews} private interview(s) for assessment...`);

          for (let i = 0; i < numberOfInterviews; i++) {
            const interviewNumber = i + 1;
            console.log(`Creating interview ${interviewNumber} of ${numberOfInterviews}...`);

            await this.dataGenerator.createInterviewForAssessment(
              selectedAssessmentId,
              selectedRoleIds
            );
          }

          console.log(`✅ Successfully created ${numberOfInterviews} private interview(s)!`);
        }
      } else if (action === "create_program") {
        // Step 1: Select company
        await this.dataGenerator.selectCompany();

        // Step 2: Get program details
        const programDetails = await this.promptForProgramDetails();

        let onsiteQuestionnaireId: number | undefined;
        let presiteQuestionnaireId: number | undefined;

        if (programDetails.includeOnsiteQuestionnaire) {
          console.log("\nSelect onsite questionnaire:");
          try {
            onsiteQuestionnaireId = await this.dataGenerator.selectQuestionnaire();
          } catch {
            console.log("No onsite questionnaire selected, continuing...");
          }
        }

        if (programDetails.includePresiteQuestionnaire) {
          console.log("\nSelect presite questionnaire:");
          try {
            presiteQuestionnaireId = await this.dataGenerator.selectQuestionnaire();
          } catch {
            console.log("No presite questionnaire selected, continuing...");
          }
        }

        // Step 3: Select metrics for the program
        console.log("\nSelect metrics for this program:");
        let selectedMetricIds: number[] = [];
        try {
          selectedMetricIds = await this.dataGenerator.selectMetrics();
        } catch {
          console.log("No metrics selected, continuing...");
        }

        console.log("\n📢 Creating program with the following details:");
        console.log(`Name: ${programDetails.name || "Auto-generated"}`);
        console.log(`Demo: ${programDetails.isDemo ? "Yes" : "No"}`);
        console.log(`Onsite Questionnaire: ${onsiteQuestionnaireId ? `ID ${onsiteQuestionnaireId}` : "None"}`);
        console.log(`Presite Questionnaire: ${presiteQuestionnaireId ? `ID ${presiteQuestionnaireId}` : "None"}`);
        console.log(`Phase Frequency: Every ${programDetails.phaseConfig.frequency} ${programDetails.phaseConfig.phaseUnit}`);
        console.log(`Number of Phases: ${programDetails.phaseConfig.numberOfPhases || "Random (3-5)"}`);
        console.log(`Selected Metrics: ${selectedMetricIds.length > 0 ? `${selectedMetricIds.length} metric(s)` : "None"}`);
        console.log();

        // Step 4: Create program
        console.log("Creating program...");
        const programResult = await this.dataGenerator.createProgram(
          programDetails.isDemo,
          onsiteQuestionnaireId,
          presiteQuestionnaireId,
          {
            ...programDetails.phaseConfig,
            metricIds: selectedMetricIds
          },
          programDetails.name
        );
        
        if (!programResult) {
          console.error("Failed to create program.");
          return;
        }

        console.log(
          `✅ Program created with ID: ${programResult.id}, Status: ${programResult.status}`
        );
      } else if (action === "add_program_data") {
        // Step 1: Select company
        await this.dataGenerator.selectCompany();

        // Step 2: Select program
        const selectedProgramId = await this.dataGenerator.selectProgram();

        // Step 3: Select program phase
        const selectedPhaseId = await this.dataGenerator.selectProgramPhase(selectedProgramId);

        // Step 4: Select data type
        const { dataType } = await inquirer.prompt([
          {
            type: "list",
            name: "dataType",
            message: "What type of data would you like to add?",
            choices: [
              {
                name: "📊 Metric Data - Add calculated metric values",
                value: "metric_data",
                short: "Metric Data",
              },
              {
                name: "🎤 Interview Data - Create interviews using program questionnaires",
                value: "interview_data",
                short: "Interview Data",
              },
            ],
          },
        ]);

        if (dataType === "metric_data") {
          // Step 5a: Get metrics associated with the program
          const programMetrics = await this.dataGenerator.getProgramMetrics(selectedProgramId);

          if (programMetrics.length === 0) {
            console.log("❌ No metrics are associated with this program. Cannot add metric data.");
            return;
          }

          // Step 6a: Ask about data generation method
          const { useRandomValues } = await inquirer.prompt([
            {
              type: "confirm",
              name: "useRandomValues",
              message: `Would you like to randomly generate values (0-100) for all ${programMetrics.length} metrics?`,
              default: programMetrics.length > 5, // Default to random for many metrics
            },
          ]);

          const metricData: Array<{ metricId: number; value: number; metricName: string }> = [];

          if (useRandomValues) {
            console.log("📊 Generating random values (0-100) for metrics:");
            for (const metric of programMetrics) {
              const randomValue = Math.floor(Math.random() * 101); // 0-100 inclusive
              metricData.push({
                metricId: metric.id,
                value: randomValue,
                metricName: metric.name,
              });
              console.log(`   📈 ${metric.name}: ${randomValue}`);
            }
          } else {
            console.log("📊 Enter values for each metric:");
            for (const metric of programMetrics) {
              const { value } = await inquirer.prompt([
                {
                  type: "input",
                  name: "value",
                  message: `Enter value for "${metric.name}"${metric.description ? ` (${metric.description})` : ""}:`,
                  validate: (input: string) => {
                    const num = parseFloat(input);
                    return !isNaN(num) || "Please enter a valid number";
                  },
                  filter: (input: string) => parseFloat(input),
                },
              ]);

              metricData.push({
                metricId: metric.id,
                value: value,
                metricName: metric.name,
              });
            }
          }

          // Step 7a: Confirm and save metric data
          console.log("\n📋 Summary of metric data to be added:");
          metricData.forEach((data) => {
            console.log(`   📊 ${data.metricName}: ${data.value}`);
          });

          const { confirm } = await inquirer.prompt([
            {
              type: "confirm",
              name: "confirm",
              message: "Add this metric data to the program phase?",
              default: true,
            },
          ]);

          if (confirm) {
            console.log("\nAdding metric data to program phase...");
            await this.dataGenerator.addMetricDataToProgram(selectedPhaseId, metricData);
          } else {
            console.log("❌ Operation cancelled. No data was added.");
          }
        } else if (dataType === "interview_data") {
          // Step 5b: Create interviews for the program
          await this.dataGenerator.addInterviewDataToProgram(selectedProgramId, selectedPhaseId);
        }
      } else if (action === "create_recommendations") {
        // Step 1: Select company
        await this.dataGenerator.selectCompany();

        // Step 2: Get number of recommendations to create
        const { numberOfRecommendations } = await inquirer.prompt([
          {
            type: "input",
            name: "numberOfRecommendations",
            message: "How many recommendations would you like to create?",
            default: "5",
            validate: (input: string) => {
              const num = parseInt(input);
              return (
                (Number.isInteger(num) && num > 0 && num <= 20) ||
                "Please enter a number between 1 and 20"
              );
            },
            filter: (input: string) => parseInt(input),
          },
        ]);

        // Step 3: Create recommendations
        console.log(`Creating ${numberOfRecommendations} recommendation(s)...`);
        await this.dataGenerator.createRecommendations(numberOfRecommendations);
      } else if (action === "seed_shared_roles") {
        await this.handleDataSeeding("roles");
      } else if (action === "seed_metric_definitions") {
        await this.handleDataSeeding("metrics");
      } else if (action === "seed_questionnaires") {
        await this.handleDataSeeding("questionnaires");
      } else if (action === "seed_all_data") {
        await this.handleDataSeeding("all");
      } else if (action === "generate_demo_data") {
        await this.handleDemoDataGeneration(selectedUserId);
      }
    } catch (error) {
      console.error(
        "❌ Error:",
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  }
}

const cli = new CLI();
await cli.run();
