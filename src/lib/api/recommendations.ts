import { apiClient } from "./client";
import type { Tables } from "@/types/database";

export type Recommendation = Tables<"recommendations">;

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export async function getRecommendations(
  companyId: string
): Promise<Recommendation[]> {
  const response = await apiClient.get<ApiResponse<Recommendation[]>>(
    `/companies/${companyId}/recommendations`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch recommendations");
  }

  return response.data.data;
}

export async function getRecommendationById(
  id: number
): Promise<Recommendation | null> {
  const response = await apiClient.get<ApiResponse<Recommendation>>(
    `/recommendations/${id}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch recommendation");
  }

  return response.data.data;
}

export async function updateRecommendation(
  id: number,
  updates: Partial<
    Pick<
      Recommendation,
      "content" | "context" | "priority" | "status" | "program_id"
    >
  >
): Promise<Recommendation> {
  const response = await apiClient.put<ApiResponse<Recommendation>>(
    `/recommendations/${id}`,
    updates
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to update recommendation");
  }

  return response.data.data;
}