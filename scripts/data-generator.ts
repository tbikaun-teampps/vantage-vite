import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import type { Database } from "../src/types/database.js";

import { company } from "../data/demo/company.ts";
import { shared_roles } from "../data/shared_roles.ts";

import Anthropic from "@anthropic-ai/sdk";

// Load environment variables from local .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, ".env");
config({ path: envPath });

const anthropic = new Anthropic({
  apiKey: process.env["ANTHROPIC_API_KEY"],
});

type SupabaseClient = ReturnType<typeof createClient<Database>>;

export class DataGenerator {
  supabase: SupabaseClient;
  companyId: string;
  impersonatedUserId: string;
  dryRun: boolean = true;
  contentMode: "llm" | "deterministic" = "deterministic";
  sharedRolesMap: Map<string, number> = new Map();

  constructor(
    dryRun: boolean = true,
    impersonatedUserId?: string,
    contentMode: "llm" | "deterministic" = "deterministic"
  ) {
    this.companyId = ""; // Will be set via CLI selection
    this.supabase = createClient<Database>(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_SERVICE_ROLE_KEY"]!
    );
    this.dryRun = dryRun;
    this.contentMode = contentMode;
    if (this.dryRun) {
      console.log("Running in dry-run mode. No changes will be made.");
    }
    this.impersonatedUserId =
      impersonatedUserId || "3fa85f64-5717-4562-b3fc-2c963f66afa6"; // Admin user in demo company

    // Validate API key if LLM mode is selected
    if (this.contentMode === "llm" && !process.env["ANTHROPIC_API_KEY"]) {
      console.warn(
        "⚠️  Warning: LLM mode selected but ANTHROPIC_API_KEY not found. Falling back to deterministic mode."
      );
      this.contentMode = "deterministic";
    }
  }

  async loadSharedRoles() {
    console.log("🔄 Loading shared roles from database...");

    const { data: dbSharedRoles, error } = await this.supabase
      .from("shared_roles")
      .select("id, name");

    if (error) {
      console.error("❌ Error loading shared roles:", error.message);
      throw error;
    }

    // Create a map of reference role ID to database role ID
    shared_roles.forEach((refRole) => {
      const dbRole = dbSharedRoles.find((db) => db.name === refRole.name);
      if (dbRole) {
        this.sharedRolesMap.set(refRole.id, dbRole.id);
      } else {
        console.warn(
          `⚠️ Warning: Shared role "${refRole.name}" not found in database`
        );
      }
    });

    console.log(`✅ Loaded ${this.sharedRolesMap.size} shared role mappings`);
  }

  /*
  Helper method to create contacts and associate them with entities
  */
  async createContacts(
    contacts: Array<{
      id: string;
      fullname: string;
      email: string;
      title?: string;
    }>,
    companyId: string,
    associationType:
      | "company"
      | "business_unit"
      | "region"
      | "site"
      | "asset_group"
      | "work_group"
      | "role",
    entityId: number | string
  ): Promise<number[]> {
    const createdContactIds: number[] = [];

    for (const contact of contacts) {
      if (this.dryRun) {
        console.log(
          `🧪 DRY RUN: Would create contact: ${contact.fullname} (${contact.email}) for ${associationType}`
        );
        createdContactIds.push(999); // Mock ID for dry run
        continue;
      }

      // Create contact in contacts table
      const { data: createdContact, error: contactError } = await this.supabase
        .from("contacts")
        .insert({
          company_id: companyId,
          full_name: contact.fullname,
          email: contact.email,
          title: contact.title,
          created_by: this.impersonatedUserId,
        })
        .select()
        .single();

      if (contactError) {
        console.error(
          `Error creating contact ${contact.fullname}:`,
          contactError
        );
        throw new Error(`Failed to create contact ${contact.fullname}`);
      }

      createdContactIds.push(createdContact.id);
      console.log(`   👤 Created contact: ${contact.fullname}`);

      // Create association in appropriate X_contacts table
      const associationTableMap = {
        company: "company_contacts",
        business_unit: "business_unit_contacts",
        region: "region_contacts",
        site: "site_contacts",
        asset_group: "asset_group_contacts",
        work_group: "work_group_contacts",
        role: "role_contacts",
      };

      const associationTable = associationTableMap[associationType];
      const associationData: any = {
        company_id: companyId,
        contact_id: createdContact.id,
        created_by: this.impersonatedUserId,
      };

      // Add the appropriate foreign key field
      if (associationType === "company") {
        // company_contacts table doesn't need additional foreign key
      } else if (associationType === "business_unit") {
        associationData.business_unit_id = entityId;
      } else if (associationType === "region") {
        associationData.region_id = entityId;
      } else if (associationType === "site") {
        associationData.site_id = entityId;
      } else if (associationType === "asset_group") {
        associationData.asset_group_id = entityId;
      } else if (associationType === "work_group") {
        associationData.work_group_id = entityId;
      } else if (associationType === "role") {
        associationData.role_id = entityId;
      }

      const { error: associationError } = await this.supabase
        .from(associationTable)
        .insert(associationData);

      if (associationError) {
        console.error(
          `Error creating ${associationType} contact association:`,
          associationError
        );
        throw new Error(
          `Failed to create ${associationType} contact association`
        );
      }

      console.log(`   🔗 Associated contact with ${associationType}`);
    }

    return createdContactIds;
  }

  /*
  Insert a new company into the database using the known structure
  loaded from the company.ts file.
  */
  async createCompany(name?: string, description?: string, isDemo = true) {
    console.log("📢 Creating company with full structure...");

    // Load shared roles first
    await this.loadSharedRoles();

    // Use company data from the imported file, or override with parameters
    const companyData = {
      name: name || company.name,
      description: description || company.description,
      is_demo: isDemo,
    };

    if (this.dryRun) {
      console.log("🧪 DRY RUN: Would create company:", companyData);
      console.log(
        "🧪 DRY RUN: Would create full structure with business units, regions, sites, etc."
      );
      if (!companyData.is_demo) {
        console.log(
          "🧪 DRY RUN: Would add user as owner in user_companies table"
        );
      }
      return "dry-run-company-id";
    }

    // 1. Create company
    const { data: createdCompany, error: companyError } = await this.supabase
      .from("companies")
      .insert({
        name: companyData.name,
        description: companyData.description,
        is_demo: companyData.is_demo,
        created_by: this.impersonatedUserId,
      })
      .select()
      .single();

    if (companyError) {
      console.error("Error creating company:", companyError);
      throw new Error("Failed to create company");
    }

    const companyId = createdCompany.id;
    console.log(
      `✅ Created company: ${companyData.name} with ID: ${companyId}`
    );

    // Add user as owner if it's not a demo company
    if (!companyData.is_demo) {
      const { error: userCompanyError } = await this.supabase
        .from("user_companies")
        .insert({
          company_id: companyId,
          user_id: this.impersonatedUserId,
          role: "owner",
          created_by: this.impersonatedUserId,
        });

      if (userCompanyError) {
        console.error("Error adding user as company owner:", userCompanyError);
        throw new Error("Failed to add user as company owner");
      }

      console.log(`✅ Added user as owner for company: ${companyData.name}`);
    }

    // 1.1. Create company contacts
    if (company.contacts && company.contacts.length > 0) {
      await this.createContacts(
        company.contacts,
        companyId,
        "company",
        companyId
      );
    }

    // 2. Create business units and their nested structure
    for (const bu of company.business_units) {
      const { data: createdBU, error: buError } = await this.supabase
        .from("business_units")
        .insert({
          name: bu.name,
          code: bu.code,
          description: bu.description,
          company_id: companyId,
          created_by: this.impersonatedUserId,
        })
        .select()
        .single();

      if (buError) throw buError;
      console.log(`   🏢 Created business unit: ${bu.name}`);

      // 2.1. Create business unit contacts
      if (bu.contacts && bu.contacts.length > 0) {
        await this.createContacts(
          bu.contacts,
          companyId,
          "business_unit",
          createdBU.id
        );
      }

      // 3. Create regions for this business unit
      for (const region of bu.regions) {
        const { data: createdRegion, error: regionError } = await this.supabase
          .from("regions")
          .insert({
            name: region.name,
            code: region.code,
            description: region.description,
            business_unit_id: createdBU.id,
            company_id: companyId,
            created_by: this.impersonatedUserId,
          })
          .select()
          .single();

        if (regionError) throw regionError;
        console.log(`     🌍 Created region: ${region.name}`);

        if (region.contacts && region.contacts.length > 0) {
          await this.createContacts(
            region.contacts,
            companyId,
            "region",
            createdRegion.id
          );
        }

        // 4. Create sites for this region
        for (const site of region.sites) {
          const { data: createdSite, error: siteError } = await this.supabase
            .from("sites")
            .insert({
              name: site.name,
              code: site.code,
              description: site.description,
              region_id: createdRegion.id,
              company_id: companyId,
              lat: site.lat,
              lng: site.lng,
              created_by: this.impersonatedUserId,
            })
            .select()
            .single();

          if (siteError) throw siteError;
          console.log(`       🏭 Created site: ${site.name}`);

          if (site.contacts && site.contacts.length > 0) {
            await this.createContacts(
              site.contacts,
              companyId,
              "site",
              createdSite.id
            );
          }

          // 5. Create asset groups for this site
          for (const assetGroup of site.asset_groups) {
            const { data: createdAssetGroup, error: assetGroupError } =
              await this.supabase
                .from("asset_groups")
                .insert({
                  name: assetGroup.name,
                  code: assetGroup.code,
                  description: assetGroup.description,
                  site_id: createdSite.id,
                  company_id: companyId,
                  created_by: this.impersonatedUserId,
                })
                .select()
                .single();

            if (assetGroupError) throw assetGroupError;
            console.log(`         ⚙️ Created asset group: ${assetGroup.name}`);

            if (assetGroup.contacts && assetGroup.contacts.length > 0) {
              await this.createContacts(
                assetGroup.contacts,
                companyId,
                "asset_group",
                createdAssetGroup.id
              );
            }

            // 6. Create work groups for this asset group
            for (const workGroup of assetGroup.work_groups) {
              const { data: createdWorkGroup, error: workGroupError } =
                await this.supabase
                  .from("work_groups")
                  .insert({
                    name: workGroup.name,
                    code: workGroup.code,
                    description: workGroup.description,
                    asset_group_id: createdAssetGroup.id,
                    company_id: companyId,
                    created_by: this.impersonatedUserId,
                  })
                  .select()
                  .single();

              if (workGroupError) throw workGroupError;
              console.log(
                `           📊 Created work group: ${workGroup.name}`
              );

              if (workGroup.contacts && workGroup.contacts.length > 0) {
                await this.createContacts(
                  workGroup.contacts,
                  companyId,
                  "work_group",
                  createdWorkGroup.id
                );
              }

              // 7. Create roles for this work group
              if (workGroup.roles && workGroup.roles.length > 0) {
                await this.createRolesRecursively(
                  workGroup.roles,
                  createdWorkGroup.id,
                  companyId
                );
              }
            }
          }
        }
      }
    }

    console.log(
      `✅ Successfully created complete company structure for: ${companyData.name}`
    );
    return companyId;
  }

