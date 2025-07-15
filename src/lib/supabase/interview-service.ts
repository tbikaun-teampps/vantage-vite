import { createClient } from "./client";
import { useCompanyStore } from "@/stores/company-store";
import { rolesService } from "./roles-service";
import type {
  Interview,
  InterviewWithResponses,
  InterviewSession,
  InterviewProgress,
  CreateInterviewData,
  UpdateInterviewData,
  CreateInterviewResponseData,
  UpdateInterviewResponseData,
  CreateInterviewResponseActionData,
  UpdateInterviewResponseActionData,
  InterviewResponseAction,
  InterviewFilters,
  Role,
  QuestionnaireQuestion,
} from "@/types/assessment";
import { checkDemoAction } from "./utils";

export class InterviewService {
  private supabase = createClient();

  private getQuestionSelectQuery() {
    return `
      id,
      title,
      question_text,
      context,
      order_index,
      questionnaire_question_rating_scales(
        id,
        description,
        questionnaire_rating_scale:questionnaire_rating_scales(
          id,
          name,
          description,
          order_index,
          value
        )
      )
    `;
  }

  // Interview CRUD operations
  async getInterviews(
    filters?: InterviewFilters
  ): Promise<InterviewWithResponses[]> {
    try {
      // Get the selected company from company store to filter by
      const selectedCompany = useCompanyStore.getState().selectedCompany;

      let query = this.supabase
        .from("interviews")
        .select(
          `
          *,
          assessment:assessments!inner(id, name, company_id),
          interviewer:profiles(id, full_name, email),
          interview_responses(
            *,
            question:questionnaire_questions(
              ${this.getQuestionSelectQuery()}
            ),
            interview_response_roles(
              role:roles(*)
            ),
            interview_response_actions(*)
          )
        `
        )
        .eq("is_deleted", false);

      // Filter by company through the assessment
      if (selectedCompany) {
        query = query.eq("assessment.company_id", selectedCompany.id);
      }

      // Apply filters
      if (filters) {
        if (filters.assessment_id) {
          query = query.eq("assessment_id", filters.assessment_id);
        }
        if (filters.status && filters.status.length > 0) {
          query = query.in("status", filters.status);
        }
      }

      const { data: interviews, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;

      // Transform interviews data
      const data =
        interviews?.map((interview) => ({
          ...interview,
          assessment: {
            id: interview.assessment?.id,
            name: interview.assessment?.name,
            type: interview.assessment?.type,
            company_id: interview.assessment?.company_id,
          },
          completion_rate: this.calculateCompletionRate(
            interview.interview_responses || []
          ),
          average_score: this.calculateAverageScore(
            interview.interview_responses || []
          ),
          interviewer: {
            id: interview.interviewer?.id || interview.interviewer_id,
            name:
              interview.interviewer?.full_name ||
              interview.interviewer?.email
          },
          responses:
            interview.interview_responses?.map((response) => ({
              ...response,
              question: this.transformQuestionData(response.question),
              response_roles:
                response.interview_response_roles?.map((rr) => rr.role) || [],
              actions: response.interview_response_actions || [],
            })) || [],
        })) || [];

      return data;
    } catch (error) {
      console.error("Error in getInterviews:", error);
      // Return empty array on error to prevent page crashes
      return [];
    }
  }

  async getInterviewById(id: string): Promise<InterviewWithResponses | null> {
    const { data: interview, error } = await this.supabase
      .from("interviews")
      .select(
        `
        *,
        assessment:assessments!inner(id, name, type),
        interviewer:profiles(id, full_name, email),
        interview_responses(
          *,
          question:questionnaire_questions(
            ${this.getQuestionSelectQuery()}
          ),
          interview_response_roles(
            role:roles(*)
          ),
          interview_response_actions(*)
        )
      `
      )
      .eq("id", id)
      .eq("is_deleted", false)
      .single();

    if (error) throw error;
    if (!interview) return null;

    return {
      ...interview,
      assessment: {
        id: interview.assessment?.id,
        name: interview.assessment?.name,
        type: interview.assessment?.type,
      },
      interviewer: {
        id: interview.interviewer?.id || interview.interviewer_id,
        name:
          interview.interviewer?.full_name ||
          interview.interviewer?.email ||
          "Unknown",
      },
      responses:
        interview.interview_responses?.map((response) => ({
          ...response,
          question: this.transformQuestionData(response.question),
          response_roles:
            response.interview_response_roles?.map((rr) => rr.role) || [],
          actions: response.interview_response_actions || [],
        })) || [],
    };
  }

  async createInterview(
    interviewData: CreateInterviewData
  ): Promise<Interview> {
    await checkDemoAction();
    // First, get all questions for the assessment's questionnaire
    const { data: assessment, error: assessmentError } = await this.supabase
      .from("assessments")
      .select(
        `
        id,
        questionnaire:questionnaires(
          id,
          questionnaire_sections(
            id,
            questionnaire_steps(
              id,
              questionnaire_questions(id)
            )
          )
        )
      `
      )
      .eq("id", interviewData.assessment_id)
      .single();

    if (assessmentError) throw assessmentError;

    // Extract all question IDs
    const questionIds: number[] = [];
    if (assessment.questionnaire?.questionnaire_sections) {
      for (const section of assessment.questionnaire.questionnaire_sections) {
        for (const step of section.questionnaire_steps) {
          for (const question of step.questionnaire_questions) {
            questionIds.push(question.id);
          }
        }
      }
    }

    // Create the interview
    const { data: interview, error: interviewError } = await this.supabase
      .from("interviews")
      .insert([
        {
          ...interviewData,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (interviewError) throw interviewError;

    // Create interview responses for all questions with null rating_score
    if (questionIds.length > 0) {
      // created_by should be automatically populated in the db.
      const responseData = questionIds.map((questionId) => ({
        interview_id: interview.id,
        questionnaire_question_id: questionId,
        rating_score: null,
        comments: null,
        answered_at: null,
      }));

      const { data: createdResponses, error: responsesError } = await this.supabase
        .from("interview_responses")
        .insert(responseData)
        .select("id");

      if (responsesError) {
        // If response creation fails, we should clean up the interview
        await this.supabase.from("interviews").delete().eq("id", interview.id);
        throw responsesError;
      }

      // For public interviews, pre-populate role associations to avoid duplicates on saves
      if (interview.is_public && interview.assigned_role_id && createdResponses) {
        const roleAssociations = createdResponses.map((response) => ({
          interview_response_id: response.id,
          role_id: interview.assigned_role_id,
        }));

        const { error: roleAssociationsError } = await this.supabase
          .from("interview_response_roles")
          .insert(roleAssociations);

        if (roleAssociationsError) {
          // If role association fails, clean up the interview and responses
          await this.supabase.from("interviews").delete().eq("id", interview.id);
          throw roleAssociationsError;
        }
      }
    }

    return interview;
  }

  async updateInterview(
    id: string,
    updates: UpdateInterviewData,
    isPublic: boolean = false
  ): Promise<Interview> {
    if (!isPublic) await checkDemoAction();
    const { data, error } = await this.supabase
      .from("interviews")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteInterview(id: string): Promise<void> {
    await checkDemoAction();
    const { error } = await this.supabase
      .from("interviews")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  }

  async bulkUpdateInterviewStatus(
    interviewIds: string[],
    status: Interview["status"]
  ): Promise<void> {
    await checkDemoAction();
    const { error } = await this.supabase
      .from("interviews")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .in("id", interviewIds);
    if (error) throw error;
  }

  // Interview Response operations
  async createInterviewResponse(
    responseData: CreateInterviewResponseData
  ): Promise<void> {
    await checkDemoAction();
    const { data: response, error } = await this.supabase
      .from("interview_responses")
      .insert([
        {
          interview_id: responseData.interview_id,
          questionnaire_question_id: responseData.questionnaire_question_id,
          rating_score: responseData.rating_score ?? null,
          comments: responseData.comments,
          answered_at:
            responseData.rating_score !== null &&
            responseData.rating_score !== undefined
              ? new Date().toISOString()
              : null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Create role associations if provided
    if (responseData.role_ids && responseData.role_ids.length > 0) {
      await this.updateResponseRoles(response.id, responseData.role_ids);
    }
  }

  async updateInterviewResponse(
    id: string,
    updates: UpdateInterviewResponseData
  ): Promise<void> {
    await checkDemoAction();
    // Update the response
    const { error } = await this.supabase
      .from("interview_responses")
      .update({
        rating_score: updates.rating_score,
        comments: updates.comments,
        answered_at:
          updates.rating_score !== null && updates.rating_score !== undefined
            ? new Date().toISOString()
            : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;

    // Update role associations if provided
    if (updates.role_ids !== undefined) {
      // Get the interview response to access company_id
      const { error: responseError } = await this.supabase
        .from("interview_responses")
        .select("*")
        .eq("id", id)
        .single();

      if (responseError) throw responseError;

      await this.updateResponseRoles(id, updates.role_ids);
    }
  }

  async deleteInterviewResponse(id: string): Promise<void> {
    await checkDemoAction();
    const { error } = await this.supabase
      .from("interview_responses")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  }

  // Interview Response Action operations
  async createInterviewResponseAction(
    actionData: CreateInterviewResponseActionData
  ): Promise<InterviewResponseAction> {
    await checkDemoAction();
    const { data, error } = await this.supabase
      .from("interview_response_actions")
      .insert([
        {
          interview_response_id: actionData.interview_response_id,
          title: actionData.title,
          description: actionData.description,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateInterviewResponseAction(
    id: string,
    updates: UpdateInterviewResponseActionData
  ): Promise<InterviewResponseAction> {
    await checkDemoAction();
    const { data, error } = await this.supabase
      .from("interview_response_actions")
      .update({
        title: updates.title,
        description: updates.description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteInterviewResponseAction(id: string): Promise<void> {
    await checkDemoAction();
    const { error } = await this.supabase
      .from("interview_response_actions")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;
  }

  // Response role associations
  private async updateResponseRoles(
    responseId: string,
    roleIds: string[],
    isPublic: boolean = false
  ): Promise<void> {
    if (!isPublic) {
      // Check authentication / demo status...
      await checkDemoAction();
    }
    // First, delete existing associations
    const { error: deleteError } = await this.supabase
      .from("interview_response_roles")
      .delete()
      .eq("interview_response_id", responseId);

    if (deleteError) throw deleteError;

    // Then, insert new associations
    if (roleIds.length > 0) {
      const { error: insertError } = await this.supabase
        .from("interview_response_roles")
        .insert(
          roleIds.map((roleId) => ({
            interview_response_id: responseId,
            role_id: roleId,
          }))
        );

      if (insertError) throw insertError;
    }
  }

  // Interview Session operations
  async getInterviewSession(interviewId: string): Promise<InterviewSession> {
    // Get interview with responses
    const interview = await this.getInterviewById(interviewId);
    if (!interview) throw new Error("Interview not found");

    // Get assessment and questionnaire structure with enhanced question data
    const { data: assessment, error: assessmentError } = await this.supabase
      .from("assessments")
      .select(
        `
        *,
        questionnaire:questionnaires(
          *,
          questionnaire_sections(
            *,
            questionnaire_steps(
              *,
              questionnaire_questions(
                ${this.getQuestionSelectQuery()}
              )
            )
          )
        )
      `
      )
      .eq("id", interview.assessment_id)
      .single();

    if (assessmentError) throw assessmentError;

    // Transform questionnaire structure with enhanced question data
    const questionnaireStructure =
      assessment.questionnaire.questionnaire_sections
        ?.map((section) => ({
          ...section,
          steps:
            section.questionnaire_steps
              ?.map((step) => ({
                ...step,
                questions:
                  step.questionnaire_questions
                    ?.map((question) => this.transformQuestionData(question))
                    ?.sort((a, b) => a.order_index - b.order_index) || [],
              }))
              ?.sort((a, b) => a.order_index - b.order_index) || [],
        }))
        ?.sort((a, b) => a.order_index - b.order_index) || [];

    // Calculate progress
    const progress = this.calculateInterviewProgress(interview);

    // Find current question (first unanswered question)
    let currentQuestion: QuestionnaireQuestion | undefined;
    const answeredQuestionIds = interview.responses.map(
      (r) => r.questionnaire_question_id
    );

    for (const section of questionnaireStructure) {
      for (const step of section.steps) {
        for (const question of step.questions) {
          if (!answeredQuestionIds.includes(question.id)) {
            currentQuestion = question;
            break;
          }
        }
        if (currentQuestion) break;
      }
      if (currentQuestion) break;
    }

    return {
      interview,
      progress,
      current_question: currentQuestion,
      questionnaire_structure: questionnaireStructure,
    };
  }

  // Transform question data to include rating scales
  private transformQuestionData(questionData: any): QuestionnaireQuestion {
    return {
      ...questionData,
      rating_scales:
        questionData.questionnaire_question_rating_scales
          ?.map((qrs: any) => ({
            id: qrs.id,
            description: qrs.description,
            ...qrs.questionnaire_rating_scale,
          }))
          ?.sort((a: any, b: any) => a.order_index - b.order_index) || [],
    };
  }

  calculateInterviewProgress(
    interview: InterviewWithResponses
  ): InterviewProgress {
    // This would need access to the questionnaire structure to calculate total questions
    // For now, we'll use the responses to estimate progress
    const answeredQuestions = interview.responses.length;

    // You might want to fetch the total questions from the questionnaire
    // For now, we'll estimate based on typical questionnaires
    const estimatedTotalQuestions = Math.max(answeredQuestions, 20); // Minimum estimate

    const completionPercentage =
      estimatedTotalQuestions > 0
        ? Math.min((answeredQuestions / estimatedTotalQuestions) * 100, 100)
        : 0;

    return {
      interview_id: interview.id,
      total_questions: estimatedTotalQuestions,
      answered_questions: answeredQuestions,
      completion_percentage: Math.round(completionPercentage),
      current_step: undefined, // Would need questionnaire structure to determine
      current_section: undefined, // Would need questionnaire structure to determine
      next_question_id: undefined, // Would need questionnaire structure to determine
    };
  }

  // Role operations - using unified roles service
  async getRoles(): Promise<Role[]> {
    return rolesService.getRoles({
      includeSharedRole: true,
      includeOrgChart: true,
      includeCompany: true,
    });
  }

  // Get roles filtered by the site associated with the given assessment
  async getRolesByAssessmentSite(assessmentId: string): Promise<Role[]> {
    return rolesService.getRolesByAssessmentSite(assessmentId);
  }

  // Get roles that are both associated with a question AND available at the assessment site
  async getRolesIntersectionForQuestion(
    assessmentId: string,
    questionId: string
  ): Promise<Role[]> {
    return rolesService.getRolesIntersectionForQuestion(
      assessmentId,
      questionId
    );
  }

  // Get questionnaire ID for an assessment
  async getQuestionnaireIdForAssessment(
    assessmentId: string
  ): Promise<string | null> {
    try {
      const { data: assessment, error } = await this.supabase
        .from("assessments")
        .select("questionnaire_id")
        .eq("id", assessmentId)
        .single();

      if (error || !assessment?.questionnaire_id) {
        console.error("Error getting questionnaire ID for assessment:", error);
        return null;
      }

      return assessment.questionnaire_id;
    } catch (error) {
      console.error("Error in getQuestionnaireIdForAssessment:", error);
      return null;
    }
  }

  // Get all roles that are associated with ANY question in the questionnaire AND available at the assessment site
  async getAllRolesForQuestionnaire(assessmentId: string): Promise<Role[]> {
    return rolesService.getAllRolesForQuestionnaire(assessmentId);
  }

  // Calculation methods
  private calculateCompletionRate(responses: any[]): number {
    if (!responses || responses.length === 0) {
      return 0;
    }

    const completedResponses = responses.filter(
      (response) =>
        response.rating_score !== null && response.rating_score !== undefined
    );

    return completedResponses.length / responses.length;
  }

  private calculateAverageScore(responses: any[]): number {
    if (!responses || responses.length === 0) {
      return 0;
    }

    const scoredResponses = responses.filter(
      (response) =>
        response.rating_score !== null && response.rating_score !== undefined
    );

    if (scoredResponses.length === 0) {
      return 0;
    }

    const totalScore = scoredResponses.reduce(
      (sum, response) => sum + response.rating_score,
      0
    );

    return totalScore / scoredResponses.length;
  }

  // Public interview methods
  async validatePublicInterviewAccess(
    interviewId: string,
    accessCode: string,
    email: string
  ): Promise<boolean> {
    const { data: interview, error } = await this.supabase
      .from("interviews")
      .select("id, access_code, interviewee_email, is_public, enabled")
      .eq("id", interviewId)
      .eq("is_public", true)
      .eq("enabled", true)
      .single();

    if (error || !interview) {
      throw new Error("Interview not found or not accessible");
    }

    if (interview.access_code !== accessCode) {
      throw new Error("Invalid access code");
    }

    if (interview.interviewee_email?.toLowerCase() !== email.toLowerCase()) {
      throw new Error("Email address does not match");
    }

    return true;
  }

  async getPublicInterview(
    interviewId: string,
    accessCode: string,
    email: string
  ): Promise<InterviewWithResponses | null> {
    // First validate access
    await this.validatePublicInterviewAccess(interviewId, accessCode, email);

    // Then just return the regular interview
    return this.getInterviewById(interviewId);
  }

  // Public interview response methods (no auth required)
  async updatePublicInterviewResponse(
    responseId: string,
    interviewId: string,
    accessCode: string,
    email: string,
    updates: UpdateInterviewResponseData
  ): Promise<void> {
    // First validate access
    await this.validatePublicInterviewAccess(interviewId, accessCode, email);
    const { error } = await this.supabase
      .from("interview_responses")
      .update({
        rating_score: updates.rating_score,
        comments: updates.comments,
        answered_at:
          updates.rating_score !== null && updates.rating_score !== undefined
            ? new Date().toISOString()
            : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", responseId);

    if (error) throw error;
  }

  async createPublicInterviewResponseAction(
    interviewId: string,
    accessCode: string,
    email: string,
    data: CreateInterviewResponseActionData
  ): Promise<InterviewResponseAction> {
    // First validate access
    await this.validatePublicInterviewAccess(interviewId, accessCode, email);

    // Create the action without auth checks
    const { data: action, error } = await this.supabase
      .from("interview_response_actions")
      .insert({
        ...data,
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) throw error;
    return action;
  }

  async updatePublicInterviewResponseAction(
    actionId: string,
    interviewId: string,
    accessCode: string,
    email: string,
    updates: UpdateInterviewResponseActionData
  ): Promise<InterviewResponseAction> {
    // First validate access
    await this.validatePublicInterviewAccess(interviewId, accessCode, email);

    // Update the action without auth checks
    const { data: action, error } = await this.supabase
      .from("interview_response_actions")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", actionId)
      .select("*")
      .single();

    if (error) throw error;
    return action;
  }

  async deletePublicInterviewResponseAction(
    actionId: string,
    interviewId: string,
    accessCode: string,
    email: string
  ): Promise<void> {
    // First validate access
    await this.validatePublicInterviewAccess(interviewId, accessCode, email);

    // Soft delete the action without auth checks
    const { error } = await this.supabase
      .from("interview_response_actions")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", actionId);

    if (error) throw error;
  }
}

export const interviewService = new InterviewService();
