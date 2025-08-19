import { createClient } from "./client";
import type {
  Program,
  CreateProgramFormData,
  ProgramWithRelations,
} from "@/types/program";
import type { ProgramUpdateFormData } from "@/pages/programs/detail/components/program-update-schema";
import { checkDemoAction } from "./utils";
import { getCurrentUserId } from "@/lib/auth/auth-utils";
import { programScopeService } from "./program-scope-service";

export class ProgramService {
  private supabase = createClient();

  async getPrograms(companyId?: number): Promise<ProgramWithRelations[]> {
    let query = this.supabase
      .from("programs")
      .select(
        `
        *,
        company:companies!inner(id, name),
        program_objectives(id)
      `
      )
      .eq("is_deleted", false);

    if (companyId) {
      query = query.eq("company_id", companyId);
    }

    const { data: programs, error } = await query.order("updated_at", {
      ascending: false,
    });

    if (error) throw error;

    return programs.map((program: any) => ({
      ...program,
      objective_count: program.program_objectives?.length || 0,
    }));
  }

  async getProgramById(id: number): Promise<ProgramWithRelations | null> {
    const { data: program, error } = await this.supabase
      .from("programs")
      .select(
        `
        *,
        company:companies!inner(id, name),
        questionnaire:questionnaires(id, name, description),
        program_objectives(
          id,
          name,
          description,
          created_at
        )
      `
      )
      .eq("id", id)
      .eq("is_deleted", false)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }

    return {
      ...program,
      objectives: program.program_objectives || [],
      objective_count: program.program_objectives?.length || 0,
    };
  }

  async createProgram(formData: CreateProgramFormData): Promise<Program> {
    await checkDemoAction();

    const currentUserId = await getCurrentUserId();

    // Extract objectives and scope IDs from form data
    const { objectives, selected_scope_ids, ...programFields } = formData;

    // Create the program
    const { data: program, error: programError } = await this.supabase
      .from("programs")
      .insert([
        {
          ...programFields,
          created_by: currentUserId,
          is_deleted: false,
          is_demo: false,
          current_cycle: 0,
          frequency_weeks: programFields.frequency_weeks || 52,
          questionnaire_id: null,
        },
      ])
      .select()
      .single();

    if (programError) throw programError;

    // Create objectives (required)
    if (objectives && objectives.length > 0) {
      const objectiveInserts = objectives.map((objective) => ({
        program_id: program.id,
        name: objective.name,
        description: objective.description || null,
        company_id: formData.company_id,
        is_deleted: false,
        created_by: currentUserId,
      }));

      const { error: objectivesError } = await this.supabase
        .from("program_objectives")
        .insert(objectiveInserts);

      if (objectivesError) throw objectivesError;
    }

    // Create program scopes if scope IDs are provided and not company-level
    if (selected_scope_ids && selected_scope_ids.length > 0 && formData.scope_level !== "company") {
      await programScopeService.updateProgramScopes(
        program.id,
        formData.scope_level,
        selected_scope_ids
      );
    }

    return program;
  }

  async updateProgram(
    programId: number,
    updateData: ProgramUpdateFormData
  ): Promise<Program> {
    await checkDemoAction();

    const { data: program, error } = await this.supabase
      .from("programs")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", programId)
      .select()
      .single();

    if (error) throw error;
    return program;
  }

  async updateProgramQuestionnaire(
    programId: number,
    questionnaireId: number | null
  ): Promise<void> {
    await checkDemoAction();

    const { error } = await this.supabase
      .from("programs")
      .update({
        questionnaire_id: questionnaireId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", programId);

    if (error) throw error;
  }

  async deleteProgram(id: number): Promise<void> {
    await checkDemoAction();
    const { error } = await this.supabase
      .from("programs")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  }
}

export const programService = new ProgramService();