  async createRolesRecursively(
    roles: Array<{
      shared_role_id: string;
      level?: string;
      contacts?: Array<{
        id: string;
        fullname: string;
        email: string;
        title?: string;
      }>;
      direct_reports?: Array<{
        shared_role_id: string;
        level?: string;
        contacts?: Array<{
          id: string;
          fullname: string;
          email: string;
          title?: string;
        }>;
        direct_reports?: Array<Record<string, unknown>>;
      }>;
    }>,
    workGroupId: number,
    companyId: string,
    parentRoleId?: number
  ) {
    for (const role of roles) {
      const dbSharedRoleId = this.sharedRolesMap.get(role.shared_role_id);

      if (!dbSharedRoleId) {
        console.warn(
          `⚠️ Warning: Shared role ID "${role.shared_role_id}" not found - skipping`
        );
        continue;
      }

      const { data: createdRole, error: roleError } = await this.supabase
        .from("roles")
        .insert({
          company_id: companyId,
          work_group_id: workGroupId,
          shared_role_id: dbSharedRoleId,
          reports_to_role_id: parentRoleId,
          level: (role.level ||
            "other") as Database["public"]["Enums"]["role_levels"],
          sort_order: 0,
          created_by: this.impersonatedUserId,
        })
        .select()
        .single();

      if (roleError) throw roleError;
      console.log(
        `             🎭 Created role: ${role.shared_role_id} → ID ${createdRole.id}`
      );

      // Create role contacts
      if (role.contacts && role.contacts.length > 0) {
        await this.createContacts(
          role.contacts,
          companyId,
          "role",
          createdRole.id
        );
      }

      // Recursively create direct reports
      if (role.direct_reports && role.direct_reports.length > 0) {
        await this.createRolesRecursively(
          role.direct_reports,
          workGroupId,
          companyId,
          createdRole.id
        );
      }
    }
  }

  async selectCompany(): Promise<void> {
    console.log("Fetching available companies...");

    const { data: companies, error: companiesError } = await this.supabase
      .from("companies")
      .select("id, name, description, is_demo")
      .eq("is_deleted", false)
      .order("name");

    if (companiesError) {
      console.error("Error fetching companies:", companiesError);
      throw new Error("Failed to fetch companies");
    }

    if (!companies || companies.length === 0) {
      console.error("No companies found.");
      throw new Error("No companies available");
    }

    const choices = companies.map((company) => ({
      name: `${company.name}${company.is_demo ? " (Demo)" : ""} - ${company.description || "No description"}`,
      value: company.id,
      short: company.name,
    }));

    const inquirer = await import("inquirer");
    const { selectedCompanyId } = await inquirer.default.prompt([
      {
        type: "list",
        name: "selectedCompanyId",
        message: "Select a company:",
        choices: choices,
        pageSize: 10,
      },
    ]);

    this.companyId = selectedCompanyId;
    const selectedCompany = companies.find((c) => c.id === selectedCompanyId);
    console.log(`Selected company: ${selectedCompany?.name}\n`);
  }

  async selectAssetGroup(): Promise<number> {
    if (!this.companyId) {
      throw new Error("Company must be selected first");
    }

    console.log("Fetching available asset groups for the selected company...");

    const { data: assetGroups, error: assetGroupsError } = await this.supabase
      .from("asset_groups")
      .select(
        `
        id,
        name,
        description,
        site_id,
        sites (
          name,
          region_id,
          regions (
            name,
            business_unit_id,
            business_units (
              name
            )
          )
        )
      `
      )
      .eq("company_id", this.companyId)
      .eq("is_deleted", false)
      .order("name");

    if (assetGroupsError) {
      console.error("Error fetching asset groups:", assetGroupsError);
      throw new Error("Failed to fetch asset groups");
    }

    if (!assetGroups || assetGroups.length === 0) {
      console.error("No asset groups found for this company.");
      throw new Error("No asset groups available");
    }

    const choices = assetGroups.map((ag) => {
      const hierarchy = ag.sites?.regions?.business_units?.name
        ? `${ag.sites.regions.business_units.name} > ${ag.sites.regions.name} > ${ag.sites.name}`
        : "Unknown hierarchy";

      return {
        name: `${ag.name} (${hierarchy})${ag.description ? ` - ${ag.description}` : ""}`,
        value: ag.id,
        short: ag.name,
      };
    });

    const inquirer = await import("inquirer");
    const { selectedAssetGroupId } = await inquirer.default.prompt([
      {
        type: "list",
        name: "selectedAssetGroupId",
        message: "Select an asset group:",
        choices: choices,
        pageSize: 10,
      },
    ]);

    const selectedAssetGroup = assetGroups.find(
      (ag) => ag.id === selectedAssetGroupId
    );
    console.log(`Selected asset group: ${selectedAssetGroup?.name}\n`);

    return selectedAssetGroupId;
  }

