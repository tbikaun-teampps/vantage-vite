import { apiClient } from "./client";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import type {
  QuestionnaireWithCounts,
  QuestionnaireWithStructure,
  Questionnaire,
  QuestionnaireSection,
  QuestionnaireStep,
  QuestionnaireQuestion,
  QuestionnaireRatingScale,
  CreateQuestionnaireData,
  UpdateQuestionnaireData,
  CreateQuestionnaireSectionData,
  UpdateQuestionnaireSectionData,
  CreateQuestionnaireStepData,
  UpdateQuestionnaireStepData,
  CreateQuestionnaireQuestionData,
  UpdateQuestionnaireQuestionData,
  CreateQuestionnaireRatingScaleData,
  UpdateQuestionnaireRatingScaleData,
} from "@/types/assessment";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

// ============================================================================
// QUESTIONNAIRE OPERATIONS
// ============================================================================

export async function getQuestionnaires(
  companyId: string
): Promise<QuestionnaireWithCounts[]> {
  const response = await apiClient.get<ApiResponse<QuestionnaireWithCounts[]>>(
    `/companies/${companyId}/questionnaires`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch questionnaires for company"
    );
  }

  return response.data.data;
}

export async function getQuestionnaireById(
  id: number
): Promise<QuestionnaireWithStructure> {
  const response = await apiClient.get<ApiResponse<QuestionnaireWithStructure>>(
    `/questionnaires/${id}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch questionnaire");
  }

  return response.data.data;
}

export async function createQuestionnaire(
  data: CreateQuestionnaireData
): Promise<Questionnaire> {
  try {
    const response = await apiClient.post<ApiResponse<Questionnaire[]>>(
      "/questionnaires",
      data
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to create questionnaire");
    }

    toast.success("Questionnaire created successfully");
    return response.data.data[0];
  } catch (error: any) {
    const errorMessage = getErrorMessage(
      error,
      "Failed to create questionnaire"
    );
    toast.error(errorMessage);
    throw error;
  }
}

export async function updateQuestionnaire(
  id: number,
  updates: UpdateQuestionnaireData
): Promise<Questionnaire> {
  try {
    const response = await apiClient.put<ApiResponse<Questionnaire[]>>(
      `/questionnaires/${id}`,
      updates
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to update questionnaire");
    }

    toast.success("Questionnaire updated successfully");
    return response.data.data[0];
  } catch (error: any) {
    const errorMessage = getErrorMessage(
      error,
      "Failed to update questionnaire"
    );
    toast.error(errorMessage);
    throw error;
  }
}

export async function deleteQuestionnaire(id: number): Promise<void> {
  try {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/questionnaires/${id}`
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to delete questionnaire");
    }

    toast.success("Questionnaire deleted successfully");
  } catch (error: any) {
    const errorMessage = getErrorMessage(
      error,
      "Failed to delete questionnaire"
    );
    toast.error(errorMessage);
    throw error;
  }
}

export async function duplicateQuestionnaire(
  id: number
): Promise<Questionnaire> {
  try {
    const response = await apiClient.post<ApiResponse<Questionnaire[]>>(
      `/questionnaires/${id}/duplicate`
    );

    if (!response.data.success) {
      throw new Error(
        response.data.error || "Failed to duplicate questionnaire"
      );
    }

    toast.success("Questionnaire duplicated successfully");
    return response.data.data[0];
  } catch (error: any) {
    const errorMessage = getErrorMessage(
      error,
      "Failed to duplicate questionnaire"
    );
    toast.error(errorMessage);
    throw error;
  }
}

export async function checkQuestionnaireUsage(id: number): Promise<any> {
  const response = await apiClient.get<ApiResponse<any>>(
    `/questionnaires/${id}/usage`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to check questionnaire usage"
    );
  }

  return response.data.data;
}

// ============================================================================
// SECTION OPERATIONS
// ============================================================================

