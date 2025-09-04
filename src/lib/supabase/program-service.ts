import { createClient } from "./client";
import type {
  Program,
  CreateProgramFormData,
  ProgramWithRelations,
} from "@/types/program";
import type { ProgramUpdateFormData } from "@/pages/programs/detail/components/program-update-schema";
import { checkDemoAction } from "./utils";
import { getCurrentUserId } from "@/lib/auth/auth-utils";

export class ProgramService {
  private supabase = createClient();

  async getPrograms(companyId?: string): Promise<ProgramWithRelations[]> {
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
        onsite_questionnaire:questionnaires!programs_questionnaire_id_fkey(id, name, description),
        presite_questionnaire:questionnaires!programs_presite_questionnaire_id_fkey(id, name, description),
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

    // Create the program with default values
    const { data: program, error: programError } = await this.supabase
      .from("programs")
      .insert([
        {
          name: formData.name,
          description: formData.description || null,
          company_id: formData.company_id,
          frequency_weeks: 52, // Default to annual
          created_by: currentUserId,
          is_deleted: false,
          is_demo: false,
          current_cycle: 1,
          onsite_questionnaire_id: null,
          presite_questionnaire_id: null,
          status: "draft", // Default status
        },
      ])
      .select()
      .single();

    if (programError) throw programError;

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

  async updateProgramOnsiteQuestionnaire(
    programId: number,
    questionnaireId: number | null
  ): Promise<void> {
    await checkDemoAction();

    const { error } = await this.supabase
      .from("programs")
      .update({
        onsite_questionnaire_id: questionnaireId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", programId);

    if (error) throw error;
  }

  async updateProgramPresiteQuestionnaire(
    programId: number,
    questionnaireId: number | null
  ): Promise<void> {
    await checkDemoAction();

    const { error } = await this.supabase
      .from("programs")
      .update({
        presite_questionnaire_id: questionnaireId,
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