  async selectAssessment(): Promise<number> {
    if (!this.companyId) {
      throw new Error("Company must be selected first");
    }

    console.log("Fetching available assessments for the selected company...");

    const { data: assessments, error: assessmentsError } = await this.supabase
      .from("assessments")
      .select(
        `
        id,
        name,
        description,
        status,
        type,
        created_at,
        asset_groups (
          name,
          sites (
            name,
            regions (
              name,
              business_units (
                name
              )
            )
          )
        )
      `
      )
      .eq("company_id", this.companyId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (assessmentsError) {
      console.error("Error fetching assessments:", assessmentsError);
      throw new Error("Failed to fetch assessments");
    }

    if (!assessments || assessments.length === 0) {
      console.error("No assessments found for this company.");
      throw new Error("No assessments available");
    }

    const choices = assessments.map((assessment) => {
      const hierarchy = assessment.asset_groups?.sites?.regions?.business_units
        ?.name
        ? `${assessment.asset_groups.sites.regions.business_units.name} > ${assessment.asset_groups.sites.regions.name} > ${assessment.asset_groups.sites.name} > ${assessment.asset_groups.name}`
        : "Unknown hierarchy";

      const createdDate = new Date(assessment.created_at).toLocaleDateString();

      return {
        name: `${assessment.name} (${hierarchy}) - ${assessment.status} - ${createdDate}${assessment.description ? ` - ${assessment.description}` : ""}`,
        value: assessment.id,
        short: assessment.name,
      };
    });

    const inquirer = await import("inquirer");
    const { selectedAssessmentId } = await inquirer.default.prompt([
      {
        type: "list",
        name: "selectedAssessmentId",
        message: "Select an assessment:",
        choices: choices,
        pageSize: 10,
      },
    ]);

    const selectedAssessment = assessments.find(
      (a) => a.id === selectedAssessmentId
    );
    console.log(`Selected assessment: ${selectedAssessment?.name}\n`);

    return selectedAssessmentId;
  }

  async getApplicableRoleIds(assessmentId: number): Promise<number[]> {
    if (!this.companyId) {
      throw new Error("Company must be selected first");
    }

    // Get assessment details with questionnaire info
    const { data: assessment, error: assessmentError } = await this.supabase
      .from("assessments")
      .select(
        `
        id,
        name,
        questionnaire_id,
        asset_group_id,
        questionnaires (
          id,
          name
        )
      `
      )
      .eq("id", assessmentId)
      .eq("company_id", this.companyId)
      .single();

    if (assessmentError || !assessment) {
      console.error("Error fetching assessment:", assessmentError);
      throw new Error("Failed to fetch assessment details");
    }

    // Get all questionnaire questions and their required roles
    const { data: questionRoles, error: questionRolesError } =
      await this.supabase
        .from("questionnaire_question_roles")
        .select("shared_role_id")
        .eq("questionnaire_id", assessment.questionnaire_id)
        .eq("is_deleted", false);

    if (questionRolesError) {
      console.error("Error fetching question roles:", questionRolesError);
      throw new Error("Failed to fetch questionnaire question roles");
    }

    // Get all actual roles that exist in the specific asset group's work groups
    const { data: workGroups, error: workGroupsError } = await this.supabase
      .from("work_groups")
      .select("id")
      .eq("asset_group_id", assessment.asset_group_id!)
      .eq("is_deleted", false);

    if (workGroupsError) {
      console.error("Error fetching work groups:", workGroupsError);
      throw new Error("Failed to fetch work groups for asset group");
    }

    if (!workGroups || workGroups.length === 0) {
      console.log("No work groups found in the asset group.");
      return [];
    }

    const workGroupIds = workGroups.map((wg) => wg.id);

    const { data: actualRoles, error: actualRolesError } = await this.supabase
      .from("roles")
      .select("id, shared_role_id")
      .eq("company_id", this.companyId)
      .eq("is_deleted", false)
      .in("work_group_id", workGroupIds);

    if (actualRolesError) {
      console.error("Error fetching actual roles:", actualRolesError);
      throw new Error("Failed to fetch asset group roles");
    }

    if (!actualRoles || actualRoles.length === 0) {
      console.log("No roles found in the asset group hierarchy.");
      return [];
    }

    // Determine applicable roles based on questionnaire requirements
    let availableRoles: typeof actualRoles;

    if (!questionRoles || questionRoles.length === 0) {
      // No role requirements found - all questions are universal
      // This means ALL roles in the asset group are applicable
      availableRoles = actualRoles;
    } else {
      // Find intersection - questionnaire roles that actually exist in asset group
      const requiredSharedRoleIds = new Set(
        questionRoles.map((qr) => qr.shared_role_id)
      );
      availableRoles = actualRoles.filter(
        (role) =>
          role.shared_role_id && requiredSharedRoleIds.has(role.shared_role_id)
      );
    }

    // Deduplicate roles by shared_role_id (same role can exist in multiple work groups)
    const uniqueRolesMap = new Map<number, (typeof actualRoles)[0]>();
    availableRoles.forEach((role) => {
      if (role.shared_role_id && !uniqueRolesMap.has(role.shared_role_id)) {
        uniqueRolesMap.set(role.shared_role_id, role);
      }
    });
    availableRoles = Array.from(uniqueRolesMap.values());

    return availableRoles.map((role) => role.id);
  }

  async selectContactsForAssessment(
    assessmentId: number
  ): Promise<
    {
      contactId: number;
      fullName: string;
      email: string;
      roleNames: string[];
      roleIds: number[];
      location: string;
    }[]
  > {
    if (!this.companyId) {
      throw new Error("Company must be selected first");
    }

    console.log("Analyzing contacts for assessment...");

    // First, get applicable roles for this assessment (without user prompt)
    const applicableRoleIds = await this.getApplicableRoleIds(assessmentId);

    if (applicableRoleIds.length === 0) {
      console.log("No applicable roles found for this assessment.");
      return [];
    }

    // Get contacts associated with the applicable roles along with full company structure
    const { data: roleContacts, error: roleContactsError } = await this.supabase
      .from("role_contacts")
      .select(
        `
        contact_id,
        role_id,
        contacts (
          id,
          full_name,
          email,
          title
        ),
        roles (
          id,
          shared_roles (
            name
          ),
          work_groups (
            name,
            asset_groups (
              name,
              sites (
                name,
                regions (
                  name,
                  business_units (
                    name
                  )
                )
              )
            )
          )
        )
      `
      )
      .eq("company_id", this.companyId)
      .in("role_id", applicableRoleIds);

    if (roleContactsError) {
      console.error(
        "Error fetching contacts for assessment:",
        roleContactsError
      );
      throw new Error("Failed to fetch contacts for assessment");
    }

    if (!roleContacts || roleContacts.length === 0) {
      console.log("No contacts found for the applicable roles.");
      return [];
    }

    // Group contacts by contact_id and collect role info + location
    const contactsMap = new Map<
      number,
      {
        contactId: number;
        fullName: string;
        email: string;
        roleNames: string[];
        roleIds: number[];
        location: string;
      }
    >();

    roleContacts.forEach((rc) => {
      if (rc.contacts && rc.roles?.shared_roles) {
        const contactId = rc.contacts.id;
        const roleName = rc.roles.shared_roles.name;
        const roleId = rc.roles.id;

        // Build location string
        let location = "Unknown location";
        if (
          rc.roles.work_groups?.asset_groups?.sites?.regions?.business_units
        ) {
          const bu =
            rc.roles.work_groups.asset_groups.sites.regions.business_units.name;
          const region = rc.roles.work_groups.asset_groups.sites.regions.name;
          const site = rc.roles.work_groups.asset_groups.sites.name;
          const assetGroup = rc.roles.work_groups.asset_groups.name;
          const workGroup = rc.roles.work_groups.name;
          location = `${bu} > ${region} > ${site} > ${assetGroup} > ${workGroup}`;
        }

        if (!contactsMap.has(contactId)) {
          contactsMap.set(contactId, {
            contactId: contactId,
            fullName: rc.contacts.full_name,
            email: rc.contacts.email,
            roleNames: [],
            roleIds: [],
            location: location,
          });
        }

        const contact = contactsMap.get(contactId)!;
        contact.roleNames.push(roleName);
        contact.roleIds.push(roleId);
      }
    });

    const availableContacts = Array.from(contactsMap.values());

    if (availableContacts.length === 0) {
      console.log("No contacts found with valid roles and locations.");
      return [];
    }

    // Show contact information to user
    console.log(
      `\n📋 Found ${availableContacts.length} contact(s) for this assessment:`
    );
    availableContacts.forEach((contact) => {
      console.log(`   - ${contact.fullName} (${contact.email})`);
      console.log(`     Roles: ${contact.roleNames.join(", ")}`);
      console.log(`     Location: ${contact.location}`);
      console.log();
    });

    // Let user select which contacts to include
    const contactChoices = availableContacts.map((contact) => ({
      name: `${contact.fullName} (${contact.email}) - ${contact.roleNames.join(", ")} - ${contact.location}`,
      value: contact,
      checked: true, // Default to all contacts selected
    }));

    const inquirer = await import("inquirer");
    const { selectedContacts } = await inquirer.default.prompt({
      type: "checkbox",
      name: "selectedContacts",
      message:
        "Select which contacts should receive public interview invitations:",
      choices: contactChoices,
      validate: (input: unknown) =>
        (Array.isArray(input) && input.length > 0) ||
        "Please select at least one contact",
    });

    return selectedContacts;
  }

  async selectContactsForRoles(
    roleIds: number[]
  ): Promise<
    {
      contactId: number;
      fullName: string;
      email: string;
      roleNames: string[];
      roleIds: number[];
    }[]
  > {
    if (!this.companyId) {
      throw new Error("Company must be selected first");
    }

    console.log("Fetching contacts for the selected roles...");

    // Get contacts associated with the roles via role_contacts table
    const { data: roleContacts, error: roleContactsError } = await this.supabase
      .from("role_contacts")
      .select(
        `
        contact_id,
        role_id,
        contacts (
          id,
          full_name,
          email,
          title
        ),
        roles (
          id,
          shared_roles (
            name
          )
        )
      `
      )
      .eq("company_id", this.companyId)
      .in("role_id", roleIds);

    if (roleContactsError) {
      console.error("Error fetching role contacts:", roleContactsError);
      throw new Error("Failed to fetch contacts for roles");
    }

    if (!roleContacts || roleContacts.length === 0) {
      console.log("No contacts found for the selected roles.");
      return [];
    }

    // Group contacts by contact_id and collect role names and IDs
    const contactsMap = new Map<
      number,
      {
        contactId: number;
        fullName: string;
        email: string;
        roleNames: string[];
        roleIds: number[];
      }
    >();

    roleContacts.forEach((rc) => {
      if (rc.contacts && rc.roles?.shared_roles) {
        const contactId = rc.contacts.id;
        const roleId = rc.role_id;
        const roleName = rc.roles.shared_roles.name;

        if (!contactsMap.has(contactId)) {
          contactsMap.set(contactId, {
            contactId: contactId,
            fullName: rc.contacts.full_name,
            email: rc.contacts.email,
            roleNames: [],
            roleIds: [],
          });
        }

        const contact = contactsMap.get(contactId)!;
        contact.roleNames.push(roleName);
        contact.roleIds.push(roleId);
      }
    });

    return Array.from(contactsMap.values());
  }

  async selectApplicableRoles(assessmentId: number): Promise<number[]> {
    if (!this.companyId) {
      throw new Error("Company must be selected first");
    }

    console.log("Analyzing applicable roles for interview...");

    // Step 1: Get assessment details with questionnaire info
    const { data: assessment, error: assessmentError } = await this.supabase
      .from("assessments")
      .select(
        `
        id,
        name,
        questionnaire_id,
        asset_group_id,
        questionnaires (
          id,
          name
        )
      `
      )
      .eq("id", assessmentId)
      .eq("company_id", this.companyId)
      .single();

    if (assessmentError || !assessment) {
      console.error("Error fetching assessment:", assessmentError);
      throw new Error("Failed to fetch assessment details");
    }

    // Step 2: Get all questionnaire questions and their required roles
    const { data: questionRoles, error: questionRolesError } =
      await this.supabase
        .from("questionnaire_question_roles")
        .select(
          `
        shared_role_id,
        shared_roles (
          id,
          name,
          description
        ),
        questionnaire_questions (
          id,
          title,
          question_text
        )
      `
        )
        .eq("questionnaire_id", assessment.questionnaire_id)
        .eq("is_deleted", false);

    if (questionRolesError) {
      console.error("Error fetching question roles:", questionRolesError);
      throw new Error("Failed to fetch questionnaire question roles");
    }

    // Step 3: Get all actual roles that exist in the specific asset group's work groups
    // First get work groups for this asset group, then get roles for those work groups
    const { data: workGroups, error: workGroupsError } = await this.supabase
      .from("work_groups")
      .select("id")
      .eq("asset_group_id", assessment.asset_group_id!)
      .eq("is_deleted", false);

    if (workGroupsError) {
      console.error("Error fetching work groups:", workGroupsError);
      throw new Error("Failed to fetch work groups for asset group");
    }

    if (!workGroups || workGroups.length === 0) {
      console.log("No work groups found in the asset group.");
      return [];
    }

    const workGroupIds = workGroups.map((wg) => wg.id);
    console.log(
      `Found ${workGroupIds.length} work groups in asset group:`,
      workGroupIds
    );

    const { data: actualRoles, error: actualRolesError } = await this.supabase
      .from("roles")
      .select(
        `
        id,
        shared_role_id,
        work_group_id,
        shared_roles (
          id,
          name,
          description
        ),
        work_groups (
          id,
          name,
          asset_group_id
        )
      `
      )
      .eq("company_id", this.companyId)
      .eq("is_deleted", false)
      .in("work_group_id", workGroupIds);

    console.log("Actual roles in asset group:", actualRoles);

    if (actualRolesError) {
      console.error("Error fetching actual roles:", actualRolesError);
      throw new Error("Failed to fetch asset group roles");
    }

    if (!actualRoles || actualRoles.length === 0) {
      console.log("No roles found in the asset group hierarchy.");
      return [];
    }

    // Step 4: Determine applicable roles based on questionnaire requirements
    let availableRoles: typeof actualRoles;
    let analysisMessage: string;

    if (!questionRoles || questionRoles.length === 0) {
      // No role requirements found - all questions are universal
      // This means ALL roles in the asset group are applicable
      availableRoles = actualRoles;
      analysisMessage =
        "🌟 Universal Questionnaire: All questions can be answered by any role";
    } else {
      // Find intersection - questionnaire roles that actually exist in asset group
      const requiredSharedRoleIds = new Set(
        questionRoles.map((qr) => qr.shared_role_id)
      );
      availableRoles = actualRoles.filter(
        (role) =>
          role.shared_role_id && requiredSharedRoleIds.has(role.shared_role_id)
      );
      analysisMessage = `🎯 Role-Specific Questionnaire: Only certain roles can answer questions`;
    }

    // Step 4.5: Deduplicate roles by shared_role_id (same role can exist in multiple work groups)
    const uniqueRolesMap = new Map<number, (typeof actualRoles)[0]>();
    availableRoles.forEach((role) => {
      if (role.shared_role_id && !uniqueRolesMap.has(role.shared_role_id)) {
        uniqueRolesMap.set(role.shared_role_id, role);
      }
    });
    availableRoles = Array.from(uniqueRolesMap.values());

    if (availableRoles.length === 0) {
      console.log(
        "❌ No applicable roles found for this questionnaire and asset group combination."
      );
      return [];
    }

    // Step 5: Show analysis to user
    console.log(`\n📊 Role Analysis for ${assessment.name}:`);
    console.log(`   Questionnaire: ${assessment.questionnaires?.name}`);
    console.log(`   ${analysisMessage}`);
    if (questionRoles && questionRoles.length > 0) {
      const requiredSharedRoleIds = new Set(
        questionRoles.map((qr) => qr.shared_role_id)
      );
      console.log(
        `   Required roles by questions: ${requiredSharedRoleIds.size}`
      );
    } else {
      console.log(`   Questions with role requirements: 0 (all universal)`);
    }
    console.log(`   Available roles in asset group: ${actualRoles.length}`);
    console.log(
      `   Applicable roles for interview: ${availableRoles.length}\n`
    );

    // Step 6: Let user select which applicable roles to include
    const choices = availableRoles.map((role) => ({
      name: `${role.shared_roles?.name || "Unknown"} (${role.work_groups?.name || "Unknown Work Group"})${role.shared_roles?.description ? ` - ${role.shared_roles.description}` : ""}`,
      value: role.id,
      checked: true, // Default to all applicable roles selected
    }));

    const inquirer = await import("inquirer");
    const { selectedRoleIds } = await inquirer.default.prompt({
      type: "checkbox",
      name: "selectedRoleIds",
      message: "Select which roles should participate in this interview:",
      choices: choices,
      validate: (input: unknown) =>
        (Array.isArray(input) && input.length > 0) ||
        "Please select at least one role",
    });

    const selectedRoles = availableRoles.filter((role) =>
      selectedRoleIds.includes(role.id)
    );

    console.log(`\n✅ Selected ${selectedRoles.length} role(s) for interview:`);
    selectedRoles.forEach((role) => {
      console.log(
        `   - ${role.shared_roles?.name} (${role.work_groups?.name})`
      );
    });
    console.log();

    return selectedRoleIds;
  }

  async selectQuestionnaire(): Promise<number> {
    console.log("Fetching available questionnaires...");

    const { data: questionnaires, error: questionnairesError } =
      await this.supabase
        .from("questionnaires")
        .select(
          `
          id, 
          name, 
          description,
          questionnaire_questions!inner (
            id
          )
        `
        )
        .eq("is_deleted", false)
        .eq("questionnaire_questions.is_deleted", false);

    if (questionnairesError) {
      console.error("Error fetching questionnaires:", questionnairesError);
      throw new Error("Failed to fetch questionnaires");
    }

    if (!questionnaires || questionnaires.length === 0) {
      console.error("No questionnaires found.");
      throw new Error("No questionnaires available");
    }

    // Process questionnaires with their question counts
    const questionnairesWithCounts = questionnaires.map((q: any) => ({
      id: q.id,
      name: q.name,
      description: q.description,
      questionCount: Array.isArray(q.questionnaire_questions) ? q.questionnaire_questions.length : 1,
    }));

    const choices = questionnairesWithCounts.map((q) => ({
      name: `${q.name} (${q.questionCount} questions)${q.description ? ` - ${q.description}` : ""}`,
      value: q.id,
      short: q.name,
    }));

    const inquirer = await import("inquirer");
    const { selectedQuestionnaireId } = await inquirer.default.prompt([
      {
        type: "list",
        name: "selectedQuestionnaireId",
        message: "Select a questionnaire:",
        choices: choices,
        pageSize: 10,
      },
    ]);

    const selectedQuestionnaire = questionnairesWithCounts.find(
      (q) => q.id === selectedQuestionnaireId
    );
    console.log(
      `Selected questionnaire: ${selectedQuestionnaire?.name} (${selectedQuestionnaire?.questionCount} questions)\n`
    );

    return selectedQuestionnaireId;
  }

  async selectMetrics(): Promise<number[]> {
    console.log("Fetching available metrics...");

    const { data: metrics, error: metricsError } = await this.supabase
      .from("metric_definitions")
      .select("id, name, description, objective, provider, calculation_type")
      .order("name");

    if (metricsError) {
      console.error("Error fetching metrics:", metricsError);
      throw new Error("Failed to fetch metrics");
    }

    if (!metrics || metrics.length === 0) {
      console.log("No metrics found.");
      return [];
    }

    const choices = metrics.map((metric) => ({
      name: `${metric.name}${metric.description ? ` - ${metric.description}` : ""}${metric.provider ? ` (${metric.provider})` : ""}${metric.calculation_type ? ` [${metric.calculation_type}]` : ""}`,
      value: metric.id,
      short: metric.name,
      checked: false, // Default to unchecked
    }));

    const inquirer = await import("inquirer");
    const { selectedMetricIds } = await inquirer.default.prompt({
      type: "checkbox",
      name: "selectedMetricIds",
      message: "Select metrics for this program (optional):",
      choices: choices,
      pageSize: 15,
    });

    if (selectedMetricIds.length > 0) {
      const selectedMetrics = metrics.filter((m) =>
        selectedMetricIds.includes(m.id)
      );
      console.log(`\n✅ Selected ${selectedMetrics.length} metric(s):`);
      selectedMetrics.forEach((metric) => {
        console.log(`   - ${metric.name}`);
      });
      console.log();
    } else {
      console.log("No metrics selected for this program.\n");
    }

    return selectedMetricIds;
  }

  async selectProgram(): Promise<number> {
    if (!this.companyId) {
      throw new Error("Company must be selected first");
    }

    console.log("Fetching available programs for the selected company...");

    const { data: programs, error: programsError } = await this.supabase
      .from("programs")
      .select("id, name, description, status, is_demo, created_at")
      .eq("company_id", this.companyId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (programsError) {
      console.error("Error fetching programs:", programsError);
      throw new Error("Failed to fetch programs");
    }

    if (!programs || programs.length === 0) {
      console.error("No programs found for this company.");
      throw new Error("No programs available");
    }

    const choices = programs.map((program) => {
      const createdDate = new Date(program.created_at).toLocaleDateString();
      return {
        name: `${program.name} - ${program.status}${program.is_demo ? " (Demo)" : ""} - ${createdDate}${program.description ? ` - ${program.description}` : ""}`,
        value: program.id,
        short: program.name,
      };
    });

    const inquirer = await import("inquirer");
    const { selectedProgramId } = await inquirer.default.prompt([
      {
        type: "list",
        name: "selectedProgramId",
        message: "Select a program:",
        choices: choices,
        pageSize: 10,
      },
    ]);

    const selectedProgram = programs.find((p) => p.id === selectedProgramId);
    console.log(`Selected program: ${selectedProgram?.name}\n`);

    return selectedProgramId;
  }

  async selectProgramPhase(programId: number): Promise<number> {
    console.log("Fetching available phases for the selected program...");

    const { data: phases, error: phasesError } = await this.supabase
      .from("program_phases")
      .select("id, name, sequence_number, status, notes, planned_start_date, planned_end_date")
      .eq("program_id", programId)
      .eq("company_id", this.companyId)
      .order("sequence_number");

    if (phasesError) {
      console.error("Error fetching program phases:", phasesError);
      throw new Error("Failed to fetch program phases");
    }

    if (!phases || phases.length === 0) {
      console.error("No phases found for this program.");
      throw new Error("No program phases available");
    }

    const choices = phases.map((phase) => {
      const dateInfo = phase.planned_start_date 
        ? ` (${new Date(phase.planned_start_date).toLocaleDateString()})`
        : "";
      return {
        name: `Phase ${phase.sequence_number}: ${phase.name || "Unnamed"} - ${phase.status}${dateInfo}${phase.notes ? ` - ${phase.notes}` : ""}`,
        value: phase.id,
        short: `Phase ${phase.sequence_number}`,
      };
    });

    const inquirer = await import("inquirer");
    const { selectedPhaseId } = await inquirer.default.prompt([
      {
        type: "list",
        name: "selectedPhaseId",
        message: "Select a program phase:",
        choices: choices,
        pageSize: 10,
      },
    ]);

    const selectedPhase = phases.find((p) => p.id === selectedPhaseId);
    console.log(`Selected phase: Phase ${selectedPhase?.sequence_number} - ${selectedPhase?.name}\n`);

    return selectedPhaseId;
  }

  async getProgramMetrics(programId: number): Promise<Array<{
    id: number;
    name: string;
    description: string | null;
    provider: string | null;
    calculation_type: string | null;
    required_csv_columns: any;
  }>> {
    console.log("Fetching metrics associated with this program...");

    const { data: programMetrics, error: metricsError } = await this.supabase
      .from("program_metrics")
      .select(`
        metric_id,
        metric_definitions (
          id,
          name,
          description,
          provider,
          calculation_type,
          required_csv_columns
        )
      `)
      .eq("program_id", programId);

    if (metricsError) {
      console.error("Error fetching program metrics:", metricsError);
      throw new Error("Failed to fetch program metrics");
    }

    if (!programMetrics || programMetrics.length === 0) {
      console.log("No metrics are associated with this program.");
      return [];
    }

    // Extract metric definitions from the join result
    const metrics = programMetrics
      .map((pm: any) => pm.metric_definitions)
      .filter(Boolean);

    console.log(`Found ${metrics.length} metric(s) associated with this program:`);
    metrics.forEach((metric) => {
      console.log(`   - ${metric.name}${metric.description ? ` - ${metric.description}` : ""}`);
    });
    console.log();

    return metrics;
  }

  async addMetricDataToProgram(
    programPhaseId: number,
    metricData: Array<{
      metricId: number;
      value: number;
      metricName: string;
    }>
  ): Promise<void> {
    if (metricData.length === 0) {
      console.log("No metric data to add.");
      return;
    }

    const calculatedMetricsData = metricData.map((data) => ({
      program_phase_id: programPhaseId,
      metric_id: data.metricId,
      calculated_value: data.value,
      company_id: this.companyId,
      created_by: this.impersonatedUserId,
      data_source: "manual_entry",
    }));

    if (this.dryRun) {
      console.log("🧪 DRY RUN: Would create the following metric data:");
      metricData.forEach((data) => {
        console.log(`   📊 ${data.metricName}: ${data.value}`);
      });
      return;
    }

    console.log("Adding metric data to program phase...");

    const { error } = await this.supabase
      .from("calculated_metrics")
      .insert(calculatedMetricsData);

    if (error) {
      console.error("Error adding metric data:", error);
      throw new Error("Failed to add metric data to program");
    }

    console.log(`✅ Successfully added ${metricData.length} metric value(s) to program phase`);
    metricData.forEach((data) => {
      console.log(`   📊 ${data.metricName}: ${data.value}`);
    });
  }

  async fetchQuestionnaires() {
    const { data: questionnaires, error: questionnairesError } =
      await this.supabase
        .from("questionnaires")
        .select("id, name")
        .eq("is_deleted", false);

    if (questionnairesError) {
      console.error("Error fetching questionnaires:", questionnairesError);
      return;
    }

    if (!questionnaires || questionnaires.length === 0) {
      console.log("No questionnaires found.");
      return;
    }

    console.log("Available Questionnaires:");
    questionnaires.forEach((q) => {
      console.log(`- ID: ${q.id}, Name: ${q.name}`);
    });

    // For demo, pick the first questionnaire
    const selectedQuestionnaire = questionnaires[0];
    console.log(
      `\nSelected Questionnaire ID: ${selectedQuestionnaire.id}, Name: ${selectedQuestionnaire.name}`
    );

    // Fetch questions with their rating scales and roles for the selected questionnaire
    const { data: questions, error: questionsError } = await this.supabase
      .from("questionnaire_questions")
      .select(
        `
        *,
        questionnaire_question_rating_scales!inner (
          questionnaire_rating_scale_id,
          questionnaire_rating_scales (
            id,
            name,
            value,
            description,
            order_index
          )
        ),
        questionnaire_question_roles (
          shared_role_id,
          shared_roles (
            id,
            name,
            description
          )
        )
      `
      )
      .eq("questionnaire_id", selectedQuestionnaire.id)
      .eq("is_deleted", false);

    if (questionsError) {
      console.error(
        "Error fetching questions with rating scales:",
        questionsError
      );
      return;
    }

    if (!questions || questions.length === 0) {
      console.log("No questions found for the selected questionnaire.");
      return;
    }

    console.log(
      "Sample question with rating scales and roles:",
      JSON.stringify(questions[0], null, 2)
    );

    // ASSUMPTION: THERE IS MULTIPLE ASSOCIATED ROLES.

    // Convert questions to a format suitable for LLM prompt.
    // The goal of the LLM is to generate action(s) based on the question, context, associated roles, and rating scales.

    const questionPromptContext = questions
      .map((q) => {
        // Randomly select 1 to max available roles (if any exist)
        let selectedRoles: typeof q.questionnaire_question_roles = [];
        if (q.questionnaire_question_roles.length > 0) {
          const numRolesToSelect =
            Math.floor(Math.random() * q.questionnaire_question_roles.length) +
            1;
          const shuffledRoles = [...q.questionnaire_question_roles].sort(
            () => Math.random() - 0.5
          );
          selectedRoles = shuffledRoles.slice(0, numRolesToSelect);
        }

        // Randomly select 1 rating scale
        const randomRatingScaleIndex = Math.floor(
          Math.random() * q.questionnaire_question_rating_scales.length
        );
        const selectedRatingScale =
          q.questionnaire_question_rating_scales[randomRatingScaleIndex];

        // Check if the random rating scale is not the max value, if not, it requires actions from the LLM
        const maxRatingScaleValue = Math.max(
          ...q.questionnaire_question_rating_scales.map(
            (rs) => rs.questionnaire_rating_scales.value
          )
        );
        if (
          selectedRatingScale.questionnaire_rating_scales.value <
          maxRatingScaleValue
        ) {
          // Get a random number of actions to suggest between 1 and 3
          const numActionsToSuggest = Math.floor(Math.random() * 3) + 1;

          // Randomly decide to add a comment or not
          const addComment = true; // Math.random() < 0.5;

          // Generate prompt for LLM to suggest actions to improve rating
          const systemPrompt = `You are an expert in asset and maintenance management. Given the following question, context and answer. Your goal is to provide ${numActionsToSuggest} number of actions to improve the rating.`;

          //   Actions are in the format: {"title": string, "description": string}
          const resultFormat =
            "Your response should be in the following JSON format:\n" +
            "```json\n" +
            "{\n" +
            '  "actions": [\n' +
            `    { "title": "Action Title 1", "description": "Detailed description of action 1" },\n` +
            `    ... up to ${numActionsToSuggest} actions ...\n` +
            "  ]" +
            (addComment
              ? ',\n  "comment": "Additional context or explanation"'
              : "") +
            "\n}\n" +
            "```\n" +
            "Where each action is a concise description (one or two sentences) of a specific step that can be taken to improve the rating." +
            (addComment
              ? " Also include a brief comment explaining the overall situation or providing additional context."
              : "") +
            " IMPORTANT: ONLY RETURN THE JSON, DO NOT RETURN ANYTHING ELSE.";

          return (
            systemPrompt +
            "\n\n" +
            "## Question:\n" +
            q.question_text +
            "\n\n" +
            (q.context ? `## Context:\n${q.context}\n\n` : "") +
            (selectedRoles.length > 0
              ? "##Answer\n### Role(s):\n" +
                selectedRoles
                  .map(
                    (r) => `- ${r.shared_roles.name} (ID: ${r.shared_role_id})`
                  )
                  .join("\n") +
                "\n"
              : "") +
            "### Rating Scale:\n" +
            `${selectedRatingScale.questionnaire_rating_scales.value} (${selectedRatingScale.questionnaire_rating_scales.name}): ${selectedRatingScale.questionnaire_rating_scales.description} (ID: ${selectedRatingScale.questionnaire_rating_scales.id})` +
            "\n\n" +
            resultFormat
          );
        }
        return null; // Return null for questions that don't need actions
      })
      .filter((prompt): prompt is string => prompt !== null); // Filter out null values

    if (questionPromptContext.length === 0) {
      console.log(
        "No questions need improvement actions (all randomly selected ratings were already at maximum)."
      );
      return;
    }

    // Show sample of llm prompt context
    console.log("Sample LLM Prompt Context:\n\n", questionPromptContext[0]);

    // Check if randomly sampled rating scale is not the highest (i.e. needs improvement).
    // If so, generate prompt for LLM to suggest actions to improve rating.

    const msg = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 1024,
      messages: [{ role: "user", content: questionPromptContext[0] }],
    });
    console.log("Anthropic Response:", msg);

    // Handle different content types properly
    const textContent = msg.content.find((block) => block.type === "text");
    if (textContent && "text" in textContent) {
      console.log("Generated Actions:", textContent.text);
    }
  }

