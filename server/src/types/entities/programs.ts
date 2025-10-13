import type { Database } from "../supabase";

export type Program = Database["public"]["Tables"]["programs"]["Row"];
export type ProgramWithRelations = Program & {
  company: { id: string; name: string } | null;
  objective_count: number;
  phases?: Database["public"]["Tables"]["program_phases"]["Row"][];
  objectives?: Database["public"]["Tables"]["program_objectives"]["Row"][];
};
