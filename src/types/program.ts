import type { DatabaseRow, CreateInput, UpdateInput, Enums } from "./utils";

export type ScopeLevelEnum = Enums["scope_levels"];
export type ProgramExecutionStatusEnum = Enums["program_execution_statuses"];
export type ProgramStatusEnum = Enums["program_statuses"];

export type Program = DatabaseRow<"programs">;
export type ProgramExecution = DatabaseRow<"program_executions">;
export type ProgramObjective = DatabaseRow<"program_objectives">;
export type ProgramScope = DatabaseRow<"program_scopes">;

export interface ProgramWithRelations extends Program {
  questionnaire?: {
    id: number;
    name: string;
  };
  company?: {
    id: number;
    name: string;
  };
  executions?: ProgramExecution[];
  objectives?: ProgramObjective[];
  objective_count?: number;
}

export type CreateProgramData = CreateInput<"programs">;
export type UpdateProgramData = UpdateInput<"programs">;

export interface CreateProgramFormData {
  name: string;
  description?: string;
  scope_level: ScopeLevelEnum;
  frequency_weeks?: number;
  company_id: number;
  objectives: Array<{
    name: string;
    description?: string;
  }>;
  selected_scope_ids?: number[];
}