  /*
   * Create an assessment.
   */
  async createAssessment(
    assetGroupId: number,
    questionnaireId: number,
    customName?: string
  ): Promise<{ id: number; status: string } | undefined> {
    // Use the assetGroupId to fetch the related site, region, and business unit.
    // This is via company > business unit > region > site > asset group
    const { data: assetGroup, error: assetGroupError } = await this.supabase
      .from("asset_groups")
      .select(
        `
            id,
            name,
            site_id,
            sites (
                id,
                name,
                region_id,
                regions (
                    id,
                    name,
                    business_unit_id,
                    business_units (
                        id,
                        name
                    )
                )
            )
            `
      )
      .eq("id", assetGroupId)
      .eq("is_deleted", false)
      .single();

    if (assetGroupError) {
      console.error("Error fetching asset group:", assetGroupError);
      return;
    }

    if (!assetGroup) {
      console.error(`Asset group with ID ${assetGroupId} not found.`);
      return;
    }

    if (!assetGroup.sites) {
      console.error(`Site for asset group ID ${assetGroupId} not found.`);
      return;
    }

    if (!assetGroup.sites.regions) {
      console.error(`Region for site ID ${assetGroup.sites.id} not found.`);
      return;
    }

    if (!assetGroup.sites.regions.business_units) {
      console.error(
        `Business unit for region ID ${assetGroup.sites.region_id} not found.`
      );
      return;
    }

    const companyConfig = {
      business_unit_id: assetGroup.sites.regions.business_unit_id,
      region_id: assetGroup.sites.region_id,
      site_id: assetGroup.site_id,
      asset_group_id: assetGroup.id,
    };

    // Randomly select assessment status and type
    const assessmentStatuses: Database["public"]["Enums"]["assessment_statuses"][] =
      ["draft", "active", "under_review", "completed", "archived"];
    const assessmentTypes: Database["public"]["Enums"]["assessment_types"][] = [
      "onsite",
    ]; // "desktop" removed for now.
    const randomStatus =
      assessmentStatuses[Math.floor(Math.random() * assessmentStatuses.length)];
    const randomType = assessmentTypes[0]; //[Math.floor(Math.random() * assessmentTypes.length)];

    const assessmentData = {
      name: customName || `Assessment for ${assetGroup.name}`,
      description: `Assessment created for asset group ${assetGroup.name} using questionnaire ID ${questionnaireId}`,
      status: randomStatus,
      type: randomType,
      questionnaire_id: questionnaireId,
      company_id: this.companyId,
      created_by: this.impersonatedUserId,
      ...companyConfig,
    };

    // Generate assessment objectives once (used in both dry-run and actual creation)
    const numObjectives = Math.floor(Math.random() * 3) + 3; // Random between 3-5
    const objectiveTitles = [
      "Improve operational efficiency",
      "Enhance safety protocols",
      "Reduce environmental impact",
      "Optimize maintenance procedures",
      "Increase equipment reliability",
      "Minimize downtime",
      "Improve workforce productivity",
      "Enhance risk management",
      "Optimize resource utilization",
      "Improve quality control",
    ];
    const selectedObjectiveTitles = [...objectiveTitles]
      .sort(() => Math.random() - 0.5)
      .slice(0, numObjectives);

    if (this.dryRun) {
      console.log("🧪 DRY RUN: Would create assessment:", assessmentData);
      console.log(
        `🧪 DRY RUN: Would create ${numObjectives} assessment objectives with the titles: `,
        selectedObjectiveTitles
      );
      return { id: 999, status: randomStatus };
    }

    console.log("Creating assessment with data:", assessmentData);

    // Insert assessment into database
    const { data: createdAssessment, error: assessmentError } =
      await this.supabase
        .from("assessments")
        .insert(assessmentData)
        .select()
        .single();

    if (assessmentError) {
      console.error("Error creating assessment:", assessmentError);
      throw new Error("Failed to create assessment");
    }

    console.log(
      `✅ Created assessment: ${assessmentData.name} with ID: ${createdAssessment.id}, Status: ${randomStatus}, Type: ${randomType}`
    );

    // Create assessment objectives using the pre-selected titles
    for (const title of selectedObjectiveTitles) {
      const objectiveData = {
        assessment_id: createdAssessment.id,
        company_id: this.companyId,
        title: title,
        description: `${title} for ${assetGroup.name}`,
        created_by: this.impersonatedUserId,
      };

      const { error: objectiveError } = await this.supabase
        .from("assessment_objectives")
        .insert(objectiveData);

      if (objectiveError) {
        console.error("Error creating assessment objective:", objectiveError);
        // Don't throw here - assessment creation was successful, objectives are supplementary
        console.warn(`⚠️  Failed to create objective: ${title}`);
      } else {
        console.log(`   📋 Created objective: ${title}`);
      }
    }

    return { id: createdAssessment.id, status: randomStatus };
  }

