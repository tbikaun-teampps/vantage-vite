import { createClient } from "./client";
import { rolesService } from "./roles-service";
import { evidenceService } from "./evidence-service";
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
  QuestionnaireSection,
  CreateInterviewData,
  CreateInterviewResponseActionData,
  InterviewResponse,
  InterviewResponseWithDetails,
  InterviewX,
  InterviewXWithResponses,
  AssessmentWithQuestionnaire,
} from "@/types/assessment";
import type { InterviewEvidence } from "./evidence-service";
import type { CreateInput, UpdateInput } from "@/types/utils";
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
          interview_contact:contacts(
            id,
            full_name,
            email,
            title,
            phone
          ),
          assigned_role:roles(id, shared_role:shared_roles(id, name)),
          interview_roles(
            role:roles(
              id,
              shared_role:shared_roles(id, name),
              work_group:work_groups(
                id,
                name
              )
            )
          ),
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
        if (filters.program_id) {
          query = query.eq("program_id", filters.program_id);
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
        interviews?.map((interview: any) => {
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
              id: interview?.interview_contact?.id,
              full_name: interview?.interview_contact?.full_name,
              email: interview?.interview_contact?.email,
              title: interview?.interview_contact?.title,
              phone: interview?.interview_contact?.phone,
              role:
                interview.interview_roles &&
                interview.interview_roles.length > 0
                  ? interview.interview_roles
                      .map((ir: any) => ir.role?.shared_role?.name)
                      .filter(Boolean)
                      .join(", ")
                  : interview.assigned_role?.shared_role?.name,
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

  async getProgramInterviews(
    companyId: string,
    programId: number,
    programPhaseId: number | null = null,
    questionnaireId: number
  ): Promise<InterviewWithResponses[]> {
    try {
      console.log(
        "fetching interviews for program with: ",
        companyId,
        programId,
        programPhaseId
      );
      let query = this.supabase
        .from("interviews")
        .select(
          `
          *,
          interviewer:profiles(id, full_name, email),
          interview_contact:contacts(
            id,
            full_name,
            email,
            title,
            phone
          ),
          assigned_role:roles(id, shared_role:shared_roles(id, name)),
          interview_roles(
            role:roles(
              id,
              shared_role:shared_roles(id, name),
              work_group:work_groups(
                id,
                name
              )
            )
          ),
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
        .eq("program_id", programId)
        .eq('questionnaire_id', questionnaireId)

      // Apply filter
      if (programPhaseId) {
        query = query.eq("program_phase_id", programPhaseId);
      }

      const { data: interviews, error } = await query.order("created_at", {
        ascending: false,
      });

      console.log("program interviews: ", interviews);

      if (error) throw error;

      // Transform interviews data
      const data =
        interviews?.map((interview: any) => {
          const ratingRange = this.calculateRatingValueRange(
            interview.assessment?.questionnaire
          );

          return {
            ...interview,
            completion_rate: this.calculateCompletionRate(
              interview.interview_responses || []
            ),
            average_score: this.calculateAverageScore(
              interview.interview_responses || []
            ),
            min_rating_value: ratingRange.min,
            max_rating_value: ratingRange.max,
            interviewee: {
              id: interview?.interview_contact?.id,
              full_name: interview?.interview_contact?.full_name,
              email: interview?.interview_contact?.email,
              title: interview?.interview_contact?.title,
              phone: interview?.interview_contact?.phone,
              role:
                interview.interview_roles &&
                interview.interview_roles.length > 0
                  ? interview.interview_roles
                      .map((ir: any) => ir.role?.shared_role?.name)
                      .filter(Boolean)
                      .join(", ")
                  : interview.assigned_role?.shared_role?.name,
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
      console.error("Error in getProgramInterviews:", error);
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
          interview_contact:contacts(
            id,
            full_name,
            email,
            title,
            phone
          ),
          interview_roles(
            role:roles(
              id,
              shared_role:shared_roles(id, name),
              work_group:work_groups(
                id,
                name
              )
            )
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
          // company_name: companyName,
        },
        interviewee: {
          id: interview.interview_contact?.id,
          full_name: interview.interview_contact?.full_name,
          email: interview.interview_contact?.email,
          title: interview.interview_contact?.title,
          phone: interview.interview_contact?.phone,
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

  async createProgramInterview(interviewData: {
    program_id: number;
    program_phase_id: number;
    questionnaire_id: number;
    interviewer_id?: string;
    interview_contact_id?: number;
    is_public?: boolean;
    enabled?: boolean;
    access_code?: string;
    name?: string;
    notes?: string;
    status?: "pending" | "in_progress" | "completed" | "cancelled";
    role_ids?: number[];
  }): Promise<InterviewX | null> {
    await checkDemoAction();

    // Extract role_ids from the data (not part of the database schema)
    const { role_ids, ...dbInterviewData } = interviewData;

    // Get program details for company_id
    const { data: program, error: programError } = await this.supabase
      .from("programs")
      .select("company_id")
      .eq("id", interviewData.program_id)
      .single();

    if (programError) throw programError;
    if (!program) return null;

    // Get questionnaire structure to extract question IDs
    const { data: questionnaire, error: questionnaireError } =
      await this.supabase
        .from("questionnaires")
        .select(
          `
        id,
        questionnaire_sections(
          id,
          questionnaire_steps(
            id,
            questionnaire_questions(id)
          )
        )
      `
        )
        .eq("id", interviewData.questionnaire_id)
        .eq("questionnaire_sections.is_deleted", false)
        .eq("questionnaire_sections.questionnaire_steps.is_deleted", false)
        .eq(
          "questionnaire_sections.questionnaire_steps.questionnaire_questions.is_deleted",
          false
        )
        .single();

    if (questionnaireError) throw questionnaireError;
    if (!questionnaire) return null;

    // Extract all question IDs
    const questionIds: number[] = [];
    if (questionnaire.questionnaire_sections) {
      for (const section of questionnaire.questionnaire_sections) {
        for (const step of section.questionnaire_steps) {
          for (const question of step.questionnaire_questions) {
            questionIds.push(question.id);
          }
        }
      }
    }

    // Create the interview with program details
    const { data: interview, error: interviewError } = await this.supabase
      .from("interviews")
      .insert([
        {
          ...dbInterviewData,
          company_id: program.company_id,
          questionnaire_id: interviewData.questionnaire_id,
          status: interviewData.status || "pending",
          enabled: interviewData.enabled ?? true,
          is_public: interviewData.is_public ?? false,
        },
      ])
      .select()
      .single();

    if (interviewError) throw interviewError;

    // Create interview-level role associations if roles were selected
    if (role_ids && role_ids.length > 0) {
      const interviewRoleAssociations = role_ids.map((roleId) => ({
        interview_id: interview.id,
        role_id: roleId,
        company_id: program.company_id,
      }));

      const { error: interviewRoleError } = await this.supabase
        .from("interview_roles")
        .insert(interviewRoleAssociations);

      if (interviewRoleError) {
        // If role association fails, clean up the interview
        await this.supabase.from("interviews").delete().eq("id", interview.id);
        throw interviewRoleError;
      }
    }

    // Create interview responses for all questions
    if (questionIds.length > 0) {
      const responseData = questionIds.map((questionId) => ({
        interview_id: interview.id,
        questionnaire_question_id: questionId,
        rating_score: null,
        comments: null,
        answered_at: null,
        is_applicable: true, // Assume all questions are applicable for program interviews
        company_id: program.company_id,
      }));

      const { data: createdResponses, error: responsesError } =
        await this.supabase
          .from("interview_responses")
          .insert(responseData)
          .select("id");

      if (responsesError) {
        // If response creation fails, clean up the interview
        await this.supabase.from("interviews").delete().eq("id", interview.id);
        throw responsesError;
      }

      // For public interviews with single role, pre-populate response role associations
      if (
        interview.is_public &&
        role_ids &&
        role_ids.length === 1 &&
        createdResponses
      ) {
        const responseRoleAssociations = createdResponses.map((response) => ({
          interview_response_id: response.id,
          role_id: role_ids[0],
          company_id: program.company_id,
          interview_id: interview.id,
        }));

        const { error: responseRoleError } = await this.supabase
          .from("interview_response_roles")
          .insert(responseRoleAssociations);

        if (responseRoleError) {
          // If response role association fails, clean up everything
          await this.supabase
            .from("interviews")
            .delete()
            .eq("id", interview.id);
          throw responseRoleError;
        }
      }
    }

    return interview;
  }

  async createInterview(
    interviewData: CreateInterviewData
  ): Promise<InterviewX | null> {
    await checkDemoAction();

    // Extract role_ids from the data (not part of the database schema)
    const { role_ids, ...dbInterviewData } = interviewData;

    // First, get all questions for the assessment's questionnaire
    const { data: assessment, error: assessmentError } = (await this.supabase
      .from("assessments")
      .select(
        `
        id,
        company_id,
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

    // Create the interview with company_id and questionnaire_id
    const { data: interview, error: interviewError } = await this.supabase
      .from("interviews")
      .insert([
        {
          ...dbInterviewData,
          company_id: assessment.company_id,
          questionnaire_id: assessment.questionnaire!.id,
        },
      ])
      .select()
      .single();
    console.log("dbInterviewData: ", dbInterviewData);

    if (interviewError) throw interviewError;

    // Create interview-level role associations first if roles were selected
    if (role_ids && role_ids.length > 0) {
      const interviewRoleAssociations = role_ids.map((roleId) => ({
        interview_id: interview.id,
        role_id: roleId,
        company_id: assessment.company_id,
      }));

      const { error: interviewRoleError } = await this.supabase
        .from("interview_roles")
        .insert(interviewRoleAssociations);

      if (interviewRoleError) {
        // If role association fails, clean up the interview
        await this.supabase.from("interviews").delete().eq("id", interview.id);
        throw interviewRoleError;
      }
    }

    // Create interview responses for all questions with applicability check
    if (questionIds.length > 0) {
      // Check applicability for each question
      const responseData = await Promise.all(
        questionIds.map(async (questionId) => {
          // Check if this question has applicable roles for this interview
          const applicableRoles = await this.getApplicableRolesForQuestion(
            interviewData.assessment_id!,
            questionId,
            interview.id
          );

          return {
            interview_id: interview.id,
            questionnaire_question_id: questionId,
            rating_score: null,
            comments: null,
            answered_at: null,
            is_applicable: applicableRoles.length > 0,
            company_id: assessment.company_id,
          };
        })
      );

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

      // For public interviews with single role, also pre-populate response role associations
      if (
        interview.is_public &&
        role_ids &&
        role_ids.length === 1 &&
        createdResponses
      ) {
        const responseRoleAssociations = createdResponses.map((response) => ({
          interview_response_id: response.id,
          role_id: role_ids[0],
          company_id: assessment.company_id,
          interview_id: interview.id,
        }));

        const { error: responseRoleError } = await this.supabase
          .from("interview_response_roles")
          .insert(responseRoleAssociations);

        if (responseRoleError) {
          // If response role association fails, clean up everything
          await this.supabase
            .from("interviews")
            .delete()
            .eq("id", interview.id);
          throw responseRoleError;
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

    // Get company_id for security filtering (skip for public access)
    if (!isPublic) {
      const { data: existing, error: fetchError } = await this.supabase
        .from("interviews")
        .select("company_id")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;
      if (!existing) throw new Error("Interview not found");

      const { data, error } = await this.supabase
        .from("interviews")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("company_id", existing.company_id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    // Public access path (no company_id filtering)
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

    // Get company_id for security filtering
    const { data: existing, error: fetchError } = await this.supabase
      .from("interviews")
      .select("company_id")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;
    if (!existing) throw new Error("Interview not found");

    const { error } = await this.supabase
      .from("interviews")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("company_id", existing.company_id);

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

    // Get the interview to access company_id
    const { data: interview, error: interviewError } = await this.supabase
      .from("interviews")
      .select("company_id")
      .eq("id", responseData.interview_id)
      .single();

    if (interviewError) throw interviewError;
    if (!interview) throw new Error("Interview not found");

    const { data: response, error } = await this.supabase
      .from("interview_responses")
      .insert([
        {
          interview_id: responseData.interview_id,
          questionnaire_question_id: responseData.questionnaire_question_id,
          rating_score: responseData.rating_score ?? null,
          comments: responseData.comments,
          company_id: interview.company_id,
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
      await this.updateResponseRoles(
        response.id,
        responseData.role_ids,
        interview.company_id
      );
    }
  }

  async updateInterviewResponse(
    id: number,
    updates: UpdateInterviewResponseData
  ): Promise<void> {
    await checkDemoAction();

    // Get company_id for security filtering
    const { data: existing, error: fetchError } = await this.supabase
      .from("interview_responses")
      .select("company_id")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;
    if (!existing) throw new Error("Interview response not found");

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
      .eq("id", id)
      .eq("company_id", existing.company_id);

    if (error) throw error;

    // Update role associations if provided
    if (updates.role_ids !== undefined) {
      await this.updateResponseRoles(id, updates.role_ids, existing.company_id);
    }
  }

  // Method specifically for updating comments with evidence support
  async updateResponseComments(
    responseId: number,
    comments: string
  ): Promise<void> {
    await checkDemoAction();
    const { error } = await this.supabase
      .from("interview_responses")
      .update({
        comments,
        updated_at: new Date().toISOString(),
      })
      .eq("id", responseId);

    if (error) throw error;
  }

  // Get evidence for a specific response
  async getResponseEvidence(responseId: number): Promise<InterviewEvidence[]> {
    return evidenceService.getEvidenceForResponse(responseId);
  }

  async deleteInterviewResponse(id: number): Promise<void> {
    await checkDemoAction();

    // Get company_id for security filtering
    const { data: existing, error: fetchError } = await this.supabase
      .from("interview_responses")
      .select("company_id")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;
    if (!existing) throw new Error("Interview response not found");

    const { error } = await this.supabase
      .from("interview_responses")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("company_id", existing.company_id);

    if (error) throw error;
  }

  // Interview Response Action operations
  async getAllInterviewResponseActions(
    companyId: string
  ): Promise<InterviewResponseAction[]> {
    const { data, error } = await this.supabase
      .from("interview_response_actions")
      .select(
        `
        *,
        interview_response:interview_responses(
          id,
          questionnaire_question:questionnaire_questions(
            id,
            title,
            questionnaire_step:questionnaire_steps(
              id,
              title,
              questionnaire_section:questionnaire_sections(
                id,
                title
              )
            )
          ),
          interview:interviews(
            id,
            interview_contact:contacts(
              id,
              full_name,
              email,
              title
            ),
            assessment:assessments(
              id,
              name,
              company_id,
              site:sites(
                id,
                name,
                region:regions(
                  id,
                  name,
                  business_unit:business_units(
                    id,
                    name
                  )
                )
              )
            )
          )
        )
      `
      )
      .eq("is_deleted", false)
      .eq("interview_response.interview.assessment.company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createInterviewResponseAction(
    actionData: CreateInput<"interview_response_actions">
  ): Promise<InterviewResponseAction> {
    await checkDemoAction();

    // Get the company_id and interview_id from the interview_response
    const { data: response, error: responseError } = await this.supabase
      .from("interview_responses")
      .select("company_id, interview_id")
      .eq("id", actionData.interview_response_id)
      .single();

    if (responseError) throw responseError;
    if (!response) throw new Error("Interview response not found");

    const { data, error } = await this.supabase
      .from("interview_response_actions")
      .insert([
        {
          interview_response_id: actionData.interview_response_id,
          title: actionData.title,
          description: actionData.description,
          company_id: response.company_id,
          interview_id: response.interview_id,
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

    // Get company_id for security filtering
    const { data: existing, error: fetchError } = await this.supabase
      .from("interview_response_actions")
      .select("company_id")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;
    if (!existing) throw new Error("Interview response action not found");

    const { data, error } = await this.supabase
      .from("interview_response_actions")
      .update({
        title: updates.title,
        description: updates.description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("company_id", existing.company_id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteInterviewResponseAction(id: number): Promise<void> {
    await checkDemoAction();

    // Get company_id for security filtering
    const { data: existing, error: fetchError } = await this.supabase
      .from("interview_response_actions")
      .select("company_id")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;
    if (!existing) throw new Error("Interview response action not found");

    const { error } = await this.supabase
      .from("interview_response_actions")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("company_id", existing.company_id);
    if (error) throw error;
  }

  // Response role associations
  private async updateResponseRoles(
    responseId: number,
    roleIds: number[],
    companyId: string,
    isPublic: boolean = false
  ): Promise<void> {
    if (!isPublic) {
      // Check authentication / demo status...
      await checkDemoAction();
    }

    // Get the interview_id from the response
    const { data: response, error: responseError } = await this.supabase
      .from("interview_responses")
      .select("interview_id")
      .eq("id", responseId)
      .single();

    if (responseError) throw responseError;
    if (!response) throw new Error("Interview response not found");

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
            company_id: companyId,
            interview_id: response.interview_id,
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

  // Get contacts associated with a specific role
  async getContactsByRole(roleId: number): Promise<any[]> {
    try {
      const { data: contacts, error } = await this.supabase
        .from("role_contacts")
        .select(
          `
          contact:contacts(
            id,
            full_name,
            email,
            title,
            phone
          )
        `
        )
        .eq("role_id", roleId)
        .eq("contacts.is_deleted", false);

      if (error) throw error;

      // Extract the contact data from the junction result
      return contacts?.map((rc: any) => rc.contact).filter(Boolean) || [];
    } catch (error) {
      console.error("Error fetching contacts by role:", error);
      return [];
    }
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

  // Get applicable roles for a specific question, filtered by interview scope
  async getApplicableRolesForQuestion(
    assessmentId: number,
    questionId: number,
    interviewId: number
  ): Promise<Role[]> {
    try {
      // Get question-specific roles (intersection of question roles and site roles)
      const questionSpecificRoles = await this.getRolesIntersectionForQuestion(
        assessmentId,
        questionId
      );

      // Get interview data to check for role scope
      const interview = await this.getInterviewById(interviewId);
      if (!interview) {
        console.warn(`Interview ${interviewId} not found`);
        return [];
      }

      // If interview has specific roles scoped, filter question roles by interview scope
      if (interview.interview_roles && interview.interview_roles.length > 0) {
        const interviewRoleIds = interview.interview_roles
          .map((ir) => ir.role?.id)
          .filter(Boolean);

        return questionSpecificRoles.filter((questionRole) =>
          interviewRoleIds.includes(questionRole.id)
        );
      }

      // If no interview role scope, return all question-specific roles
      return questionSpecificRoles;
    } catch (error) {
      console.error("Error in getApplicableRolesForQuestion:", error);
      return [];
    }
  }

  // Get applicable roles for a specific question by program phase, filtered by interview scope
  async getApplicableRolesForQuestionByProgramPhase(
    programPhaseId: number,
    questionId: number,
    interviewId: number
  ): Promise<Role[]> {
    try {
      // First, we need to get the questionnaire ID from the program phase
      // Program phase -> program -> questionnaire (assumption based on your DB structure)
      const { data: programPhase, error: phaseError } = await this.supabase
        .from("program_phases")
        .select(`
          id,
          program_id,
          programs!inner(
            id,
            onsite_questionnaire_id,
            presite_questionnaire_id
          )
        `)
        .eq("id", programPhaseId)
        .single();

      if (phaseError || !programPhase) {
        console.error("Error getting program phase:", phaseError);
        return [];
      }

      // For now, we'll use the onsite_questionnaire_id. You may need to adjust this
      // based on your business logic for which questionnaire to use
      const questionnaireId = programPhase.programs.onsite_questionnaire_id || 
                             programPhase.programs.presite_questionnaire_id;

      console.log('questionnaireId: ', questionnaireId);


      if (!questionnaireId) {
        console.error("No questionnaire found for program phase:", programPhaseId);
        return [];
      }

      // Get question-specific roles for this questionnaire and question
      // We need to adapt this to work with questionnaire instead of assessment
      const questionSpecificRoles = await this.getRolesIntersectionForQuestionByQuestionnaire(
        questionnaireId,
        questionId
      );

      // Get interview data to check for role scope (same logic as assessment-based)
      const interview = await this.getInterviewById(interviewId);
      if (!interview) {
        console.warn(`Interview ${interviewId} not found`);
        return [];
      }

      // If interview has specific roles scoped, filter question roles by interview scope
      if (interview.interview_roles && interview.interview_roles.length > 0) {
        const interviewRoleIds = interview.interview_roles
          .map((ir) => ir.role?.id)
          .filter(Boolean);

        return questionSpecificRoles.filter((questionRole) =>
          interviewRoleIds.includes(questionRole.id)
        );
      }

      // If no interview role scope, return all question-specific roles
      return questionSpecificRoles;
    } catch (error) {
      console.error("Error in getApplicableRolesForQuestionByProgramPhase:", error);
      return [];
    }
  }

  // Get roles that are both associated with a question AND available for a questionnaire
  // This is a helper method for program-phase based role fetching
  async getRolesIntersectionForQuestionByQuestionnaire(
    questionnaireId: number,
    questionId: number
  ): Promise<Role[]> {
    try {
      // Get roles that are associated with this specific question
      const { data: questionRoles, error: questionError } = await this.supabase
        .from("questionnaire_question_roles")
        .select(`
          shared_role_id,
          shared_roles!inner(id, name, description)
        `)
        .eq("questionnaire_question_id", questionId)
        .eq("questionnaire_id", questionnaireId)
        .eq("is_deleted", false);

      if (questionError) {
        console.error("Error getting question roles:", questionError);
        return [];
      }

      if (!questionRoles || questionRoles.length === 0) {
        // No roles specifically assigned to this question
        return [];
      }

      // Get the shared role IDs
      const sharedRoleIds = questionRoles.map(qr => qr.shared_role_id);

      // Now get all company roles that match these shared roles
      // This is a simplified version - you might need to add company/site filtering
      const { data: companyRoles, error: rolesError } = await this.supabase
        .from("roles")
        .select(`
          *,
          shared_role:shared_roles(*),
          work_group:work_groups(
            id,
            name,
            asset_group:asset_groups(
              id,
              name
            )
          )
        `)
        .in("shared_role_id", sharedRoleIds)
        .eq("is_deleted", false);

      if (rolesError) {
        console.error("Error getting company roles:", rolesError);
        return [];
      }

      return companyRoles || [];
    } catch (error) {
      console.error("Error in getRolesIntersectionForQuestionByQuestionnaire:", error);
      return [];
    }
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

    // Only consider applicable responses
    const applicableResponses = responses.filter(
      (response) => response.is_applicable !== false
    );

    if (applicableResponses.length === 0) {
      return 0;
    }

    const completedResponses = applicableResponses.filter(
      (response) =>
        response.rating_score !== null && response.rating_score !== undefined
    );

    return completedResponses.length / applicableResponses.length;
  }

  private calculateAverageScore(responses: any[]): number {
    if (!responses || responses.length === 0) {
      return 0;
    }

    // Only consider applicable responses with scores
    const scoredResponses = responses.filter(
      (response) =>
        response.is_applicable !== false &&
        response.rating_score !== null &&
        response.rating_score !== undefined
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
    // First decode URL encoding, then replace spaces with '+' for aliased emails
    email = decodeURIComponent(email).replace(/ /g, "+");

    const { data: interview, error } = await this.supabase
      .from("interviews")
      .select(
        `
        id, 
        access_code, 
        is_public, 
        enabled,
        interview_contact:contacts!interview_contact_id(email)
      `
      )
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

    // Check email against contact email
    if (
      interview.interview_contact?.email?.toLowerCase() !== email.toLowerCase()
    ) {
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
    console.log(
      "validating user before creating public interview response action:",
      email
    );
    await this.validatePublicInterviewAccess(interviewId, accessCode, email);

    // Get the interview details including company_id
    const { data: interview, error: interviewError } = await this.supabase
      .from("interviews")
      .select("company_id")
      .eq("id", interviewId)
      .single();

    if (interviewError) throw interviewError;
    if (!interview) throw new Error("Interview not found");

    // Create the action without auth checks
    const { data: action, error } = await this.supabase
      .from("interview_response_actions")
      .insert({
        ...data,
        interview_id: interviewId,
        company_id: interview.company_id,
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

  // Validate that a questionnaire has applicable questions for given role IDs (for program questionnaires)
  async validateProgramQuestionnaireHasApplicableRoles(
    questionnaireId: number,
    roleIds: number[]
  ): Promise<{ isValid: boolean; hasUniversalQuestions: boolean }> {
    try {
      // First, get all questions for this questionnaire
      // We need to go through the hierarchy: questionnaire -> steps -> questions
      const { data: steps } = await this.supabase
        .from("questionnaire_steps")
        .select("id")
        .eq("questionnaire_id", questionnaireId)
        .eq("is_deleted", false);

      if (!steps || steps.length === 0) {
        return { isValid: false, hasUniversalQuestions: false };
      }

      const stepIds = steps.map((s) => s.id);

      const { data: allQuestions } = await this.supabase
        .from("questionnaire_questions")
        .select("id")
        .in("questionnaire_step_id", stepIds)
        .eq("is_deleted", false);

      if (!allQuestions || allQuestions.length === 0) {
        return { isValid: false, hasUniversalQuestions: false };
      }

      const allQuestionIds = allQuestions.map((q) => q.id);

      // Get role restrictions for all questions
      const { data: questionRoles } = await this.supabase
        .from("questionnaire_question_roles")
        .select("questionnaire_question_id, shared_role_id")
        .in("questionnaire_question_id", allQuestionIds)
        .eq("is_deleted", false);

      // Check for universal questions (questions with no role restrictions)
      const questionsWithRoles = new Set(
        (questionRoles || []).map((qr) => qr.questionnaire_question_id)
      );
      const hasUniversalQuestions = allQuestionIds.some(
        (id) => !questionsWithRoles.has(id)
      );

      // If we have universal questions, the questionnaire is always valid
      if (hasUniversalQuestions) {
        return { isValid: true, hasUniversalQuestions: true };
      }

      // Otherwise, check if any questions apply to the selected roles
      if (roleIds.length === 0) {
        return { isValid: false, hasUniversalQuestions: false };
      }

      const { data: roles } = await this.supabase
        .from("roles")
        .select("shared_role_id")
        .in("id", roleIds)
        .not("shared_role_id", "is", null);

      if (!roles || roles.length === 0) {
        return { isValid: false, hasUniversalQuestions: false };
      }

      const sharedRoleIds = roles
        .map((role) => role.shared_role_id)
        .filter(Boolean);
      const hasMatchingRoles = (questionRoles || []).some((qr) =>
        sharedRoleIds.includes(qr.shared_role_id)
      );

      return {
        isValid: hasMatchingRoles,
        hasUniversalQuestions: false,
      };
    } catch (error) {
      console.error("Error in validateProgramQuestionnaireHasApplicableRoles:", error);
      return { isValid: false, hasUniversalQuestions: false };
    }
  }

  // Validate that a questionnaire has applicable questions for given role IDs (optimized)
  async validateQuestionnaireHasApplicableRoles(
    assessmentId: number,
    roleIds: number[]
  ): Promise<{ isValid: boolean; hasUniversalQuestions: boolean }> {
    try {
      // 1. Get questionnaire_id from assessment
      const { data: assessment, error: assessmentError } = await this.supabase
        .from("assessments")
        .select("questionnaire_id")
        .eq("id", assessmentId)
        .eq("is_deleted", false)
        .single();

      if (assessmentError || !assessment?.questionnaire_id) {
        console.error(
          "Error getting questionnaire for assessment:",
          assessmentError
        );
        return { isValid: false, hasUniversalQuestions: false };
      }

      // 2. Get all question IDs for this questionnaire (flattened queries)
      // First get section IDs
      const { data: sections, error: sectionsError } = await this.supabase
        .from("questionnaire_sections")
        .select("id")
        .eq("questionnaire_id", assessment.questionnaire_id)
        .eq("is_deleted", false);

      if (sectionsError || !sections || sections.length === 0) {
        console.error(
          "Error getting sections for questionnaire:",
          sectionsError
        );
        return { isValid: false, hasUniversalQuestions: false };
      }

      const sectionIds = sections.map((s) => s.id);

      // Then get step IDs
      const { data: steps, error: stepsError } = await this.supabase
        .from("questionnaire_steps")
        .select("id")
        .in("questionnaire_section_id", sectionIds)
        .eq("is_deleted", false);

      if (stepsError || !steps || steps.length === 0) {
        console.error("Error getting steps for questionnaire:", stepsError);
        return { isValid: false, hasUniversalQuestions: false };
      }

      const stepIds = steps.map((s) => s.id);

      // Finally get question IDs
      const { data: questions, error: questionsError } = await this.supabase
        .from("questionnaire_questions")
        .select("id")
        .in("questionnaire_step_id", stepIds)
        .eq("is_deleted", false);

      if (questionsError || !questions || questions.length === 0) {
        console.error(
          "Error getting questions for questionnaire:",
          questionsError
        );
        return { isValid: false, hasUniversalQuestions: false };
      }

      const allQuestionIds = questions.map((q) => q.id);

      // 3. Get role restrictions for all questions at once
      const { data: questionRoles, error: questionRolesError } =
        await this.supabase
          .from("questionnaire_question_roles")
          .select("questionnaire_question_id, shared_role_id")
          .in("questionnaire_question_id", allQuestionIds)
          .eq("is_deleted", false);

      if (questionRolesError) {
        console.error("Error getting question roles:", questionRolesError);
        return { isValid: false, hasUniversalQuestions: false };
      }

      // 4. Check for universal questions (questions with no role restrictions)
      const questionsWithRoles = new Set(
        (questionRoles || []).map((qr) => qr.questionnaire_question_id)
      );
      const hasUniversalQuestions = allQuestionIds.some(
        (id) => !questionsWithRoles.has(id)
      );

      // If we have universal questions, the questionnaire is always valid
      if (hasUniversalQuestions) {
        console.log("hasUniversalQuestions: ", hasUniversalQuestions);
        return { isValid: true, hasUniversalQuestions: true };
      }

      // 5. Get shared_role_ids for the provided roleIds
      if (roleIds.length === 0) {
        return { isValid: false, hasUniversalQuestions: false };
      }

      const { data: roles, error: rolesError } = await this.supabase
        .from("roles")
        .select("id, shared_role_id")
        .in("id", roleIds)
        .eq("is_deleted", false);

      if (rolesError || !roles || roles.length === 0) {
        console.error("Error getting roles:", rolesError);
        return { isValid: false, hasUniversalQuestions: false };
      }

      const providedSharedRoleIds = roles
        .map((r) => r.shared_role_id)
        .filter(Boolean);

      // 6. Check if any questions are applicable to the provided roles
      const questionSharedRoleIds = new Set(
        (questionRoles || []).map((qr) => qr.shared_role_id)
      );

      const hasApplicableQuestions = providedSharedRoleIds.some(
        (sharedRoleId) => questionSharedRoleIds.has(sharedRoleId)
      );

      return {
        isValid: hasApplicableQuestions,
        hasUniversalQuestions: false,
      };
    } catch (error) {
      console.error("Error in validateQuestionnaireHasApplicableRoles:", error);
      return { isValid: false, hasUniversalQuestions: false };
    }
  }

  // Get questionnaire structure for an assessment (for validation during interview creation)
  async getQuestionnaireStructureForAssessment(
    assessmentId: number
  ): Promise<{ sections: QuestionnaireSection[] } | null> {
    try {
      // First, get the assessment to find the questionnaire
      const { data: assessment, error: assessmentError } = await this.supabase
        .from("assessments")
        .select("questionnaire_id")
        .eq("id", assessmentId)
        .single();

      if (assessmentError || !assessment?.questionnaire_id) {
        console.error(
          "Failed to get questionnaire for assessment:",
          assessmentError
        );
        return null;
      }

      const questionnaireId = assessment.questionnaire_id;

      // Get the full questionnaire structure
      const { data: questionnaire, error: questionnaireError } =
        await this.supabase
          .from("questionnaires")
          .select(
            `
          questionnaire_sections(
            id,
            title,
            order_index,
            questionnaire_steps(
              id,
              title,
              order_index,
              questionnaire_questions(
                ${this.getQuestionSelectQuery()}
              )
            )
          )
        `
          )
          .eq("id", questionnaireId)
          .eq("questionnaire_sections.is_deleted", false)
          .eq("questionnaire_sections.questionnaire_steps.is_deleted", false)
          .eq(
            "questionnaire_sections.questionnaire_steps.questionnaire_questions.is_deleted",
            false
          )
          .single();

      if (questionnaireError || !questionnaire) {
        console.error(
          "Failed to get questionnaire structure:",
          questionnaireError
        );
        return null;
      }

      // Transform and sort the data structure properly
      const sections = ((questionnaire as any).questionnaire_sections || [])
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((section: any, sectionIndex: number) => ({
          ...section,
          order_index: sectionIndex, // Normalize to 0-based indexing for consistent display
          steps: (section.questionnaire_steps || [])
            .sort((a: any, b: any) => a.order_index - b.order_index)
            .map((step: any, stepIndex: number) => ({
              ...step,
              order_index: stepIndex, // Normalize to 0-based indexing for consistent display
              questions: (step.questionnaire_questions || [])
                .sort((a: any, b: any) => a.order_index - b.order_index)
                .map((question: any, questionIndex: number) => ({
                  ...question,
                  order_index: questionIndex, // Normalize to 0-based indexing for consistent display
                  // Transform questionnaire_question_rating_scales to rating_scales for component compatibility
                  rating_scales: (
                    question.questionnaire_question_rating_scales || []
                  )
                    .map((qrs: any) => ({
                      id: qrs.questionnaire_rating_scale?.id || qrs.id,
                      value: qrs.questionnaire_rating_scale?.value || 0,
                      name: qrs.questionnaire_rating_scale?.name || "",
                      description:
                        qrs.questionnaire_rating_scale?.description ||
                        qrs.description ||
                        "",
                    }))
                    .sort((a: any, b: any) => a.value - b.value),
                })),
            })),
        }));

      return { sections };
    } catch (error) {
      console.error("Error in getQuestionnaireStructureForAssessment:", error);
      return null;
    }
  }

  // Get questionnaire structure for an interview (stable question source)
  async getQuestionnaireStructureForInterview(
    interviewId: number
  ): Promise<{ sections: QuestionnaireSection[] } | null> {
    try {
      // Get the interview's questionnaire_id directly
      const { data: interview, error: interviewError } = await this.supabase
        .from("interviews")
        .select("questionnaire_id")
        .eq("id", interviewId)
        .maybeSingle();

      if (interviewError || !interview?.questionnaire_id) {
        console.error(
          "Failed to get questionnaire for interview:",
          interviewError
        );
        return null;
      }

      const questionnaireId = interview.questionnaire_id;

      // Get the full questionnaire structure
      const { data: questionnaire, error: questionnaireError } =
        await this.supabase
          .from("questionnaires")
          .select(
            `
          questionnaire_sections(
            id,
            title,
            order_index,
            questionnaire_steps(
              id,
              title,
              order_index,
              questionnaire_questions(
                ${this.getQuestionSelectQuery()}
              )
            )
          )
        `
          )
          .eq("id", questionnaireId)
          .eq("questionnaire_sections.is_deleted", false)
          .eq("questionnaire_sections.questionnaire_steps.is_deleted", false)
          .eq(
            "questionnaire_sections.questionnaire_steps.questionnaire_questions.is_deleted",
            false
          )
          .maybeSingle();

      if (questionnaireError || !questionnaire) {
        console.error(
          "Failed to get questionnaire structure:",
          questionnaireError
        );
        return null;
      }

      // Transform and sort the data structure properly
      const sections = ((questionnaire as any).questionnaire_sections || [])
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((section: any, sectionIndex: number) => ({
          ...section,
          order_index: sectionIndex, // Normalize to 0-based indexing for consistent display
          steps: (section.questionnaire_steps || [])
            .sort((a: any, b: any) => a.order_index - b.order_index)
            .map((step: any, stepIndex: number) => ({
              ...step,
              order_index: stepIndex, // Normalize to 0-based indexing for consistent display
              questions: (step.questionnaire_questions || [])
                .sort((a: any, b: any) => a.order_index - b.order_index)
                .map((question: any, questionIndex: number) => ({
                  ...question,
                  order_index: questionIndex, // Normalize to 0-based indexing for consistent display
                  // Transform questionnaire_question_rating_scales to rating_scales for component compatibility
                  rating_scales: (
                    question.questionnaire_question_rating_scales || []
                  )
                    .map((qrs: any) => ({
                      id: qrs.questionnaire_rating_scale?.id || qrs.id,
                      value: qrs.questionnaire_rating_scale?.value || 0,
                      name: qrs.questionnaire_rating_scale?.name || "",
                      description:
                        qrs.questionnaire_rating_scale?.description ||
                        qrs.description ||
                        "",
                    }))
                    .sort((a: any, b: any) => a.value - b.value),
                })),
            })),
        }));

      return { sections };
    } catch (error) {
      console.error("Error in getQuestionnaireStructureForInterview:", error);
      return null;
    }
  }

  // Get all comments for an assessment (across all interviews)
  async getCommentsForAssessment(
    assessmentId: number, 
    options?: {
      page?: number;
      pageSize?: number;
    }
  ): Promise<{
    data: any[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, pageSize = 10 } = options || {};
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // First get the total count
      const { count, error: countError } = await this.supabase
        .from("interview_responses")
        .select("*, interview:interviews!inner(assessment_id)", { count: "exact", head: true })
        .not("comments", "is", null)
        .neq("comments", "")
        .eq("interview.assessment_id", assessmentId);

      if (countError) {
        console.error("Error fetching comments count:", countError);
        throw countError;
      }

      // Then get the paginated data
      const { data, error } = await this.supabase
        .from("interview_responses")
        .select(
          `
          id,
          comments,
          answered_at,
          created_at,
          updated_at,
          created_by,
          questionnaire_question_id,
          interview:interviews!inner(
            id,
            name,
            assessment_id
          ),
          questionnaire_question:questionnaire_questions(
            id,
            title,
            questionnaire_step:questionnaire_steps(
              title,
              questionnaire_section:questionnaire_sections(
                title
              )
            )
          )
        `
        )
        .not("comments", "is", null)
        .neq("comments", "")
        .eq("interview.assessment_id", assessmentId)
        .order("updated_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error fetching assessment comments:", error);
        throw error;
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / pageSize);

      // Transform the data to a flatter structure for easier consumption
      const transformedData = (data || []).map((item: any) => ({
        id: item.id,
        comments: item.comments,
        answered_at: item.answered_at,
        created_at: item.created_at,
        updated_at: item.updated_at,
        created_by: item.created_by,
        interview_id: item.interview?.id,
        interview_name: item.interview?.name,
        question_id: item.questionnaire_question?.id,
        question_title: item.questionnaire_question?.title,
        domain_name:
          item.questionnaire_question?.questionnaire_step?.questionnaire_section
            ?.title || "Unknown Section",
        subdomain_name: item.questionnaire_question?.questionnaire_step?.title,
      }));

      return {
        data: transformedData,
        total,
        page,
        pageSize,
        totalPages,
      };
    } catch (error) {
      console.error("Error in getCommentsForAssessment:", error);
      throw error;
    }
  }
}

export const interviewService = new InterviewService();