export async function createSection(
  data: CreateQuestionnaireSectionData
): Promise<QuestionnaireSection> {
  try {
    const response = await apiClient.post<ApiResponse<QuestionnaireSection>>(
      "/questionnaires/sections",
      data
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to create section");
    }

    toast.success("Section created successfully");
    return response.data.data;
  } catch (error: any) {
    const errorMessage = getErrorMessage(error, "Failed to create section");
    toast.error(errorMessage);
    throw error;
  }
}

export async function updateSection(
  id: number,
  updates: UpdateQuestionnaireSectionData
): Promise<QuestionnaireSection> {
  try {
    const response = await apiClient.put<ApiResponse<QuestionnaireSection>>(
      `/questionnaires/sections/${id}`,
      updates
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to update section");
    }

    toast.success("Section updated successfully");
    return response.data.data;
  } catch (error: any) {
    const errorMessage = getErrorMessage(error, "Failed to update section");
    toast.error(errorMessage);
    throw error;
  }
}

export async function deleteSection(id: number): Promise<void> {
  try {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/questionnaires/sections/${id}`
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to delete section");
    }

    toast.success("Section deleted successfully");
  } catch (error: any) {
    const errorMessage = getErrorMessage(error, "Failed to delete section");
    toast.error(errorMessage);
    throw error;
  }
}

// ============================================================================
// STEP OPERATIONS
// ============================================================================

export async function createStep(
  data: CreateQuestionnaireStepData
): Promise<QuestionnaireStep> {
  try {
    const response = await apiClient.post<ApiResponse<QuestionnaireStep>>(
      "/questionnaires/steps",
      {
        questionnaire_section_id: data.questionnaire_section_id,
        title: data.title,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to create step");
    }

    toast.success("Step created successfully");
    return response.data.data;
  } catch (error: any) {
    const errorMessage = getErrorMessage(error, "Failed to create step");
    toast.error(errorMessage);
    throw error;
  }
}

export async function updateStep(
  id: number,
  updates: UpdateQuestionnaireStepData
): Promise<QuestionnaireStep> {
  try {
    const response = await apiClient.put<ApiResponse<QuestionnaireStep>>(
      `/questionnaires/steps/${id}`,
      updates
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to update step");
    }

    toast.success("Step updated successfully");
    return response.data.data;
  } catch (error: any) {
    const errorMessage = getErrorMessage(error, "Failed to update step");
    toast.error(errorMessage);
    throw error;
  }
}

export async function deleteStep(id: number): Promise<void> {
  try {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/questionnaires/steps/${id}`
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to delete step");
    }

    toast.success("Step deleted successfully");
  } catch (error: any) {
    const errorMessage = getErrorMessage(error, "Failed to delete step");
    toast.error(errorMessage);
    throw error;
  }
}

// ============================================================================
// QUESTION OPERATIONS
// ============================================================================