  /*
   * Create an interview based on a questionnaire.
   * Public interviews are for individuals and require an `interview_contact_id`.
   * roleIds are the roles of applicable people taking the interview.
   */
  async createInterview(
    questionnaireId: number,
    assessmentConfig: {
      id: number;
      status?: Database["public"]["Enums"]["assessment_statuses"];
    } | null = null,
    roleIds: number[] = [],
    programConfig: { id: number; phaseId: number } | null = null,
    publicConfig: {
      access_code: string;
      enabled: boolean;
      interview_contact_id: number;
    } | null = null
  ) {
    if (roleIds.length === 0) {
      throw new Error("At least one roleId must be provided for the interview");
    }

    // Validation: exactly one of assessment or program must be provided
    if (!assessmentConfig && !programConfig) {
      throw new Error(
        "Either assessmentConfig or programConfig must be provided"
      );
    }
    if (assessmentConfig && programConfig) {
      throw new Error(
        "Cannot provide both assessmentConfig and programConfig - only one is allowed"
      );
    }

    // Validation: all config elements must be provided
    if (assessmentConfig && typeof assessmentConfig.id !== "number") {
      throw new Error("assessmentConfig.id must be provided and be a number");
    }

    if (programConfig) {
      if (typeof programConfig.id !== "number") {
        throw new Error("programConfig.id must be provided and be a number");
      }
      if (typeof programConfig.phaseId !== "number") {
        throw new Error(
          "programConfig.phaseId must be provided and be a number"
        );
      }
    }

    if (publicConfig) {
      if (typeof publicConfig.access_code !== "string") {
        throw new Error(
          "publicConfig.access_code must be provided and be a string"
        );
      }
      if (typeof publicConfig.enabled !== "boolean") {
        throw new Error(
          "publicConfig.enabled must be provided and be a boolean"
        );
      }
      if (typeof publicConfig.interview_contact_id !== "number") {
        throw new Error(
          "publicConfig.interview_contact_id must be provided and be a number"
        );
      }
    }

    const interviewStatuses: Database["public"]["Enums"]["interview_statuses"][] =
      ["in_progress", "completed"];

    // Get random interview status
    const randomStatus =
      interviewStatuses[Math.floor(Math.random() * interviewStatuses.length)];

    const interviewName = `Interview for Questionnaire ${questionnaireId}${publicConfig ? " (Public)" : ""}${
      assessmentConfig ? ` (Assessment ${assessmentConfig.id})` : ""
    }${programConfig ? ` (Program ${programConfig.id})` : ""} - ${new Date().toISOString()}`;

    const interviewData = {
      name: interviewName,
      company_id: this.companyId,
      questionnaire_id: questionnaireId,
      notes: "",
      created_by: this.impersonatedUserId,
      status: randomStatus,
      ...(assessmentConfig || programConfig
        ? { interviewer_id: this.impersonatedUserId }
        : {}),
      ...(assessmentConfig ? { assessment_id: assessmentConfig.id } : {}),
      ...(programConfig
        ? {
            program_phase_id: programConfig.phaseId,
            program_id: programConfig.id,
          }
        : {}),
      ...(publicConfig
        ? {
            access_code: publicConfig.access_code,
            is_public: true,
            interview_contact_id: publicConfig.interview_contact_id,
            enabled: publicConfig.enabled,
          }
        : {}),
    };

    // Create data for interview_roles
    const interviewRolesData = roleIds.map((roleId) => ({
      role_id: roleId,
      company_id: this.companyId,
      // interview_id will be set after interview is created
    }));

    // Get all questions for the questionnaire
    const { data: questions, error: questionsError } = await this.supabase
      .from("questionnaire_questions")
      .select("id")
      .eq("is_deleted", false)
      .eq("questionnaire_id", questionnaireId);

    if (questionsError) {
      console.error(
        "Error fetching questions for questionnaire:",
        questionsError
      );
      throw new Error("Failed to fetch questionnaire questions");
    }

    if (!questions || questions.length === 0) {
      throw new Error(
        `No questions found for questionnaire ID ${questionnaireId}`
      );
    }

    // Get question-role mappings efficiently (single query to avoid N+1)
    const questionIds = questions.map((q) => q.id);
    const { data: questionRoles, error: questionRolesError } =
      await this.supabase
        .from("questionnaire_question_roles")
        .select("questionnaire_question_id, shared_role_id")
        .in("questionnaire_question_id", questionIds)
        .eq("questionnaire_id", questionnaireId)
        .eq("is_deleted", false);

    if (questionRolesError) {
      console.error("Error fetching question roles:", questionRolesError);
      throw new Error("Failed to fetch question role mappings");
    }

    // Create a map for efficient role lookups
    const questionRoleMap = new Map<number, Set<number>>();
    (questionRoles || []).forEach((qr) => {
      if (!questionRoleMap.has(qr.questionnaire_question_id)) {
        questionRoleMap.set(qr.questionnaire_question_id, new Set());
      }
      questionRoleMap.get(qr.questionnaire_question_id)!.add(qr.shared_role_id);
    });

    // Get shared_role_ids for the interview roles to check applicability
    const { data: interviewRoleData, error: roleDataError } =
      await this.supabase
        .from("roles")
        .select("id, shared_role_id")
        .in("id", roleIds)
        .eq("is_deleted", false);

    if (roleDataError) {
      console.error("Error fetching interview role data:", roleDataError);
      throw new Error("Failed to fetch interview role data");
    }

    const interviewSharedRoleIds = new Set(
      (interviewRoleData || []).map((r) => r.shared_role_id).filter(Boolean)
    );

    // Generate realistic interview response data
    const interviewResponsesData = questions.map((question) => {
      // Check if question is applicable to any of the interview roles
      const questionSharedRoles = questionRoleMap.get(question.id) || new Set();

      let isApplicable = true;
      if (questionSharedRoles.size > 0) {
        // Question has role restrictions, check if any interview roles match
        isApplicable = Array.from(questionSharedRoles).some((sharedRoleId) =>
          interviewSharedRoleIds.has(sharedRoleId)
        );
      }
      // If questionSharedRoles.size === 0, it's a universal question (applicable to all)

      // Generate realistic rating and comments based on content mode
      let ratingScore: number | null = null;
      let comments: string | null = null;
      let answeredAt: string | null = null;

      if (isApplicable && Math.random() > 0.1) {
        // 90% completion rate
        // Generate random rating between 1-5
        ratingScore = Math.floor(Math.random() * 5) + 1;

        if (this.contentMode === "deterministic") {
          comments = `Sample response for question ${question.id} (Rating: ${ratingScore}/5)`;
        } else {
          // For LLM mode, we could generate more realistic comments later
          comments = `Detailed assessment comment for question ${question.id}`;
        }

        answeredAt = new Date().toISOString();
      }

      return {
        questionnaire_question_id: question.id,
        company_id: this.companyId,
        // interview_id will be set after interview is created
        is_applicable: isApplicable,
        rating_score: ratingScore,
        comments: comments,
        answered_at: answeredAt,
      };
    });

    // Generate interview response actions data (for both dry run and actual execution)
    const responseActionsData = interviewResponsesData.map(
      (response, index) => {
        const actionTitle = this.dryRun
          ? "Review Response (Dry Run)"
          : "Follow Up Required";
        const actionDescription = this.dryRun
          ? `This is a dry run action for response ${index + 1}. In production, this would trigger follow-up activities.`
          : `Action required for response to question ${response.questionnaire_question_id}. Please review and follow up as necessary.`;

        return {
          questionnaire_question_id: response.questionnaire_question_id,
          company_id: this.companyId,
          description: actionDescription,
          title: actionTitle,
        };
      }
    );

    if (this.dryRun) {
      console.log("🧪 DRY RUN: Would create interview:", interviewData);
      console.log(
        `✅ DRY RUN: Interview would be created with status: ${randomStatus}`
      );
      console.log(
        `🧪 DRY RUN: Would create ${interviewRolesData.length} interview roles:`,
        interviewRolesData
      );
      console.log(
        `🧪 DRY RUN: Would create ${interviewResponsesData.length} interview responses:`,
        interviewResponsesData
      );
      console.log(
        `🧪 DRY RUN: Would create ${responseActionsData.length} interview response actions:`,
        responseActionsData
      );

      return;
    }

    console.log("Creating interview with data:", interviewData);

    // Insert interview into database
    const { data: createdInterview, error: interviewError } =
      await this.supabase
        .from("interviews")
        .insert(interviewData)
        .select()
        .single();

    if (interviewError) {
      console.error("Error creating interview:", interviewError);
      throw new Error("Failed to create interview");
    }

    console.log(
      `✅ Created interview: ${createdInterview.name} with ID: ${createdInterview.id}, Status: ${randomStatus}`
    );

    try {
      // Insert interview_roles
      const rolesWithInterviewId = interviewRolesData.map((role) => ({
        ...role,
        interview_id: createdInterview.id,
      }));

      const { error: rolesError } = await this.supabase
        .from("interview_roles")
        .insert(rolesWithInterviewId);

      if (rolesError) {
        console.error("Error creating interview roles:", rolesError);
        // Clean up the interview on failure
        await this.supabase
          .from("interviews")
          .delete()
          .eq("id", createdInterview.id);
        throw new Error("Failed to create interview roles");
      }

      console.log(
        `   🎭 Created ${rolesWithInterviewId.length} interview roles`
      );

      // Insert interview_responses
      const responsesWithInterviewId = interviewResponsesData.map(
        (response) => ({
          ...response,
          interview_id: createdInterview.id,
        })
      );

      const { data: createdResponses, error: responsesError } =
        await this.supabase
          .from("interview_responses")
          .insert(responsesWithInterviewId)
          .select("id, questionnaire_question_id");

      if (responsesError) {
        console.error("Error creating interview responses:", responsesError);
        // Clean up the interview on failure
        await this.supabase
          .from("interviews")
          .delete()
          .eq("id", createdInterview.id);
        throw new Error("Failed to create interview responses");
      }

      console.log(
        `   📝 Created ${responsesWithInterviewId.length} interview responses`
      );

      // Create interview_response_roles for applicable questions
      if (createdResponses && createdResponses.length > 0) {
        const responseRoleAssociations: Array<{
          interview_response_id: number;
          role_id: number;
          company_id: string;
          interview_id: number;
        }> = [];

        createdResponses.forEach((response) => {
          const questionSharedRoles =
            questionRoleMap.get(response.questionnaire_question_id) ||
            new Set();

          if (questionSharedRoles.size > 0) {
            // Question has role restrictions - randomly sample from matching roles
            // NOTE: Could be made configurable via class property (e.g., this.samplingRate = 0.5)
            const applicableInterviewRoles = (interviewRoleData || []).filter(
              (roleData) =>
                roleData.shared_role_id &&
                questionSharedRoles.has(roleData.shared_role_id)
            );

            // Random sample: 50% of applicable roles, minimum 1
            const sampleSize = Math.max(
              1,
              Math.floor(applicableInterviewRoles.length * 0.5)
            );
            const sampledRoles = applicableInterviewRoles
              .sort(() => Math.random() - 0.5)
              .slice(0, sampleSize);

            sampledRoles.forEach((roleData) => {
              responseRoleAssociations.push({
                interview_response_id: response.id,
                role_id: roleData.id,
                company_id: this.companyId,
                interview_id: createdInterview.id,
              });
            });
          } else {
            // Universal question - randomly sample from all interview roles
            // NOTE: Could be made configurable via class property (e.g., this.samplingRate = 0.5)
            const sampleSize = Math.max(
              1,
              Math.floor((interviewRoleData || []).length * 0.5)
            );
            const sampledRoles = (interviewRoleData || [])
              .sort(() => Math.random() - 0.5)
              .slice(0, sampleSize);

            sampledRoles.forEach((roleData) => {
              responseRoleAssociations.push({
                interview_response_id: response.id,
                role_id: roleData.id,
                company_id: this.companyId,
                interview_id: createdInterview.id,
              });
            });
          }
        });

        if (responseRoleAssociations.length > 0) {
          const { error: responseRolesError } = await this.supabase
            .from("interview_response_roles")
            .insert(responseRoleAssociations);

          if (responseRolesError) {
            console.warn(
              "Warning: Failed to create response role associations:",
              responseRolesError
            );
            // Don't fail the whole operation for response roles
          } else {
            console.log(
              `   🔗 Created ${responseRoleAssociations.length} response role associations`
            );
          }
        }
      }

      // Create interview_response_actions using pre-generated data
      if (createdResponses && createdResponses.length > 0) {
        const responseActions = responseActionsData.map(
          (actionData, index) => ({
            interview_id: createdInterview.id,
            interview_response_id: createdResponses[index].id,
            company_id: actionData.company_id,
            description: actionData.description,
            title: actionData.title,
          })
        );

        if (responseActions.length > 0) {
          const { error: actionsError } = await this.supabase
            .from("interview_response_actions")
            .insert(responseActions);

          if (actionsError) {
            console.warn(
              "Warning: Failed to create interview response actions:",
              actionsError
            );
            // Don't fail the whole operation for actions
          } else {
            console.log(
              `   ⚡ Created ${responseActions.length} interview response actions (production mode)`
            );
          }
        }
      }

      console.log(
        `✅ Successfully created complete interview with all associations`
      );
    } catch (error) {
      console.error("Error in interview creation process:", error);
      throw error;
    }
  }

