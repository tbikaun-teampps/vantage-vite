import { createClient } from "./client";
import { useAuthStore } from "@/stores/auth-store";
import type {
  Assessment,
  AssessmentWithCounts,
  AssessmentWithQuestionnaire,
  CreateAssessmentData,
  UpdateAssessmentData,
  AssessmentFilters,
  Questionnaire,
} from "@/types/assessment";

export class AssessmentService {
  private supabase = createClient();

  // Assessment CRUD operations
  async getAssessments(
    filters?: AssessmentFilters
  ): Promise<AssessmentWithCounts[]> {
    try {
      // Get current user and demo mode status with fallbacks
      // const { data: authData, error: authError } =
      //   await this.supabase.auth.getUser();

      let query = this.supabase.from("assessments").select(`
          *,
          questionnaire:questionnaires(name),
          company:companies!inner(id, name, deleted_at, is_demo, created_by),
          interviews(
            id,
            status,
            interview_responses(id)
          )
        `);

      // Filter out deleted companies
      // query = query.is("company.deleted_at", null);

      // Apply demo mode filtering only if we have auth data
      // if (!authError && authData?.user) {
      //   const authStore = useAuthStore.getState();
      //   const isDemoMode = authStore?.isDemoMode ?? false;

      //   if (isDemoMode) {
      //     // Demo users only see assessments from demo companies
      //     query = query.eq("company.is_demo", true);
      //   } else {
      //     // Get user's own companies separately
      //     const ownCompanies = await this.supabase
      //       .from("companies")
      //       .select("id")
      //       .eq("is_demo", false)
      //       .eq("created_by", authData.user.id);

      //     const allCompanyIds = ownCompanies.data?.map((c) => c.id) || [];

      //     if (allCompanyIds.length > 0) {
      //       query = query.in("company_id", allCompanyIds);
      //     } else {
      //       // No accessible companies, return empty result immediately
      //       return [];
      //     }
      //   }
      // }
      // If no auth or auth error, return all assessments (will be filtered by RLS)

      // Apply filters
      if (filters) {
        if (filters.status && filters.status.length > 0) {
          query = query.in("status", filters.status);
        }
        if (filters.type) {
          query = query.eq("type", filters.type);
        }
        if (filters.company_id) {
          query = query.eq("company_id", filters.company_id);
        }
        if (filters.search) {
          query = query.or(
            `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
          );
        }
      }

      const { data: assessments, error } = await query.order("updated_at", {
        ascending: false,
      });

      if (error) throw error;

      // Calculate counts and format data
      return assessments.map((assessment: any) => {
        // Filter out interviews from deleted companies
        const activeInterviews =
          assessment.interviews?.filter((i: any) => !i.company?.deleted_at) ||
          [];

        return {
          ...assessment,
          interview_count: activeInterviews.length,
          completed_interview_count: activeInterviews.filter(
            (i: any) => i.status === "completed"
          ).length,
          total_responses: activeInterviews.reduce(
            (total: number, interview: any) =>
              total + (interview.interview_responses?.length || 0),
            0
          ),
          questionnaire_name:
            assessment.questionnaire?.name || "Unknown Questionnaire",
          last_modified: this.formatLastModified(assessment.updated_at),
        };
      });
    } catch (error) {
      console.error("Error in getAssessments:", error);
      // Return empty array on error to prevent page crashes
      return [];
    }
  }

  async getAssessmentById(
    id: string
  ): Promise<AssessmentWithQuestionnaire | null> {
    // Get assessment basic info
    const { data: assessment, error: assessmentError } = await this.supabase
      .from("assessments")
      .select("*")
      .eq("id", id)
      .single();

    if (assessmentError) throw assessmentError;
    if (!assessment) return null;

    // Get questionnaire structure
    const { data: questionnaire, error: questionnaireError } =
      await this.supabase
        .from("questionnaires")
        .select(
          `
        *,
        questionnaire_sections(
          *,
          questionnaire_steps(
            *,
            questionnaire_questions(
              id,
              title,
              question_text,
              context,
              order_index
            )
          )
        )
      `
        )
        .eq("id", assessment.questionnaire_id)
        .single();

    if (questionnaireError) throw questionnaireError;

    // Get objectives for this assessment
    const { data: objectives, error: objectivesError } = await this.supabase
      .from("assessment_objectives")
      .select("title, description")
      .eq("assessment_id", Number(id));

    if (objectivesError) throw objectivesError;

    // Transform questionnaire data
    const transformedQuestionnaire = {
      ...questionnaire,
      sections:
        questionnaire.questionnaire_sections
          ?.map((section) => ({
            ...section,
            steps:
              section.questionnaire_steps
                ?.map((step) => ({
                  ...step,
                  questions:
                    step.questionnaire_questions?.sort(
                      (a, b) => a.order_index - b.order_index
                    ) || [],
                }))
                ?.sort((a, b) => a.order_index - b.order_index) || [],
          }))
          ?.sort((a, b) => a.order_index - b.order_index) || [],
    };

    return {
      ...assessment,
      questionnaire: transformedQuestionnaire,
      objectives: objectives || [],
    };
  }

  async createAssessment(
    assessmentData: CreateAssessmentData
  ): Promise<Assessment> {
    const currentUserId = await this.getCurrentUserId();

    // Extract objectives from assessment data
    const { objectives, ...assessmentFields } = assessmentData;

    // Create the assessment
    const { data: assessment, error: assessmentError } = await this.supabase
      .from("assessments")
      .insert([
        {
          ...assessmentFields,
          status: "draft",
          created_by: currentUserId,
          company_id: assessmentData.company_id,
        },
      ])
      .select()
      .single();

    if (assessmentError) throw assessmentError;

    // Create objectives if provided
    if (objectives && objectives.length > 0) {
      const objectiveInserts = objectives.map((objective) => ({
        assessment_id: assessment.id,
        // company_id: assessmentData.company_id,
        created_by: currentUserId,
        title: objective.title,
        description: objective.description || null,
      }));

      const { error: objectivesError } = await this.supabase
        .from("assessment_objectives")
        .insert(objectiveInserts);

      if (objectivesError) {
        // If objectives creation fails, we should clean up the assessment
        await this.supabase
          .from("assessments")
          .delete()
          .eq("id", assessment.id);
        throw new Error(
          `Failed to create objectives: ${objectivesError.message}`
        );
      }
    }

    return assessment;
  }

  async updateAssessment(
    id: string,
    updates: UpdateAssessmentData
  ): Promise<Assessment> {
    const { data, error } = await this.supabase
      .from("assessments")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteAssessment(id: string): Promise<void> {
    // Soft delete - triggers will handle cascading to related tables
    const { error } = await this.supabase
      .from("assessments")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  }

  async duplicateAssessment(originalId: string): Promise<Assessment> {
    // Get the original assessment
    const { data: originalAssessment, error: assessmentError } =
      await this.supabase
        .from("assessments")
        .select("*")
        .eq("id", originalId)
        .single();

    if (assessmentError) throw assessmentError;
    if (!originalAssessment) throw new Error("Assessment not found");

    // Create new assessment
    const currentUserId = await this.getCurrentUserId();
    const { data: newAssessment, error: createError } = await this.supabase
      .from("assessments")
      .insert([
        {
          questionnaire_id: originalAssessment.questionnaire_id,
          name: `${originalAssessment.name} (Copy)`,
          description: originalAssessment.description,
          status: "draft",
          start_date: originalAssessment.start_date,
          end_date: originalAssessment.end_date,
          company_id: originalAssessment.company_id,
          business_unit_id: originalAssessment.business_unit_id,
          region_id: originalAssessment.region_id,
          site_id: originalAssessment.site_id,
          asset_group_id: originalAssessment.asset_group_id,
          type: originalAssessment.type,
          created_by: currentUserId,
        },
      ])
      .select()
      .single();

    if (createError) throw createError;

    return newAssessment;
  }

  // Questionnaire operations for assessment creation
  async getQuestionnaires(): Promise<Questionnaire[]> {
    try {
      // Get current user and demo mode status with fallbacks
      const { data: authData, error: authError } =
        await this.supabase.auth.getUser();

      let query = this.supabase
        .from("questionnaires")
        .select("*")
        .eq("status", "active");

      // Apply demo mode filtering only if we have auth data
      if (!authError && authData?.user) {
        const authStore = useAuthStore.getState();
        const isDemoMode = authStore?.isDemoMode ?? false;

        if (isDemoMode) {
          // Demo users only see demo questionnaires
          query = query.eq("is_demo", true);
        } else {
          // Get user's own questionnaires and demo questionnaires separately
          const ownQuestionnaires = await this.supabase
            .from("questionnaires")
            .select("id")
            .eq("is_demo", false)
            .eq("created_by", authData.user.id)
            .eq("status", "active");

          const allQuestionnaireIds =
            ownQuestionnaires.data?.map((q) => q.id) || [];

          if (allQuestionnaireIds.length > 0) {
            query = query.in("id", allQuestionnaireIds);
          } else {
            // No accessible questionnaires, return empty result
            return [];
          }
        }
      }
      // If no auth or auth error, return all questionnaires (will be filtered by RLS)

      const { data, error } = await query.order("name");

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error in getQuestionnaires:", error);
      // Return empty array on error to prevent page crashes
      return [];
    }
  }

  // Utility methods
  private formatLastModified(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    if (diffInMinutes < 10080)
      return `${Math.floor(diffInMinutes / 1440)} days ago`;

    return date.toLocaleDateString();
  }

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

export const assessmentService = new AssessmentService();
