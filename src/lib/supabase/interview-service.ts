import { createClient } from "./client";
import type {
  InterviewResponseAction,
  Role,
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
        .select(
          `
          id,
          program_id,
          programs!inner(
            id,
            onsite_questionnaire_id,
            presite_questionnaire_id
          )
        `
        )
        .eq("id", programPhaseId)
        .single();

      if (phaseError || !programPhase) {
        console.error("Error getting program phase:", phaseError);
        return [];
      }

      // For now, we'll use the onsite_questionnaire_id. You may need to adjust this
      // based on your business logic for which questionnaire to use
      const questionnaireId =
        programPhase.programs.onsite_questionnaire_id ||
        programPhase.programs.presite_questionnaire_id;

      console.log("questionnaireId: ", questionnaireId);

      if (!questionnaireId) {
        console.error(
          "No questionnaire found for program phase:",
          programPhaseId
        );
        return [];
      }

      // Get question-specific roles for this questionnaire and question
      // We need to adapt this to work with questionnaire instead of assessment
      const questionSpecificRoles =
        await this.getRolesIntersectionForQuestionByQuestionnaire(
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
      console.error(
        "Error in getApplicableRolesForQuestionByProgramPhase:",
        error
      );
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
        .select(
          `
          shared_role_id,
          shared_roles!inner(id, name, description)
        `
        )
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
      const sharedRoleIds = questionRoles.map((qr) => qr.shared_role_id);

      // Now get all company roles that match these shared roles
      // This is a simplified version - you might need to add company/site filtering
      const { data: companyRoles, error: rolesError } = await this.supabase
        .from("roles")
        .select(
          `
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
        `
        )
        .in("shared_role_id", sharedRoleIds)
        .eq("is_deleted", false);

      if (rolesError) {
        console.error("Error getting company roles:", rolesError);
        return [];
      }

      return companyRoles || [];
    } catch (error) {
      console.error(
        "Error in getRolesIntersectionForQuestionByQuestionnaire:",
        error
      );
      return [];
    }
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
      console.error(
        "Error in validateProgramQuestionnaireHasApplicableRoles:",
        error
      );
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
}

export const interviewService = new InterviewService();
