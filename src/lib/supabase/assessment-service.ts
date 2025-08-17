import { createClient } from "./client";
import type {
  Assessment,
  AssessmentWithCounts,
  AssessmentWithQuestionnaire,
  CreateAssessmentData,
  AssessmentFilters,
  Questionnaire,
} from "@/types/assessment";
import { checkDemoAction } from "./utils";
import { getCurrentUserId } from "@/lib/auth/auth-utils";
import type { UpdateInput } from "@/types";

export class AssessmentService {
  private supabase = createClient();

  // Assessment CRUD operations
  async getAssessments(
    filters?: AssessmentFilters
  ): Promise<AssessmentWithCounts[]> {
    let query = this.supabase
      .from("assessments")
      .select(
        `
        *,
        questionnaire:questionnaires(name),
        company:companies!inner(id, name, deleted_at, is_demo, created_by),
        interviews(
          id,
          status,
          interview_responses(id, rating_score)
        )
      `
      )
      .eq("is_deleted", false)
      .not("interviews.interview_responses.rating_score", "is", null);

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
        assessment.interviews?.filter((i: any) => !i.company?.deleted_at) || [];

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
      };
    });
  }

  async getAssessmentById(
    id: number
  ): Promise<AssessmentWithQuestionnaire | null> {
    // Get assessment basic info
    const { data: assessment, error: assessmentError } = await this.supabase
      .from("assessments")
      .select("*")
      .eq("id", id)
      .eq("is_deleted", false)
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
      .eq("assessment_id", Number(id))
      .eq("is_deleted", false);

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
    await checkDemoAction();
    // Extract objectives from assessment data
    const { objectives, ...assessmentFields } = assessmentData;

    // Create the assessment
    const { data: assessment, error: assessmentError } = await this.supabase
      .from("assessments")
      .insert([
        {
          ...assessmentFields,
          status: "draft",
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
    id: number,
    updates: UpdateInput<"assessments">
  ): Promise<Assessment> {
    await checkDemoAction();
    const { data, error } = await this.supabase
      .from("assessments")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteAssessment(id: number): Promise<void> {
    await checkDemoAction();
    const { error } = await this.supabase
      .from("assessments")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  }

  async duplicateAssessment(originalId: number): Promise<Assessment> {
    await checkDemoAction();
    // Get the original assessment
    const { data: originalAssessment, error: assessmentError } =
      await this.supabase
        .from("assessments")
        .select("*")
        .eq("id", originalId)
        .eq("is_deleted", false)
        .single();

    if (assessmentError) throw assessmentError;
    if (!originalAssessment) throw new Error("Assessment not found");

    // Create new assessment
    const currentUserId = await getCurrentUserId();
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
    const query = this.supabase
      .from("questionnaires")
      .select("*")
      .eq("status", "active")
      .eq("is_deleted", false);
    const { data, error } = await query.order("name");

    if (error) throw error;
    return data || [];
  }
}

export const assessmentService = new AssessmentService();
