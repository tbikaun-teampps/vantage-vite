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

/**
 * Creates one or more public interviews scoped to individual contacts via email and access code.
 */
export async function createPublicInterviews(
  data: CreateInterviewData
): Promise<Interview[]> {
  const response = await apiClient.post<ApiResponse<Interview[]>>(
    "/interviews/public",
    data
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to create public interview(s)");
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

export async function getInterviewSummary(interviewId: number): Promise<any> {
  const response = await apiClient.get<ApiResponse<any>>(
    `/interviews/${interviewId}/summary`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch interview summary");
  }

  return response.data.data;
}

export async function updateInterview(
  interviewId: number,
  updates: { name?: string; status?: string; notes?: string }
): Promise<any> {
  const response = await apiClient.put<ApiResponse<any>>(
    `/interviews/${interviewId}`,
    updates
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to update interview");
  }

  return response.data.data;
}

export async function deleteInterview(interviewId: number): Promise<void> {
  const response = await apiClient.delete<ApiResponse<any>>(
    `/interviews/${interviewId}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to delete interview");
  }
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

export async function updateInterviewResponse(
  interviewId: number,
  responseId: number,
  data: { rating_score?: number | null; role_ids?: number[] | null }
): Promise<any> {
  const response = await apiClient.put<ApiResponse<any>>(
    `/interviews/${interviewId}/responses/${responseId}`,
    data
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to update interview response"
    );
  }

  return response.data.data;
}

// ====== Interview Response Evidence ======

export async function getInterviewResponseEvidence(
  responseId: number
): Promise<any> {
  const response = await apiClient.get<ApiResponse<any>>(
    `/interviews/responses/${responseId}/evidence`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch interview response evidence"
    );
  }

  return response.data.data;
}

export async function uploadInterviewResponseEvidence(
  responseId: number,
  file: File
): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<ApiResponse<any>>(
    `/interviews/responses/${responseId}/evidence`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to upload interview response evidence"
    );
  }

  return response.data.data;
}

export async function deleteInterviewResponseEvidence(
  responseId: number,
  evidenceId: number
): Promise<any> {
  const response = await apiClient.delete<ApiResponse<any>>(
    `/interviews/responses/${responseId}/evidence/${evidenceId}`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to delete interview response evidence"
    );
  }

  return response.data.data;
}


// ====== Interview Creation Helpers ======

export async function getRolesAssociatedWithAssessment(
  assessmentId: number
): Promise<any> {
  const response = await apiClient.get<ApiResponse<any>>(
    `/interviews/assessment-roles/${assessmentId}`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch roles for assessment"
    );
  }

  return response.data.data;
}