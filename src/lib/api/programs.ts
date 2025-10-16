import { apiClient } from "./client";
import type { ProgramObjective } from "@/types/program";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface CreateObjectiveData {
  name: string;
  description?: string;
  program_id: number;
}

export interface UpdateObjectiveData {
  name?: string;
  description?: string;
}

// ====== Program Objectives ======

export async function getProgramObjectives(
  programId: number
): Promise<ProgramObjective[]> {
  const response = await apiClient.get<ApiResponse<ProgramObjective[]>>(
    `/programs/${programId}/objectives`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch program objectives"
    );
  }

  return response.data.data;
}

export async function createProgramObjective(
  data: CreateObjectiveData
): Promise<ProgramObjective> {
  const response = await apiClient.post<ApiResponse<ProgramObjective>>(
    `/programs/${data.program_id}/objectives`,
    { name: data.name, description: data.description }
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to create program objective"
    );
  }

  return response.data.data;
}

export async function updateProgramObjective(
  programId: number,
  objectiveId: number,
  updates: UpdateObjectiveData
): Promise<ProgramObjective> {
  const response = await apiClient.put<ApiResponse<ProgramObjective>>(
    `/programs/${programId}/objectives/${objectiveId}`,
    updates
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to update program objective"
    );
  }

  return response.data.data;
}

export async function deleteProgramObjective(
  programId: number,
  objectiveId: number
): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/programs/${programId}/objectives/${objectiveId}`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to delete program objective"
    );
  }
}

export async function getProgramObjectiveCount(
  programId: number
): Promise<number> {
  const response = await apiClient.get<ApiResponse<number>>(
    `/programs/${programId}/objectives/count`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch program objective count"
    );
  }

  return response.data.data;
}
