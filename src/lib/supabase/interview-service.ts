import { createClient } from "./client";
import { rolesService } from "./roles-service";
import type {
  Interview,
  InterviewWithResponses,
  InterviewProgress,
  CreateInterviewResponseData,
  UpdateInterviewResponseData,
  InterviewResponseAction,
  InterviewFilters,
  Role,
  QuestionnaireQuestion,
  CreateInterviewData,
  CreateInterviewResponseActionData,
  InterviewResponse,
  InterviewResponseWithDetails,
  InterviewX,
  InterviewXWithResponses,
  AssessmentWithQuestionnaire,
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
    companyId: string,
    filters?: InterviewFilters
  ): Promise<InterviewWithResponses[]> {
    try {
      console.log("fetching interviews with: ", companyId, filters);
      let query = this.supabase
        .from("interviews")
        .select(
          `
          *,
          assessment:assessments!inner(
            id, 
            name, 
            company_id,
            questionnaire:questionnaires(
              id,
              questionnaire_rating_scales(
                id,
                value,
                order_index
              )
            )
          ),
          interviewer:profiles(id, full_name, email),
          assigned_role:roles(id, shared_role:shared_roles(id, name)),
          interview_responses(
            *,
            question:questionnaire_questions(
              ${this.getQuestionSelectQuery()}
            ),
            interview_response_roles(
              role:roles(*)
            )
          )
        `
        )
        .eq("is_deleted", false)
        .eq("assessment.company_id", companyId);

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

      console.log("interviews: ", interviews);

      if (error) throw error;

      // Transform interviews data
      const data =
        interviews?.map((interview) => {
          const ratingRange = this.calculateRatingValueRange(
            interview.assessment?.questionnaire
          );

          return {
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
            min_rating_value: ratingRange.min,
            max_rating_value: ratingRange.max,
            interviewee: {
              email: interview?.interviewee_email,
              role: interview.assigned_role?.shared_role?.name,
            },
            interviewer: {
              id: interview.interviewer?.id || interview.interviewer_id,
              name:
                interview.interviewer?.full_name ||
                interview.interviewer?.email,
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
        }) || [];

      return data;
    } catch (error) {
      console.error("Error in getInterviews:", error);
      // Return empty array on error to prevent page crashes
      return [];
    }
  }

  async getInterviewById(id: number): Promise<InterviewXWithResponses | null> {
    try {
      const { data: interview, error } = (await this.supabase
        .from("interviews")
        .select(
          `
          *,
          assessment:assessments(
            id,
            name,
            type
          ),
          interviewer:profiles(
            id,
            full_name,
            email
          ),
          interview_responses(
            *,
            question:questionnaire_questions(
              ${this.getQuestionSelectQuery()}
            ),
            response_roles:interview_response_roles(
              role:roles(*)
            )
          )
        `
        )
        .eq("id", id)
        .eq("is_deleted", false)
        .eq("interview_responses.is_deleted", false)
        .single()) as { data: InterviewX | null; error: any };

      // console.log("interview: ", interview);

      if (error) throw error;
      if (!interview) return null;

      // Fetch interview response actions separately to properly handle is_deleted filtering
      const responseIds: number[] =
        interview.interview_responses?.map((r) => r.id) || [];
      const actionsMap: Record<number, InterviewResponseAction[]> = {};

      if (responseIds.length > 0) {
        const { data: actions, error: actionsError } = await this.supabase
          .from("interview_response_actions")
          .select("*")
          .in("interview_response_id", responseIds)
          .eq("is_deleted", false)
          .order("created_at", { ascending: true });

        if (actionsError) {
          console.warn(
            "Error fetching interview response actions:",
            actionsError
          );
          // Continue without actions rather than failing completely
        } else if (actions) {
          // Group actions by response_id
          actions.forEach((action) => {
            const responseId = action.interview_response_id;
            if (!actionsMap[responseId]) {
              actionsMap[responseId] = [];
            }
            actionsMap[responseId].push(action);
          });
        }
      }

      // Get role name associated with the interviewee.

      return {
        ...interview,
        assessment: {
          id: interview.assessment?.id,
          name: interview.assessment?.name,
          type: interview.assessment?.type,
          company_name: companyName,
        },
        interviewee: {
          email: interview.interviewee_email,
          role: null, //roleName,
        },
        interviewer: {
          id: interview.interviewer?.id,
          name: interview.interviewer?.name,
        },
        responses:
          interview.interview_responses?.map((response) => ({
            ...response,
            question: this.transformQuestionData(response.question),
            response_roles: response.response_roles || [],
            actions: actionsMap[response.id] || [],
          })) || [],
      };
    } catch (error) {
      console.error("Error in getInterviewById:", error);
      throw error;
    }
  }

  async createInterview(
    interviewData: CreateInterviewData
  ): Promise<InterviewX | null> {
    await checkDemoAction();
    // First, get all questions for the assessment's questionnaire
    const { data: assessment, error: assessmentError } = (await this.supabase
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
      .single()) as { data: AssessmentWithQuestionnaire | null; error: any };

      console.log('assessment', assessment)

    if (assessmentError) throw assessmentError;
    if (!assessment) return null;

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

      const { data: createdResponses, error: responsesError } =
        await this.supabase
          .from("interview_responses")
          .insert(responseData)
          .select("id");

      if (responsesError) {
        // If response creation fails, we should clean up the interview
        await this.supabase.from("interviews").delete().eq("id", interview.id);
        throw responsesError;
      }

      // For public interviews, pre-populate role associations to avoid duplicates on saves
      if (
        interview.is_public &&
        interview.assigned_role_id &&
        createdResponses
      ) {
        const roleAssociations = createdResponses.map((response) => ({
          interview_response_id: response.id,
          role_id: interview.assigned_role_id,
        }));

        const { error: roleAssociationsError } = await this.supabase
          .from("interview_response_roles")
          .insert(roleAssociations);

        if (roleAssociationsError) {
          // If role association fails, clean up the interview and responses
          await this.supabase
            .from("interviews")
            .delete()
            .eq("id", interview.id);
          throw roleAssociationsError;
        }
      }
    }

    return interview;
  }

  async updateInterview(
    id: number,
    updates: UpdateInput<"interviews">,
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

  async deleteInterview(id: number): Promise<void> {
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
    interviewIds: number[],
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
    id: number,
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

  async deleteInterviewResponse(id: number): Promise<void> {
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
    actionData: CreateInput<"interview_response_actions">
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
    id: number,
    updates: UpdateInput<"interview_response_actions">
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

  async deleteInterviewResponseAction(id: number): Promise<void> {
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
    responseId: number,
    roleIds: number[],
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

  // Get roles filtered by the site associated with the given assessment
  async getRolesByAssessmentSite(assessmentId: number): Promise<Role[]> {
    return rolesService.getRolesByAssessmentSite(assessmentId);
  }

  // Get roles that are both associated with a question AND available at the assessment site
  async getRolesIntersectionForQuestion(
    assessmentId: number,
    questionId: number
  ): Promise<Role[]> {
    return rolesService.getRolesIntersectionForQuestion(
      assessmentId,
      questionId
    );
  }

  // Get questionnaire ID for an assessment
  async getQuestionnaireIdForAssessment(
    assessmentId: number
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
  async getAllRolesForQuestionnaire(assessmentId: number): Promise<Role[]> {
    return rolesService.getAllRolesForQuestionnaire(assessmentId);
  }

  // Helper method to calculate min/max rating values from questionnaire rating scales
  private calculateRatingValueRange(
    questionnaire:
      | { questionnaire_rating_scales?: Array<{ value: number }> }
      | null
      | undefined
  ): { min: number; max: number } {
    const defaultRange = { min: 0, max: 5 };

    if (
      !questionnaire?.questionnaire_rating_scales ||
      questionnaire.questionnaire_rating_scales.length === 0
    ) {
      return defaultRange;
    }

    const values = questionnaire.questionnaire_rating_scales.map(
      (scale) => scale.value
    );
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
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
    interviewId: number,
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
    interviewId: number,
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
    responseId: number,
    interviewId: number,
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
    interviewId: number,
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
    actionId: number,
    interviewId: number,
    accessCode: string,
    email: string,
    updates: UpdateInterviewResponseData
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
    actionId: number,
    interviewId: number,
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