  /*
   * Helper method to create interviews for assessments specifically
   */
  async createInterviewForAssessment(
    assessmentId: number,
    roleIds: number[]
  ): Promise<void> {
    if (!this.companyId) {
      throw new Error("Company must be selected first");
    }

    console.log(
      `Creating interview for assessment ID: ${assessmentId} with ${roleIds.length} roles.`
    );

    // First, get the assessment to find its questionnaire
    const { data: assessment, error: assessmentError } = await this.supabase
      .from("assessments")
      .select("id, name, questionnaire_id")
      .eq("id", assessmentId)
      .eq("company_id", this.companyId)
      .single();

    if (assessmentError) {
      console.error("Error fetching assessment:", assessmentError);
      throw new Error("Failed to fetch assessment");
    }

    if (!assessment) {
      throw new Error(`Assessment with ID ${assessmentId} not found`);
    }

    // Use the existing createInterview method with assessment config
    await this.createInterview(
      assessment.questionnaire_id,
      {
        id: assessmentId,
      },
      roleIds
    );
  }

  /*
   * Helper method to create public interviews for assessments with specific contact configuration
   */
  async createInterviewForAssessmentWithPublicConfig(
    assessmentId: number,
    roleIds: number[],
    publicConfig: {
      access_code: string;
      enabled: boolean;
      interview_contact_id: number;
    }
  ): Promise<void> {
    if (!this.companyId) {
      throw new Error("Company must be selected first");
    }

    console.log(
      `Creating public interview for assessment ID: ${assessmentId} with contact ID: ${publicConfig.interview_contact_id}`
    );

    // First, get the assessment to find its questionnaire
    const { data: assessment, error: assessmentError } = await this.supabase
      .from("assessments")
      .select("id, name, questionnaire_id")
      .eq("id", assessmentId)
      .eq("company_id", this.companyId)
      .single();

    if (assessmentError) {
      console.error("Error fetching assessment:", assessmentError);
      throw new Error("Failed to fetch assessment");
    }

    if (!assessment) {
      throw new Error(`Assessment with ID ${assessmentId} not found`);
    }

    // Use the existing createInterview method with assessment config and public config
    await this.createInterview(
      assessment.questionnaire_id,
      {
        id: assessmentId,
      },
      roleIds,
      null, // programConfig
      publicConfig
    );
  }

