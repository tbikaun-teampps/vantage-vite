import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.js";
import {
  ProgramPhaseStatus,
  ProgramStatus,
  ProgramWithRelations,
} from "../types/entities/programs.js";
import { CalculatedMeasurementWithDefinition } from "../types/entities/assessments.js";
import { NotFoundError } from "../plugins/errorHandler.js";

export class ProgramService {
  private supabase: SupabaseClient<Database>;

  constructor(supabaseClient: SupabaseClient<Database>) {
    this.supabase = supabaseClient;
  }

  async getPrograms(companyId: string): Promise<ProgramWithRelations[]> {
    const { data: programs, error } = await this.supabase
      .from("programs")
      .select(
        `
        *,
        company:companies!inner(id, name),
        program_objectives(id)
      `
      )
      .eq("company_id", companyId)
      .eq("is_deleted", false)
      .order("updated_at", {
        ascending: false,
      });

    if (error) throw error;

    return programs.map((program) => ({
      ...program,
      measurements_count: 0, // Placeholder, implement measurement count logic if needed
      objective_count: program.program_objectives?.length || 0,
    }));
  }

  /**
   * Creates a new program including its first phase.
   * @param data
   * @returns
   */

  async createProgram(data: {
    name: string;
    description?: string;
    company_id: string;
  }): Promise<any> {
    const { data: program, error } = await this.supabase
      .from("programs")
      .insert({
        name: data.name,
        description: data.description,
        company_id: data.company_id,
      })
      .select()
      .single();

    if (error) throw error;

    // Create first phase
    const { error: phaseError } = await this.supabase
      .from("program_phases")
      .insert({
        company_id: data.company_id,
        program_id: program.id,
        sequence_number: 1,
        name: "Program Assessment - Phase 1",
        status: "in_progress",
      });

    if (phaseError) throw phaseError;

    return program;
  }

  /**
   * Fetches a program by its ID
   * @param programId
   * @returns
   */
  async getProgramById(programId: number): Promise<any> {
    const { data: program, error } = await this.supabase
      .from("programs")
      .select(
        `
        *,
        company:companies!inner(id, name),
        program_objectives(id),
        presite_questionnaire:questionnaires!presite_questionnaire_id(id, name),
        onsite_questionnaire:questionnaires!onsite_questionnaire_id(id, name)
      `
      )
      .eq("id", programId)
      .eq("is_deleted", false)
      .single();

    if (error) throw error;

    if (!program) throw new NotFoundError("Program not found");

    // Get phases
    const { data: phases, error: phasesError } = await this.supabase
      .from("program_phases")
      .select("*")
      .eq("program_id", programId)
      .eq("is_deleted", false);

    if (phasesError) throw phasesError;

    return {
      ...program,
      measurements_count: 0, // Placeholder, implement measurement count logic if needed
      objective_count: program.program_objectives?.length || 0,
      phases,
      presite_questionnaire: program.presite_questionnaire,
      onsite_questionnaire: program.onsite_questionnaire,
    };
  }

