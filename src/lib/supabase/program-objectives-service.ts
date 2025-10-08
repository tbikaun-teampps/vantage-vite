import { createClient } from "./client";
import type { ProgramObjective } from "@/types/program";

export interface CreateObjectiveData {
  name: string;
  description?: string;
  program_id: number;
}

export interface UpdateObjectiveData {
  name?: string;
  description?: string;
}

export class ProgramObjectivesService {
  private supabase = createClient();

  async getObjectivesByProgramId(
    programId: number
  ): Promise<ProgramObjective[]> {
    const { data: objectives, error } = await this.supabase
      .from("program_objectives")
      .select("*")
      .eq("program_id", programId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return objectives || [];
  }

  async createObjective(data: CreateObjectiveData): Promise<ProgramObjective> {

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
    data: UpdateObjectiveData
  ): Promise<ProgramObjective> {

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
}

export const programObjectivesService = new ProgramObjectivesService();
