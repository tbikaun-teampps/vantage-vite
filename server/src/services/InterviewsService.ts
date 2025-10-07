import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

export interface CreateInterviewData {
  assessment_id: number;
  interviewer_id: string | null;
  name: string;
  notes?: string | null;
  is_public?: boolean;
  enabled?: boolean;
  access_code?: string | null;
  interview_contact_id?: number | null;
  role_ids?: number[];
}

export type Interview = Database["public"]["Tables"]["interviews"]["Row"];

interface AssessmentWithQuestionnaire {
  id: number;
  company_id: string;
  questionnaire: {
    id: number;
    questionnaire_sections: Array<{
      id: number;
      questionnaire_steps: Array<{
        id: number;
        questionnaire_questions: Array<{
          id: number;
          questionnaire_question_roles: Array<{
            id: number;
            shared_role_id: number;
          }>;
        }>;
      }>;
    }>;
  };
}

export class InterviewsService {
  private supabase: SupabaseClient<Database>;
  private userId: string | null;

  constructor(supabaseClient: SupabaseClient<Database>, userId: string | null) {
    this.supabase = supabaseClient;
    this.userId = userId;
  }

  /**
   * Generate a unique 8-character alphanumeric access code
   */
  private async generateAccessCode(): Promise<string> {
    const crypto = await import("crypto");
    let accessCode: string;
    let isUnique = false;

    while (!isUnique) {
      accessCode = crypto.randomBytes(4).toString("hex");

      // Check if code already exists
      const { data, error } = await this.supabase
        .from("interviews")
        .select("id")
        .eq("access_code", accessCode)
        .maybeSingle();

      if (error) throw error;
      if (!data) isUnique = true;
    }

    return accessCode!;
  }

  /**
   * Create multiple public interviews, one for each contact
   * Each interview is scoped to the contact's role with a unique access code
   * @param data - Assessment ID, contact IDs, and interview name
   * @returns Array of created interviews with contact information
   */
  async createPublicInterviews(data: {
    assessment_id: number;
    interview_contact_ids: number[];
    name: string;
  }): Promise<
    Array<
      Interview & {
        contact: { id: number; full_name: string; email: string };
      }
    >
  > {
    const { assessment_id, interview_contact_ids, name } = data;
    const createdInterviews: Array<
      Interview & {
        contact: { id: number; full_name: string; email: string };
      }
    > = [];

    // Fetch all contacts with their roles in one query
    const { data: roleContacts, error: roleContactsError } = await this.supabase
      .from("role_contacts")
      .select(
        `
        contact_id,
        role_id,
        contact:contacts(id, full_name, email)
      `
      )
      .in("contact_id", interview_contact_ids);

    if (roleContactsError) throw roleContactsError;
    if (!roleContacts || roleContacts.length === 0) {
      throw new Error("No roles found for the selected contacts");
    }

    // Create maps for quick lookup
    const contactRoleMap = new Map<number, number>();
    const contactInfoMap = new Map<
      number,
      { id: number; full_name: string; email: string }
    >();
    roleContacts.forEach((rc: any) => {
      contactRoleMap.set(rc.contact_id, rc.role_id);
      if (rc.contact) {
        contactInfoMap.set(rc.contact_id, rc.contact);
      }
    });

    // Create an interview for each contact
    for (const contactId of interview_contact_ids) {
      const roleId = contactRoleMap.get(contactId);
      const contactInfo = contactInfoMap.get(contactId);

      if (!roleId) {
        console.warn(`No role found for contact ${contactId}, skipping...`);
        continue;
      }

      if (!contactInfo) {
        console.warn(
          `No contact info found for contact ${contactId}, skipping...`
        );
        continue;
      }

      // Generate unique access code
      const accessCode = await this.generateAccessCode();

      // Create interview with the contact's role
      const interviewData: CreateInterviewData = {
        assessment_id,
        interviewer_id: null, // Public interviews have no interviewer
        name,
        is_public: true,
        enabled: true,
        access_code: accessCode,
        interview_contact_id: contactId,
        role_ids: [roleId],
      };

      try {
        const interview = await this.createInterview(interviewData);
        createdInterviews.push({
          ...interview,
          contact: contactInfo,
        });
      } catch (error) {
        console.error(
          `Failed to create interview for contact ${contactId}:`,
          error
        );
        // Continue with other contacts even if one fails
      }
    }

    if (createdInterviews.length === 0) {
      throw new Error("Failed to create any interviews");
    }

    return createdInterviews;
  }