  /**
   * Updates a program's details
   * @param programId
   * @param data
   * @returns
   */
  async updateProgram(
    programId: number,
    data: {
      name?: string;
      description?: string;
      status?: ProgramStatus;
      presite_questionnaire_id?: number;
      onsite_questionnaire_id?: number;
    }
  ): Promise<any> {
    const { data: program, error } = await this.supabase
      .from("programs")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", programId)
      .eq("is_deleted", false)
      .select()
      .single();

    if (error) throw error;

    return program;
  }
  /**
   * Add a new phase to an existing program
   * @param programId
   * @param activate boolean - whether to set this phase as active
   * @param phaseData
   * @returns
   */
  async addPhaseToProgram(
    programId: number,
    activate: boolean = false,
    phaseData: {
      name: string;
    }
  ): Promise<any> {
    const { data: program, error: programError } = await this.supabase
      .from("programs")
      .select("id, company_id")
      .eq("id", programId)
      .eq("is_deleted", false)
      .maybeSingle();

    if (programError) throw programError;
    if (!program) throw new NotFoundError("Program not found");

    const { data: phases, error: phasesError } = await this.supabase
      .from("program_phases")
      .select("id, sequence_number")
      .eq("program_id", programId)
      .eq("is_deleted", false)
      .order("sequence_number", { ascending: false });

    if (phasesError) throw phasesError;

    const nextSequenceNumber =
      phases && phases.length > 0 ? phases[0].sequence_number + 1 : 1;

    const { data: phase, error } = await this.supabase
      .from("program_phases")
      .insert({
        program_id: programId,
        sequence_number: nextSequenceNumber,
        company_id: program.company_id,
        status: activate ? "in_progress" : "scheduled",
        ...phaseData,
      })
      .select()
      .single();

    if (error) throw error;

    if (activate) {
      // Set current_sequence_number on program
      const { error: updateProgramError } = await this.supabase
        .from("programs")
        .update({
          current_sequence_number: nextSequenceNumber,
          updated_at: new Date().toISOString(),
        })
        .eq("id", programId);

      if (updateProgramError) throw updateProgramError;
    }

    return phase;
  }

  async updateProgramPhase(
    phaseId: number,
    data: {
      name?: string | null;
      status?: ProgramPhaseStatus;
      planned_start_date?: string | null;
      actual_start_date?: string | null;
      planned_end_date?: string | null;
      actual_end_date?: string | null;
    }
  ): Promise<any> {
    const { data: phase, error } = await this.supabase
      .from("program_phases")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", phaseId)
      .eq("is_deleted", false)
      .select()
      .single();

    if (error) throw error;

    return phase;
  }

  /**
   * Creates interviews for a program phase
   */
  async createInterviews(
    programId: number,
    phaseId: number,
    isIndividual: boolean = false,
    roleIds: number[] = [],
    contactIds: number[],
    interviewType: "onsite" | "presite",
    createdBy: string
  ): Promise<{ success: boolean; message: string; interviewsCreated: number }> {
    // Validate data
    if (roleIds.length === 0) {
      throw new Error("At least one role must be selected");
    }

    if (isIndividual && contactIds.length === 0) {
      throw new Error(
        "At least one contact must be selected for individual interviews"
      );
    }

    // Step 1: Fetch program data
    const { data: program, error: programError } = await this.supabase
      .from("programs")
      .select("company_id, onsite_questionnaire_id, presite_questionnaire_id")
      .eq("id", programId)
      .single();

    if (programError) throw programError;

    // Step 2: Validate phase exists
    const { data: programPhase, error: phaseError } = await this.supabase
      .from("program_phases")
      .select("id, sequence_number")
      .eq("id", phaseId)
      .single();

    if (phaseError) throw phaseError;

    if (!programPhase) {
      throw new NotFoundError("Program phase not found");
    }

    // Step 3: Determine questionnaire based on interview type
    const questionnaireId =
      interviewType === "onsite"
        ? program.onsite_questionnaire_id
        : program.presite_questionnaire_id;

    if (!questionnaireId) {
      throw new Error(
        `No ${interviewType} questionnaire configured for this program`
      );
    }

    // Step 4: Get questionnaire structure to extract question IDs
    const { data: questionnaire, error: questionnaireError } =
      await this.supabase
        .from("questionnaires")
        .select(
          `
        id,
        questionnaire_sections(
          id,
          questionnaire_steps(
            id,
            questionnaire_questions(id)
          )
        )
      `
        )
        .eq("id", questionnaireId)
        .eq("questionnaire_sections.is_deleted", false)
        .eq("questionnaire_sections.questionnaire_steps.is_deleted", false)
        .eq(
          "questionnaire_sections.questionnaire_steps.questionnaire_questions.is_deleted",
          false
        )
        .single();

    if (questionnaireError) throw questionnaireError;

    // Step 5: Extract all question IDs
    const questionIds: number[] = [];
    if (questionnaire?.questionnaire_sections) {
      for (const section of questionnaire.questionnaire_sections) {
        for (const step of section.questionnaire_steps) {
          for (const question of step.questionnaire_questions) {
            questionIds.push(question.id);
          }
        }
      }
    }

    if (questionIds.length === 0) {
      throw new Error("No questions found in questionnaire");
    }

    // Step 6: Check if an assessment for this program phase exists or create one
    // As the structure is program > phase > assessment > interview(s)
    let assessmentId: number | null = null;
    const { data: existingAssessment, error: assessmentError } =
      await this.supabase
        .from("assessments")
        .select("id")
        .eq("program_phase_id", phaseId)
        .eq("questionnaire_id", questionnaireId)
        .maybeSingle();

    if (assessmentError && !existingAssessment) {
      throw assessmentError;
    }

    if (existingAssessment) {
      console.log("Existing assessment found with ID:", existingAssessment.id);
      assessmentId = existingAssessment.id;
    } else {
      console.log("No existing assessment found, creating new one.");
      // Create new assessment
      const { data: newAssessment, error: createAssessmentError } =
        await this.supabase
          .from("assessments")
          .insert({
            name: `${interviewType} Assessment - Phase ${programPhase.sequence_number}`,
            program_phase_id: phaseId,
            type: "onsite",
            questionnaire_id: questionnaireId,
            company_id: program.company_id,
          })
          .select()
          .single();

      if (createAssessmentError) throw createAssessmentError;

      assessmentId = newAssessment.id;
    }

    // Step 7: Create interview(s) based on type
    let interviewsCreated = 0;

    if (isIndividual) {
      // Create individual interview for each contact
      for (const contactId of contactIds) {
        await this.createSingleProgramInterview({
          programId,
          phaseId,
          assessmentId,
          questionnaireId,
          contactId,
          roleIds,
          questionIds,
          companyId: program.company_id,
          isIndividual: true,
          createdBy,
          interviewType,
        });
        interviewsCreated++;
      }
    } else {
      // Create single group interview
      await this.createSingleProgramInterview({
        programId,
        phaseId,
        assessmentId,
        questionnaireId,
        contactId: null,
        roleIds,
        questionIds,
        companyId: program.company_id,
        isIndividual: false,
        createdBy,
        interviewType,
      });
      interviewsCreated = 1;
    }

    return {
      success: true,
      message: `Successfully created ${interviewsCreated} ${interviewType} interview(s)`,
      interviewsCreated,
    };
  }

