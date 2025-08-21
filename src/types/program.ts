import type { DatabaseRow, CreateInput, UpdateInput, Enums } from "./utils";

export type ProgramExecutionStatusEnum = Enums["program_execution_statuses"];
export type ProgramStatusEnum = Enums["program_statuses"];

export type Program = DatabaseRow<"programs">;
export type ProgramExecution = DatabaseRow<"program_executions">;
export type ProgramObjective = DatabaseRow<"program_objectives">;

export interface ProgramWithRelations extends Program {
  onsite_questionnaire?: {
    id: number;
    name: string;
    description?: string;
  };
  presite_questionnaire?: {
    id: number;
    name: string;
    description?: string;
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
  company_id: string;
}