  /**
   * Create a new interview (public)
   * @param interviewData Data for creating the interview
   * @returns
   */
  async createInterview(
    interviewData: CreateInterviewData
  ): Promise<Interview> {
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
              questionnaire_questions(id, 
                questionnaire_question_roles(
                  id, shared_role_id
                  )
                )
            )
          )
        )
      `
      )
      .eq("id", interviewData.assessment_id)
      .single()) as { data: AssessmentWithQuestionnaire | null; error: any };

    if (assessmentError) throw assessmentError;
    if (!assessment) throw new Error("Assessment not found");

    console.log("assessment: ", JSON.stringify(assessment, null, 2));

    // Get shared_role_ids associated with the role_ids
    // This is used to determine question applicability later
    // Also create a mapping for efficient lookups when populating interview_question_applicable_roles
    let sharedRoleIds: number[] = [];
    const roleMapping: Map<number, number> = new Map(); // shared_role_id -> role_id

    if (role_ids && role_ids.length > 0) {
      const { data: roles, error: rolesError } = await this.supabase
        .from("roles")
        .select("id, shared_role_id")
        .in("id", role_ids)
        .eq("is_deleted", false);

      if (rolesError) throw rolesError;

      if (roles) {
        sharedRoleIds = roles.map((r) => r.shared_role_id);
        roles.forEach((r) => roleMapping.set(r.shared_role_id, r.id));
      }
    }

    console.log("sharedRoleIds: ", sharedRoleIds);

    // Get all the roles associated with the company
    // This is used to determine question applicability later
    // Also create a mapping for populating interview_question_applicable_roles
    const { data: companyRoles, error: companyRolesError } = await this.supabase
      .from("roles")
      .select("id, shared_role_id")
      .eq("company_id", assessment.company_id)
      .eq("is_deleted", false);

    if (companyRolesError) throw companyRolesError;

    const companySharedRoleIds = companyRoles
      ? companyRoles.map((r) => r.shared_role_id)
      : [];

    // Create mapping of shared_role_id -> role_id for all company roles
    const companyRoleMapping: Map<number, number> = new Map();
    companyRoles?.forEach((r) =>
      companyRoleMapping.set(r.shared_role_id, r.id)
    );

    console.log("companySharedRoleIds: ", companySharedRoleIds);

    // Extract all question IDs
    const questionIds: number[] = [];
    const questionRoleMap: { [questionId: number]: number[] } = {};
    if (assessment.questionnaire?.questionnaire_sections) {
      for (const section of assessment.questionnaire.questionnaire_sections) {
        for (const step of section.questionnaire_steps) {
          for (const question of step.questionnaire_questions) {
            questionIds.push(question.id);
            // Map question to its applicable shared_role_ids
            questionRoleMap[question.id] =
              question.questionnaire_question_roles.map(
                (qrr) => qrr.shared_role_id
              );
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
          interviewer_id: dbInterviewData.interviewer_id || this.userId,
          created_by: this.userId,
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
        company_id: assessment.company_id,
        created_by: this.userId,
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

    // Create interview responses for all questions and populate applicable roles
    if (questionIds.length > 0) {
      const responseData: any[] = [];
      const applicableRoleRecords: Array<{
        interview_id: number;
        questionnaire_question_id: number;
        is_universal: boolean;
        role_id: number | null;
        company_id: string;
      }> = [];

      for (const questionId of questionIds) {
        console.log("Creating response for question ID:", questionId);

        // Check if question is applicable.
        // Applicability is based on whether the roles associated with the question
        // intersect with the roles associated with the interview (if any).
        // If no roles are explicitly defined, still need to check that
        // the company has intersecting roles with the question.

        let applicable = true;
        const hasInterviewRoles = role_ids && role_ids.length > 0;
        const questionRoles = questionRoleMap[questionId];

        console.log(
          "questionRoleMap[questionId]: ",
          questionRoleMap[questionId]
        );

        if (!hasInterviewRoles && questionRoles.length === 0) {
          // Universally applicable question
          // Questionnaire hasn't defined roles for this question, and
          // user hasn't scoped the interview to specific roles
          applicable = true;

          // Add universal applicable role record
          applicableRoleRecords.push({
            interview_id: interview.id,
            questionnaire_question_id: questionId,
            is_universal: true,
            role_id: null,
            company_id: assessment.company_id,
          });
        } else if (hasInterviewRoles && questionRoles.length === 0) {
          // Universally applicable question
          // Questionnaire hasn't defined roles for this question, but
          // user has scoped the interview to specific roles which doesn't change anything
          applicable = true;

          // Add universal applicable role record
          applicableRoleRecords.push({
            interview_id: interview.id,
            questionnaire_question_id: questionId,
            is_universal: true,
            role_id: null,
            company_id: assessment.company_id,
          });
        } else if (!hasInterviewRoles && questionRoles.length > 0) {
          // Question has specific roles defined, but
          // user hasn't scoped the interview to specific roles
          // Need to check if company has any roles that intersect with the question roles

          const applicableSharedRoleIds = questionRoles.filter((roleId) =>
            companySharedRoleIds.includes(roleId)
          );
          applicable = applicableSharedRoleIds.length > 0;

          // Add role-specific applicable role records
          for (const sharedRoleId of applicableSharedRoleIds) {
            const actualRoleId = companyRoleMapping.get(sharedRoleId);
            if (actualRoleId) {
              applicableRoleRecords.push({
                interview_id: interview.id,
                questionnaire_question_id: questionId,
                is_universal: false,
                role_id: actualRoleId,
                company_id: assessment.company_id,
              });
            }
          }
        } else if (hasInterviewRoles && questionRoles.length > 0) {
          // Both question and interview have roles defined
          // Check for intersection between the two sets of roles
          const intersection = questionRoles.filter((roleId) =>
            sharedRoleIds.includes(roleId)
          );
          applicable = intersection.length > 0;

          // Add role-specific applicable role records for interview roles
          for (const sharedRoleId of intersection) {
            const actualRoleId = roleMapping.get(sharedRoleId);
            if (actualRoleId) {
              applicableRoleRecords.push({
                interview_id: interview.id,
                questionnaire_question_id: questionId,
                is_universal: false,
                role_id: actualRoleId,
                company_id: assessment.company_id,
              });
            }
          }
        }

        console.log(
          `Question ID ${questionId} applicable: ${applicable} (Interview roles: ${sharedRoleIds}, Question roles: ${questionRoles})`
        );

        responseData.push({
          interview_id: interview.id,
          questionnaire_question_id: questionId,
          rating_score: null,
          comments: null,
          answered_at: null,
          is_applicable: applicable,
          company_id: assessment.company_id,
          created_by: this.userId,
        });
      }

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

      // Insert all applicable role records for interview_question_applicable_roles table
      if (applicableRoleRecords.length > 0) {
        const { error: applicableRolesError } = await this.supabase
          .from("interview_question_applicable_roles")
          .insert(applicableRoleRecords);

        if (applicableRolesError) {
          // If applicable roles creation fails, clean up the interview
          await this.supabase
            .from("interviews")
            .delete()
            .eq("id", interview.id);
          throw applicableRolesError;
        }
      }

      // For single role interviews, pre-populate response role associations
      if (
        role_ids &&
        role_ids.length === 1 &&
        createdResponses &&
        createdResponses.length > 0
      ) {
        const responseRoleAssociations = createdResponses.map((response) => ({
          interview_response_id: response.id,
          role_id: role_ids[0],
          company_id: assessment.company_id,
          interview_id: interview.id,
          created_by: this.userId,
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

  /**
   * Get an interview by ID
   * @param interviewId ID of the interview to retrieve
   * @returns
   */
  async getInterviewById(interviewId: number): Promise<any | null> {
    // Get interview
    const { data: interview, error: interviewError } = await this.supabase
      .from("interviews")
      .select(
        "id,questionnaire_id, name, notes, status, is_public, assessment_id"
      )
      .eq("id", interviewId)
      .eq("is_deleted", false)
      .maybeSingle();

    if (interviewError) throw interviewError;

    if (!interview) return null;
    console.log("interview: ", interview);

    // Fetch the questionnaire associated with the interview.
    // This is used for quick navigation and search in the UI.
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
                id,
                title,
                order_index
              )
            )
          )
        `
        )
        .eq("id", interview.questionnaire_id)
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

    let firstQuestionId: number | null = null;

    // Transform and sort the data structure properly
    const sections = ((questionnaire as any).questionnaire_sections || [])
      .sort((a: any, b: any) => a.order_index - b.order_index)
      .map((section: any, sectionIndex: number) => ({
        id: section.id,
        title: section.title,
        order_index: sectionIndex, // Normalize to 0-based indexing for consistent display
        steps: (section.questionnaire_steps || [])
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((step: any, stepIndex: number) => ({
            id: step.id,
            title: step.title,
            order_index: stepIndex, // Normalize to 0-based indexing for consistent display
            questions: (step.questionnaire_questions || [])
              .sort((a: any, b: any) => a.order_index - b.order_index)
              .map((question: any, questionIndex: number) => {
                // Capture the first question ID for default navigation
                if (firstQuestionId === null) {
                  firstQuestionId = question.id;
                }
                return {
                  id: question.id,
                  title: question.title,
                  order_index: questionIndex, // Normalize to 0-based indexing for consistent display
                };
              }),
          })),
      }));

    return { interview, questionnaire: sections, firstQuestionId };
  }

  /**
   * Get interview summary (lightweight - for layout/settings)
   * Returns only essential metadata without responses or full questionnaire
   * @param interviewId ID of the interview to retrieve
   * @returns Interview summary with assessment, interviewer, and roles
   */
  async getInterviewSummary(interviewId: number): Promise<any | null> {
    const { data: interview, error } = await this.supabase
      .from("interviews")
      .select(
        `
        id,
        name,
        status,
        notes,
        is_public,
        assessment:assessments(id, name),
        interviewer:profiles(id, full_name),
        interview_roles(
          role:roles(
            id,
            shared_role:shared_roles(name)
          )
        )
      `
      )
      .eq("id", interviewId)
      .eq("is_deleted", false)
      .maybeSingle();

    if (error) throw error;
    if (!interview) return null;

    // Transform interviewer data to match expected format
    const transformedInterview = {
      ...interview,
      interviewer: interview.interviewer
        ? {
            id: interview.interviewer.id,
            name: interview.interviewer.full_name,
          }
        : null,
    };

    return transformedInterview;
  }

  /**
   * Get interview structure (questionnaire hierarchy)
   * Optimized for navigation - minimal data, long cache TTL
   */
  async getInterviewStructure(interviewId: number): Promise<any | null> {
    // Get interview basic info
    const { data: interview, error: interviewError } = await this.supabase
      .from("interviews")
      .select("id, questionnaire_id, name, assessment_id, is_public")
      .eq("id", interviewId)
      .eq("is_deleted", false)
      .maybeSingle();

    if (interviewError) throw interviewError;
    if (!interview || !interview.questionnaire_id) return null;

    // Fetch the questionnaire structure
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
                id,
                title,
                order_index
              )
            )
          )
        `
        )
        .eq("id", interview.questionnaire_id)
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

    // Transform and sort the data structure
    const sections = ((questionnaire as any).questionnaire_sections || [])
      .sort((a: any, b: any) => a.order_index - b.order_index)
      .map((section: any, sectionIndex: number) => ({
        id: section.id,
        title: section.title,
        order_index: sectionIndex,
        steps: (section.questionnaire_steps || [])
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((step: any, stepIndex: number) => ({
            id: step.id,
            title: step.title,
            order_index: stepIndex,
            questions: (step.questionnaire_questions || [])
              .sort((a: any, b: any) => a.order_index - b.order_index)
              .map((question: any, questionIndex: number) => ({
                id: question.id,
                title: question.title,
                order_index: questionIndex,
              })),
          })),
      }));

    return {
      interview: {
        id: interview.id,
        name: interview.name,
        questionnaire_id: interview.questionnaire_id,
        assessment_id: interview.assessment_id,
        is_public: interview.is_public,
      },
      sections,
    };
  }

  // TODO: need to ensure that the counts are correct, currently they are higher than expected.
  async getInterviewProgress(interviewId: number): Promise<any> {
    const { data, error } = await this.supabase
      .from("interviews")
      .select(
        `*,
          interview_responses(
            *,
            is_applicable,
            response_roles:interview_response_roles(
              role:roles(*)
            )
          )`
      )
      .eq("id", interviewId)
      .eq("interview_responses.is_applicable", true)
      .single();

    if (error) throw error;

    const totalQuestions = data?.interview_responses?.length || 0;
    // Answered questions are those that have interview_responses.rating_score AND at least one response role
    const answeredQuestions = data?.interview_responses
      ? data.interview_responses.filter(
          (response) =>
            response.rating_score !== null &&
            response.response_roles &&
            response.response_roles.length > 0
        ).length
      : 0;

    const progressPercentage =
      totalQuestions === 0
        ? 0
        : Math.round((answeredQuestions / totalQuestions) * 100);

    // Determine status based on progress
    let status: Database["public"]["Enums"]["interview_statuses"];
    if (answeredQuestions === 0) {
      status = "pending";
    } else if (answeredQuestions === totalQuestions && totalQuestions > 0) {
      status = "completed";
    } else {
      status = "in_progress";
    }

    // Capture previous status before updating
    const previousStatus = data.status;

    // Update interview status if it has changed
    if (previousStatus !== status) {
      const { error: updateError } = await this.supabase
        .from("interviews")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", interviewId);

      if (updateError) {
        console.error("Failed to update interview status:", updateError);
        // Don't throw - status calculation still valid even if update fails
      }
    }

    // Create response map for efficient lookups by question ID
    const responses: Record<number, any> = {};
    if (data?.interview_responses) {
      for (const response of data.interview_responses) {
        responses[response.questionnaire_question_id] = {
          id: response.id,
          rating_score: response.rating_score,
          is_applicable: response.is_applicable,
          has_rating_score: response.rating_score !== null,
          has_roles:
            response.response_roles && response.response_roles.length > 0,
        };
      }
    }

    return {
      status,
      previous_status: previousStatus !== status ? previousStatus : undefined,
      total_questions: totalQuestions,
      answered_questions: answeredQuestions,
      progress_percentage: progressPercentage,
      responses,
    };
  }

  async getInterviewQuestionById(
    interviewId: number,
    questionId: number
  ): Promise<any | null> {
    // First, get the interview to determine company context
    const { data: interview, error: interviewError } = await this.supabase
      .from("interviews")
      .select("id, company_id")
      .eq("id", interviewId)
      .eq("is_deleted", false)
      .maybeSingle();

    if (interviewError) throw interviewError;
    if (!interview) return null;

    // Fetch the question details along with any existing response
    const { data, error } = await this.supabase
      .from("questionnaire_questions")
      .select(
        `
        id,
        title,
        question_text,
        context,
        order_index,
        step:questionnaire_steps(
          id,
          title,
          order_index,
          section:questionnaire_sections(
            id,
            title,
            order_index
          )
        ),
        response:interview_responses(
          id,
          rating_score,
          answered_at,
          response_roles:interview_response_roles(
            id,
            role:roles(*)
          )
        ),
        rating_scale:questionnaire_question_rating_scales(
          id,
          questionnaire_rating_scale:questionnaire_rating_scales(id, value),
          description
        ),
        applicable_roles:interview_question_applicable_roles(
          role_id,
          is_universal,
          interview_id,
          role:roles(
            id,
            shared_role:shared_roles(id, name, description),
            work_group:work_groups(
              name,
              asset_group:asset_groups(
                name,
                site:sites(
                  name,
                  region:regions(
                    name,
                    business_unit:business_units(name)
                  )
                )
              )
            )
          )
        )
      `
      )
      .eq("id", questionId)
      .eq("response.interview_id", interviewId)
      .eq("applicable_roles.interview_id", interviewId) // Filter applicable roles to this interview
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    // Helper function to build organizational path for a role
    const buildRolePath = (role: any): string => {
      const parts: string[] = [];

      if (role.work_group?.asset_group?.site?.region?.business_unit?.name) {
        parts.push(role.work_group.asset_group.site.region.business_unit.name);
      }
      if (role.work_group?.asset_group?.site?.region?.name) {
        parts.push(role.work_group.asset_group.site.region.name);
      }
      if (role.work_group?.asset_group?.site?.name) {
        parts.push(role.work_group.asset_group.site.name);
      }
      if (role.work_group?.asset_group?.name) {
        parts.push(role.work_group.asset_group.name);
      }
      if (role.work_group?.name) {
        parts.push(role.work_group.name);
      }

      return parts.join(" > ");
    };

    console.log('data.applicable_roles: ', data.applicable_roles)

    // Check if question is universal
    const isUniversal = data.applicable_roles.some((ar) => ar.is_universal);

    let selectableRoles;
    if (isUniversal) {
      // Fetch all company roles with organizational hierarchy
      const { data: companyRoles } = await this.supabase
        .from("roles")
        .select(
          `
          id,
          shared_role:shared_roles(id, name, description),
          work_group:work_groups(
            name,
            asset_group:asset_groups(
              name,
              site:sites(
                name,
                region:regions(
                  name,
                  business_unit:business_units(name)
                )
              )
            )
          )
        `
        )
        .eq("company_id", interview.company_id)
        .eq("is_deleted", false);

      // Use all company roles
      selectableRoles = companyRoles
        ? companyRoles
            .filter((r) => r.shared_role) // Filter out null shared_roles
            .map((r) => ({
              id: r.id,
              shared_role_id: r.shared_role!.id,
              name: r.shared_role!.name,
              description: r.shared_role!.description,
              path: buildRolePath(r),
            }))
        : [];
    } else {
      // Use only applicable roles from the junction table
      selectableRoles = data.applicable_roles
        .filter((ar) => ar.role_id !== null && ar.role && ar.role.shared_role)
        .map((ar) => ({
          id: ar.role!.id,
          shared_role_id: ar.role!.shared_role!.id,
          name: ar.role!.shared_role!.name,
          description: ar.role!.shared_role!.description,
          path: buildRolePath(ar.role),
        }));
    }

    // Group roles by their organizational path for hierarchical UI display
    const groupedRoles = selectableRoles.reduce(
      (acc, role) => {
        if (!acc[role.path]) acc[role.path] = [];
        acc[role.path].push(role);
        return acc;
      },
      {} as Record<string, typeof selectableRoles>
    );

    // Get the response associated with the question (if any)
    const { data: responseData, error: responseError } = await this.supabase
      .from("interview_responses")
      .select(
        `
        id,
        rating_score,
        response_roles:interview_response_roles(
          id,
          role:roles(
            id
          )
        )
      `
      )
      .eq("interview_id", interviewId)
      .eq("questionnaire_question_id", questionId)
      .maybeSingle();

    if (responseError) throw responseError;

    const questionDetails = {
      id: questionId,
      title: `${data.step.section.order_index + 1}.${data.step.order_index + 1}.${data.order_index + 1} ${data.title}`,
      question_text: data.question_text,
      context: data.context,
      breadcrumbs: {
        section: `${data.step.section.order_index + 1} ${data.step.section.title}`,
        // TODO: review the step order index. It might be indexed from 1 instead of 0. Also does soft delete impact it?
        step: `${data.step.section.order_index + 1}.${data.step.order_index + 1} ${data.step.title}`,
        question: `${data.step.section.order_index + 1}.${data.step.order_index + 1}.${data.order_index + 1} ${data.title}`,
      },
      options: {
        applicable_roles: groupedRoles,
        rating_scales: data.rating_scale.map((rs) => ({
          id: rs.id,
          value: rs.questionnaire_rating_scale.value,
          description: rs.description,
        })),
      },
      response: responseData,
    };

    return questionDetails;
  }

  async updateInterviewResponse(
    responseId: number,
    rating_score?: number | null,
    role_ids?: number[] | null
  ) {
    // First, verify the response exists and get current data
    const { data: existingResponse, error: fetchError } = await this.supabase
      .from("interview_responses")
      .select("id, interview_id, questionnaire_question_id, company_id")
      .eq("id", responseId)
      .single();

    if (fetchError || !existingResponse) {
      throw new Error("Interview response not found");
    }

    // Update the response with new rating_score if provided
    if (rating_score !== undefined) {
      const { error: updateError } = await this.supabase
        .from("interview_responses")
        .update({ rating_score })
        .eq("id", responseId);

      if (updateError) throw updateError;
    }

    // Update roles if provided
    if (role_ids !== undefined) {
      // Delete existing role associations
      const { error: deleteError } = await this.supabase
        .from("interview_response_roles")
        .delete()
        .eq("interview_response_id", responseId);

      if (deleteError) throw deleteError;

      // Insert new role associations (only if role_ids is not null/empty)
      if (role_ids && role_ids.length > 0) {
        const roleAssociations = role_ids.map((roleId) => ({
          interview_response_id: responseId,
          role_id: roleId,
          company_id: existingResponse.company_id,
          interview_id: existingResponse.interview_id,
        }));

        const { error: insertError } = await this.supabase
          .from("interview_response_roles")
          .insert(roleAssociations);

        if (insertError) throw insertError;
      }
    }

    // Fetch and return updated response
    const { data: updatedResponse, error: responseError } = await this.supabase
      .from("interview_responses")
      .select(
        `
        id,
        rating_score,
        response_roles:interview_response_roles(
          id,
          role:roles(id)
        )
      `
      )
      .eq("id", responseId)
      .single();

    if (responseError) throw responseError;

    return updatedResponse;
  }
  // Get roles associated with an assessment
  // business_unit > region > site > asset_group > work_group > role < shared_roles
  async getRolesAssociatedWithAssessment(assessmentId: number) {
    // Fetch assessment scope details
    const { data: assessment, error: assessmentError } = await this.supabase
      .from("assessments")
      .select(
        "company_id, business_unit_id, region_id, site_id, asset_group_id"
      )
      .eq("id", assessmentId)
      .eq("is_deleted", false)
      .single();

    if (assessmentError || !assessment) {
      throw new Error(
        `Failed to fetch assessment: ${assessmentError?.message || "Assessment not found"}`
      );
    }

    // Build query for roles with full organizational hierarchy
    let query = this.supabase
      .from("roles")
      .select(
        `
        id,
        shared_role:shared_roles(id, name, description),
        work_group:work_groups!inner(
          name,
          asset_group:asset_groups(
            name,
            site:sites(
              name,
              region:regions(
                name,
                business_unit:business_units(name)
              )
            )
          )
        )
      `
      )
      .eq("company_id", assessment.company_id)
      .eq("is_deleted", false)
      .eq("work_group.is_deleted", false);

    // Apply hierarchical filters based on assessment scope
    // Filters cascade from most specific (asset_group) to least specific (business_unit)
    if (assessment.asset_group_id) {
      query = query.eq("work_group.asset_group_id", assessment.asset_group_id);
    } else if (assessment.site_id) {
      query = query.eq("work_group.asset_group.site_id", assessment.site_id);
    } else if (assessment.region_id) {
      query = query.eq(
        "work_group.asset_group.site.region_id",
        assessment.region_id
      );
    } else if (assessment.business_unit_id) {
      query = query.eq(
        "work_group.asset_group.site.region.business_unit_id",
        assessment.business_unit_id
      );
    }
    // If none are set, returns all company roles (no additional filter)

    const { data: roles, error: rolesError } = await query;

    if (rolesError) {
      throw new Error(`Failed to fetch roles: ${rolesError.message}`);
    }

    // Flatten the organizational hierarchy for easier frontend consumption
    return (roles || []).map((role) => ({
      id: role.id,
      shared_role_id: role.shared_role.id,
      name: role.shared_role?.name,
      description: role.shared_role?.description,
      work_group_name: role.work_group?.name,
      asset_group_name: role.work_group?.asset_group?.name,
      site_name: role.work_group?.asset_group?.site?.name,
      region_name: role.work_group?.asset_group?.site?.region?.name,
      business_unit_name:
        role.work_group?.asset_group?.site?.region?.business_unit?.name,
    }));
  }

  async validateAssessmentRolesForQuestionnaire(
    assessmentId: number,
    roleIds: number[]
  ): Promise<any> {
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
