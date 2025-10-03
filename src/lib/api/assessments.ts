import { apiClient } from "./client";
import type {
  AssessmentWithQuestionnaire,
  CreateAssessmentData,
  Assessment,
} from "@/types/assessment";
import type { UpdateInput } from "@/types";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export async function getAssessments(
  companyId: string,
  filters?: any
): Promise<any[]> {
  const response = await apiClient.get<ApiResponse<any[]>>(
    `/companies/${companyId}/assessments`
    // { params: filters }
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch assessments");
  }

  return response.data.data;
}

export async function getAssessmentById(
  id: number
): Promise<AssessmentWithQuestionnaire> {
  const response = await apiClient.get<
    ApiResponse<AssessmentWithQuestionnaire>
  >(`/assessments/${id}`);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch assessment");
  }

  return response.data.data;
}
export async function getCommentsByAssessmentId(id: number): Promise<any[]> {
  const response = await apiClient.get<ApiResponse<any[]>>(
    `/assessments/${id}/comments`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch comments");
  }

  return response.data.data;
}

export async function getEvidenceByAssessmentId(id: number): Promise<any[]> {
  const response = await apiClient.get<ApiResponse<any[]>>(
    `/assessments/${id}/evidence`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch evidence");
  }

  return response.data.data;
}

export async function getInterviewsByAssessmentId(id: number): Promise<any[]> {
  const response = await apiClient.get<ApiResponse<any[]>>(
    `/assessments/${id}/interviews`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch interviews");
  }

  return response.data.data;
}

export async function createOnsiteAssessment(
  data: CreateAssessmentData
): Promise<Assessment> {
  const response = await apiClient.post<ApiResponse<Assessment>>(
    "/assessments/onsite",
    data
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to create assessment");
  }

  return response.data.data;
}

export async function updateAssessment(
  id: number,
  updates: UpdateInput<"assessments">
): Promise<Assessment> {
  const response = await apiClient.put<ApiResponse<Assessment>>(
    `/assessments/${id}`,
    updates
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to update assessment");
  }

  return response.data.data;
}

export async function deleteAssessment(id: number): Promise<void> {
  const response = await apiClient.delete<ApiResponse<null>>(
    `/assessments/${id}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to delete assessment");
  }
}

export async function duplicateAssessment(id: number): Promise<Assessment> {
  const response = await apiClient.post<ApiResponse<Assessment>>(
    `/assessments/${id}/duplicate`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to duplicate assessment");
  }

  return response.data.data;
}