export async function createQuestion(
  data: CreateQuestionnaireQuestionData
): Promise<QuestionnaireQuestion> {
  try {
    const response = await apiClient.post<ApiResponse<QuestionnaireQuestion>>(
      "/questionnaires/questions",
      {
        questionnaire_step_id: data.questionnaire_step_id,
        title: data.title,
        question_text: data.question_text,
        context: data.context,
        order_index: data.order_index,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to create question");
    }

    toast.success("Question created successfully");
    return response.data.data;
  } catch (error: any) {
    const errorMessage = getErrorMessage(error, "Failed to create question");
    toast.error(errorMessage);
    throw error;
  }
}

export async function updateQuestion(
  id: number,
  updates: UpdateQuestionnaireQuestionData
): Promise<QuestionnaireQuestion> {
  try {
    const response = await apiClient.put<ApiResponse<QuestionnaireQuestion>>(
      `/questionnaires/questions/${id}`,
      updates
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to update question");
    }

    toast.success("Question updated successfully");
    return response.data.data;
  } catch (error: any) {
    const errorMessage = getErrorMessage(error, "Failed to update question");
    toast.error(errorMessage);
    throw error;
  }
}

export async function deleteQuestion(id: number): Promise<void> {
  try {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/questionnaires/questions/${id}`
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to delete question");
    }

    toast.success("Question deleted successfully");
  } catch (error: any) {
    const errorMessage = getErrorMessage(error, "Failed to delete question");
    toast.error(errorMessage);
    throw error;
  }
}

export async function duplicateQuestion(
  id: number
): Promise<QuestionnaireQuestion> {
  try {
    const response = await apiClient.post<ApiResponse<QuestionnaireQuestion>>(
      `/questionnaires/questions/${id}/duplicate`
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to duplicate question");
    }

    toast.success("Question duplicated successfully");
    return response.data.data;
  } catch (error: any) {
    const errorMessage = getErrorMessage(error, "Failed to duplicate question");
    toast.error(errorMessage);
    throw error;
  }
}

// ============================================================================
// RATING SCALE OPERATIONS
// ============================================================================

export async function getRatingScales(
  questionnaireId: number
): Promise<QuestionnaireRatingScale[]> {
  const response = await apiClient.get<ApiResponse<QuestionnaireRatingScale[]>>(
    `/questionnaires/${questionnaireId}/rating-scales`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch rating scales");
  }

  return response.data.data;
}

export async function createRatingScale(
  questionnaireId: number,
  data: CreateQuestionnaireRatingScaleData
): Promise<QuestionnaireRatingScale> {
  try {
    const response = await apiClient.post<
      ApiResponse<QuestionnaireRatingScale>
    >(`/questionnaires/${questionnaireId}/rating-scale`, data);

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to create rating scale");
    }

    toast.success("Rating scale created successfully");
    return response.data.data;
  } catch (error: any) {
    const errorMessage = getErrorMessage(
      error,
      "Failed to create rating scale"
    );
    toast.error(errorMessage);
    throw error; // Re-throw so components can handle loading states
  }
}

export async function createRatingScalesBatch(
  questionnaireId: number,
  scales: CreateQuestionnaireRatingScaleData[]
): Promise<QuestionnaireRatingScale[]> {
  try {
    const response = await apiClient.post<
      ApiResponse<QuestionnaireRatingScale[]>
    >(`/questionnaires/${questionnaireId}/rating-scales/batch`, { scales });

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to create rating scales");
    }

    toast.success(
      `${scales.length} rating scale${scales.length > 1 ? "s" : ""} created successfully`
    );
    return response.data.data;
  } catch (error: any) {
    const errorMessage = getErrorMessage(
      error,
      "Failed to create rating scales"
    );
    toast.error(errorMessage);
    throw error;
  }
}

export async function updateRatingScale(
  id: number,
  updates: UpdateQuestionnaireRatingScaleData
): Promise<QuestionnaireRatingScale> {
  try {
    const response = await apiClient.put<ApiResponse<QuestionnaireRatingScale>>(
      `/questionnaires/rating-scales/${id}`,
      updates
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to update rating scale");
    }

    toast.success("Rating scale updated successfully");
    return response.data.data;
  } catch (error: any) {
    const errorMessage = getErrorMessage(
      error,
      "Failed to update rating scale"
    );
    toast.error(errorMessage);
    throw error;
  }
}

export async function deleteRatingScale(id: number): Promise<void> {
  try {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/questionnaires/rating-scales/${id}`
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to delete rating scale");
    }

    toast.success("Rating scale deleted successfully");
  } catch (error: any) {
    const errorMessage = getErrorMessage(
      error,
      "Failed to delete rating scale"
    );
    toast.error(errorMessage);
    throw error;
  }
}

// ============================================================================
// QUESTION RATING SCALE AND ROLE ASSOCIATIONS
// ============================================================================

// Note: These operations might need to be handled differently based on the server implementation
// For now, we'll implement them as direct calls, but they might need to be integrated into
// the question update operations on the server side

