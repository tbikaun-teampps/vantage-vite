import { createClient } from "./client";
import { useAuthStore } from "@/stores/auth-store";
import { useCompanyStore } from "@/stores/company-store";
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

export class InterviewService {
  private supabase = createClient();

  // Enhanced question selection with rating scales
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
      // Get current user and demo mode status with fallbacks
      const { data: authData, error: authError } =
        await this.supabase.auth.getUser();

      let query = this.supabase.from("interviews").select(`
          *,
          company:companies!inner(id, name, deleted_at, is_demo, created_by),
          assessment:assessments!inner(id, name),
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
        `);
      query = query.is("company.deleted_at", null);

      // Apply demo mode filtering only if we have auth data
      if (!authError && authData?.user) {
        const authStore = useAuthStore.getState();
        const isDemoMode = authStore?.isDemoMode ?? false;

        if (isDemoMode) {
          // Demo users only see interviews from demo companies
          query = query.eq("company.is_demo", true);
        } else {
          // Get user's accessible company IDs first
          const ownCompanies = await this.supabase
            .from("companies")
            .select("id")
            .eq("is_demo", false)
            .eq("created_by", authData.user.id);

          const allCompanyIds = ownCompanies.data?.map((c) => c.id) || [];

          if (allCompanyIds.length > 0) {
            query = query.in("company.id", allCompanyIds);
          } else {
            // No accessible interviews, return empty result immediately
            return [];
          }
        }
      }
      // If no auth or auth error, return all interviews (will be filtered by RLS)

      // Apply filters
      if (filters) {
        if (filters.assessment_id) {
          query = query.eq("assessment_id", filters.assessment_id);
        }
        if (filters.status && filters.status.length > 0) {
          query = query.in("status", filters.status);
        }
        if (filters.interviewer_id) {
          query = query.eq("interviewer_id", filters.interviewer_id);
        }
        if (filters.company_id) {
          query = query.eq("company_id", filters.company_id);
        }

        if (filters.date_range) {
          query = query
            .gte("created_at", filters.date_range.start)
            .lte("created_at", filters.date_range.end);
        }
      }

