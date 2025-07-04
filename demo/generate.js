#!/usr/bin/env node

/**
 * Demo Data Generator using Supabase JavaScript Client
 * Reads from data.json and creates complete company structures
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
      questionnaires: new Map(),
      questionnaire_sections: new Map(),
      questionnaire_steps: new Map(),
      questionnaire_questions: new Map(),
      questionnaire_rating_scales: new Map(),
      org_charts: new Map(),
      roles: new Map(),
      assessments: new Map(),
      interviews: new Map(),
      interview_responses: new Map(),
      interview_response_actions: new Map(),
    };
  }

  async loadDemoData(filePath = "./data.json") {
    try {
      const data = await fs.readFile(filePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error loading demo data:", error.message);
      throw error;
    }
  }

  async loadSharedRoles() {
    console.log("🔄 Loading shared roles from database...");
    
    try {
      const { data: sharedRoles, error } = await this.supabase
        .from("shared_roles")
        .select("id, name");
      
      if (error) {
        console.error("❌ Error loading shared roles:", error.message);
        throw error;
      }
      
      // Create a map of role name to shared role ID
      this.sharedRolesMap = new Map();
      sharedRoles.forEach(role => {
        this.sharedRolesMap.set(role.name, role.id);
      });
      
      console.log(`✅ Loaded ${this.sharedRolesMap.size} shared roles`);
      return this.sharedRolesMap;
    } catch (error) {
      console.error("❌ Failed to load shared roles:", error.message);
      throw error;
    }
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
        {
          name: "questionnaires",
          column: "id",
          ids: demoQuestionnaireIds,
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

      console.log("✅ Demo questionnaire cleanup completed");
    } catch (error) {
      console.error("❌ Error during questionnaire cleanup:", error.message);
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

      // Delete in reverse dependency order
      const tables = [
        { name: "interview_response_actions", hasDemo: false },
        { name: "interview_response_roles", hasDemo: false },
        { name: "interview_responses", hasDemo: false },
        { name: "interviews", hasDemo: false },
        { name: "assessment_objectives", hasDemo: false },
        { name: "assessments", hasDemo: false },
        { name: "roles", hasDemo: false },
        { name: "org_charts", hasDemo: false },
        { name: "asset_groups", hasDemo: false },
        { name: "sites", hasDemo: false },
        { name: "regions", hasDemo: false },
        { name: "business_units", hasDemo: false },
        { name: "companies", hasDemo: true },
      ];

      for (const table of tables) {
        console.log(`🗑️ Cleaning ${table.name}...`);

        let deleteQuery;
        if (table.hasDemo) {
          // For companies table, use is_demo flag
          deleteQuery = this.supabase
            .from(table.name)
            .delete()
            .eq("is_demo", true);
        } else {
          // For other tables, use company_id
          deleteQuery = this.supabase
            .from(table.name)
            .delete()
            .in("company_id", demoCompanyIds);
        }

        const { error, count } = await deleteQuery;

        if (error) {
          console.log(`⚠️ Error cleaning ${table.name}:`, error.message);
        } else {
          console.log(
            `✅ Cleaned ${table.name} (${count || "unknown"} records)`
          );
        }
      }

      // Clean up questionnaires after assessments are deleted
      await this.cleanupDemoQuestionnaires();

      console.log("✅ Cleanup completed successfully");
    } catch (error) {
      console.error("❌ Error during cleanup:", error.message);
      // Don't throw - we want to continue with generation even if cleanup fails
    }
  }

  async insertCompany(companyData) {
    console.log(`📢 Creating company: ${companyData.name}`);

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

    this.idMappings.companies.set(companyData.name, data.id);
    console.log(`✅ Company created with ID: ${data.id}`);
    return data.id;
  }

  async insertBusinessUnits(companyId, businessUnits) {
    console.log(`🏢 Creating ${businessUnits.length} business units...`);

    const inserts = businessUnits.map((bu) => ({
      name: bu.name,
      code: bu.code,
      manager: bu.manager,
      company_id: companyId,
      created_by: this.adminUserId,
    }));

    const { data, error } = await this.supabase
      .from("business_units")
      .insert(inserts)
      .select();

    if (error) throw error;

    // Map names to IDs
    businessUnits.forEach((bu, index) => {
      this.idMappings.business_units.set(bu.name, data[index].id);
    });

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
        business_unit_id: buId,
        company_id: companyId,
        created_by: this.adminUserId,
      }));

      const { data, error } = await this.supabase
        .from("regions")
        .insert(regionInserts)
        .select();

      if (error) throw error;

      // Map region names to IDs
      bu.regions.forEach((region, index) => {
        this.idMappings.regions.set(
          `${bu.name}::${region.name}`,
          data[index].id
        );
      });

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

        // Map site names to IDs
        region.sites.forEach((site, index) => {
          this.idMappings.sites.set(site.name, data[index].id);
        });
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
            site_id: siteId,
            company_id: companyId,
            created_by: this.adminUserId,
          }));

          const { data, error } = await this.supabase
            .from("asset_groups")
            .insert(assetInserts)
            .select();

          if (error) throw error;

          // Map asset group names to IDs
          site.asset_groups.forEach((ag, index) => {
            this.idMappings.asset_groups.set(ag.name, data[index].id);
          });
        }
      }
    }
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
    this.idMappings.questionnaires.set(questionnaireData.name, questionnaireId);

    // 2. Create rating scales
    const ratingScaleInserts = questionnaireData.rating_scales.map(
      (scale, index) => ({
        name: scale.name,
        description: scale.description,
        order_index: index + 1,
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

    // Map rating scale names to IDs
    questionnaireData.rating_scales.forEach((scale, index) => {
      this.idMappings.questionnaire_rating_scales.set(
        scale.name,
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
      this.idMappings.questionnaire_sections.set(section.title, sectionId);

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
        this.idMappings.questionnaire_steps.set(
          `${section.title}::${step.title}`,
          stepId
        );

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

        // Map question titles to IDs
        step.questions.forEach((question, index) => {
          this.idMappings.questionnaire_questions.set(
            question.title,
            questionsData[index].id
          );
        });

        // 6. Create question-specific rating scales and associations
        for (const question of step.questions) {
          const questionId = this.idMappings.questionnaire_questions.get(
            question.title
          );

          // Create role associations for this question if applicable_roles exist
          if (question.applicable_roles && question.applicable_roles.length > 0) {
            console.log(`   🎭 Creating role associations for question "${question.title}"`);
            
            const roleAssociations = [];
            const skippedRoles = [];
            
            for (const roleName of question.applicable_roles) {
              const sharedRoleId = this.sharedRolesMap.get(roleName);
              
              if (!sharedRoleId) {
                console.log(`   ⚠️ Warning: Shared role "${roleName}" not found for question "${question.title}"`);
                skippedRoles.push(roleName);
                continue;
              }
              
              roleAssociations.push({
                questionnaire_question_id: questionId,
                shared_role_id: sharedRoleId,
                created_by: this.adminUserId,
              });
            }
            
            if (roleAssociations.length > 0) {
              const { error: roleAssocError } = await this.supabase
                .from("questionnaire_question_roles")
                .insert(roleAssociations);
              
              if (roleAssocError) throw roleAssocError;
              
              console.log(`   ✅ Associated ${roleAssociations.length} roles with question "${question.title}"`);
            }
            
            if (skippedRoles.length > 0) {
              console.log(`   ⚠️ Skipped ${skippedRoles.length} roles: ${skippedRoles.join(', ')}`);
            }
          }

          if (question.rating_scales && question.rating_scales.length > 0) {
            // Create associations between this question and master rating scales using question-specific descriptions
            const ratingScaleAssociations = question.rating_scales
              .map((questionScale) => {
                // Find the master rating scale by name and value
                const masterScaleId =
                  this.idMappings.questionnaire_rating_scales.get(
                    questionScale.name
                  );

                if (!masterScaleId) {
                  console.log(
                    `   ⚠️ Warning: Master rating scale "${questionScale.name}" not found for question "${question.title}"`
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
                  this.idMappings.questionnaire_rating_scales.get(scale.name),
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

  async insertOrgCharts(orgChartsData, companyId) {
    console.log("📊 Creating organizational charts...");

    for (const orgChart of orgChartsData) {
      // Find the site ID by name
      const siteId = this.idMappings.sites.get(orgChart.site_reference);

      const { data: chartData, error: chartError } = await this.supabase
        .from("org_charts")
        .insert({
          name: orgChart.name,
          code: orgChart.code,
          chart_type: orgChart.chart_type,
          site_id: siteId,
          company_id: companyId,
          created_by: this.adminUserId,
        })
        .select()
        .single();

      if (chartError) throw chartError;

      const chartId = chartData.id;
      this.idMappings.org_charts.set(orgChart.name, chartId);

      // Create roles for this org chart
      const roleInserts = [];
      const skippedRoles = [];
      
      for (const role of orgChart.roles) {
        // Look up the shared role by name
        const sharedRoleId = this.sharedRolesMap.get(role.name);
        
        if (!sharedRoleId) {
          console.log(`   ⚠️ Warning: Shared role "${role.name}" not found - skipping`);
          skippedRoles.push(role.name);
          continue;
        }
        
        roleInserts.push({
          level: role.level,
          department: role.department,
          sort_order: role.sort_order,
          org_chart_id: chartId,
          company_id: companyId,
          shared_role_id: sharedRoleId,
          created_by: this.adminUserId,
        });
      }
      
      if (roleInserts.length > 0) {
        const { data: rolesData, error: rolesError } = await this.supabase
          .from("roles")
          .insert(roleInserts)
          .select();

        if (rolesError) throw rolesError;

        // Map shared role IDs to role IDs with company context
        rolesData.forEach((roleData, index) => {
          const originalRole = orgChart.roles.find((r, i) => i === index);
          const sharedRoleId = this.sharedRolesMap.get(originalRole.name);
          
          if (sharedRoleId) {
            this.idMappings.roles.set(
              `${companyId}::shared_role_${sharedRoleId}`,
              roleData.id
            );
            console.log(
              `   📋 Created role: "${originalRole.name}" → ID ${roleData.id} (shared_role_id: ${roleData.shared_role_id})`
            );
          }
        });
      }
      
      if (skippedRoles.length > 0) {
        console.log(`   ⚠️ Skipped ${skippedRoles.length} roles without shared role mappings: ${skippedRoles.join(', ')}`);
      }
    }
  }

  async insertAssessments(assessmentsData, companyId, actionsData) {
    console.log("📝 Creating assessments and interviews...");

    for (const assessment of assessmentsData) {
      // Get required IDs from mappings
      // Use the first questionnaire if only one exists, otherwise try to find by name
      let questionnaireId;
      const questionnaireNames = Array.from(
        this.idMappings.questionnaires.keys()
      );

      if (questionnaireNames.length === 1) {
        // Single questionnaire - use it
        questionnaireId = this.idMappings.questionnaires.get(
          questionnaireNames[0]
        );
        console.log(`   📋 Using questionnaire: "${questionnaireNames[0]}"`);
      } else if (questionnaireNames.length > 1) {
        // Multiple questionnaires - try to find one that matches assessment context
        console.log(
          `   ⚠️  Multiple questionnaires found: ${questionnaireNames.join(
            ", "
          )}`
        );
        // For now, use the first one but log a warning
        questionnaireId = this.idMappings.questionnaires.get(
          questionnaireNames[0]
        );
        console.log(
          `   📋 Using first questionnaire: "${questionnaireNames[0]}"`
        );
      } else {
        throw new Error("No questionnaires found in mappings");
      }

      if (!questionnaireId) {
        throw new Error(
          `Failed to find questionnaire ID for assessment "${assessment.name}"`
        );
      }

      const businessUnitId = this.idMappings.business_units.get(
        assessment.business_unit_ref
      );
      const regionId = this.idMappings.regions.get(
        `${assessment.business_unit_ref}::${assessment.region_ref}`
      );
      const siteId = this.idMappings.sites.get(assessment.site_ref);
      const assetGroupId = this.idMappings.asset_groups.get(
        assessment.asset_group_ref
      );

      const { data: assessmentData, error: assessmentError } =
        await this.supabase
          .from("assessments")
          .insert({
            name: assessment.name,
            description: assessment.description,
            status: assessment.status,
            type: assessment.type,
            questionnaire_id: questionnaireId,
            business_unit_id: businessUnitId,
            region_id: regionId,
            site_id: siteId,
            asset_group_id: assetGroupId,
            company_id: companyId,
            created_by: this.adminUserId,
            start_date: new Date().toISOString(),
          })
          .select()
          .single();

      if (assessmentError) throw assessmentError;

      const assessmentId = assessmentData.id;
      this.idMappings.assessments.set(assessment.name, assessmentId);

      // Create objectives for this assessment if they exist
      if (assessment.objectives && assessment.objectives.length > 0) {
        console.log(
          `   🎯 Creating ${assessment.objectives.length} objectives for "${assessment.name}"`
        );

        const objectiveInserts = assessment.objectives.map((objective) => ({
          assessment_id: assessmentId,
          company_id: companyId,
          created_by: this.adminUserId,
          title: objective.title,
          description: objective.description || null,
        }));

        const { error: objectivesError } = await this.supabase
          .from("assessment_objectives")
          .insert(objectiveInserts);

        if (objectivesError) throw objectivesError;

        console.log(`   ✅ Created ${assessment.objectives.length} objectives`);
      }

      // Create interviews for this assessment
      for (const interview of assessment.interviews) {
        const { data: interviewData, error: interviewError } =
          await this.supabase
            .from("interviews")
            .insert({
              name: interview.name,
              status: interview.status,
              notes: interview.notes,
              assessment_id: assessmentId,
              interviewer_id: this.adminUserId,
              company_id: companyId,
              created_by: this.adminUserId,
            })
            .select()
            .single();

        if (interviewError) throw interviewError;

        const interviewId = interviewData.id;
        this.idMappings.interviews.set(interview.name, interviewId);

        // Create interview responses
        const responseInserts = interview.responses.map((response) => ({
          rating_score: response.rating_score,
          comments: response.comments,
          interview_id: interviewId,
          questionnaire_question_id:
            this.idMappings.questionnaire_questions.get(response.question_ref),
          company_id: companyId,
          created_by: this.adminUserId,
        }));

        const { data: responsesData, error: responsesError } =
          await this.supabase
            .from("interview_responses")
            .insert(responseInserts)
            .select();

        if (responsesError) throw responsesError;

        // Create interview response role associations
        for (let i = 0; i < interview.responses.length; i++) {
          const response = interview.responses[i];
          const responseId = responsesData[i].id;

          // Track response ID
          this.idMappings.interview_responses.set(
            `${interview.name}::${response.question_ref}`,
            responseId
          );

          // Generate actions for low-scored responses (1 or 2)
          if (response.rating_score <= 2 && actionsData) {
            const actionResult = await this.generateActionsForResponse(
              responseId,
              response.question_ref,
              response.rating_score,
              companyId,
              actionsData
            );

            if (actionResult && actionResult.length > 0) {
              console.log(
                `   🎯 Created ${actionResult.length} action(s) for low-scored response "${response.question_ref}" (score: ${response.rating_score})`
              );

              // Track action IDs
              actionResult.forEach((action, index) => {
                this.idMappings.interview_response_actions.set(
                  `${interview.name}::${response.question_ref}::${index}`,
                  action.id
                );
              });
            }
          }

          // Create role associations if roles are specified
          if (
            response.applicable_roles &&
            response.applicable_roles.length > 0
          ) {
            console.log(
              `   🎭 Creating role associations for response "${
                response.question_ref
              }": [${response.applicable_roles.join(", ")}]`
            );

            const roleAssociations = response.applicable_roles
              .map((roleName) => {
                // First get the shared role ID from the role name
                const sharedRoleId = this.sharedRolesMap.get(roleName);
                if (!sharedRoleId) {
                  console.log(
                    `   ⚠️ Warning: Shared role "${roleName}" not found`
                  );
                  return null;
                }
                
                // Then get the company-specific role ID using the shared role ID
                const roleId = this.idMappings.roles.get(
                  `${companyId}::shared_role_${sharedRoleId}`
                );
                if (!roleId) {
                  console.log(
                    `   ⚠️ Warning: Role with shared_role_id ${sharedRoleId} not found for company ${companyId}`
                  );
                  return null;
                }
                
                return {
                  interview_response_id: responseId,
                  role_id: roleId,
                  company_id: companyId,
                  created_by: this.adminUserId,
                };
              })
              .filter((assoc) => assoc !== null); // Only include if role exists

            if (roleAssociations.length > 0) {
              const { error: responseRoleError } = await this.supabase
                .from("interview_response_roles")
                .insert(roleAssociations);

              if (responseRoleError) throw responseRoleError;
              console.log(
                `   ✅ Created ${roleAssociations.length} role associations`
              );
            } else {
              console.log(
                `   ⚠️ No valid role associations created for response "${response.question_ref}"`
              );
            }
          }
        }
      }
    }
  }

  async generateDemoData(filePath) {
    try {
      console.log("🚀 Starting demo data generation...");

      const demoData = await this.loadDemoData(filePath);
      
      // Load shared roles before generating data
      await this.loadSharedRoles();

      // Clean up existing demo data first
      await this.cleanupExistingDemoData();

      console.log("📊 Starting fresh data generation...");

      for (const companyData of demoData.demoData.companies) {
        console.log(`\n📊 Processing company: ${companyData.name}`);

        // 1. Create company
        const companyId = await this.insertCompany(companyData);

        // 2. Create business structure
        await this.insertBusinessUnits(companyId, companyData.business_units);
        await this.insertRegions(companyData.business_units, companyId);
        await this.insertSites(companyData.business_units, companyId);
        await this.insertAssetGroups(companyData.business_units, companyId);

        // 3. Create org charts and roles FIRST
        if (companyData.org_charts) {
          await this.insertOrgCharts(companyData.org_charts, companyId);
        }

        // 4. Create questionnaire structure (now roles exist for associations)
        await this.insertQuestionnaire(companyData.questionnaire);

        // 5. Create assessments and interviews
        if (companyData.assessments) {
          await this.insertAssessments(
            companyData.assessments,
            companyId,
            companyData.actions
          );
        }

        console.log(`✅ Company ${companyData.name} completed successfully!`);
      }

      console.log("\n🎉 All demo data generated successfully!");
      console.log("\n📈 Summary:");
      console.log(`Companies: ${this.idMappings.companies.size}`);
      console.log(`Business Units: ${this.idMappings.business_units.size}`);
      console.log(`Regions: ${this.idMappings.regions.size}`);
      console.log(`Sites: ${this.idMappings.sites.size}`);
      console.log(`Asset Groups: ${this.idMappings.asset_groups.size}`);
      console.log(`Questionnaires: ${this.idMappings.questionnaires.size}`);
      console.log(
        `Questionnaire Questions: ${this.idMappings.questionnaire_questions.size}`
      );
      console.log(
        `Questionnaire Rating Scales: ${this.idMappings.questionnaire_rating_scales.size}`
      );
      console.log(`Organizational Charts: ${this.idMappings.org_charts.size}`);
      console.log(`Roles: ${this.idMappings.roles.size}`);
      console.log(`Assessments: ${this.idMappings.assessments.size}`);
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

  // Helper methods for action generation
  async generateActionsForResponse(
    responseId,
    questionRef,
    score,
    companyId,
    actionsData
  ) {
    const questionActions = this.findActionsForQuestion(
      actionsData,
      questionRef,
      score
    );

    if (questionActions && questionActions.length > 0) {
      const selectedActions = this.randomlySelectActions(questionActions, 1, 3);

      const actionInserts = selectedActions.map((action) => ({
        interview_response_id: responseId,
        title: action.title,
        description: action.description,
        company_id: companyId,
        created_by: this.adminUserId,
      }));

      const { data, error } = await this.supabase
        .from("interview_response_actions")
        .insert(actionInserts)
        .select();

      if (error) {
        console.log(
          `   ⚠️ Error creating actions for response "${questionRef}":`,
          error.message
        );
        return null;
      }

      return data;
    }

    return null;
  }

  findActionsForQuestion(actionsData, questionRef, score) {
    if (!actionsData) return [];

    const scoreKey = `score_${score}`;
    const actions = [];

    // Navigate through the nested actions structure
    // Structure: Category → Sub-category → Question Topic → Score Level
    for (const [_category, subcategories] of Object.entries(actionsData)) {
      if (typeof subcategories !== "object") continue;

      for (const [_subcategory, questionTopics] of Object.entries(
        subcategories
      )) {
        if (typeof questionTopics !== "object") continue;

        for (const [topic, scoreActions] of Object.entries(questionTopics)) {
          if (typeof scoreActions !== "object") continue;

          if (
            this.matchesQuestion(questionRef, topic) &&
            scoreActions[scoreKey]
          ) {
            actions.push(...scoreActions[scoreKey]);
          }
        }
      }
    }

    return actions;
  }

  matchesQuestion(questionRef, actionTopic) {
    // Clean and normalize both strings for comparison
    const cleanQuestion = this.cleanTitle(questionRef);
    const cleanTopic = this.cleanTitle(actionTopic);

    // Check for exact matches or substring matches
    return (
      cleanQuestion.includes(cleanTopic) ||
      cleanTopic.includes(cleanQuestion) ||
      this.fuzzyMatch(cleanQuestion, cleanTopic)
    );
  }

  cleanTitle(title) {
    if (!title) return "";

    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, "") // Remove punctuation
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim()
      .split(" ")
      .filter(
        (word) =>
          ![
            "a",
            "an",
            "the",
            "is",
            "are",
            "and",
            "or",
            "of",
            "in",
            "on",
            "at",
            "to",
            "for",
          ].includes(word)
      )
      .join(" ");
  }

  fuzzyMatch(str1, str2) {
    const words1 = str1.split(" ");
    const words2 = str2.split(" ");

    // Check if any significant words match
    const matches = words1.filter(
      (word) =>
        word.length > 3 &&
        words2.some((w2) => w2.includes(word) || word.includes(w2))
    );

    return matches.length > 0;
  }

  randomlySelectActions(actions, min, max) {
    if (!actions || actions.length === 0) return [];

    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...actions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, actions.length));
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

  await generator.generateDemoData("./data.json");
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default SupabaseDemoGenerator;