export async function addQuestionRatingScale(data: {
  questionId: number;
  questionnaire_rating_scale_id: number;
  description: string;
}): Promise<any> {
  try {
    const response = await apiClient.post<ApiResponse<any>>(
      `/questionnaires/questions/${data.questionId}/rating-scales`,
      {
        questionnaire_rating_scale_id: data.questionnaire_rating_scale_id,
        description: data.description,
      }
    );

    if (!response.data.success) {
      throw new Error(
        response.data.error || "Failed to add question rating scale"
      );
    }

    toast.success("Rating scale added to question");
    return response.data.data;
  } catch (error: any) {
    const errorMessage = getErrorMessage(
      error,
      "Failed to add question rating scale"
    );
    toast.error(errorMessage);
    throw error;
  }
}

export async function updateQuestionRatingScale(data: {
  questionId: number;
  questionRatingScaleId: number;
  description: string;
}): Promise<any> {
  try {
    const response = await apiClient.put<ApiResponse<any>>(
      `/questionnaires/questions/${data.questionId}/rating-scales/${data.questionRatingScaleId}`,
      {
        description: data.description,
      }
    );

    if (!response.data.success) {
      throw new Error(
        response.data.error || "Failed to update question rating scale"
      );
    }

    toast.success("Question rating scale updated successfully");
    return response.data.data;
  } catch (error: any) {
    const errorMessage = getErrorMessage(
      error,
      "Failed to update question rating scale"
    );
    toast.error(errorMessage);
    throw error;
  }
}

export async function addAllQuestionnaireRatingScales(data: {
  questionnaireId: number;
  questionId: number;
}): Promise<any[]> {
  try {
    const response = await apiClient.post<ApiResponse<any[]>>(
      `/questionnaires/questions/${data.questionId}/add-questionnaire-rating-scales`,
      {
        questionnaireId: data.questionnaireId,
      }
    );

    if (!response.data.success) {
      throw new Error(
        response.data.error || "Failed to add all questionnaire rating scales"
      );
    }

    toast.success("All rating scales added to question");
    return response.data.data;
  } catch (error: any) {
    const errorMessage = getErrorMessage(
      error,
      "Failed to add all questionnaire rating scales"
    );
    toast.error(errorMessage);
    throw error;
  }
}

export async function deleteQuestionRatingScale(data: {
  questionId: number;
  questionRatingScaleId: number;
}): Promise<void> {
  try {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/questionnaires/questions/${data.questionId}/rating-scales/${data.questionRatingScaleId}`
    );

    if (!response.data.success) {
      throw new Error(
        response.data.error || "Failed to delete question rating scale"
      );
    }

    toast.success("Rating scale removed from question");
  } catch (error: any) {
    const errorMessage = getErrorMessage(
      error,
      "Failed to delete question rating scale"
    );
    toast.error(errorMessage);
    throw error;
  }
}

export async function updateQuestionRoles(
  questionId: number,
  sharedRoleIds: number[]
): Promise<any> {
  try {
    const response = await apiClient.put<ApiResponse<null>>(
      `/questionnaires/questions/${questionId}/applicable-roles`,
      { shared_role_ids: sharedRoleIds }
    );

    if (!response.data.success) {
      throw new Error(
        response.data.error || "Failed to update question applicable roles"
      );
    }

    toast.success("Question roles updated successfully");
    return response.data.data;
  } catch (error: any) {
    const errorMessage = getErrorMessage(
      error,
      "Failed to update question applicable roles"
    );
    toast.error(errorMessage);
    throw error;
  }
}

// ===== Import =====
export async function importQuestionnaire(data: {
  file: File;
  name: string;
  description?: string;
  guidelines?: string;
}): Promise<Questionnaire> {
  try {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("name", data.name);
    if (data.description) {
      formData.append("description", data.description);
    }
    if (data.guidelines) {
      formData.append("guidelines", data.guidelines);
    }

    const response = await apiClient.post<ApiResponse<Questionnaire>>(
      `/questionnaires/import`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to import questionnaire");
    }

    toast.success("Questionnaire imported successfully");
    return response.data.data;
  } catch (error: any) {
    const errorMessage = getErrorMessage(
      error,
      "Failed to import questionnaire"
    );
    toast.error(errorMessage);
    throw error;
  }
}