      const { data: interviews, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;

      // Transform interviews data
      return (
        interviews?.map((interview) => ({
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
        })) || []
      );
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
        company:companies!inner(id, name, deleted_at, is_demo, created_by),
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
      .single();

    if (error) throw error;
    if (!interview) return null;

    return {
      ...interview,
      company: {
        id: interview.company?.id,
        name: interview.company?.name,
      },
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
    const currentUserId = await this.getCurrentUserId();

    const { data, error } = await this.supabase
      .from("interviews")
      .insert([
        {
          ...interviewData,
          status: "pending",
          created_by: currentUserId,
          company_id: interviewData.company_id,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateInterview(
    id: string,
    updates: UpdateInterviewData
  ): Promise<Interview> {
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
    const { error } = await this.supabase
      .from("interviews")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async bulkUpdateInterviewStatus(
    interviewIds: string[],
    status: Interview["status"]
  ): Promise<void> {
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
    const currentUserId = await this.getCurrentUserId();

    const { data: response, error } = await this.supabase
      .from("interview_responses")
      .insert([
        {
          interview_id: responseData.interview_id,
          questionnaire_question_id: responseData.questionnaire_question_id,
          rating_score: responseData.rating_score,
          comments: responseData.comments,
          company_id: responseData.company_id,
          answered_at: new Date().toISOString(),
          created_by: currentUserId,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Create role associations if provided
    if (responseData.role_ids && responseData.role_ids.length > 0) {
      await this.updateResponseRoles(
        response.id,
        responseData.role_ids,
        currentUserId,
        responseData.company_id
      );
    }
  }

  async updateInterviewResponse(
    id: string,
    updates: UpdateInterviewResponseData
  ): Promise<void> {
    const currentUserId = await this.getCurrentUserId();

    // Update the response
    const { error } = await this.supabase
      .from("interview_responses")
      .update({
        rating_score: updates.rating_score,
        comments: updates.comments,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;

    // Update role associations if provided
    if (updates.role_ids !== undefined) {
      // Get the interview response to access company_id
      const { data: responseData, error: responseError } = await this.supabase
        .from("interview_responses")
        .select("company_id")
        .eq("id", id)
        .single();

      if (responseError) throw responseError;

      await this.updateResponseRoles(
        id,
        updates.role_ids,
        currentUserId,
        responseData.company_id
      );
    }
  }

  async deleteInterviewResponse(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("interview_responses")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  // Interview Response Action operations
  async createInterviewResponseAction(
    actionData: CreateInterviewResponseActionData
  ): Promise<InterviewResponseAction> {
    const currentUserId = await this.getCurrentUserId();

    const { data, error } = await this.supabase
      .from("interview_response_actions")
      .insert([
        {
          interview_response_id: actionData.interview_response_id,
          title: actionData.title,
          description: actionData.description,
          company_id: actionData.company_id,
          created_by: currentUserId,
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
    const { error } = await this.supabase
      .from("interview_response_actions")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  // Response role associations
  private async updateResponseRoles(
    responseId: string,
    roleIds: string[],
    createdBy: string,
    companyId: number
  ): Promise<void> {
    // First, delete existing associations
    await this.supabase
      .from("interview_response_roles")
      .delete()
      .eq("interview_response_id", responseId);

    // Then, insert new associations
    if (roleIds.length > 0) {
      const { error } = await this.supabase
        .from("interview_response_roles")
        .insert(
          roleIds.map((roleId) => ({
            interview_response_id: responseId,
            role_id: roleId,
            created_by: createdBy,
            company_id: companyId,
          }))
        );

      if (error) throw error;
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

  // Role operations
  async getRoles(): Promise<Role[]> {
    try {
      // Get current user and demo mode status with fallbacks
      const { data: authData, error: authError } =
        await this.supabase.auth.getUser();

      let query = this.supabase
        .from("roles")
        .select(`
          *,
          shared_role:shared_roles(
            id,
            name,
            description
          ),
          org_chart:org_charts(
            id,
            name,
            site_id
          ),
          company:companies!inner(id, name, deleted_at, is_demo, created_by)
        `)
        .is("company.deleted_at", null)
        .eq("is_active", true);

      // Apply demo mode filtering only if we have auth data
      if (!authError && authData?.user) {
        const authStore = useAuthStore.getState();
        const companyStore = useCompanyStore.getState();
        const isDemoMode = authStore?.isDemoMode ?? false;
        const selectedCompany = companyStore?.selectedCompany;

        if (isDemoMode) {
          // Demo users only see roles from demo companies
          query = query.eq("company.is_demo", true);

          // If there's a selected company, filter to only that company's roles
          if (selectedCompany?.id) {
            query = query.eq("company.id", selectedCompany.id);
          }
        } else {
          // Non-demo users: NO demo data, only their own companies
          query = query.eq("company.is_demo", false);
          query = query.eq("company.created_by", authData.user.id);

          // Filter to only the currently selected company's roles
          if (selectedCompany?.id) {
            query = query.eq("company.id", selectedCompany.id);
          } else {
            // No company selected, throw error to indicate configuration issue
            throw new Error(
              "No company selected - company selection required for role access"
            );
          }
        }
      } else {
        // No auth data, return empty result
        return [];
      }

      const { data, error } = await query.order("name");

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error in getRoles:", error);
      // Return empty array on error to prevent page crashes
      return [];
    }
  }

  // Get roles filtered by assessment site context
  async getRolesByAssessmentSite(assessmentId: string): Promise<Role[]> {
    try {
      // First, get the assessment to find the site_id
      const { data: assessmentData, error: assessmentError } =
        await this.supabase
          .from("assessments")
          .select("site_id, company_id")
          .eq("id", assessmentId)
          .single();

      if (assessmentError || !assessmentData) {
        console.error("Error getting assessment site:", assessmentError);
        // Fallback to all roles if we can't get assessment site
        return this.getRoles();
      }

      // Get org chart IDs for this specific site only
      const { data: orgCharts, error: orgChartError } = await this.supabase
        .from("org_charts")
        .select("id, name, site_id")
        .eq("site_id", assessmentData.site_id)
        .eq("company_id", assessmentData.company_id);

      if (orgChartError || !orgCharts || orgCharts.length === 0) {
        console.error("Error getting org charts for site:", orgChartError);
        console.error("Looking for site_id:", assessmentData.site_id, "company_id:", assessmentData.company_id);
        // Fallback to all roles for this company
        return this.getRoles();
      }

      const orgChartIds = orgCharts.map(oc => oc.id);
      // Get current user and demo mode status with fallbacks
      const { data: authData, error: authError } =
        await this.supabase.auth.getUser();

      let query = this.supabase
        .from("roles")
        .select(`
          *,
          shared_role:shared_roles(
            id,
            name,
            description
          ),
          org_chart:org_charts(
            id,
            name,
            site_id
          )
        `)
        .eq("is_active", true)
        .in("org_chart_id", orgChartIds);

      // Apply company filtering directly on the roles table
      query = query.eq("company_id", assessmentData.company_id);

      // Apply demo mode filtering only if we have auth data
      if (!authError && authData?.user) {
        const authStore = useAuthStore.getState();
        const companyStore = useCompanyStore.getState();
        const isDemoMode = authStore?.isDemoMode ?? false;
        const selectedCompany = companyStore?.selectedCompany;

        // Additional validation for non-demo users
        if (!isDemoMode) {
          // For non-demo users, verify they have access to this company
          const { data: companyData, error: companyError } = await this.supabase
            .from("companies")
            .select("id, is_demo, created_by")
            .eq("id", assessmentData.company_id)
            .eq("created_by", authData.user.id)
            .eq("is_demo", false)
            .single();

          if (companyError || !companyData) {
            console.error("User doesn't have access to this company:", companyError);
            return [];
          }
        }
      }

      const { data, error } = await query.order("name");

      if (error) throw error;
      
      // Remove any potential duplicates based on role ID
      const uniqueRoles = data?.filter((role, index, arr) => 
        arr.findIndex(r => r.id === role.id) === index
      ) || [];
      
      return uniqueRoles;
    } catch (error) {
      console.error("Error in getRolesByAssessmentSite:", error);
      // Fallback to all roles on error
      return this.getRoles();
    }
  }

  // Get roles that are both associated with a question AND available at the assessment site
  // If no specific roles are associated with the question, return all site roles
  async getRolesIntersectionForQuestion(assessmentId: string, questionId: string): Promise<Role[]> {
    try {
      // 1. Get shared_role_ids associated with this question
      const { data: questionRoles, error: questionRolesError } = await this.supabase
        .from('questionnaire_question_roles')
        .select('shared_role_id')
        .eq('questionnaire_question_id', questionId);

      if (questionRolesError) {
        console.error("Error fetching question roles:", questionRolesError);
        throw questionRolesError;
      }

      // 2. Get roles available at the assessment site
      const siteRoles = await this.getRolesByAssessmentSite(assessmentId);

      // If question has no associated roles, return all site roles
      if (!questionRoles || questionRoles.length === 0) {
        return siteRoles;
      }

      const questionSharedRoleIds = questionRoles.map(qr => qr.shared_role_id);

      // 3. Filter site roles to only include those whose shared_role_id matches question roles
      const intersectionRoles = siteRoles.filter(role => 
        role.shared_role_id && questionSharedRoleIds.includes(role.shared_role_id)
      );

      return intersectionRoles;
    } catch (error) {
      console.error("Error in getRolesIntersectionForQuestion:", error);
      // Return empty array on error - this will show the "No Applicable Roles" alert
      return [];
    }
  }

  // Get questionnaire ID for an assessment
  async getQuestionnaireIdForAssessment(assessmentId: string): Promise<string | null> {
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
  async getAllRolesForQuestionnaire(assessmentId: string, questionnaireId: string): Promise<Role[]> {
    try {
      // 1. Get all question IDs for this questionnaire
      const { data: questions, error: questionsError } = await this.supabase
        .from('questionnaire_questions')
        .select(`
          id,
          questionnaire_step:questionnaire_steps(
            questionnaire_section:questionnaire_sections(
              questionnaire_id
            )
          )
        `)
        .eq('questionnaire_step.questionnaire_section.questionnaire_id', questionnaireId);

      if (questionsError) {
        console.error("Error fetching questionnaire questions:", questionsError);
        throw questionsError;
      }

      const questionIds = questions?.map(q => q.id) || [];
      
      if (questionIds.length === 0) {
        return [];
      }

      // 2. Get all shared_role_ids associated with ANY question in the questionnaire
      const { data: questionRoles, error: questionRolesError } = await this.supabase
        .from('questionnaire_question_roles')
        .select('shared_role_id')
        .in('questionnaire_question_id', questionIds);

      if (questionRolesError) {
        console.error("Error fetching questionnaire question roles:", questionRolesError);
        throw questionRolesError;
      }

      // 3. Get roles available at the assessment site
      const siteRoles = await this.getRolesByAssessmentSite(assessmentId);

      // If questionnaire has no associated roles, return all site roles
      if (!questionRoles || questionRoles.length === 0) {
        return siteRoles;
      }

      // Get unique shared role IDs
      const uniqueSharedRoleIds = [...new Set(questionRoles.map(qr => qr.shared_role_id))];

      // 4. Filter site roles to only include those whose shared_role_id matches questionnaire roles
      const intersectionRoles = siteRoles.filter(role => 
        role.shared_role_id && uniqueSharedRoleIds.includes(role.shared_role_id)
      );

      return intersectionRoles;
    } catch (error) {
      console.error("Error in getAllRolesForQuestionnaire:", error);
      // Fallback to all site roles on error
      return this.getRolesByAssessmentSite(assessmentId);
    }
  }

  // Utility methods
  async getCurrentUserId(): Promise<string> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) {
      throw new Error("Authentication required");
    }
    return user.id;
  }
}

export const interviewService = new InterviewService();
