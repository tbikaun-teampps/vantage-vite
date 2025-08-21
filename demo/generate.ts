#!/usr/bin/env node

/**
 * Demo Data Generator using Supabase JavaScript Client
 * Reads from data.json and creates complete company structures
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { company } from "../data/demo/company.ts";
import { shared_roles } from "../data/shared_roles.ts";
import { questionnaires } from "../data/demo/questionnaires.ts";
import { assessments } from "../data/demo/assessments.ts";
import { interviews } from "../data/demo/interviews.ts";
import { actions } from "../data/demo/actions.ts";

// Load environment variables from local .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, ".env");

config({ path: envPath });

class SupabaseDemoGenerator {
  constructor(supabaseUrl, supabaseKey, adminUserId) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.adminUserId = adminUserId;

    // Track inserted IDs for foreign key relationships
    this.idMappings = {
      companies: new Map(),
      business_units: new Map(),
      regions: new Map(),
      sites: new Map(),
      asset_groups: new Map(),
      work_groups: new Map(),
      roles: new Map(),
      contacts: new Map(),
      questionnaires: new Map(),
      questionnaire_sections: new Map(),
      questionnaire_steps: new Map(),
      questionnaire_questions: new Map(),
      questionnaire_rating_scales: new Map(),
      assessments: new Map(),
      assessment_objectives: new Map(),
      interviews: new Map(),
      interview_responses: new Map(),
      interview_response_actions: new Map(),
    };
  }

  loadDemoData() {
    return company;
  }

  async loadSharedRoles() {
    console.log("🔄 Loading shared roles from database...");

    try {
      const { data: dbSharedRoles, error } = await this.supabase
        .from("shared_roles")
        .select("id, name");

      if (error) {
        console.error("❌ Error loading shared roles:", error.message);
        throw error;
      }

      // Create a map of reference role ID to database role ID
      this.sharedRolesMap = new Map();

      // Map each reference role to its database counterpart by name
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
      return this.sharedRolesMap;
    } catch (error) {
      console.error("❌ Failed to load shared roles:", error.message);
      throw error;
    }
  }

  async insertContacts(contactsData, companyId) {
    if (!contactsData || contactsData.length === 0) return [];
    
    console.log(`👥 Creating ${contactsData.length} contacts...`);

    const contactInserts = contactsData.map((contact) => ({
      full_name: contact.fullname,
      email: contact.email,
      title: contact.title || null,
      company_id: companyId,
      created_by: this.adminUserId,
    }));

    const { data, error } = await this.supabase
      .from("contacts")
      .insert(contactInserts)
      .select();

    if (error) throw error;

    // Map contact reference IDs to database IDs
    contactsData.forEach((contact, index) => {
      this.idMappings.contacts.set(contact.id, data[index].id);
    });

    console.log(`✅ Created ${data.length} contacts`);
    return data;
  }

  async createContactJunctions(entityType, entityId, contactIds) {
    if (!contactIds || contactIds.length === 0) return;

    const junctionTableName = `${entityType}_contacts`;
    const entityColumnName = `${entityType}_id`;

    const junctionInserts = contactIds.map((contactId) => ({
      [entityColumnName]: entityId,
      contact_id: contactId,
      created_by: this.adminUserId,
    }));

    const { error } = await this.supabase
      .from(junctionTableName)
      .insert(junctionInserts);

    if (error) throw error;

    console.log(`   🔗 Created ${contactIds.length} contact associations for ${entityType}`);
  }

  async cleanupDemoQuestionnaires() {
    console.log("📋 Cleaning demo questionnaire hierarchies...");

    try {
      // 1. Get all demo questionnaire IDs
      const { data: demoQuestionnaires, error: questionnaireError } =
        await this.supabase
          .from("questionnaires")
          .select("id")
          .eq("is_demo", true);

      if (questionnaireError) {
        console.log(
          "⚠️ Error fetching demo questionnaires:",
          questionnaireError.message
        );
        return;
      }

      if (!demoQuestionnaires || demoQuestionnaires.length === 0) {
        console.log("✨ No demo questionnaires to clean up");
        return;
      }

      const demoQuestionnaireIds = demoQuestionnaires.map((q) => q.id);
      console.log(
        `🎯 Found ${demoQuestionnaireIds.length} demo questionnaires to clean up`
      );

      // 2. Get all sections for these questionnaires
      const { data: demoSections } = await this.supabase
        .from("questionnaire_sections")
        .select("id")
        .in("questionnaire_id", demoQuestionnaireIds);

      const demoSectionIds = demoSections?.map((s) => s.id) || [];

      // 3. Get all steps for these sections
      const { data: demoSteps } = await this.supabase
        .from("questionnaire_steps")
        .select("id")
        .in("questionnaire_section_id", demoSectionIds);

      const demoStepIds = demoSteps?.map((s) => s.id) || [];

      // 4. Get all questions for these steps
      const { data: demoQuestions } = await this.supabase
        .from("questionnaire_questions")
        .select("id")
        .in("questionnaire_step_id", demoStepIds);

      const demoQuestionIds = demoQuestions?.map((q) => q.id) || [];

      // 5. Cleanup in reverse dependency order
      const cleanupSteps = [
        {
          name: "questionnaire_question_rating_scales",
          column: "questionnaire_question_id",
          ids: demoQuestionIds,
        },
        {
          name: "questionnaire_question_roles",
          column: "questionnaire_question_id",
          ids: demoQuestionIds,
        },
        {
          name: "questionnaire_questions",
          column: "questionnaire_step_id",
          ids: demoStepIds,
        },
        {
          name: "questionnaire_steps",
          column: "questionnaire_section_id",
          ids: demoSectionIds,
        },
        {
          name: "questionnaire_sections",
          column: "questionnaire_id",
          ids: demoQuestionnaireIds,
        },
        {
          name: "questionnaire_rating_scales",
          column: "questionnaire_id",
          ids: demoQuestionnaireIds,
        },
        // Note: questionnaires will be cleaned up by cleanupDemoAssessments
        // since assessments reference questionnaires via foreign key
      ];

      for (const step of cleanupSteps) {
        if (step.ids.length > 0) {
          console.log(`🗑️ Cleaning ${step.name}...`);

          const { error, count } = await this.supabase
            .from(step.name)
            .delete()
            .in(step.column, step.ids);

          if (error) {
            console.log(`⚠️ Error cleaning ${step.name}:`, error.message);
          } else {
            console.log(
              `✅ Cleaned ${step.name} (${count || "unknown"} records)`
            );
          }
        }
      }

      console.log("✅ Demo questionnaire cleanup completed");
    } catch (error) {
      console.error("❌ Error during questionnaire cleanup:", error.message);
    }
  }

  async cleanupDemoAssessments(demoCompanyIds) {
    console.log("📊 Cleaning demo assessment hierarchies...");

    try {
      if (!demoCompanyIds || demoCompanyIds.length === 0) {
        console.log("✨ No demo companies found, skipping assessment cleanup");
        return;
      }

      // 1. Get all demo assessment IDs based on company_id
      const { data: demoAssessments, error: assessmentError } =
        await this.supabase
          .from("assessments")
          .select("id")
          .in("company_id", demoCompanyIds);

      if (assessmentError) {
        console.log(
          "⚠️ Error fetching demo assessments:",
          assessmentError.message
        );
        return;
      }

      if (!demoAssessments || demoAssessments.length === 0) {
        console.log("✨ No demo assessments to clean up");
        return;
      }

      const demoAssessmentIds = demoAssessments.map((a) => a.id);
      console.log(
        `🎯 Found ${demoAssessmentIds.length} demo assessments to clean up`
      );

      // 2. Get all demo interview IDs based on assessment_id
      const { data: demoInterviews } = await this.supabase
        .from("interviews")
        .select("id")
        .in("assessment_id", demoAssessmentIds);

      const demoInterviewIds = demoInterviews?.map((i) => i.id) || [];

      // 3. Get all demo interview response IDs based on interview_id
      const { data: demoInterviewResponses } = await this.supabase
        .from("interview_responses")
        .select("id")
        .in("interview_id", demoInterviewIds);

      const demoInterviewResponseIds = demoInterviewResponses?.map((r) => r.id) || [];

      // 4. Cleanup in reverse dependency order
      const cleanupSteps = [
        {
          name: "interview_response_actions",
          column: "interview_response_id",
          ids: demoInterviewResponseIds,
        },
        {
          name: "interview_response_roles",
          column: "interview_response_id",
          ids: demoInterviewResponseIds,
        },
        {
          name: "interview_responses",
          column: "interview_id",
          ids: demoInterviewIds,
        },
        {
          name: "interviews",
          column: "assessment_id",
          ids: demoAssessmentIds,
        },
        {
          name: "assessment_objectives",
          column: "assessment_id",
          ids: demoAssessmentIds,
        },
        {
          name: "assessments",
          column: "id",
          ids: demoAssessmentIds,
        },
      ];

      for (const step of cleanupSteps) {
        if (step.ids.length > 0) {
          console.log(`🗑️ Cleaning ${step.name}...`);

          const { error, count } = await this.supabase
            .from(step.name)
            .delete()
            .in(step.column, step.ids);

          if (error) {
            console.log(`⚠️ Error cleaning ${step.name}:`, error.message);
          } else {
            console.log(
              `✅ Cleaned ${step.name} (${count || "unknown"} records)`
            );
          }
        }
      }

      // Finally clean up questionnaires now that assessments are gone
      console.log("🗑️ Cleaning questionnaires...");
      const { data: demoQuestionnaires, error: questionnaireError } =
        await this.supabase
          .from("questionnaires")
          .select("id")
          .eq("is_demo", true);

      if (questionnaireError) {
        console.log("⚠️ Error fetching demo questionnaires:", questionnaireError.message);
      } else if (demoQuestionnaires && demoQuestionnaires.length > 0) {
        const demoQuestionnaireIds = demoQuestionnaires.map(q => q.id);
        
        const { error: questionsDeleteError } = await this.supabase
          .from("questionnaires")
          .delete()
          .in("id", demoQuestionnaireIds);

        if (questionsDeleteError) {
          console.log("⚠️ Error cleaning questionnaires:", questionsDeleteError.message);
        } else {
          console.log(`✅ Cleaned questionnaires (${demoQuestionnaireIds.length} records)`);
        }
      } else {
        console.log("✅ No questionnaires to clean");
      }

      console.log("✅ Demo assessment cleanup completed");
    } catch (error) {
      console.error("❌ Error during assessment cleanup:", error.message);
    }
  }

  async cleanupContactJunctions(demoCompanyIds) {
    console.log("👥 Cleaning up contact junction tables...");

    const junctionTables = [
      "role_contacts",
      "work_group_contacts", 
      "asset_group_contacts",
      "site_contacts",
      "region_contacts",
      "business_unit_contacts",
      "company_contacts"
    ];

    for (const tableName of junctionTables) {
      console.log(`🗑️ Cleaning ${tableName}...`);
      
      try {
        // First get contact IDs for demo companies
        const { data: demoContactIds, error: contactError } = await this.supabase
          .from("contacts")
          .select("id")
          .in("company_id", demoCompanyIds);

        if (contactError) {
          console.log(`⚠️ Error getting demo contacts for ${tableName}:`, contactError.message);
          continue;
        }

        if (demoContactIds && demoContactIds.length > 0) {
          const contactIds = demoContactIds.map(c => c.id);
          
          const { error } = await this.supabase
            .from(tableName)
            .delete()
            .in("contact_id", contactIds);

          if (error) {
            console.log(`⚠️ Error cleaning ${tableName}:`, error.message);
          } else {
            console.log(`✅ Cleaned ${tableName}`);
          }
        } else {
          console.log(`✅ No contacts to clean for ${tableName}`);
        }
      } catch (error) {
        console.log(`⚠️ Error cleaning ${tableName}:`, error.message);
      }
    }
  }

  async cleanupExistingDemoData() {
    console.log("🧹 Cleaning up existing demo data...");

    try {
      // First, get all demo company IDs
      const { data: demoCompanies, error: companyError } = await this.supabase
        .from("companies")
        .select("id")
        .eq("is_demo", true);

      if (companyError) {
        console.log(
          "⚠️ No existing demo companies found or error fetching:",
          companyError.message
        );
        return;
      }

      if (!demoCompanies || demoCompanies.length === 0) {
        console.log("✨ No existing demo data to clean up");
        return;
      }

      const demoCompanyIds = demoCompanies.map((c) => c.id);
      console.log(
        `🎯 Found ${demoCompanyIds.length} demo companies to clean up`
      );

      // Clean up questionnaires and assessments first to handle all interview-related dependencies
      await this.cleanupDemoQuestionnaires();
      await this.cleanupDemoAssessments(demoCompanyIds);

      // Clean up junction tables for contacts first (most dependent)
      await this.cleanupContactJunctions(demoCompanyIds);

      // Delete in reverse dependency order
      const cleanupSteps = [
        {
          name: "roles",
          column: "company_id",
          ids: demoCompanyIds,
        },
        {
          name: "work_groups",
          column: "company_id",
          ids: demoCompanyIds,
        },
        {
          name: "asset_groups",
          column: "company_id",
          ids: demoCompanyIds,
        },
        {
          name: "sites",
          column: "company_id",
          ids: demoCompanyIds,
        },
        {
          name: "regions",
          column: "company_id",
          ids: demoCompanyIds,
        },
        {
          name: "business_units",
          column: "company_id",
          ids: demoCompanyIds,
        },
        {
          name: "contacts",
          column: "company_id",
          ids: demoCompanyIds,
        },
      ];

      for (const step of cleanupSteps) {
        if (step.ids.length > 0) {
          console.log(`🗑️ Cleaning ${step.name}...`);

          const { error, count } = await this.supabase
            .from(step.name)
            .delete()
            .in(step.column, step.ids);

          if (error) {
            console.log(`⚠️ Error cleaning ${step.name}:`, error.message);
          } else {
            console.log(
              `✅ Cleaned ${step.name} (${count || "unknown"} records)`
            );
          }
        }
      }

      // Finally delete companies
      console.log(`🗑️ Cleaning companies...`);
      const { error: companiesError, count: companyCount } = await this.supabase
        .from("companies")
        .delete()
        .eq("is_demo", true);

      if (companiesError) {
        console.log(`⚠️ Error cleaning companies:`, companiesError.message);
      } else {
        console.log(
          `✅ Cleaned companies (${companyCount || "unknown"} records)`
        );
      }

      console.log("✅ Cleanup completed successfully");
    } catch (error) {
      console.error("❌ Error during cleanup:", error.message);
      // Don't throw - we want to continue with generation even if cleanup fails
    }
  }

  async insertCompany(companyData) {
    console.log(`📢 Creating company: ${companyData.name}`);

    // Create company
    const { data, error } = await this.supabase
      .from("companies")
      .insert({
        name: companyData.name,
        code: companyData.code,
        description: companyData.description,
        created_by: this.adminUserId,
        is_demo: true,
      })
      .select()
      .single();

    if (error) throw error;

    const companyId = data.id;
    this.idMappings.companies.set(companyData.name, companyId);
    console.log(`✅ Company created with ID: ${companyId}`);

    // Create contacts and junction table entries
    if (companyData.contacts && companyData.contacts.length > 0) {
      await this.insertContacts(companyData.contacts, companyId);
      
      const contactIds = companyData.contacts.map(contact => 
        this.idMappings.contacts.get(contact.id)
      );
      
      await this.createContactJunctions("company", companyId, contactIds);
    }

    return companyId;
  }

  async insertBusinessUnits(companyId, businessUnits) {
    console.log(`🏢 Creating ${businessUnits.length} business units...`);

    const inserts = businessUnits.map((bu) => ({
      name: bu.name,
      code: bu.code,
      description: bu.description,
      company_id: companyId,
      created_by: this.adminUserId,
    }));

    const { data, error } = await this.supabase
      .from("business_units")
      .insert(inserts)
      .select();

    if (error) throw error;

    // Map names to IDs and create contacts
    for (let index = 0; index < businessUnits.length; index++) {
      const bu = businessUnits[index];
      const businessUnitId = data[index].id;
      
      this.idMappings.business_units.set(bu.name, businessUnitId);
      
      // Create contacts and junction table entries
      if (bu.contacts && bu.contacts.length > 0) {
        await this.insertContacts(bu.contacts, companyId);
        
        const contactIds = bu.contacts.map(contact => 
          this.idMappings.contacts.get(contact.id)
        );
        
        await this.createContactJunctions("business_unit", businessUnitId, contactIds);
      }
    }

    return data;
  }

  async insertRegions(businessUnits, companyId) {
    console.log("🌍 Creating regions...");

    const allRegions = [];

    for (const bu of businessUnits) {
      const buId = this.idMappings.business_units.get(bu.name);

      const regionInserts = bu.regions.map((region) => ({
        name: region.name,
        code: region.code,
        description: region.description,
        business_unit_id: buId,
        company_id: companyId,
        created_by: this.adminUserId,
      }));

      const { data, error } = await this.supabase
        .from("regions")
        .insert(regionInserts)
        .select();

      if (error) throw error;

      // Map region names to IDs and create contacts
      for (let index = 0; index < bu.regions.length; index++) {
        const region = bu.regions[index];
        const regionId = data[index].id;
        
        this.idMappings.regions.set(
          `${bu.name}::${region.name}`,
          regionId
        );
        
        // Create contacts and junction table entries
        if (region.contacts && region.contacts.length > 0) {
          await this.insertContacts(region.contacts, companyId);
          
          const contactIds = region.contacts.map(contact => 
            this.idMappings.contacts.get(contact.id)
          );
          
          await this.createContactJunctions("region", regionId, contactIds);
        }
      }

      allRegions.push(...data);
    }

    return allRegions;
  }

  async insertSites(businessUnits, companyId) {
    console.log("🏭 Creating sites...");

    for (const bu of businessUnits) {
      for (const region of bu.regions) {
        const regionId = this.idMappings.regions.get(
          `${bu.name}::${region.name}`
        );

        const siteInserts = region.sites.map((site) => ({
          name: site.name,
          code: site.code,
          description: site.description,
          region_id: regionId,
          company_id: companyId,
          lat: site.lat,
          lng: site.lng,
          created_by: this.adminUserId,
        }));

        const { data, error } = await this.supabase
          .from("sites")
          .insert(siteInserts)
          .select();

        if (error) throw error;

        // Map site names to IDs and create contacts
        for (let index = 0; index < region.sites.length; index++) {
          const site = region.sites[index];
          const siteId = data[index].id;
          
          this.idMappings.sites.set(site.name, siteId);
          
          // Create contacts and junction table entries
          if (site.contacts && site.contacts.length > 0) {
            await this.insertContacts(site.contacts, companyId);
            
            const contactIds = site.contacts.map(contact => 
              this.idMappings.contacts.get(contact.id)
            );
            
            await this.createContactJunctions("site", siteId, contactIds);
          }
        }
      }
    }
  }

  async insertAssetGroups(businessUnits, companyId) {
    console.log("⚙️ Creating asset groups...");

    for (const bu of businessUnits) {
      for (const region of bu.regions) {
        for (const site of region.sites) {
          const siteId = this.idMappings.sites.get(site.name);

          const assetInserts = site.asset_groups.map((ag) => ({
            name: ag.name,
            code: ag.code,
            asset_type: ag.asset_type,
            description: ag.description,
            site_id: siteId,
            company_id: companyId,
            created_by: this.adminUserId,
          }));

          const { data, error } = await this.supabase
            .from("asset_groups")
            .insert(assetInserts)
            .select();

          if (error) throw error;

          // Map asset group names to IDs and create contacts
          for (let index = 0; index < site.asset_groups.length; index++) {
            const ag = site.asset_groups[index];
            const assetGroupId = data[index].id;
            
            this.idMappings.asset_groups.set(ag.name, assetGroupId);
            
            // Create contacts and junction table entries
            if (ag.contacts && ag.contacts.length > 0) {
              await this.insertContacts(ag.contacts, companyId);
              
              const contactIds = ag.contacts.map(contact => 
                this.idMappings.contacts.get(contact.id)
              );
              
              await this.createContactJunctions("asset_group", assetGroupId, contactIds);
            }
          }
        }
      }
    }
  }

  async insertWorkGroupsAndRoles(businessUnits, companyId) {
    console.log("📊 Creating work groups and roles...");

    for (const bu of businessUnits) {
      for (const region of bu.regions) {
        for (const site of region.sites) {
          for (const assetGroup of site.asset_groups) {
            const assetGroupId = this.idMappings.asset_groups.get(
              assetGroup.name
            );

            for (const workGroup of assetGroup.work_groups) {
              // Create work group
              const { data: workGroupData, error: workGroupError } =
                await this.supabase
                  .from("work_groups")
                  .insert({
                    name: workGroup.name,
                    code: workGroup.code,
                    description: workGroup.description,
                    asset_group_id: assetGroupId,
                    company_id: companyId,
                    created_by: this.adminUserId,
                  })
                  .select()
                  .single();

              if (workGroupError) throw workGroupError;

              const workGroupId = workGroupData.id;
              this.idMappings.work_groups.set(workGroup.name, workGroupId);
              console.log(
                `   📊 Created work group: "${workGroup.name}" → ID ${workGroupId}`
              );

              // Create work group contacts and junction table entries
              if (workGroup.contacts && workGroup.contacts.length > 0) {
                await this.insertContacts(workGroup.contacts, companyId);
                
                const contactIds = workGroup.contacts.map(contact => 
                  this.idMappings.contacts.get(contact.id)
                );
                
                await this.createContactJunctions("work_group", workGroupId, contactIds);
              }

              // Create roles for this work group (two-pass for hierarchy)
              if (workGroup.roles && workGroup.roles.length > 0) {
                await this.createRolesWithHierarchy(workGroup.roles, workGroupId, companyId);
              }
            }
          }
        }
      }
    }
  }

  async createRolesWithHierarchy(roles, workGroupId, companyId) {
    console.log(`     🎭 Creating roles with hierarchy for work group...`);
    
    // Pass 1: Create all roles without reports_to_role_id
    const roleMap = new Map(); // Maps reference role ID to database role ID
    const allRoles = this.flattenRoleHierarchy(roles);
    
    for (const role of allRoles) {
      const dbSharedRoleId = this.sharedRolesMap.get(role.shared_role_id);
      
      if (!dbSharedRoleId) {
        console.log(`   ⚠️ Warning: Shared role ID "${role.shared_role_id}" not found - skipping`);
        continue;
      }

      const { data: roleData, error: roleError } = await this.supabase
        .from("roles")
        .insert({
          company_id: companyId,
          work_group_id: workGroupId,
          shared_role_id: dbSharedRoleId,
          created_by: this.adminUserId,
          level: role.level || "other",
          sort_order: 0
        })
        .select()
        .single();

      if (roleError) throw roleError;

      const roleId = roleData.id;
      roleMap.set(role.id, roleId);
      this.idMappings.roles.set(`${companyId}::${role.id}`, roleId);
      
      // Create role contacts and junction table entries
      if (role.contacts && role.contacts.length > 0) {
        await this.insertContacts(role.contacts, companyId);
        
        const contactIds = role.contacts.map(contact => 
          this.idMappings.contacts.get(contact.id)
        );
        
        await this.createContactJunctions("role", roleId, contactIds);
      }
      
      console.log(`     📋 Created role with shared_role_id ${dbSharedRoleId} → ID ${roleId}`);
    }
    
    // Pass 2: Update roles with reports_to_role_id based on hierarchy
    for (const role of allRoles) {
      if (role.reports_to_role_id) {
        const roleId = roleMap.get(role.id);
        const reportsToRoleId = roleMap.get(role.reports_to_role_id);
        
        if (roleId && reportsToRoleId) {
          const { error: updateError } = await this.supabase
            .from("roles")
            .update({ reports_to_role_id: reportsToRoleId })
            .eq("id", roleId);
            
          if (updateError) throw updateError;
          
          console.log(`     🔗 Updated role ${roleId} to report to ${reportsToRoleId}`);
        }
      }
    }
  }

  flattenRoleHierarchy(roles) {
    const flattened = [];
    
    const processRole = (role, parentRoleId = null) => {
      const flatRole = {
        ...role,
        reports_to_role_id: parentRoleId
      };
      flattened.push(flatRole);
      
      // Process direct reports
      if (role.direct_reports && role.direct_reports.length > 0) {
        for (const directReport of role.direct_reports) {
          processRole(directReport, role.id);
        }
      }
    };
    
    // Start with top-level roles
    for (const role of roles) {
      processRole(role);
    }
    
    return flattened;
  }

  async insertQuestionnaire(questionnaireData) {
    console.log("📋 Creating questionnaire structure...");

    // 1. Create questionnaire
    const { data: questionnaire, error: questionnaireError } =
      await this.supabase
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
    this.idMappings.questionnaires.set(questionnaireData.id, questionnaireId);

    // 2. Create rating scales
    const ratingScaleInserts = questionnaireData.rating_scales.map(
      (scale, index) => ({
        name: scale.name,
        description: scale.description,
        order_index: scale.order_index,
        value: scale.value,
        questionnaire_id: questionnaireId,
        created_by: this.adminUserId,
      })
    );

    const { data: ratingScalesData, error: ratingScalesError } =
      await this.supabase
        .from("questionnaire_rating_scales")
        .insert(ratingScaleInserts)
        .select();

    if (ratingScalesError) throw ratingScalesError;

    // Map rating scale reference IDs to database IDs
    questionnaireData.rating_scales.forEach((scale, index) => {
      this.idMappings.questionnaire_rating_scales.set(
        scale.id,
        ratingScalesData[index].id
      );
    });

    // 3. Create sections
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
      this.idMappings.questionnaire_sections.set(section.id, sectionId);

      // 4. Create steps for this section
      for (const step of section.steps) {
        const { data: stepData, error: stepError } = await this.supabase
          .from("questionnaire_steps")
          .insert({
            title: step.title,
            order_index: step.order,
            expanded: true,
            questionnaire_section_id: sectionId,
            created_by: this.adminUserId,
          })
          .select()
          .single();

        if (stepError) throw stepError;

        const stepId = stepData.id;
        this.idMappings.questionnaire_steps.set(step.id, stepId);

        // 5. Create questions for this step
        const questionInserts = step.questions.map((question) => ({
          title: question.title,
          question_text: question.question_text,
          context: question.context,
          order_index: question.order,
          questionnaire_step_id: stepId,
          created_by: this.adminUserId,
        }));

        const { data: questionsData, error: questionsError } =
          await this.supabase
            .from("questionnaire_questions")
            .insert(questionInserts)
            .select();

        if (questionsError) throw questionsError;

        // Map question reference IDs to database IDs
        step.questions.forEach((question, index) => {
          this.idMappings.questionnaire_questions.set(
            question.id,
            questionsData[index].id
          );
        });

        // 6. Create question-specific rating scales and role associations
        for (const question of step.questions) {
          const questionId = this.idMappings.questionnaire_questions.get(
            question.id
          );

          // Create role associations for this question if applicable_roles exist
          if (
            question.applicable_roles &&
            question.applicable_roles.length > 0
          ) {
            console.log(
              `   🎭 Creating role associations for question "${question.title}"`
            );

            const roleAssociations = [];
            const skippedRoles = [];

            for (const roleRefId of question.applicable_roles) {
              // roleRefId is a reference ID from shared_role_name_to_id, need to map to database ID
              const dbSharedRoleId = this.sharedRolesMap.get(roleRefId);

              if (!dbSharedRoleId) {
                console.log(
                  `   ⚠️ Warning: Shared role reference "${roleRefId}" not found for question "${question.title}"`
                );
                skippedRoles.push(roleRefId);
                continue;
              }

              roleAssociations.push({
                questionnaire_question_id: questionId,
                shared_role_id: dbSharedRoleId,
                created_by: this.adminUserId,
              });
            }

            if (roleAssociations.length > 0) {
              const { error: roleAssocError } = await this.supabase
                .from("questionnaire_question_roles")
                .insert(roleAssociations);

              if (roleAssocError) throw roleAssocError;

              console.log(
                `   ✅ Associated ${roleAssociations.length} roles with question "${question.title}"`
              );
            }

            if (skippedRoles.length > 0) {
              console.log(
                `   ⚠️ Skipped ${skippedRoles.length} roles: ${skippedRoles.join(", ")}`
              );
            }
          }

          // Create rating scale associations for this question
          if (question.rating_scales && question.rating_scales.length > 0) {
            // Create associations between this question and rating scales using question-specific descriptions
            const ratingScaleAssociations = question.rating_scales
              .map((questionScale) => {
                // Find the master rating scale by reference ID
                const masterScaleId =
                  this.idMappings.questionnaire_rating_scales.get(
                    questionScale.questionnaire_rating_scale_id
                  );

                if (!masterScaleId) {
                  console.log(
                    `   ⚠️ Warning: Rating scale reference "${questionScale.questionnaire_rating_scale_id}" not found for question "${question.title}"`
                  );
                  return null;
                }

                return {
                  questionnaire_question_id: questionId,
                  questionnaire_rating_scale_id: masterScaleId,
                  description: questionScale.description, // Use question-specific description
                  created_by: this.adminUserId,
                };
              })
              .filter((assoc) => assoc !== null); // Remove null entries

            if (ratingScaleAssociations.length > 0) {
              const { error: scaleAssocError } = await this.supabase
                .from("questionnaire_question_rating_scales")
                .insert(ratingScaleAssociations);

              if (scaleAssocError) throw scaleAssocError;

              console.log(
                `   📏 Associated ${ratingScaleAssociations.length} rating scales with "${question.title}"`
              );
            } else {
              console.log(
                `   ⚠️ No valid rating scale associations created for "${question.title}"`
              );
            }
          } else {
            // Fallback: use global rating scales if question doesn't have specific ones
            const ratingScaleAssociations = questionnaireData.rating_scales.map(
              (scale) => ({
                questionnaire_question_id: questionId,
                questionnaire_rating_scale_id:
                  this.idMappings.questionnaire_rating_scales.get(scale.id),
                description: scale.description, // Use master description as fallback
                created_by: this.adminUserId,
              })
            );

            const { error: scaleAssocError } = await this.supabase
              .from("questionnaire_question_rating_scales")
              .insert(ratingScaleAssociations);

            if (scaleAssocError) throw scaleAssocError;

            console.log(
              `   📏 Used global rating scales for "${question.title}"`
            );
          }
        }
      }
    }

    console.log(
      `✅ Questionnaire created with ${questionnaireData.sections.length} sections`
    );
  }

  async insertInterviews(interviewsData) {
    console.log(`🎤 Creating ${interviewsData.length} interviews...`);

    for (const interview of interviewsData) {
      // Map reference assessment ID to database assessment ID
      const assessmentId = this.idMappings.assessments.get(
        interview.assessment_id
      );

      if (!assessmentId) {
        console.warn(
          `⚠️ Warning: Assessment "${interview.assessment_id}" not found - skipping interview "${interview.name}"`
        );
        continue;
      }

      // Create interview
      const { data: interviewData, error: interviewError } =
        await this.supabase
          .from("interviews")
          .insert({
            name: interview.name,
            status: interview.status,
            notes: interview.notes,
            assessment_id: assessmentId,
            created_by: this.adminUserId,
          })
          .select()
          .single();

      if (interviewError) throw interviewError;

      const interviewId = interviewData.id;
      this.idMappings.interviews.set(interview.id, interviewId);

      console.log(
        `   🎤 Created interview: "${interview.name}" → ID ${interviewId}`
      );

      // Create interview responses
      if (interview.responses && interview.responses.length > 0) {
        const responseInserts = interview.responses
          .map((response) => {
            // Map reference question ID to database question ID
            const questionId = this.idMappings.questionnaire_questions.get(
              response.question_id
            );

            if (!questionId) {
              console.warn(
                `   ⚠️ Warning: Question "${response.question_id}" not found - skipping response`
              );
              return null;
            }

            return {
              interview_id: interviewId,
              questionnaire_question_id: questionId,
              rating_score: response.rating_score,
              comments: response.comments,
              created_by: this.adminUserId,
            };
          })
          .filter((response) => response !== null); // Remove null entries

        if (responseInserts.length > 0) {
          const { data: responsesData, error: responsesError } =
            await this.supabase
              .from("interview_responses")
              .insert(responseInserts)
              .select();

          if (responsesError) throw responsesError;

          // Map response reference IDs to database IDs and create role associations
          for (let index = 0; index < interview.responses.length; index++) {
            const originalResponse = interview.responses[index];
            const responseData = responsesData[index];
            
            if (responseData) {
              this.idMappings.interview_responses.set(
                `${interview.id}::${originalResponse.question_id}`,
                responseData.id
              );

              // Create role associations for this response
              if (originalResponse.applicable_role_ids && originalResponse.applicable_role_ids.length > 0) {
                const roleAssociations = [];
                
                for (const sharedRoleId of originalResponse.applicable_role_ids) {
                  // Get the database shared role ID
                  const dbSharedRoleId = this.sharedRolesMap.get(sharedRoleId);
                  if (dbSharedRoleId) {
                    // Find company roles with this shared role ID
                    for (const [roleKey, companyRoleId] of this.idMappings.roles.entries()) {
                      // For now, we'll include the first matching role for each shared role
                      // In practice, you might want to query the database to find all roles
                      // with the matching shared_role_id
                      roleAssociations.push({
                        interview_response_id: responseData.id,
                        role_id: companyRoleId,
                        created_by: this.adminUserId,
                      });
                      break; // Take first matching role for now
                    }
                  }
                }

                // Insert role associations if we found any
                if (roleAssociations.length > 0) {
                  const { error: roleAssocError } = await this.supabase
                    .from("interview_response_roles")
                    .insert(roleAssociations);

                  if (roleAssocError) {
                    console.warn(
                      `   ⚠️ Warning: Failed to create role associations for response: ${roleAssocError.message}`
                    );
                  } else {
                    console.log(
                      `     🎭 Associated ${roleAssociations.length} roles with response`
                    );
                  }
                }
              }
            }
          }

          console.log(
            `     💬 Created ${responsesData.length} responses for "${interview.name}"`
          );
        }
      }
    }

    console.log(
      `✅ Created ${interviewsData.length} interviews successfully`
    );
  }

  async insertInterviewResponseActions() {
    console.log(`🎯 Creating response actions for interview responses...`);

    let totalActionsInserted = 0;

    for (const actionSet of actions) {
      // Find interview responses for this question ID
      const responseEntries = Array.from(this.idMappings.interview_responses.entries())
        .filter(([key]) => key.includes(actionSet.question_id));

      if (responseEntries.length === 0) {
        console.warn(`⚠️ Warning: No interview responses found for question "${actionSet.question_id}"`);
        continue;
      }

      for (const [responseKey, responseId] of responseEntries) {
        // Get the rating score for this response by querying the database
        const { data: responseData, error: responseError } = await this.supabase
          .from("interview_responses")
          .select("rating_score")
          .eq("id", responseId)
          .single();

        if (responseError) {
          console.warn(`⚠️ Warning: Could not fetch rating for response ${responseId}:`, responseError.message);
          continue;
        }

        const ratingScore = responseData.rating_score;

        // Find action options that match this rating score
        const matchingActions = actionSet.options.filter(option => option.score === ratingScore);

        if (matchingActions.length === 0) {
          console.log(`   📝 No actions found for response with rating ${ratingScore} on question "${actionSet.question_id}"`);
          continue;
        }

        // Insert matching actions
        const actionInserts = matchingActions.map(action => ({
          interview_response_id: responseId,
          title: action.title,
          description: action.description,
          created_by: this.adminUserId,
        }));

        const { data: actionsData, error: actionsError } = await this.supabase
          .from("interview_response_actions")
          .insert(actionInserts)
          .select();

        if (actionsError) {
          console.warn(`⚠️ Warning: Failed to insert actions for response ${responseId}:`, actionsError.message);
          continue;
        }

        // Map action reference IDs to database IDs
        matchingActions.forEach((action, index) => {
          if (actionsData[index]) {
            this.idMappings.interview_response_actions.set(
              `${responseId}::${action.id}`,
              actionsData[index].id
            );
          }
        });

        totalActionsInserted += actionsData.length;
        console.log(`     ✅ Created ${actionsData.length} actions for response with rating ${ratingScore}`);
      }
    }

    console.log(`✅ Created ${totalActionsInserted} response actions successfully`);
  }

  async insertAssessments(assessmentsData, companyId) {
    console.log(`📊 Creating ${assessmentsData.length} assessments...`);

    for (const assessment of assessmentsData) {
      // Map reference IDs to database IDs for foreign keys
      const questionnaireId = this.idMappings.questionnaires.get(
        assessment.questionnaire_id
      );

      // For company structure, we need to find the database IDs by matching the reference IDs
      // from the assessment data with the actual data structure we created
      let businessUnitId, regionId, siteId, assetGroupId;

      // Find the business unit, region, site, and asset group by reference ID
      const companyData = this.loadDemoData();

      for (const bu of companyData.business_units) {
        if (bu.id === assessment.business_unit_id) {
          businessUnitId = this.idMappings.business_units.get(bu.name);

          for (const region of bu.regions) {
            if (region.id === assessment.region_id) {
              regionId = this.idMappings.regions.get(
                `${bu.name}::${region.name}`
              );

              for (const site of region.sites) {
                if (site.id === assessment.site_id) {
                  siteId = this.idMappings.sites.get(site.name);

                  for (const assetGroup of site.asset_groups) {
                    if (assetGroup.id === assessment.asset_group_id) {
                      assetGroupId = this.idMappings.asset_groups.get(
                        assetGroup.name
                      );
                      break;
                    }
                  }
                  break;
                }
              }
              break;
            }
          }
          break;
        }
      }

      if (!questionnaireId) {
        console.warn(
          `⚠️ Warning: Questionnaire "${assessment.questionnaire_id}" not found - skipping assessment "${assessment.name}"`
        );
        continue;
      }

      if (!businessUnitId) {
        console.warn(
          `⚠️ Warning: Business unit "${assessment.business_unit_id}" not found - skipping assessment "${assessment.name}"`
        );
        continue;
      }

      if (!regionId) {
        console.warn(
          `⚠️ Warning: Region "${assessment.region_id}" not found - skipping assessment "${assessment.name}"`
        );
        continue;
      }

      if (!siteId) {
        console.warn(
          `⚠️ Warning: Site "${assessment.site_id}" not found - skipping assessment "${assessment.name}"`
        );
        continue;
      }

      if (!assetGroupId) {
        console.warn(
          `⚠️ Warning: Asset group "${assessment.asset_group_id}" not found - skipping assessment "${assessment.name}"`
        );
        continue;
      }

      // Create assessment
      const { data: assessmentData, error: assessmentError } =
        await this.supabase
          .from("assessments")
          .insert({
            name: assessment.name,
            description: assessment.description,
            status: assessment.status,
            type: assessment.type,
            questionnaire_id: questionnaireId,
            company_id: companyId,
            business_unit_id: businessUnitId,
            region_id: regionId,
            site_id: siteId,
            asset_group_id: assetGroupId,
            created_by: this.adminUserId,
          })
          .select()
          .single();

      if (assessmentError) throw assessmentError;

      const assessmentId = assessmentData.id;
      this.idMappings.assessments.set(assessment.id, assessmentId);

      console.log(
        `   📊 Created assessment: "${assessment.name}" → ID ${assessmentId}`
      );

      // Create assessment objectives
      if (assessment.objectives && assessment.objectives.length > 0) {
        const objectiveInserts = assessment.objectives.map((objective) => ({
          title: objective.title,
          description: objective.description,
          assessment_id: assessmentId,
          created_by: this.adminUserId,
        }));

        const { data: objectivesData, error: objectivesError } =
          await this.supabase
            .from("assessment_objectives")
            .insert(objectiveInserts)
            .select();

        if (objectivesError) throw objectivesError;

        // Map objective reference IDs to database IDs
        assessment.objectives.forEach((objective, index) => {
          this.idMappings.assessment_objectives.set(
            objective.id,
            objectivesData[index].id
          );
        });

        console.log(
          `     🎯 Created ${objectivesData.length} objectives for "${assessment.name}"`
        );
      }
    }

    console.log(
      `✅ Created ${assessmentsData.length} assessments successfully`
    );
  }

  async generateDemoData() {
    try {
      console.log("🚀 Starting demo data generation...");

      const companyData = this.loadDemoData();

      // Load shared roles before generating data
      await this.loadSharedRoles();

      // Clean up existing demo data first
      await this.cleanupExistingDemoData();

      console.log("📊 Starting fresh data generation...");
      console.log(`\n📊 Processing company: ${companyData.name}`);

      // 1. Create company
      const companyId = await this.insertCompany(companyData);

      // 2. Create business structure
      await this.insertBusinessUnits(companyId, companyData.business_units);
      await this.insertRegions(companyData.business_units, companyId);
      await this.insertSites(companyData.business_units, companyId);
      await this.insertAssetGroups(companyData.business_units, companyId);

      // 3. Create work groups and roles (now nested in asset groups)
      await this.insertWorkGroupsAndRoles(
        companyData.business_units,
        companyId
      );

      // 4. Create questionnaire structure (now roles exist for associations)
      for (const questionnaire of questionnaires) {
        await this.insertQuestionnaire(questionnaire);
      }

      // 5. Create assessments (now questionnaires and company structure exist)
      await this.insertAssessments(assessments, companyId);

      // 6. Create interviews (now assessments exist)
      await this.insertInterviews(interviews);

      // 7. Create interview response actions (now interview responses exist)
      await this.insertInterviewResponseActions();

      console.log(`✅ Company ${companyData.name} completed successfully!`);

      console.log("\n🎉 All demo data generated successfully!");
      console.log("\n📈 Summary:");
      console.log(`Companies: ${this.idMappings.companies.size}`);
      console.log(`Business Units: ${this.idMappings.business_units.size}`);
      console.log(`Regions: ${this.idMappings.regions.size}`);
      console.log(`Sites: ${this.idMappings.sites.size}`);
      console.log(`Asset Groups: ${this.idMappings.asset_groups.size}`);
      console.log(`Work Groups: ${this.idMappings.work_groups.size}`);
      console.log(`Roles: ${this.idMappings.roles.size}`);
      console.log(`Questionnaires: ${this.idMappings.questionnaires.size}`);
      console.log(
        `Questionnaire Questions: ${this.idMappings.questionnaire_questions.size}`
      );
      console.log(
        `Questionnaire Rating Scales: ${this.idMappings.questionnaire_rating_scales.size}`
      );
      console.log(`Assessments: ${this.idMappings.assessments.size}`);
      console.log(
        `Assessment Objectives: ${this.idMappings.assessment_objectives.size}`
      );
      console.log(`Interviews: ${this.idMappings.interviews.size}`);
      console.log(
        `Interview Responses: ${this.idMappings.interview_responses.size}`
      );
      console.log(
        `Interview Response Actions: ${this.idMappings.interview_response_actions.size}`
      );

      console.log("\n✨ All association tables created successfully!");
    } catch (error) {
      console.error("❌ Error generating demo data:", error);
      console.error("Stack trace:", error.stack);

      // Log which step failed
      if (error.message.includes("companies")) {
        console.error("🔍 Failed during company creation");
      } else if (error.message.includes("questionnaire")) {
        console.error("🔍 Failed during questionnaire structure creation");
      } else if (error.message.includes("assessment")) {
        console.error("🔍 Failed during assessment creation");
      } else if (error.message.includes("interview")) {
        console.error("🔍 Failed during interview creation");
      }

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
    console.error("❌ Missing SUPABASE_URL environment variable");
    process.exit(1);
  }

  if (!SUPABASE_KEY) {
    console.error(
      "❌ Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY environment variable"
    );
    process.exit(1);
  }

  if (!ADMIN_USER_ID) {
    console.error("❌ Missing ADMIN_USER_ID environment variable");
    console.log("💡 You can set it in .env as ADMIN_USER_ID=your-user-id");
    process.exit(1);
  }

  console.log("🔧 Configuration:");
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
  console.log(
    `🔑 Using key: ${SUPABASE_KEY.substring(0, 20)}... ${
      process.env.SUPABASE_SERVICE_ROLE_KEY ? "(service role)" : "(anon)"
    }`
  );
  console.log(`👤 Admin User ID: ${ADMIN_USER_ID}`);

  const generator = new SupabaseDemoGenerator(
    SUPABASE_URL,
    SUPABASE_KEY,
    ADMIN_USER_ID
  );

  await generator.generateDemoData();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default SupabaseDemoGenerator;
