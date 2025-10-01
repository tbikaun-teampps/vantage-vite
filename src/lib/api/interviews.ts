import { apiClient } from "./client";
import type { Interview, CreateInterviewData } from "@/types/assessment";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export async function createInterview(
  data: CreateInterviewData
): Promise<Interview> {
  const response = await apiClient.post<ApiResponse<Interview>>(
    "/interviews",
    data
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to create interview");
  }

  return response.data.data;
}

export async function getInterviewById(interviewId: number): Promise<any> {
  const response = await apiClient.get<ApiResponse<any>>(
    `/interviews/${interviewId}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch interview");
  }

  return response.data.data;
}

export async function getInterviewProgress(interviewId: number): Promise<any> {
  const response = await apiClient.get<ApiResponse<any>>(
    `/interviews/${interviewId}/progress`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch interview progress"
    );
  }

  return response.data.data;
}

export async function getInterviewQuestionById(
  interviewId: number,
  questionId: number
): Promise<any> {
  const response = await apiClient.get<ApiResponse<any>>(
    `/interviews/${interviewId}/questions/${questionId}`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch interview question"
    );
  }

  return response.data.data;
}

// ====== Interview Actions ======

export async function getInterviewResponseActions(
  responseId: number
): Promise<any> {
  const response = await apiClient.get<ApiResponse<any>>(
    `/interviews/responses/${responseId}/actions`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch interview response actions"
    );
  }

  return response.data.data;
}

export async function addInterviewResponseAction(
  responseId: number,
  action: { title?: string; description: string }
): Promise<any> {
  const response = await apiClient.post<ApiResponse<any>>(
    `/interviews/responses/${responseId}/actions`,
    action
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to add interview response action"
    );
  }

  return response.data.data;
}

export async function updateInterviewResponseAction(
  responseId: number,
  actionId: number,
  action: { title?: string; description?: string }
): Promise<any> {
  const response = await apiClient.put<ApiResponse<any>>(
    `/interviews/responses/${responseId}/actions/${actionId}`,
    action
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to update interview response action"
    );
  }

  return response.data.data;
}

export async function deleteInterviewResponseAction(
  responseId: number,
  actionId: number
): Promise<any> {
  const response = await apiClient.delete<ApiResponse<any>>(
    `/interviews/responses/${responseId}/actions/${actionId}`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to delete interview response action"
    );
  }

  return response.data.data;
}

// ====== Interview Response Comments ======

export async function getInterviewResponseComments(
  responseId: number
): Promise<any> {
  const response = await apiClient.get<ApiResponse<any>>(
    `/interviews/responses/${responseId}/comments`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch interview response comments"
    );
  }

  return response.data.data;
}

export async function updateInterviewResponseComments(
  responseId: number,
  comments: string
): Promise<any> {
  const response = await apiClient.put<ApiResponse<any>>(
    `/interviews/responses/${responseId}/comments`,
    { comments }
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to update interview response comments"
    );
  }

  return response.data.data;
}