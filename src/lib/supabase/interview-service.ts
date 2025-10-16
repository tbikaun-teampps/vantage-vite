import { createClient } from "./client";
import type {
  InterviewResponseAction,
  QuestionnaireQuestion,
  InterviewX,
  InterviewXWithResponses,
} from "@/types/assessment";

import {
  getInterviewById as getInterviewByIdAPI,
  getInterviewProgress as getInterviewProgressAPI,
  getInterviewQuestionById as getInterviewQuestionByIdAPI,
} from "@/lib/api/interviews";

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

  async getInterviewById(id: number): Promise<InterviewXWithResponses | null> {
    try {
      // Fetch api data for testing
      const interviewDataApi = await getInterviewByIdAPI(id);
      console.log("interviewDataApi: ", interviewDataApi);

      const interviewProgressDataApi = await getInterviewProgressAPI(id);
      console.log("interviewProgressDataApi: ", interviewProgressDataApi);

      const interviewQuestionDataApi = await getInterviewQuestionByIdAPI(
        id,
        interviewDataApi.firstQuestionId
      );
      console.log("interviewQuestionDataApi: ", interviewQuestionDataApi);

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
}

export const interviewService = new InterviewService();