  /**
   * Helper method to create a single program interview with full transaction logic
   */
  private async createSingleProgramInterview(params: {
    programId: number;
    phaseId: number;
    assessmentId: number;
    questionnaireId: number;
    contactId: number | null;
    roleIds: number[];
    questionIds: number[];
    companyId: string;
    isIndividual: boolean;
    createdBy: string;
    interviewType: "onsite" | "presite";
  }): Promise<void> {
    const {
      programId,
      phaseId,
      assessmentId,
      questionnaireId,
      contactId,
      questionIds,
      companyId,
      isIndividual,
      createdBy,
      interviewType,
    } = params;

    // roleIds might be modified, so keep as let
    let { roleIds } = params;

    // Validation: Individual interviews should only have one role
    if (isIndividual && contactId && roleIds.length > 1) {
      console.warn(
        `Individual interview created with ${roleIds.length} roles for contact ${contactId}. Using only the first role to ensure single role assignment.`
      );
      roleIds = [roleIds[0]];
    }

    // Generate interview name
    const interviewName =
      isIndividual && contactId
        ? `${interviewType} Interview - Contact ${contactId}`
        : `${interviewType} Interview - Group`;

    // Generate access code for individual interviews
    const accessCode = isIndividual
      ? Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
      : null;

    // Step 1: Create the interview
    const { data: interview, error: interviewError } = await this.supabase
      .from("interviews")
      .insert([
        {
          assessment_id: assessmentId,
          name: interviewName,
          program_id: programId,
          program_phase_id: phaseId,
          questionnaire_id: questionnaireId,
          interview_contact_id: contactId,
          company_id: companyId,
          is_individual: isIndividual,
          enabled: true,
          access_code: accessCode,
          status: "pending",
          created_by: createdBy,
        },
      ])
      .select()
      .single();

    if (interviewError) throw interviewError;

    try {
      // Step 2: Create interview-level role associations
      if (roleIds.length > 0) {
        const interviewRoleAssociations = roleIds.map((roleId) => ({
          interview_id: interview.id,
          role_id: roleId,
          company_id: companyId,
          created_by: createdBy,
        }));

        const { error: interviewRoleError } = await this.supabase
          .from("interview_roles")
          .insert(interviewRoleAssociations);

        if (interviewRoleError) {
          // Clean up the interview if role association fails
          await this.supabase
            .from("interviews")
            .delete()
            .eq("id", interview.id);
          throw interviewRoleError;
        }
      }

      // Step 3: Create interview responses for all questions
      if (questionIds.length > 0) {
        const responseData = questionIds.map((questionId) => ({
          interview_id: interview.id,
          questionnaire_question_id: questionId,
          rating_score: null,
          comments: null,
          answered_at: null,
          is_applicable: true, // Assume all questions are applicable for program interviews
          company_id: companyId,
          created_by: createdBy,
        }));

        const { data: createdResponses, error: responsesError } =
          await this.supabase
            .from("interview_responses")
            .insert(responseData)
            .select("id");

        if (responsesError) {
          // Clean up the interview if response creation fails
          await this.supabase
            .from("interviews")
            .delete()
            .eq("id", interview.id);
          throw responsesError;
        }

        // Step 4: For individual interviews with single role, pre-populate response role associations
        if (isIndividual && roleIds.length === 1 && createdResponses) {
          const responseRoleAssociations = createdResponses.map((response) => ({
            interview_response_id: response.id,
            role_id: roleIds[0],
            company_id: companyId,
            interview_id: interview.id,
            created_by: createdBy,
          }));

          const { error: responseRoleError } = await this.supabase
            .from("interview_response_roles")
            .insert(responseRoleAssociations);

          if (responseRoleError) {
            // Clean up everything if response role association fails
            await this.supabase
              .from("interviews")
              .delete()
              .eq("id", interview.id);
            throw responseRoleError;
          }
        }
      }
    } catch (error) {
      // Ensure interview is cleaned up on any error
      try {
        await this.supabase.from("interviews").delete().eq("id", interview.id);
      } catch (cleanupError) {
        console.error("Failed to cleanup interview after error:", cleanupError);
      }
      throw error;
    }
  }

