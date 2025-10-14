import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";
import { createCustomSupabaseJWT } from "../lib/jwt";
import type { QuestionnaireSectionFromDB } from "../types/entities/questionnaires";
import type {
  InterviewWithQuestionnaire,
  InterviewSummary,
  CreateInterviewData,
  Interview,
  UpdateInterviewResponseActionData,
  CreateInterviewResponseActionData,
  UpdateInterviewData,
  InterviewStatus,
  InterviewQuestion,
  InterviewProgress,
  InterviewStructure,
} from "../types/entities/interviews";
import {
  calculateAverageScore,
  calculateCompletionRate,
  calculateRatingValueRange,
} from "./utils";

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
  private supabaseAdmin?: SupabaseClient<Database>; // Optional admin client for elevated operations

  constructor(
    supabaseClient: SupabaseClient<Database>,
    userId: string | null,
    supabaseAdminClient?: SupabaseClient<Database>
  ) {
    this.supabase = supabaseClient;
    this.userId = userId;
    this.supabaseAdmin = supabaseAdminClient; // Assign admin client
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
    // Array<
    //   Interview & {
    //     contact: { id: number; full_name: string; email: string };
    //   }
    // >
    any[]
  > {
    if (!this.supabaseAdmin) {
      throw new Error("Supabase admin client is required for this operation");
    }

    const { assessment_id, interview_contact_ids, name } = data;
    const createdInterviews: any[] = [];
    // Array<
    //   Interview & {
    //     contact: { id: number; full_name: string; email: string };
    //   }
    // >

    // Fetch assessment to get company_id for user_companies association
    const { data: assessment, error: assessmentError } = await this.supabase
      .from("assessments")
      .select("id, company_id")
      .eq("id", assessment_id)
      .eq("is_deleted", false)
      .single();

    if (assessmentError) throw assessmentError;
    if (!assessment) throw new Error("Assessment not found");

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

      let userId: string;
      // Check if user already exists:
      const { data: profile, error: profileError } = await this.supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("email", contactInfo.email)
        .maybeSingle();

      if (profileError) {
        console.log("profileError: ", profileError);
        continue; // Skip this contact on error
      }

      if (!profile) {
        console.log("No existing profile found for contact, creating user");
        const {
          data: { user: newUser },
          error: userError,
        } = await this.supabaseAdmin.auth.admin.createUser({
          email: contactInfo.email,
          password: crypto.randomUUID(),
          email_confirm: true,
          // Must be set with user_metadata not app_metadata
          // see: https://github.com/supabase/auth/issues/1280
          user_metadata: {
            account_type: "interview_only", // Flag for overriding profile subscription_tier default 'demo'. Instead sets as 'interview_only'
          },
        });
        if (userError || !newUser) {
          console.log("userError: ", userError);
          continue; // Skip this contact on error
        }
        console.log("Created user for contact: ", newUser);

        userId = newUser.id;
      } else {
        console.log("Found existing profile for contact: ", profile);
        userId = profile.id;
      }

      console.log("Using userId for interview creation: ", userId);

      // Add user to company as interviewee if not already associated
      try {
        // Check if user is already associated with this company
        const { data: existingUserCompany, error: userCompanyCheckError } =
          await this.supabaseAdmin
            .from("user_companies")
            .select("id, role")
            .eq("user_id", userId)
            .eq("company_id", assessment.company_id)
            .maybeSingle();

        if (userCompanyCheckError) {
          console.error(
            "Error checking user_companies association:",
            userCompanyCheckError
          );
        } else if (!existingUserCompany) {
          // User is not associated with company, add them as interviewee
          const { error: insertUserCompanyError } = await this.supabaseAdmin
            .from("user_companies")
            .insert({
              user_id: userId,
              company_id: assessment.company_id,
              role: "interviewee",
              created_by: this.userId || userId,
            });

          if (insertUserCompanyError) {
            console.error(
              "Error adding user to user_companies:",
              insertUserCompanyError
            );
            // Don't fail the interview creation - log and continue
          } else {
            console.log(
              `Added user ${userId} to company ${assessment.company_id} as interviewee`
            );
          }
        } else {
          console.log(
            `User ${userId} already associated with company ${assessment.company_id} with role: ${existingUserCompany.role}`
          );
        }
      } catch (error) {
        console.error("Error in user_companies association logic:", error);
        // Don't fail the interview creation - log and continue
      }

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
        interviewee_id: userId,
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
   * Create a new interview
   * @param interviewData Data for creating the interview
   * @returns
   */
  async createInterview(
    interviewData: CreateInterviewData
  ): Promise<Interview> {
    if (!this.userId || this.userId === null) {
      throw new Error("User not authenticated");
    }

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
        sharedRoleIds = roles
          .map((r) => r.shared_role_id)
          .filter((id): id is number => id !== null);
        roles.forEach((r) => {
          if (r.shared_role_id !== null) {
            roleMapping.set(r.shared_role_id, r.id);
          }
        });
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
      ? companyRoles
          .map((r) => r.shared_role_id)
          .filter((id): id is number => id !== null)
      : [];

    // Create mapping of shared_role_id -> role_id for all company roles
    const companyRoleMapping: Map<number, number> = new Map();
    companyRoles?.forEach((r) => {
      if (r.shared_role_id !== null) {
        companyRoleMapping.set(r.shared_role_id, r.id);
      }
    });

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
      const responseData: {
        interview_id: number;
        questionnaire_question_id: number;
        rating_score: null;
        comments: null;
        answered_at: null;
        is_applicable: boolean;
        company_id: string;
        created_by: string;
      }[] = [];
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
  async getInterviewById(
    interviewId: number
  ): Promise<InterviewWithQuestionnaire | null> {
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
    if (!interview.questionnaire_id) {
      console.warn("Interview has no associated questionnaire");
      return { interview, questionnaire: [], firstQuestionId: null };
    }

    // Fetch the questionnaire sections associated with the interview.
    // This is used for quick navigation and search in the UI.
    const { data: sections, error: sectionsError } = await this.supabase
      .from("questionnaire_sections")
      .select(
        `
          id,
          title,
          order_index,
          questionnaire_steps!inner(
            id,
            title,
            order_index,
            questionnaire_questions!inner(
              id,
              title,
              order_index
            )
          )
        `
      )
      .eq("questionnaire_id", interview.questionnaire_id)
      .eq("is_deleted", false)
      .eq("questionnaire_steps.is_deleted", false)
      .eq("questionnaire_steps.questionnaire_questions.is_deleted", false)
      .order("order_index", { ascending: true });

    if (sectionsError || !sections) {
      console.error("Failed to get questionnaire sections:", sectionsError);
      return null;
    }

    let firstQuestionId: number | null = null;

    // Transform and sort the data structure properly (simplified for navigation)
    const transformedSections = sections.map(
      (section: QuestionnaireSectionFromDB, sectionIndex: number) => ({
        id: section.id,
        title: section.title,
        order_index: sectionIndex, // Normalize to 0-based indexing for consistent display
        steps: (section.questionnaire_steps || [])
          .sort((a, b) => a.order_index - b.order_index)
          .map((step, stepIndex: number) => ({
            id: step.id,
            title: step.title,
            order_index: stepIndex, // Normalize to 0-based indexing for consistent display
            questions: (step.questionnaire_questions || [])
              .sort((a, b) => a.order_index - b.order_index)
              .map((question, questionIndex: number) => {
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
      })
    );

    return { interview, questionnaire: transformedSections, firstQuestionId };
  }

  /**
   * Get interview summary for layout/settings
   * Returns only essential metadata without responses or full questionnaire
   * @param interviewId ID of the interview to retrieve
   * @returns Interview summary with assessment, interviewer, and roles
   */
  async getInterviewSummary(
    interviewId: number
  ): Promise<InterviewSummary | null> {
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
        interviewer:profiles!interviewer_id(full_name, email),
        interviewee:profiles!interviewee_id(full_name, email),
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

    // Transform the response to match return type
    // If the interview is public, omit interviewer details and assessment id
    return {
      ...interview,
      interviewer: interview.is_public ? null : interview.interviewer,
      assessment:
        interview.is_public && interview.assessment
          ? { ...interview.assessment, id: null }
          : interview.assessment,
    };
  }

  /**
   * Get interview structure (questionnaire hierarchy)
   * Optimized for navigation - minimal data, long cache TTL
   */
  async getInterviewStructure(
    interviewId: number
  ): Promise<InterviewStructure | null> {
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
    const sections = (questionnaire.questionnaire_sections || [])
      .sort((a, b) => a.order_index - b.order_index)
      .map((section, sectionIndex) => ({
        id: section.id,
        title: section.title,
        order_index: sectionIndex,
        steps: (section.questionnaire_steps || [])
          .sort((a, b) => a.order_index - b.order_index)
          .map((step, stepIndex) => ({
            id: step.id,
            title: step.title,
            order_index: stepIndex,
            questions: (step.questionnaire_questions || [])
              .sort((a, b) => a.order_index - b.order_index)
              .map((question, questionIndex) => ({
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
  async getInterviewProgress(interviewId: number): Promise<InterviewProgress> {
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
      .maybeSingle();

    if (error) throw error;

    if (!data) throw new Error("Interview not found");

    const isPublicInterview = data.is_public;

    const totalQuestions = data?.interview_responses?.length || 0;
    // Answered questions are those that have interview_responses.rating_score AND at least one response role
    // If the interview is public (single role), then just need rating_score
    // TODO: review
    const answeredQuestions = data?.interview_responses
      ? data.interview_responses.filter((response) =>
          isPublicInterview
            ? response.rating_score !== null
            : response.rating_score !== null &&
              response.response_roles &&
              response.response_roles.length > 0
        ).length
      : 0;

    const progressPercentage =
      totalQuestions === 0
        ? 0
        : Math.round((answeredQuestions / totalQuestions) * 100);

    // Determine status based on progress
    let status: InterviewStatus;
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
    // TODO: not sure if this is required in the UI anymore.
    const responses: Record<
      number,
      {
        id: number;
        rating_score: number | null;
        is_applicable: boolean;
        has_rating_score: boolean;
        has_roles: boolean;
      }
    > = {};
    if (data?.interview_responses) {
      for (const response of data.interview_responses) {
        responses[response.questionnaire_question_id] = {
          id: response.id,
          rating_score: response.rating_score,
          is_applicable: response.is_applicable,
          has_rating_score: response.rating_score !== null,
          has_roles: isPublicInterview
            ? true
            : response.response_roles && response.response_roles.length > 0, // Default true for public interviews as the role is associated at interview creation. Also interviewees do not have access to the roles table.
          // TODO: review
        };
      }
    }

    return {
      status,
      previous_status: previousStatus !== status ? previousStatus : null,
      total_questions: totalQuestions,
      answered_questions: answeredQuestions,
      progress_percentage: progressPercentage,
      responses,
    };
  }

  async getInterviewQuestionById(
    interviewId: number,
    questionId: number
  ): Promise<InterviewQuestion | null> {
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
    const { data: interviewQuestion, error } = await this.supabase
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
          questionnaire_rating_scale:questionnaire_rating_scales(id, name, value),
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
      .eq("questionnaire_steps.is_deleted", false)
      .eq("questionnaire_steps.questionnaire_sections.is_deleted", false)
      .eq("questionnaire_question_rating_scales.is_deleted", false)
      .eq(
        "questionnaire_question_rating_scales.questionnaire_rating_scale.is_deleted",
        false
      )
      .maybeSingle();

    if (error) throw error;
    if (!interviewQuestion) return null;

    // Helper function to build organizational path for a role
    const buildRolePath = (role: {
      id: number;
      shared_role: {
        id: number;
        name: string;
        description: string | null;
      } | null;
      work_group: {
        name: string;
        asset_group: {
          name: string;
          site: {
            name: string;
            region: {
              name: string;
              business_unit: { name: string } | null;
            } | null;
          } | null;
        } | null;
      } | null;
    }): string => {
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

    // Check if question is universal
    const isUniversal = interviewQuestion.applicable_roles.some(
      (ar) => ar.is_universal
    );

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
      selectableRoles = interviewQuestion.applicable_roles
        .filter((ar) => ar.role_id !== null && ar.role && ar.role.shared_role)
        .map((ar) => ({
          id: ar.role!.id,
          shared_role_id: ar.role!.shared_role!.id,
          name: ar.role!.shared_role!.name,
          description: ar.role!.shared_role!.description,
          path: buildRolePath(ar.role!),
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
      title: `${interviewQuestion.step.section.order_index + 1}.${interviewQuestion.step.order_index + 1}.${interviewQuestion.order_index + 1}. ${interviewQuestion.title}`,
      question_text: interviewQuestion.question_text,
      context: interviewQuestion.context,
      breadcrumbs: {
        section: `${interviewQuestion.step.section.order_index + 1}. ${interviewQuestion.step.section.title}`,
        // TODO: review the step order index. It might be indexed from 1 instead of 0. Also does soft delete impact it?
        step: `${interviewQuestion.step.section.order_index + 1}.${interviewQuestion.step.order_index + 1}. ${interviewQuestion.step.title}`,
        question: `${interviewQuestion.step.section.order_index + 1}.${interviewQuestion.step.order_index + 1}.${interviewQuestion.order_index + 1}. ${interviewQuestion.title}`,
      },
      options: {
        applicable_roles: groupedRoles,
        rating_scales: interviewQuestion.rating_scale.map((rs) => ({
          id: rs.id,
          name: rs.questionnaire_rating_scale.name,
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

    if (!roles || roles.length === 0) {
      console.warn("No roles found for the given assessment scope");
      return [];
    }

    // Flatten the organisational hierarchy for easier frontend consumption
    return roles.map((role) => ({
      id: role.id,
      shared_role_id: role.shared_role?.id,
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
  ): Promise<{
    isValid: boolean;
    hasUniversalQuestions: boolean;
  }> {
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
        .filter((r) => r !== null) as number[];

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

  async getInterviews(
    companyId: string,
    assessmentId?: number,
    status?: InterviewStatus[],
    programId?: number
  ) {
    console.log(
      "fetching interviews with: ",
      companyId,
      assessmentId,
      status,
      programId
    );

    let query = this.supabase
      .from("interviews")
      .select(
        `
          *,
          assessment:assessments!inner(
            id, 
            name, 
            company_id,
            type,
            questionnaire:questionnaires(
              id,
              questionnaire_rating_scales(
                id,
                value,
                order_index
              )
            )
          ),
          interviewer:profiles!interviewer_id(full_name, email),
          interviewee:profiles!interviewee_id(full_name, email),
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
            ),
            interview_response_actions(*),
            interview_response_roles(
              role:roles(*)
            )
          )
        `
      )
      .eq("is_deleted", false)
      .eq("assessment.company_id", companyId);

    // Apply filters
    if (assessmentId) {
      query = query.eq("assessment_id", assessmentId);
    }
    if (programId) {
      query = query.eq("program_id", programId);
    }
    if (status && status.length > 0) {
      query = query.in("status", status);
    }

    const { data: interviews, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;
    if (!interviews || interviews.length === 0) return [];

    // Transform interviews data
    return interviews.map((interview) => {
      const ratingRange = calculateRatingValueRange(
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
        completion_rate: calculateCompletionRate(
          interview.interview_responses || []
        ),
        average_score: calculateAverageScore(
          interview.interview_responses || []
        ),
        min_rating_value: ratingRange.min,
        max_rating_value: ratingRange.max,
        interviewee: interview.interviewee?.email
          ? {
              full_name: interview.interviewee.full_name,
              email: interview.interviewee.email,
              role:
                interview.interview_roles &&
                interview.interview_roles.length > 0
                  ? interview.interview_roles
                      .map((ir) => ir.role?.shared_role?.name)
                      .filter(Boolean)
                      .join(", ")
                  : (interview.assigned_role?.shared_role?.name ?? ""),
            }
          : null,
        interviewer: interview.interviewer?.email
          ? {
              full_name: interview.interviewer.full_name,
              email: interview.interviewer.email,
            }
          : null,
        responses:
          interview.interview_responses?.map((response) => ({
            ...response,
            // question: transformQuestionData(response.question),
            response_roles:
              response.interview_response_roles?.map((rr) => rr.role) || [],
            actions: response.interview_response_actions || [],
          })) || [],
      };
    });
  }

  async updateInterviewDetails(
    interviewId: number,
    updates: UpdateInterviewData
  ) {
    // Update using service method
    const { data, error } = await this.supabase
      .from("interviews")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", interviewId)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async deleteInterview(interviewId: number) {
    const { error } = await this.supabase
      .from("interviews")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", interviewId);

    if (error) throw error;
  }

  async addActionToInterviewResponse(
    responseId: number,
    data: CreateInterviewResponseActionData
  ) {
    const { data: response, error: respError } = await this.supabase
      .from("interview_responses")
      .select("*")
      .eq("id", responseId)
      .single();

    if (respError || !response) throw new Error("Interview response not found");

    const { data: action, error } = await this.supabase
      .from("interview_response_actions")
      .insert({
        company_id: response.company_id,
        interview_id: response.interview_id,
        interview_response_id: responseId,
        description: data.description,
        title: data.title,
      })
      .select()
      .single();

    if (error) throw error;

    return action;
  }

  async updateInterviewResponseAction(
    actionId: number,
    updates: UpdateInterviewResponseActionData
  ) {
    const { data, error } = await this.supabase
      .from("interview_response_actions")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", actionId)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async deleteInterviewResponseAction(actionId: number): Promise<void> {
    const { error } = await this.supabase
      .from("interview_response_actions")
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq("id", actionId)
      .select();

    if (error) throw error;
  }

  async getInterviewResponseComments(responseId: number): Promise<string> {
    const { data, error } = await this.supabase
      .from("interview_responses")
      .select("id, comments, created_at, updated_at")
      .eq("id", responseId)
      .order("created_at", { ascending: false })
      .single();

    if (error) throw error;

    return data?.comments || "";
  }

  async updateInterviewResponseComments(
    responseId: number,
    comments: string
  ): Promise<string> {
    const { data, error } = await this.supabase
      .from("interview_responses")
      .update({
        comments,
        updated_at: new Date().toISOString(),
      })
      .eq("id", responseId)
      .select()
      .single();

    if (error) throw error;

    return data?.comments || "";
  }

  /**
   *  Method for generating a short-lived JWT for interview access
   *  This is used by public interviews to get a token for accessing the interview (after validating email + access code)
   *  This is for pre-authentication validation...
   * @param interviewId
   * @param email
   * @param accessCode
   * @param supabaseAdminClient
   * @param jwtSigningKey
   * @returns
   */
  async createPublicInterviewJWT(
    interviewId: number,
    email: string,
    accessCode: string,
    supabaseAdminClient: SupabaseClient,
    jwtSigningKey: string
  ) {
    console.log(
      "Auth request for interviewId=",
      interviewId,
      "email=",
      email,
      "accessCode=",
      accessCode
    );

    // Validate interview exists, is public, enabled, and credentials match
    const { data: interview, error: interviewError } = await supabaseAdminClient
      .from("interviews")
      .select(
        `
          id,
          is_public,
          enabled,
          access_code,
          interview_contact_id,
          interviewee_id,
          company_id,
          questionnaire_id,
          interview_contact:contacts(id, email)
        `
      )
      .eq("id", interviewId)
      .eq("is_deleted", false)
      .maybeSingle();

    if (interviewError) {
      console.log("Failed to fetch interview:", interviewError);
      throw new Error("Failed to validate interview access");
    }

    if (!interview) {
      console.log("Interview not found for id:", interviewId);
      throw new Error("Interview not found");
    }

    if (
      !interview.interview_contact_id ||
      !interview.company_id ||
      !interview.questionnaire_id ||
      !interview.interviewee_id
    ) {
      console.log("Interview missing required configuration for public access");
      throw new Error("Interview is not properly configured for public access");
    }

    // Validate interview is public
    if (!interview.is_public) {
      console.log("Interview is not public");
      throw new Error("This interview is not publicly accessible");
    }

    // Validate interview is enabled
    if (!interview.enabled) {
      console.log("Interview is not enabled");
      throw new Error("This interview has been disabled");
    }

    // Validate access code
    if (interview.access_code!.trim() !== accessCode) {
      console.log("Invalid access code provided");
      console.log('Expected "', interview.access_code);
      throw new Error("Invalid access code");
    }

    // Validate email matches interview contact
    // Type assertion: Supabase returns a single object for one-to-one relationships
    // Cast through 'unknown' to satisfy TypeScript's strict type checking
    const interviewContact = interview.interview_contact as unknown as {
      id: number;
      email: string;
    } | null;

    if (!interviewContact || interviewContact.email.trim() !== email) {
      console.log("Email does not match interview contact");
      throw new Error("Email does not match interview contact");
    }

    // All validation passed - generate JWT
    const token = createCustomSupabaseJWT(
      interview.interviewee_id,
      {
        interviewId,
        email,
        contactId: interview.interview_contact_id,
        companyId: interview.company_id,
        questionnaireId: interview.questionnaire_id,
        anonymousRole: "public_interviewee",
      },
      jwtSigningKey
    );

    console.log(
      `Generated public interview token for interviewId=${interviewId}, email=${email}`
    );
    return token;
  }
}

// // Transform question data to include rating scales
// function transformQuestionData(questionData: {
//   id: number;
//   title: string;
//   question_text: string;
//   context: string | null;
//   order_index: number;
//   questionnaire_question_rating_scales: {
//     id: number;
//     description: string;
//     questionnaire_rating_scale: {
//       id: number;
//       name: string;
//       description: string | null;
//       order_index: number;
//       value: number;
//     };
//   }[];
// }): QuestionnaireQuestion {
//   return {
//     ...questionData,
//     rating_scales:
//       questionData.questionnaire_question_rating_scales
//         .map((qrs) => ({
//           id: qrs.id,
//           description: qrs.description,
//           ...qrs.questionnaire_rating_scale,
//         }))
//         .sort((a, b) => a.order_index - b.order_index) || [],
//   };
// }