  /*
   * Create a program.
   */
  async createProgram(
    isDemo: boolean = false,
    onsiteQuestionnaireId?: number,
    presiteQuestionnaireId?: number,
    config: {
      phaseUnit: "weeks" | "months" | "years";
      frequency: number;
      numberOfPhases?: number;
      metricIds?: number[];
    } = {
      phaseUnit: "months",
      frequency: 3,
    },
    customName?: string
  ): Promise<{ id: number; status: string } | undefined> {
    const programStatuses: Database["public"]["Enums"]["program_statuses"][] = [
      "draft",
      "active",
      "under_review",
      "completed",
      "archived",
    ];
    const randomStatus =
      programStatuses[Math.floor(Math.random() * programStatuses.length)];

    const programData = {
      name: customName?.trim() || `Program - ${new Date().toISOString()}`,
      description: `Program created on ${new Date().toISOString()}`,
      company_id: this.companyId,
      is_demo: isDemo,
      status: randomStatus,
      ...(onsiteQuestionnaireId
        ? { onsite_questionnaire_id: onsiteQuestionnaireId }
        : {}),
      ...(presiteQuestionnaireId
        ? { presite_questionnaire_id: presiteQuestionnaireId }
        : {}),
      created_by: this.impersonatedUserId,
    };

    // Generate program phases (use provided number or default to random 3-5)
    const numPhases =
      config.numberOfPhases || Math.floor(Math.random() * 3) + 3;

    // Calculate the current date to determine phase statuses chronologically
    const currentDate = new Date();

    const selectedPhaseNames = Array.from({ length: numPhases }, (_, i) => {
      const phaseNumber = i + 1;
      return `Assessment ${phaseNumber} (+${config.frequency * phaseNumber} ${config.phaseUnit})`;
    });

    // Generate program objectives (3-5 objectives)
    const numObjectives = Math.floor(Math.random() * 3) + 3; // 3-5 objectives
    const objectiveNames = [
      "Improve operational efficiency",
      "Enhance safety protocols",
      "Reduce environmental impact",
      "Optimize maintenance procedures",
      "Increase equipment reliability",
      "Minimize downtime",
      "Improve workforce productivity",
      "Enhance risk management",
      "Optimize resource utilization",
      "Improve quality control",
    ];
    const selectedObjectiveNames = [...objectiveNames]
      .sort(() => Math.random() - 0.5)
      .slice(0, numObjectives);

    if (this.dryRun) {
      console.log("🧪 DRY RUN: Would create program:", programData);
      console.log(
        `🧪 DRY RUN: Would create ${numPhases} program phases:`,
        selectedPhaseNames
      );
      console.log(
        `🧪 DRY RUN: Would create ${numObjectives} program objectives:`,
        selectedObjectiveNames
      );
      if (config.metricIds && config.metricIds.length > 0) {
        console.log(
          `🧪 DRY RUN: Would associate ${config.metricIds.length} metric(s) with program`
        );
      }
      return { id: 999, status: randomStatus };
    }

    console.log("Creating program with data:", programData);

    // Insert program into database
    const { data: createdProgram, error: programError } = await this.supabase
      .from("programs")
      .insert(programData)
      .select()
      .single();

    if (programError) {
      console.error("Error creating program:", programError);
      throw new Error("Failed to create program");
    }

    console.log(
      `✅ Created program: ${programData.name} with ID: ${createdProgram.id}, Status: ${randomStatus}`
    );

    // Create program phases with chronological status logic
    for (let i = 0; i < selectedPhaseNames.length; i++) {
      const phaseName = selectedPhaseNames[i];

      // Calculate when this phase should occur based on frequency
      const phaseDate = new Date(currentDate);
      const phaseNumber = i + 1;

      // Add time based on phase unit and frequency
      if (config.phaseUnit === "weeks") {
        phaseDate.setDate(
          currentDate.getDate() + config.frequency * phaseNumber * 7
        );
      } else if (config.phaseUnit === "months") {
        phaseDate.setMonth(
          currentDate.getMonth() + config.frequency * phaseNumber
        );
      } else if (config.phaseUnit === "years") {
        phaseDate.setFullYear(
          currentDate.getFullYear() + config.frequency * phaseNumber
        );
      }

      // Determine status based on chronological timing
      let phaseStatus: Database["public"]["Enums"]["program_phase_status"];
      const daysDifference = Math.floor(
        (phaseDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDifference < -90) {
        // Phase was more than 3 months ago - archived or completed
        phaseStatus = Math.random() < 0.7 ? "completed" : "archived";
      } else if (daysDifference < -30) {
        // Phase was 1-3 months ago - likely completed
        phaseStatus = "completed";
      } else if (daysDifference < 0) {
        // Phase was in the past month - could be completed or in_progress
        phaseStatus = Math.random() < 0.8 ? "completed" : "in_progress";
      } else if (daysDifference <= 30) {
        // Phase is within the next month - in_progress or scheduled
        phaseStatus = Math.random() < 0.6 ? "in_progress" : "scheduled";
      } else {
        // Phase is in the future - scheduled
        phaseStatus = "scheduled";
      }

      const phaseData = {
        program_id: createdProgram.id,
        company_id: this.companyId,
        name: phaseName,
        sequence_number: i + 1,
        status: phaseStatus,
        notes: `Phase ${i + 1} for ${programData.name} (Due: ${phaseDate.toISOString().split("T")[0]})`,
        created_by: this.impersonatedUserId,
      };

      const { error: phaseError } = await this.supabase
        .from("program_phases")
        .insert(phaseData);

      if (phaseError) {
        console.error("Error creating program phase:", phaseError);
        console.warn(`⚠️  Failed to create phase: ${phaseName}`);
      } else {
        console.log(
          `   📋 Created phase: ${phaseName} (Status: ${phaseStatus})`
        );
      }
    }

    // Create program objectives
    for (const objectiveName of selectedObjectiveNames) {
      const objectiveData = {
        program_id: createdProgram.id,
        company_id: this.companyId,
        name: objectiveName,
        description: `${objectiveName} for ${programData.name}`,
        created_by: this.impersonatedUserId,
      };

      const { error: objectiveError } = await this.supabase
        .from("program_objectives")
        .insert(objectiveData);

      if (objectiveError) {
        console.error("Error creating program objective:", objectiveError);
        console.warn(`⚠️  Failed to create objective: ${objectiveName}`);
      } else {
        console.log(`   🎯 Created objective: ${objectiveName}`);
      }
    }

    // Create program_metrics associations if metrics were provided
    if (config.metricIds && config.metricIds.length > 0) {
      const programMetricsData = config.metricIds.map((metricId) => ({
        program_id: createdProgram.id,
        metric_id: metricId,
        created_by: this.impersonatedUserId,
      }));

      const { error: metricsError } = await this.supabase
        .from("program_metrics")
        .insert(programMetricsData);

      if (metricsError) {
        console.error("Error creating program metrics:", metricsError);
        console.warn(`⚠️  Failed to associate metrics with program`);
      } else {
        console.log(`   📊 Associated ${config.metricIds.length} metric(s) with program`);
      }
    }

    console.log(
      `✅ Successfully created complete program structure for: ${programData.name}`
    );
    return { id: createdProgram.id, status: randomStatus };
  }

  /*
   * Select roles for program interviews (simplified version without assessment context)
   */
  async selectRolesForProgram(): Promise<number[]> {
    if (!this.companyId) {
      throw new Error("Company must be selected first");
    }

    console.log("Fetching available roles for program interview...");

    // Get all roles for the company
    const { data: roles, error: rolesError } = await this.supabase
      .from("roles")
      .select(
        `
        id,
        shared_role_id,
        shared_roles (
          id,
          name,
          description
        ),
        work_groups (
          id,
          name
        )
      `
      )
      .eq("company_id", this.companyId);

    if (rolesError || !roles) {
      console.error("Error fetching roles:", rolesError);
      throw new Error("Failed to fetch roles");
    }

    if (roles.length === 0) {
      console.log("❌ No roles found for this company.");
      return [];
    }

    // Deduplicate roles by shared_role_id
    const uniqueRolesMap = new Map<number, (typeof roles)[0]>();
    roles.forEach((role) => {
      if (role.shared_role_id && !uniqueRolesMap.has(role.shared_role_id)) {
        uniqueRolesMap.set(role.shared_role_id, role);
      }
    });
    const availableRoles = Array.from(uniqueRolesMap.values());

    console.log(`\n📊 Found ${availableRoles.length} available role(s) for interview\n`);

    // Let user select which roles to include
    const choices = availableRoles.map((role) => ({
      name: `${role.shared_roles?.name || "Unknown"} (${role.work_groups?.name || "Unknown Work Group"})${role.shared_roles?.description ? ` - ${role.shared_roles.description}` : ""}`,
      value: role.id,
      checked: true, // Default to all roles selected
    }));

    const inquirer = await import("inquirer");
    const { selectedRoleIds } = await inquirer.default.prompt({
      type: "checkbox",
      name: "selectedRoleIds",
      message: "Select which roles should participate in this interview:",
      choices: choices,
      validate: (input: unknown) =>
        (Array.isArray(input) && input.length > 0) ||
        "Please select at least one role",
    });

    const selectedRoles = availableRoles.filter((role) =>
      selectedRoleIds.includes(role.id)
    );

    console.log(`\n✅ Selected ${selectedRoles.length} role(s) for interview:`);
    selectedRoles.forEach((role) => {
      console.log(
        `   - ${role.shared_roles?.name} (${role.work_groups?.name})`
      );
    });
    console.log();

    return selectedRoleIds;
  }

  /*
   * Add interview data to a program phase using the program's questionnaires
   */
  async addInterviewDataToProgram(
    programId: number,
    phaseId: number
  ): Promise<void> {
    if (!this.companyId) {
      throw new Error("Company must be selected first");
    }

    console.log(`Adding interview data to program ID: ${programId}, phase ID: ${phaseId}`);

    // Step 1: Get the program to find its questionnaires
    const { data: program, error: programError } = await this.supabase
      .from("programs")
      .select("id, name, onsite_questionnaire_id, presite_questionnaire_id")
      .eq("id", programId)
      .eq("company_id", this.companyId)
      .single();

    if (programError) {
      console.error("Error fetching program:", programError);
      throw new Error("Failed to fetch program");
    }

    if (!program) {
      throw new Error(`Program with ID ${programId} not found`);
    }

    // Step 2: Check available questionnaires
    const availableQuestionnaires: Array<{ name: string; value: string; questionnaireId: number }> = [];

    if (program.onsite_questionnaire_id) {
      availableQuestionnaires.push({
        name: "🏢 Onsite Questionnaire - For onsite interviews",
        value: "onsite",
        questionnaireId: program.onsite_questionnaire_id,
      });
    }

    if (program.presite_questionnaire_id) {
      availableQuestionnaires.push({
        name: "📋 Presite Questionnaire - For presite interviews", 
        value: "presite",
        questionnaireId: program.presite_questionnaire_id,
      });
    }

    if (availableQuestionnaires.length === 0) {
      console.log("❌ No questionnaires are configured for this program. Cannot create interviews.");
      return;
    }

    // Step 3: Let user select questionnaire type
    const inquirer = await import("inquirer");
    const { questionnaireType } = await inquirer.default.prompt([
      {
        type: "list",
        name: "questionnaireType",
        message: "Which questionnaire would you like to use for the interviews?",
        choices: availableQuestionnaires,
      },
    ]);

    const selectedQuestionnaire = availableQuestionnaires.find(q => q.value === questionnaireType);
    if (!selectedQuestionnaire) {
      throw new Error("Selected questionnaire not found");
    }

    // Step 4: Ask if this should be a public interview
    const inquirer2 = await import("inquirer");
    const { isPublic } = await inquirer2.default.prompt([
      {
        type: "confirm",
        name: "isPublic",
        message: "Should this interview be public (accessible via access code)?",
        default: false,
      },
    ]);

    if (isPublic) {
      // Step 5a: For public interviews, first select roles then get contacts for those roles
      const roleIds = await this.selectRolesForProgram();

      if (roleIds.length === 0) {
        console.log("❌ No roles selected. Cannot create interview without roles.");
        return;
      }

      // Get contacts for the selected roles
      const contactSelection = await this.selectContactsForRoles(roleIds);
      
      if (contactSelection.length === 0) {
        console.log("❌ No contacts found for the selected roles. Cannot create public interview.");
        return;
      }

      console.log(`\n✅ Selected ${contactSelection.length} contact(s) for public interviews.`);
      
      // Step 6a: Create one interview per selected contact
      console.log(`Creating ${contactSelection.length} public interview(s) for program...`);

      for (const contact of contactSelection) {
        console.log(`Creating interview for ${contact.fullName}...`);
        
        // Generate a unique access code for each public interview
        const accessCode = `PUB-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`.toUpperCase();
        
        const publicConfig = {
          access_code: accessCode,
          enabled: true,
          interview_contact_id: contact.contactId
        };

        // Use only the specific role IDs for this contact
        const contactRoleIds = contact.roleIds;

        await this.createInterview(
          selectedQuestionnaire.questionnaireId,
          null, // assessmentConfig
          contactRoleIds,
          { id: programId, phaseId: phaseId }, // programConfig
          publicConfig
        );
      }

      console.log(`✅ Successfully created ${contactSelection.length} public interview(s)!`);
    } else {
      // Step 5b: For private interviews, select roles and create interviews
      const roleIds = await this.selectRolesForProgram();

      if (roleIds.length === 0) {
        console.log("❌ No roles selected. Cannot create interview without roles.");
        return;
      }

      console.log(`\n✅ Selected ${roleIds.length} role(s) for private interviews.`);

      // Step 6b: Get number of interviews for private mode
      const { numberOfInterviews } = await inquirer2.default.prompt([
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

      // Step 7b: Create private interviews
      console.log(`Creating ${numberOfInterviews} private interview(s) for program...`);

      for (let i = 0; i < numberOfInterviews; i++) {
        const interviewNumber = i + 1;
        console.log(`Creating interview ${interviewNumber} of ${numberOfInterviews}...`);

        await this.createInterview(
          selectedQuestionnaire.questionnaireId,
          null, // assessmentConfig
          roleIds,
          { id: programId, phaseId: phaseId } // programConfig
        );
      }

      console.log(`✅ Successfully created ${numberOfInterviews} private interview(s)!`);
    }
  }

  /*
   * Create recommendations from sample data, avoiding duplicates based on content (title)
   */
  async createRecommendations(numberOfRecommendations: number): Promise<void> {
    if (!this.companyId) {
      throw new Error("Company must be selected first");
    }

    // Import the sample recommendations
    const { recommendations } = await import("../data/demo/recommendations.ts");
    
    console.log(`📋 Checking for existing recommendations to avoid duplicates...`);

    // Get existing recommendations for this company
    const { data: existingRecommendations, error: existingError } = await this.supabase
      .from("recommendations")
      .select("title")
      .eq("company_id", this.companyId)
      .eq("is_deleted", false);

    if (existingError) {
      console.error("Error fetching existing recommendations:", existingError);
      throw new Error("Failed to check existing recommendations");
    }

    const existingTitles = new Set(existingRecommendations?.map(r => r.title) || []);
    
    // Filter out recommendations that already exist (by title)
    const availableRecommendations = recommendations.filter(rec => !existingTitles.has(rec.title));

    if (availableRecommendations.length === 0) {
      console.log("❌ No new recommendations available. All sample recommendations already exist for this company.");
      return;
    }

    if (availableRecommendations.length < numberOfRecommendations) {
      console.log(`⚠️ Only ${availableRecommendations.length} unique recommendations available (requested ${numberOfRecommendations}). Creating all available.`);
      numberOfRecommendations = availableRecommendations.length;
    }

    // Randomly select recommendations to create
    const shuffled = [...availableRecommendations].sort(() => Math.random() - 0.5);
    const selectedRecommendations = shuffled.slice(0, numberOfRecommendations);

    console.log(`\n📝 Creating ${selectedRecommendations.length} recommendation(s)...\n`);

    // Create each recommendation
    for (let i = 0; i < selectedRecommendations.length; i++) {
      const rec = selectedRecommendations[i];
      console.log(`Creating recommendation ${i + 1}/${selectedRecommendations.length}: "${rec.title}"`);

      const recommendationData = {
        company_id: this.companyId,
        title: rec.title,
        content: rec.content,
        context: rec.context,
        priority: rec.priority as Database["public"]["Enums"]["priority"],
        status: rec.status as Database["public"]["Enums"]["recommendation_status"],
        program_id: null, // For now, not linking to specific programs
      };

      if (this.dryRun) {
        console.log("   🔍 DRY RUN - Would create recommendation with data:", {
          title: recommendationData.title,
          content: recommendationData.content,
          priority: recommendationData.priority,
          status: recommendationData.status,
        });
      } else {
        const { error: insertError } = await this.supabase
          .from("recommendations")
          .insert(recommendationData);

        if (insertError) {
          console.error(`   ❌ Error creating recommendation: ${insertError.message}`);
          throw new Error(`Failed to create recommendation: ${rec.title}`);
        }

        console.log(`   ✅ Created recommendation with priority: ${rec.priority}`);
      }
    }

    console.log(`\n🎉 Successfully created ${selectedRecommendations.length} recommendation(s)!`);
    
    if (!this.dryRun) {
      console.log("\n📊 Summary:");
      const priorityCount = selectedRecommendations.reduce((acc, rec) => {
        acc[rec.priority] = (acc[rec.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      Object.entries(priorityCount).forEach(([priority, count]) => {
        console.log(`   ${priority}: ${count} recommendation(s)`);
      });
    }
  }
}
