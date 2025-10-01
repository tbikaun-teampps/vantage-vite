import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

export interface AssessmentFilters {
  status?: Database["public"]["Enums"]["assessment_statuses"][];
  type?: Database["public"]["Enums"]["assessment_types"];
  company_id?: number;
  search?: string;
}

export interface AssessmentObjective {
  title: string;
  description?: string | null;
}

export interface CreateAssessmentData {
  name: string;
  description?: string | null;
  questionnaire_id: number;
  company_id: string;
  business_unit_id?: number | null;
  region_id?: number | null;
  site_id?: number | null;
  asset_group_id?: number | null;
  type: Database["public"]["Enums"]["assessment_types"];
  objectives?: AssessmentObjective[];
}

export type Assessment = Database["public"]["Tables"]["assessments"]["Row"];
export type Questionnaire =
  Database["public"]["Tables"]["questionnaires"]["Row"];

export interface AssessmentWithCounts extends Assessment {
  interview_count: number;
  completed_interview_count: number;
  total_responses: number;
  questionnaire_name: string;
}

interface QuestionnaireSection {
  id: number;
  title: string;
  order_index: number;
  step_count: number;
  question_count: number;
  steps: QuestionnaireStep[];
}

interface QuestionnaireStep {
  id: number;
  title: string;
  order_index: number;
  question_count: number;
  questions: QuestionnaireQuestion[];
}

interface QuestionnaireQuestion {
  id: number;
  title: string;
  question_text: string;
  context: string | null;
  order_index: number;
}

interface TransformedQuestionnaire extends Questionnaire {
  sections: QuestionnaireSection[];
  section_count: number;
  step_count: number;
  question_count: number;
}

export interface AssessmentWithQuestionnaire extends Assessment {
  questionnaire: TransformedQuestionnaire;
  objectives: AssessmentObjective[];
}

export type UpdateInput<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export class AssessmentsService {
  private supabase: SupabaseClient<Database>;
  private userId: string;

  constructor(supabaseClient: SupabaseClient<Database>, userId: string) {
    this.supabase = supabaseClient;
    this.userId = userId;
  }

  // Assessment CRUD operations
  async getAssessments(
    companyId: string,
    filters?: AssessmentFilters
  ): Promise<AssessmentWithCounts[]> {
    let query = this.supabase
      .from("assessments")
      .select(
        `
        *,
        questionnaire:questionnaires(name),
        interviews(
          id,
          status,
          interview_responses(id, rating_score)
        )
      `
      )
      .eq("is_deleted", false)
      .not("interviews.interview_responses.rating_score", "is", null)
      .eq("company_id", companyId);

    // Apply filters
    if (filters) {
      if (filters.status && filters.status.length > 0) {
        query = query.in("status", filters.status);
      }
      if (filters.type) {
        query = query.eq("type", filters.type);
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
    return (assessments || []).map((assessment) => {
      // Filter out interviews from deleted companies
      const activeInterviews = assessment.interviews || [];

      return {
        ...assessment,
        interview_count: activeInterviews.length,
        completed_interview_count: activeInterviews.filter(
          (i) => i.status === "completed"
        ).length,
        total_responses: activeInterviews.reduce(
          (total: number, interview) =>
            total + (interview.interview_responses?.length || 0),
          0
        ),
        questionnaire_name:
          assessment.questionnaire?.name || "Unknown Questionnaire",
      } as AssessmentWithCounts;
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
          `*,
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
      .eq("company_id", assessment.company_id)
      .eq("is_deleted", false);

    if (objectivesError) throw objectivesError;

    // Transform questionnaire data with counts at each level
    const sections =
      questionnaire.questionnaire_sections
        ?.map((section) => {
          const steps =
            section.questionnaire_steps
              ?.map((step) => {
                const questions =
                  step.questionnaire_questions?.sort(
                    (a, b) => a.order_index - b.order_index
                  ) || [];

                return {
                  ...step,
                  questions,
                  question_count: questions.length,
                };
              })
              ?.sort((a, b) => a.order_index - b.order_index) || [];

          const totalQuestions = steps.reduce(
            (sum, step) => sum + step.question_count,
            0
          );

          return {
            ...section,
            steps,
            step_count: steps.length,
            question_count: totalQuestions,
          };
        })
        ?.sort((a, b) => a.order_index - b.order_index) || [];

    const totalSteps = sections.reduce(
      (sum, section) => sum + section.step_count,
      0
    );
    const totalQuestions = sections.reduce(
      (sum, section) => sum + section.question_count,
      0
    );

    // Remove the original questionnaire_sections to avoid redundancy
    const { questionnaire_sections: _, ...restQuestionnaire } = questionnaire;

    const transformedQuestionnaire: TransformedQuestionnaire = {
      ...restQuestionnaire,
      sections,
      section_count: sections.length,
      step_count: totalSteps,
      question_count: totalQuestions,
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
          created_by: this.userId,
        },
      ])
      .select()
      .single();

    if (assessmentError) throw assessmentError;

    // Create objectives if provided
    if (objectives && objectives.length > 0) {
      const objectiveInserts = objectives.map((objective) => ({
        assessment_id: assessment.id,
        company_id: assessment.company_id,
        title: objective.title,
        description: objective.description || null,
        created_by: this.userId,
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
    const { data, error } = await this.supabase
      .from("assessments")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("is_deleted", false)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteAssessment(id: number): Promise<void> {
    const { error } = await this.supabase
      .from("assessments")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("is_deleted", false);

    if (error) throw error;
  }

  async duplicateAssessment(originalId: number): Promise<Assessment> {
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
    const { data: newAssessment, error: createError } = await this.supabase
      .from("assessments")
      .insert([
        {
          questionnaire_id: originalAssessment.questionnaire_id,
          name: `${originalAssessment.name} (Copy)`,
          description: originalAssessment.description,
          status: "draft",
          company_id: originalAssessment.company_id,
          business_unit_id: originalAssessment.business_unit_id,
          region_id: originalAssessment.region_id,
          site_id: originalAssessment.site_id,
          asset_group_id: originalAssessment.asset_group_id,
          type: originalAssessment.type,
          created_by: this.userId,
        },
      ])
      .select()
      .single();

    if (createError) throw createError;

    return newAssessment;
  }

}