  // ======= Program Objectives Methods =======

  async getObjectivesByProgramId(programId: number) {
    const { data: objectives, error } = await this.supabase
      .from("program_objectives")
      .select()
      .eq("program_id", programId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return objectives;
  }

  async createObjective(data: {
    name: string;
    description?: string;
    program_id: number;
  }) {
    // Get company_id from the program
    const { data: program, error: programError } = await this.supabase
      .from("programs")
      .select("company_id")
      .eq("id", data.program_id)
      .single();

    if (programError) throw programError;
    if (!program) throw new Error("Program not found");

    const { data: objective, error } = await this.supabase
      .from("program_objectives")
      .insert({
        name: data.name,
        description: data.description,
        program_id: data.program_id,
        company_id: program.company_id,
      })
      .select()
      .single();

    if (error) throw error;
    return objective;
  }

  async updateObjective(
    id: number,
    data: {
      name?: string;
      description?: string;
    }
  ) {
    const { data: objective, error } = await this.supabase
      .from("program_objectives")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("is_deleted", false)
      .select()
      .single();

    if (error) throw error;
    return objective;
  }

  async deleteObjective(id: number): Promise<void> {
    const { error } = await this.supabase
      .from("program_objectives")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  }

  async getObjectiveCount(programId: number): Promise<number> {
    const { count, error } = await this.supabase
      .from("program_objectives")
      .select("*", { count: "exact", head: true })
      .eq("program_id", programId)
      .eq("is_deleted", false);

    if (error) throw error;
    return count || 0;
  }

  async getProgramMeasurements(
    programId: number,
    includeDefinitions: boolean = false
  ): Promise<any> {
    let query: any = this.supabase.from("program_measurements");

    if (includeDefinitions) {
      query = query.select(`*, 
  measurement_definition:measurement_definitions!inner(id, name, 
  description, calculation_type, required_csv_columns, provider)`);
    } else {
      query = query.select("*");
    }

    query = query
      .eq("program_id", programId)
      .order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  async getAvailableProgramMeasurements(programId: number): Promise<any> {
    // First, get measurement_definition_ids already associated with the program
    const { data: existingMeasurements, error: existingError } =
      await this.supabase
        .from("program_measurements")
        .select("measurement_definition_id")
        .eq("program_id", programId);

    if (existingError) throw existingError;

    const existingDefinitionIds =
      existingMeasurements?.map((m) => m.measurement_definition_id) || [];

    // Now, fetch measurement definitions not already associated with the program
    let query = this.supabase
      .from("measurement_definitions")
      .select()
      .order("name", { ascending: true });

    if (existingDefinitionIds.length > 0) {
      query = query.not("id", "in", `(${existingDefinitionIds.join(",")})`);
    }

    const { data: availableDefinitions, error: availableError } = await query;

    if (availableError) throw availableError;

    return availableDefinitions;
  }

  async addMeasurementDefinitionsToProgram(
    programId: number,
    measurementDefinitionIds: number[]
  ): Promise<any> {
    // Ensure no duplicates in measurementDefinitionIds
    measurementDefinitionIds = Array.from(new Set(measurementDefinitionIds));

    // Validate that the definitions exist
    const { data: validDefinitions, error: definitionsError } =
      await this.supabase
        .from("measurement_definitions")
        .select("id")
        .in("id", measurementDefinitionIds);

    if (definitionsError) throw definitionsError;

    const validDefinitionIds = validDefinitions?.map((def) => def.id) || [];

    if (validDefinitionIds.length === 0) {
      throw new Error("No valid measurement definitions provided");
    }

    // Ensure that the measurement definitions are not already associated with the program
    const { data: existingMeasurements, error: existingError } =
      await this.supabase
        .from("program_measurements")
        .select("measurement_definition_id")
        .eq("program_id", programId)
        .in("measurement_definition_id", validDefinitionIds);

    if (existingError) throw existingError;

    const existingDefinitionIds =
      existingMeasurements?.map((m) => m.measurement_definition_id) || [];

    // Filter out already associated definition IDs
    const newDefinitionIds = validDefinitionIds.filter(
      (id) => !existingDefinitionIds.includes(id)
    );

    if (newDefinitionIds.length === 0) {
      return []; // Nothing to add
    }

    const records = newDefinitionIds.map((id) => ({
      program_id: programId,
      measurement_definition_id: id,
    }));

    const { data, error } = await this.supabase
      .from("program_measurements")
      .insert(records)
      .select();

    if (error) throw error;

    return data;
  }

  /**
   * Removes a measurement definition from a program, including any of its calculated measurements on program phases and assessments.
   */
  async removeMeasurementDefinitionFromProgram(
    programId: number,
    measurementDefinitionId: number
  ): Promise<void> {
    // First, remove any calculated measurements associated with this definition for the program's phases
    const { data: phases, error: phasesError } = await this.supabase
      .from("program_phases")
      .select("id")
      .eq("program_id", programId)
      .eq("is_deleted", false);

    if (phasesError) throw phasesError;

    const phaseIds = phases?.map((phase) => phase.id) || [];

    if (phaseIds.length > 0) {
      // Soft delete calculated measurements
      const { error: calcMeasurementsError } = await this.supabase
        .from("measurements_calculated")
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .in("program_phase_id", phaseIds)
        .eq("measurement_definition_id", measurementDefinitionId);

      if (calcMeasurementsError) throw calcMeasurementsError;
    }

    // Now, remove the measurement definition from the program
    const { error } = await this.supabase
      .from("program_measurements")
      .delete()
      .eq("program_id", programId)
      .eq("measurement_definition_id", measurementDefinitionId);

    if (error) throw error;
  }

  async getCalculatedMeasurementsForProgramPhase(
    programPhaseId: number
  ): Promise<any> {
    const { data: metrics, error } = await this.supabase
      .from("measurements_calculated")
      .select(
        `
        *,
        measurement_definition:measurement_definitions!measurement_definition_id(
          id,
          name,
          description,
          calculation_type,
          required_csv_columns,
          provider
        )
      `
      )
      .eq("program_phase_id", programPhaseId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return metrics || [];
  }

  async getCalculatedMeasurementForProgramPhase(
    programPhaseId: number,
    measurementId?: number,
    location?: {
      business_unit_id?: number;
      region_id?: number;
      site_id?: number;
      asset_group_id?: number;
      work_group_id?: number;
      role_id?: number;
    }
  ): Promise<any> {
    let query = this.supabase
      .from("measurements_calculated")
      .select(
        `
        *,
        measurement_definition:measurement_definitions!measurement_definition_id(
          id,
          name,
          description,
          calculation_type,
          required_csv_columns,
          provider
        )
      `
      )
      .eq("program_phase_id", programPhaseId);

    if (measurementId) {
      query = query.eq("id", measurementId);
    }

    if (location) {
      if (location.business_unit_id) {
        query = query.eq("business_unit_id", location.business_unit_id);
        if (location.region_id) {
          query = query.eq("region_id", location.region_id);
          if (location.site_id) {
            query = query.eq("site_id", location.site_id);
            if (location.asset_group_id) {
              query = query.eq("asset_group_id", location.asset_group_id);
              if (location.work_group_id) {
                query = query.eq("work_group_id", location.work_group_id);
                if (location.role_id) {
                  query = query.eq("role_id", location.role_id);
                }
              }
            }
          }
        }
      }
    }

    const { data: metric, error } = await query.maybeSingle();

    if (error) throw error;
    return metric;
  }

  async createCalculatedMeasurement(data: {
    program_phase_id: number;
    measurement_definition_id: number;
    calculated_value: number;
    business_unit_id?: number;
    region_id?: number;
    site_id?: number;
    asset_group_id?: number;
    work_group_id?: number;
    role_id?: number;
  }): Promise<CalculatedMeasurementWithDefinition> {
    // Check phase exists and get company_id from it
    const { data: phase } = await this.supabase
      .from("program_phases")
      .select("company_id")
      .eq("id", data.program_phase_id)
      .single();

    if (!phase) throw new Error("Program phase not found");

    const { data: measurement, error } = await this.supabase
      .from("measurements_calculated")
      .insert({
        program_phase_id: data.program_phase_id,
        measurement_definition_id: data.measurement_definition_id,
        calculated_value: data.calculated_value,
        company_id: phase.company_id,
        data_source: "manual",
        business_unit_id: data.business_unit_id || null,
        region_id: data.region_id || null,
        site_id: data.site_id || null,
        asset_group_id: data.asset_group_id || null,
        work_group_id: data.work_group_id || null,
        role_id: data.role_id || null,
      })
      .select(
        `
        *,
        measurement_definition:measurement_definitions!measurement_definition_id(
          id,
          name,
          description,
          calculation_type,
          required_csv_columns,
          provider
        )
      `
      )
      .single();

    if (error) throw error;
    return measurement;
  }

  async updateCalculatedMeasurement(
    measurementId: number,
    calculated_value: number
  ): Promise<CalculatedMeasurementWithDefinition> {
    const { data: measurement, error } = await this.supabase
      .from("measurements_calculated")
      .update({
        calculated_value,
        updated_at: new Date().toISOString(),
      })
      .eq("id", measurementId)
      .select(
        `
        *,
        measurement_definition:measurement_definitions!measurement_definition_id(
          id,
          name,
          description,
          calculation_type,
          required_csv_columns,
          provider
        )
      `
      )
      .single();

    if (error) throw error;
    return measurement;
  }

  async deleteCalculatedMeasurement(measurementId: number): Promise<void> {
    const { error } = await this.supabase
      .from("measurements_calculated")
      .delete()
      .eq("id", measurementId);

    if (error) throw error;
  }
}
