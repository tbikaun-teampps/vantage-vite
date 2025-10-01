import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase.js";

export type Questionnaire =
  Database["public"]["Tables"]["questionnaires"]["Row"];
export type QuestionnaireSection =
  Database["public"]["Tables"]["questionnaire_sections"]["Row"];
export type QuestionnaireStep =
  Database["public"]["Tables"]["questionnaire_steps"]["Row"];
export type QuestionnaireQuestion =
  Database["public"]["Tables"]["questionnaire_questions"]["Row"];

export type QuestionnaireRatingScale =
  Database["public"]["Tables"]["questionnaire_rating_scales"]["Row"];

export type QuestionnaireWithCounts = Questionnaire & {
  section_count: number;
  step_count: number;
  question_count: number;
};

export type QuestionnaireWithStructure = QuestionnaireWithCounts & {
  sections: Array<
    QuestionnaireSection & {
      steps: Array<
        QuestionnaireStep & {
          questions: Array<
            QuestionnaireQuestion & {
              question_rating_scales: Array<{
                id: number;
                questionnaire_rating_scale_id: number;
                description: string;
              }>;
              question_roles?: Array<{
                id: number;
                questionnaire_question_id: number;
                shared_role_id: number;
                role: {
                  id: number;
                  name: string;
                  description: string;
                } | null;
              }>;
            }
          >;
        }
      >;
    }
  >;
  questionnaire_rating_scales: Array<{
    id: number;
    name: string;
    description: string;
    value: number;
    order_index: number;
  }>;
};

export type CreateQuestionnaireData = Pick<
  Database["public"]["Tables"]["questionnaires"]["Insert"],
  "name" | "description" | "guidelines" | "status"
>;

export type UpdateQuestionnaireData = Partial<
  Pick<
    Database["public"]["Tables"]["questionnaires"]["Update"],
    "name" | "description" | "guidelines" | "status"
  >
>;

export type CreateQuestionnaireSectionData =
  Database["public"]["Tables"]["questionnaire_sections"]["Insert"];

export type UpdateQuestionnaireSectionData = Partial<
  Pick<
    Database["public"]["Tables"]["questionnaire_sections"]["Update"],
    "title" | "description" | "order_index" | "expanded"
  >
>;

export type CreateQuestionnaireStepData = Pick<
  Database["public"]["Tables"]["questionnaire_steps"]["Insert"],
  | "questionnaire_section_id"
  | "title"
  | "description"
  | "order_index"
  | "expanded"
>;

export type UpdateQuestionnaireStepData = Partial<
  Pick<
    Database["public"]["Tables"]["questionnaire_steps"]["Update"],
    "title" | "description" | "order_index" | "expanded"
  >
>;

export type CreateQuestionnaireQuestionData = Pick<
  Database["public"]["Tables"]["questionnaire_questions"]["Insert"],
  | "questionnaire_step_id"
  | "title"
  | "question_text"
  | "context"
  | "order_index"
>;

export type UpdateQuestionnaireQuestionData = Partial<
  Pick<
    Database["public"]["Tables"]["questionnaire_questions"]["Update"],
    "title" | "question_text" | "context" | "order_index"
  >
>;

export class QuestionnaireService {
  private supabase: SupabaseClient<Database>;
  private userId: string;

  constructor(supabaseClient: SupabaseClient<Database>, userId: string) {
    this.supabase = supabaseClient;
    this.userId = userId;
  }

  async getQuestionnaires(): Promise<QuestionnaireWithCounts[]> {
    const { data, error } = await this.supabase
      .from("questionnaires")
      .select("*")
      .eq("created_by", this.userId)
      .eq("is_deleted", false)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      return [];
    }

    const questionnaireIds = data.map((q) => q.id);
    const [sectionsData, stepsData, questionsData] =
      await this.fetchCounts(questionnaireIds);

    const sectionCounts: Record<number, number> = {};
    const stepCounts: Record<number, number> = {};
    const questionCounts: Record<number, number> = {};

    sectionsData?.forEach((section) => {
      if (section.questionnaire_id) {
        sectionCounts[section.questionnaire_id] =
          (sectionCounts[section.questionnaire_id] || 0) + 1;
      }
    });

    stepsData?.forEach((step) => {
      if (step.questionnaire_id) {
        stepCounts[step.questionnaire_id] =
          (stepCounts[step.questionnaire_id] || 0) + 1;
      }
    });

    questionsData?.forEach((question) => {
      if (question.questionnaire_id) {
        questionCounts[question.questionnaire_id] =
          (questionCounts[question.questionnaire_id] || 0) + 1;
      }
    });

    return data.map((questionnaire) => ({
      ...questionnaire,
      section_count: sectionCounts[questionnaire.id] || 0,
      step_count: stepCounts[questionnaire.id] || 0,
      question_count: questionCounts[questionnaire.id] || 0,
    }));
  }

  async getQuestionnaireById(
    questionnaireId: number
  ): Promise<QuestionnaireWithStructure | null> {
    const { data, error } = await this.supabase
      .from("questionnaires")
      .select("*")
      .eq("id", questionnaireId)
      .eq("is_deleted", false)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const [
      sections,
      steps,
      questions,
      questionRatingScales,
      questionnaireRatingScales,
    ] = await this.fetchQuestionnaireStructure(data.id);

    const questionnaireWithCounts = data as QuestionnaireWithCounts;
    questionnaireWithCounts.section_count = sections?.length || 0;
    questionnaireWithCounts.step_count = steps?.length || 0;
    questionnaireWithCounts.question_count = questions?.length || 0;

    const sectionsData = sections || [];
    const stepsData = steps || [];
    const questionsData = questions || [];
    const questionRatingScalesData = questionRatingScales || [];
    const questionnaireRatingScalesData = questionnaireRatingScales || [];

    const questionRolesData = await this.fetchQuestionRoles(
      questions.map((q) => q.id)
    );

    const transformedSections = this.buildQuestionnaireStructure(
      sectionsData,
      stepsData,
      questionsData,
      questionRatingScalesData,
      questionRolesData
    );

    return {
      ...questionnaireWithCounts,
      sections: transformedSections,
      questionnaire_rating_scales: questionnaireRatingScalesData,
    } as QuestionnaireWithStructure;
  }

  async createQuestionnaire(
    data: CreateQuestionnaireData
  ): Promise<Questionnaire> {
    const { data: questionnaire, error } = await this.supabase
      .from("questionnaires")
      .insert([
        {
          name: data.name,
          description: data.description,
          guidelines: data.guidelines,
          status: data.status || "draft",
          created_by: this.userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return questionnaire;
  }

  async updateQuestionnaire(
    questionnaireId: number,
    data: UpdateQuestionnaireData
  ): Promise<Questionnaire | null> {
    const { data: existingData, error: fetchError } = await this.supabase
      .from("questionnaires")
      .select("id")
      .eq("id", questionnaireId)
      .eq("is_deleted", false)
      .single();

    if (fetchError) throw fetchError;
    if (!existingData) return null;

    const { data: questionnaire, error } = await this.supabase
      .from("questionnaires")
      .update({
        name: data.name,
        description: data.description,
        guidelines: data.guidelines,
        status: data.status,
      })
      .eq("id", questionnaireId)
      .select()
      .single();

    if (error) throw error;
    return questionnaire;
  }

  async deleteQuestionnaire(questionnaireId: number): Promise<boolean> {
    const { data: existingData, error: fetchError } = await this.supabase
      .from("questionnaires")
      .select("id")
      .eq("id", questionnaireId)
      .eq("is_deleted", false)
      .single();

    if (fetchError) throw fetchError;
    if (!existingData) return false;

    const { error: deleteError } = await this.supabase
      .from("questionnaires")
      .update({ is_deleted: true })
      .eq("id", questionnaireId);

    if (deleteError) throw deleteError;
    return true;
  }

  async duplicateQuestionnaire(originalId: number): Promise<Questionnaire> {
    // Get the original questionnaire with all its structure
    const originalQuestionnaire = await this.getQuestionnaireById(originalId);
    if (!originalQuestionnaire) throw new Error("Questionnaire not found");

    // Create new questionnaire
    const { data: newQuestionnaire, error: questionnaireError } =
      await this.supabase
        .from("questionnaires")
        .insert([
          {
            name: `${originalQuestionnaire.name} (Copy)`,
            description: originalQuestionnaire.description,
            guidelines: originalQuestionnaire.guidelines,
            status: "draft",
            created_by: this.userId,
          },
        ])
        .select()
        .single();

    if (questionnaireError) throw questionnaireError;

    // Duplicate rating scales
    if (originalQuestionnaire.questionnaire_rating_scales.length > 0) {
      const { error: ratingError } = await this.supabase
        .from("questionnaire_rating_scales")
        .insert(
          originalQuestionnaire.questionnaire_rating_scales.map((scale) => ({
            name: scale.name,
            description: scale.description,
            order_index: scale.order_index,
            value: scale.value,
            questionnaire_id: newQuestionnaire.id,
            created_by: this.userId,
          }))
        );

      if (ratingError) throw ratingError;
    }

    // Duplicate sections, steps, and questions
    for (const section of originalQuestionnaire.sections) {
      const { data: newSection, error: sectionError } = await this.supabase
        .from("questionnaire_sections")
        .insert([
          {
            questionnaire_id: newQuestionnaire.id,
            title: section.title,
            order_index: section.order_index,
            expanded: section.expanded,
            created_by: this.userId,
          },
        ])
        .select()
        .single();

      if (sectionError) throw sectionError;

      for (const step of section.steps) {
        const { data: newStep, error: stepError } = await this.supabase
          .from("questionnaire_steps")
          .insert([
            {
              questionnaire_section_id: newSection.id,
              title: step.title,
              order_index: step.order_index,
              expanded: step.expanded,
              questionnaire_id: newQuestionnaire.id,
              created_by: this.userId,
            },
          ])
          .select()
          .single();

        if (stepError) throw stepError;

        for (const question of step.questions) {
          const { data: newQuestion, error: questionError } =
            await this.supabase
              .from("questionnaire_questions")
              .insert([
                {
                  questionnaire_step_id: newStep.id,
                  title: question.title,
                  question_text: question.question_text,
                  context: question.context,
                  order_index: question.order_index,
                  questionnaire_id: newQuestionnaire.id,
                  created_by: this.userId,
                },
              ])
              .select()
              .single();

          if (questionError) throw questionError;

          // Duplicate question rating scale associations
          if (question.question_rating_scales.length > 0) {
            // Get the new rating scale IDs that correspond to the original ones
            const { data: newRatingScales } = await this.supabase
              .from("questionnaire_rating_scales")
              .select("id, value, name")
              .eq("questionnaire_id", newQuestionnaire.id);

            if (newRatingScales) {
              // Create a mapping from original rating scales to new ones
              const ratingScaleMap = new Map();
              question.question_rating_scales.forEach((qrs) => {
                const matchingNewScale = newRatingScales.find(
                  (nrs) => nrs.value === qrs.value && nrs.name === qrs.name
                );
                if (matchingNewScale) {
                  ratingScaleMap.set(
                    qrs.questionnaire_rating_scale_id,
                    matchingNewScale.id
                  );
                }
              });

              // Insert the question rating scale associations
              const questionRatingScalesToInsert =
                question.question_rating_scales
                  .map((qrs) => {
                    const newRatingScaleId = ratingScaleMap.get(
                      qrs.questionnaire_rating_scale_id
                    );
                    if (newRatingScaleId) {
                      return {
                        questionnaire_question_id: newQuestion.id,
                        questionnaire_rating_scale_id: newRatingScaleId,
                        description: qrs.description,
                        questionnaire_id: newQuestionnaire.id,
                        created_by: this.userId,
                      };
                    }
                    return null;
                  })
                  .filter(Boolean);

              if (questionRatingScalesToInsert.length > 0) {
                const { error: qrsError } = await this.supabase
                  .from("questionnaire_question_rating_scales")
                  .insert(questionRatingScalesToInsert);

                if (qrsError) throw qrsError;
              }
            }
          }
        }
      }
    }

    return newQuestionnaire;
  }

  // Questionnaire rating scale operations
  async getRatingScalesByQuestionnaireId(
    questionnaireId: number
  ): Promise<QuestionnaireRatingScale[]> {
    const { data, error } = await this.supabase
      .from("questionnaire_rating_scales")
      .select("*")
      .eq("questionnaire_id", questionnaireId)
      .eq("is_deleted", false)
      .order("order_index", { ascending: true });
    if (error) throw error;
    return data || [];
  }
  async createRatingScale(
    questionnaireId: number,
    ratingData: {
      name: string;
      description: string;
      value: number;
      order_index: number;
    }
  ): Promise<QuestionnaireRatingScale> {
    // Check questionnaire ownership
    const { data: questionnaire, error: qError } = await this.supabase
      .from("questionnaires")
      .select("id")
      // .eq("created_by", this.userId)
      .eq("id", questionnaireId)
      .eq("is_deleted", false)
      .maybeSingle();

    if (qError) throw qError;
    if (!questionnaire)
      throw new Error("Questionnaire not found or access denied");

    // Check if value already exists
    const { data: existingScale, error: existingError } = await this.supabase
      .from("questionnaire_rating_scales")
      .select("value")
      .eq("questionnaire_id", questionnaireId)
      .eq("value", ratingData.value)
      .eq("is_deleted", false)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existingScale) {
      throw new Error(
        `A rating scale with value ${ratingData.value} already exists`
      );
    }

    const { data, error } = await this.supabase
      .from("questionnaire_rating_scales")
      .insert([
        {
          ...ratingData,
          questionnaire_id: questionnaireId,
          created_by: this.userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async createRatingScalesBatch(
    questionnaireId: number,
    ratingScalesData: Array<{
      name: string;
      description: string;
      value: number;
      order_index: number;
    }>
  ): Promise<QuestionnaireRatingScale[]> {
    // Check questionnaire ownership
    const { data: questionnaire, error: qError } = await this.supabase
      .from("questionnaires")
      .select("id")
      .eq("id", questionnaireId)
      .eq("is_deleted", false)
      .maybeSingle();

    if (qError) throw qError;
    if (!questionnaire)
      throw new Error("Questionnaire not found or access denied");

    // Check for duplicate values within the incoming batch
    const incomingValues = ratingScalesData.map((s) => s.value);
    const duplicatesInBatch = incomingValues.filter(
      (value, index) => incomingValues.indexOf(value) !== index
    );
    if (duplicatesInBatch.length > 0) {
      throw new Error(
        `Duplicate rating values in batch: ${[...new Set(duplicatesInBatch)].join(", ")}`
      );
    }

    // Check for conflicts with existing rating scale values
    const { data: existingScales, error: existingError } = await this.supabase
      .from("questionnaire_rating_scales")
      .select("value")
      .eq("questionnaire_id", questionnaireId)
      .eq("is_deleted", false)
      .in("value", incomingValues);

    if (existingError) throw existingError;

    if (existingScales && existingScales.length > 0) {
      const conflictingValues = existingScales.map((s) => s.value);
      throw new Error(
        `Rating scale values already exist: ${conflictingValues.join(", ")}`
      );
    }

    // Insert all rating scales in a single transaction
    const { data, error } = await this.supabase
      .from("questionnaire_rating_scales")
      .insert(
        ratingScalesData.map((scale) => ({
          ...scale,
          questionnaire_id: questionnaireId,
          created_by: this.userId,
        }))
      )
      .select();

    if (error) throw error;
    return data;
  }

  async updateRatingScale(
    ratingScaleId: number,
    updates: {
      name?: string;
      description?: string;
      value?: number;
      order_index?: number;
    }
  ): Promise<QuestionnaireRatingScale> {
    // Get the existing rating scale to find its questionnaire_id
    const { data: existingRatingScale, error: fetchError } = await this.supabase
      .from("questionnaire_rating_scales")
      .select("questionnaire_id, value")
      .eq("id", ratingScaleId)
      .eq("is_deleted", false)
      .single();

    if (fetchError) throw fetchError;
    if (!existingRatingScale) throw new Error("Rating scale not found");

    // If updating the value, check for conflicts with other rating scales
    if (
      updates.value !== undefined &&
      updates.value !== existingRatingScale.value
    ) {
      const { data: conflictingScale, error: conflictError } =
        await this.supabase
          .from("questionnaire_rating_scales")
          .select("id")
          .eq("questionnaire_id", existingRatingScale.questionnaire_id)
          .eq("value", updates.value)
          .eq("is_deleted", false)
          .neq("id", ratingScaleId)
          .maybeSingle();

      if (conflictError) throw conflictError;

      if (conflictingScale) {
        throw new Error(
          `A rating scale with value ${updates.value} already exists`
        );
      }
    }

    const { data, error } = await this.supabase
      .from("questionnaire_rating_scales")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", ratingScaleId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async checkRatingScaleInUse(ratingScaleId: number): Promise<{
    isInUse: boolean;
    questionCount: number;
    message?: string;
  }> {
    // Check if any questions reference this rating scale
    const { data: questionRatingScales, error } = await this.supabase
      .from("questionnaire_question_rating_scales")
      .select("questionnaire_question_id")
      .eq("questionnaire_rating_scale_id", ratingScaleId)
      .eq("is_deleted", false);

    if (error) throw error;

    const questionCount = questionRatingScales?.length || 0;

    if (questionCount === 0) {
      return { isInUse: false, questionCount: 0 };
    }

    return {
      isInUse: true,
      questionCount,
      message: `Cannot modify rating scale while in use by ${questionCount} question${questionCount > 1 ? "s" : ""}`,
    };
  }

  async deleteRatingScale(ratingScaleId: number): Promise<void> {
    const { error } = await this.supabase
      .from("questionnaire_rating_scales")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", ratingScaleId);

    if (error) throw error;

    // Delete all questionnaire question rating scale associations with this rating scale
    const { error: assocError } = await this.supabase
      .from("questionnaire_question_rating_scales")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("questionnaire_rating_scale_id", ratingScaleId);

    if (assocError) throw assocError;
  }

  // Section operations
  async createSection(
    questionnaireId: number,
    sectionData: Omit<CreateQuestionnaireSectionData, "questionnaire_id">
  ): Promise<QuestionnaireSection> {
    // Get the highest order_index to insert after
    const { data: maxOrderData, error: maxOrderError } = await this.supabase
      .from("questionnaire_sections")
      .select("order_index")
      .eq("questionnaire_id", questionnaireId)
      .eq("is_deleted", false)
      .order("order_index", { ascending: false })
      .limit(1);

    if (maxOrderError) throw maxOrderError;
    const newOrderIndex = (maxOrderData?.[0]?.order_index || 0) + 1;

    const { data, error } = await this.supabase
      .from("questionnaire_sections")
      .insert([
        {
          ...sectionData,
          questionnaire_id: questionnaireId,
          order_index: sectionData.order_index ?? newOrderIndex,
          expanded: sectionData.expanded ?? true,
          created_by: this.userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSection(
    sectionId: number,
    updates: UpdateQuestionnaireSectionData
  ): Promise<QuestionnaireSection | null> {
    const { data: existingData, error: fetchError } = await this.supabase
      .from("questionnaire_sections")
      .select("id")
      .eq("id", sectionId)
      .eq("is_deleted", false)
      .single();

    if (fetchError) throw fetchError;
    if (!existingData) return null;

    const { data, error } = await this.supabase
      .from("questionnaire_sections")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", sectionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSection(sectionId: number): Promise<boolean> {
    const { data: existingData, error: fetchError } = await this.supabase
      .from("questionnaire_sections")
      .select("id")
      .eq("id", sectionId)
      .eq("is_deleted", false)
      .single();

    if (fetchError) throw fetchError;
    if (!existingData) return false;

    const { error } = await this.supabase
      .from("questionnaire_sections")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", sectionId);

    if (error) throw error;
    return true;
  }

  // Step operations
  async createStep(
    sectionId: number,
    stepData: Omit<CreateQuestionnaireStepData, "questionnaire_section_id">
  ): Promise<QuestionnaireStep> {
    // Fetch section to ensure it exists and belongs to the questionnaire
    const { data: section, error: sectionError } = await this.supabase
      .from("questionnaire_sections")
      .select("id, questionnaire_id")
      .eq("id", sectionId)
      .eq("is_deleted", false)
      .single();

    if (sectionError) throw sectionError;
    if (!section) throw new Error("Section not found");

    // Get the highest order_index in the same section to insert after
    const { data: maxOrderData, error: maxOrderError } = await this.supabase
      .from("questionnaire_steps")
      .select("order_index")
      .eq("questionnaire_section_id", sectionId)
      .eq("is_deleted", false)
      .order("order_index", { ascending: false })
      .limit(1);

    if (maxOrderError) throw maxOrderError;
    const newOrderIndex = (maxOrderData?.[0]?.order_index || 0) + 1;

    const { data, error } = await this.supabase
      .from("questionnaire_steps")
      .insert([
        {
          ...stepData,
          questionnaire_section_id: sectionId,
          order_index: stepData.order_index ?? newOrderIndex,
          expanded: stepData.expanded ?? true,
          questionnaire_id: section.questionnaire_id,
          created_by: this.userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateStep(
    stepId: number,
    updates: UpdateQuestionnaireStepData
  ): Promise<QuestionnaireStep | null> {
    const { data: existingData, error: fetchError } = await this.supabase
      .from("questionnaire_steps")
      .select("id")
      .eq("id", stepId)
      .eq("is_deleted", false)
      .single();

    if (fetchError) throw fetchError;
    if (!existingData) return null;

    const { data, error } = await this.supabase
      .from("questionnaire_steps")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", stepId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteStep(stepId: number): Promise<boolean> {
    const { data: existingData, error: fetchError } = await this.supabase
      .from("questionnaire_steps")
      .select("id")
      .eq("id", stepId)
      .eq("is_deleted", false)
      .single();

    if (fetchError) throw fetchError;
    if (!existingData) return false;

    const { error } = await this.supabase
      .from("questionnaire_steps")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", stepId);

    if (error) throw error;
    return true;
  }

  // Question operations
  async createQuestion(
    questionnaireStepId: number,
    questionData: Omit<CreateQuestionnaireQuestionData, "questionnaire_step_id">
  ): Promise<QuestionnaireQuestion> {
    // Verify step exists and belongs to the questionnaire
    const { data: step, error: stepError } = await this.supabase
      .from("questionnaire_steps")
      .select("id, questionnaire_id")
      .eq("id", questionnaireStepId)
      .eq("is_deleted", false)
      .single();

    if (stepError) throw stepError;
    if (!step) throw new Error("Step not found");

    // Get the highest order_index in the same step to insert after
    const { data: maxOrderData, error: maxOrderError } = await this.supabase
      .from("questionnaire_questions")
      .select("order_index")
      .eq("questionnaire_step_id", questionnaireStepId)
      .eq("is_deleted", false)
      .order("order_index", { ascending: false })
      .limit(1);

    if (maxOrderError) throw maxOrderError;
    const newOrderIndex = (maxOrderData?.[0]?.order_index || 0) + 1;

    const { data, error } = await this.supabase
      .from("questionnaire_questions")
      .insert([
        {
          ...questionData,
          questionnaire_step_id: questionnaireStepId,
          order_index: questionData.order_index ?? newOrderIndex,
          title: questionData.title || "New Question",
          questionnaire_id: step.questionnaire_id,
          created_by: this.userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateQuestion(
    questionId: number,
    updates: UpdateQuestionnaireQuestionData
  ): Promise<QuestionnaireQuestion | null> {
    const { data: existingData, error: fetchError } = await this.supabase
      .from("questionnaire_questions")
      .select("id")
      .eq("id", questionId)
      .eq("is_deleted", false)
      .single();

    if (fetchError) throw fetchError;
    if (!existingData) return null;

    const { data, error } = await this.supabase
      .from("questionnaire_questions")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", questionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteQuestion(questionId: number): Promise<boolean> {
    const { data: existingData, error: fetchError } = await this.supabase
      .from("questionnaire_questions")
      .select("id")
      .eq("id", questionId)
      .eq("is_deleted", false)
      .single();

    if (fetchError) throw fetchError;
    if (!existingData) return false;

    const { error } = await this.supabase
      .from("questionnaire_questions")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", questionId);

    if (error) throw error;
    return true;
  }

  async duplicateQuestion(
    originalQuestionId: number
  ): Promise<QuestionnaireQuestion> {
    // First, get the original question with all its data
    const { data: originalQuestion, error: questionError } = await this.supabase
      .from("questionnaire_questions")
      .select(
        `
        *,
        questionnaire_question_rating_scales(
          questionnaire_rating_scale_id,
          description
        ),
        questionnaire_question_roles(
          shared_role_id
        )
      `
      )
      .eq("id", originalQuestionId)
      .single();

    if (questionError) throw questionError;
    if (!originalQuestion) throw new Error("Question not found");

    // Get the highest order_index in the same step to insert after
    const { data: maxOrderData, error: maxOrderError } = await this.supabase
      .from("questionnaire_questions")
      .select("order_index")
      .eq("questionnaire_step_id", originalQuestion.questionnaire_step_id)
      .order("order_index", { ascending: false })
      .limit(1);

    if (maxOrderError) throw maxOrderError;
    const newOrderIndex = (maxOrderData?.[0]?.order_index || 0) + 1;

    // Create the duplicate question
    const newQuestionData = {
      questionnaire_step_id: originalQuestion.questionnaire_step_id,
      question_text: `${originalQuestion.question_text} (Copy)`,
      context: originalQuestion.context,
      title: `${originalQuestion.title} (Copy)`,
      order_index: newOrderIndex,
      questionnaire_id: originalQuestion.questionnaire_id,
      created_by: this.userId,
    };

    const { data: newQuestion, error: createError } = await this.supabase
      .from("questionnaire_questions")
      .insert([newQuestionData])
      .select()
      .single();

    if (createError) throw createError;

    // Duplicate rating scale associations if any exist
    if (originalQuestion.questionnaire_question_rating_scales?.length > 0) {
      const ratingScaleAssociations =
        originalQuestion.questionnaire_question_rating_scales.map(
          (rs: any) => ({
            questionnaire_question_id: newQuestion.id,
            questionnaire_rating_scale_id: rs.questionnaire_rating_scale_id,
            description: rs.description,
            questionnaire_id: originalQuestion.questionnaire_id,
            created_by: this.userId,
          })
        );

      const { error: ratingScaleError } = await this.supabase
        .from("questionnaire_question_rating_scales")
        .insert(ratingScaleAssociations);

      if (ratingScaleError) throw ratingScaleError;
    }

    // Duplicate role associations if any exist
    if (originalQuestion.questionnaire_question_roles?.length > 0) {
      const roleAssociations =
        originalQuestion.questionnaire_question_roles.map((qr: any) => ({
          questionnaire_question_id: newQuestion.id,
          shared_role_id: qr.shared_role_id,
          questionnaire_id: originalQuestion.questionnaire_id,
          created_by: this.userId,
        }));

      const { error: roleError } = await this.supabase
        .from("questionnaire_question_roles")
        .insert(roleAssociations);

      if (roleError) throw roleError;
    }

    // Fetch the complete question with all associations to return
    const { data: completeQuestion, error: fetchError } = await this.supabase
      .from("questionnaire_questions")
      .select(
        `
        *,
        questionnaire_question_rating_scales(
          *,
          rating_scale:questionnaire_rating_scales(*)
        ),
        questionnaire_question_roles(
          *,
          role:shared_roles(*)
        )
      `
      )
      .eq("id", newQuestion.id)
      .single();

    if (fetchError) throw fetchError;

    // Transform to match the expected format
    const transformedQuestion = {
      ...completeQuestion,
      question_rating_scales:
        completeQuestion.questionnaire_question_rating_scales?.map(
          (qrs: any) => ({
            ...qrs,
            rating_scale: qrs.rating_scale,
          })
        ) || [],
      question_roles:
        completeQuestion.questionnaire_question_roles?.map((qar: any) => ({
          ...qar,
          role: qar.role,
        })) || [],
    };

    return transformedQuestion;
  }

  async addQuestionRatingScale(
    questionId: number,
    questionnaireRatingScaleId: number,
    description: string
  ): Promise<any> {
    // Check if the association already exists
    const { data: existingData, error: fetchError } = await this.supabase
      .from("questionnaire_question_rating_scales")
      .select("id")
      .eq("questionnaire_question_id", questionId)
      .eq("questionnaire_rating_scale_id", questionnaireRatingScaleId)
      .eq("is_deleted", false)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (existingData) return; // Association already exists

    // Fetch questionnaire rating scale to ensure it exists and to get its questionnaire_id
    const { data: ratingScale, error: ratingScaleError } = await this.supabase
      .from("questionnaire_rating_scales")
      .select("questionnaire_id")
      .eq("id", questionnaireRatingScaleId)
      .eq("is_deleted", false)
      .single();

    if (ratingScaleError) throw ratingScaleError;
    if (!ratingScale) {
      throw new Error("Questionnaire rating scale not found");
    }

    const { data, error } = await this.supabase
      .from("questionnaire_question_rating_scales")
      .insert([
        {
          questionnaire_question_id: questionId,
          questionnaire_rating_scale_id: questionnaireRatingScaleId,
          description,
          questionnaire_id: ratingScale.questionnaire_id,
          created_by: this.userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async deleteQuestionRatingScale(
    questionRatingScaleId: number
  ): Promise<void> {
    const { error } = await this.supabase
      .from("questionnaire_question_rating_scales")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", questionRatingScaleId);

    if (error) throw error;
  }

  async updateQuestionRatingScale(
    questionRatingScaleId: number,
    description: string
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from("questionnaire_question_rating_scales")
      .update({ description, updated_at: new Date().toISOString() })
      .eq("id", questionRatingScaleId)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async addQuestionnaireRatingScaleToQuestion(
    questionnaireId: number,
    questionId: number
  ): Promise<any> {
    // Fetch rating scale associated with the questionnaire
    const {
      data: questionnaireRatingScale,
      error: questionnaireRatingScaleError,
    } = await this.supabase
      .from("questionnaire_rating_scales")
      .select("*")
      .eq("questionnaire_id", questionnaireId)
      .eq("is_deleted", false);

    if (questionnaireRatingScaleError) throw questionnaireRatingScaleError;
    if (!questionnaireRatingScale)
      throw new Error("Questionnaire rating scale not found");

    console.log("questionnaireRatingScale", questionnaireRatingScale);

    // const { error } = await this.supabase
    //   .from("questionnaire_question_rating_scales")
    //   .insert(
    //     questionnaireRatingScale.map((qrs) => ({
    //       questionnaire_question_id: questionId,
    //       questionnaire_id: questionnaireId,
    //       questionnaire_rating_scale_id: qrs.id,
    //       description: qrs.description,
    //     }))
    //   );

    // if (error) throw error;
  }

  // Question applicable role
  async updateQuestionApplicableRoles(
    questionId: number,
    sharedRoleIds: number[]
  ): Promise<any> {
    if (sharedRoleIds.length === 0) {
      // Remove all associations
      const { error: deleteError } = await this.supabase
        .from("questionnaire_question_roles")
        .delete()
        .eq("questionnaire_question_id", questionId);

      if (deleteError) throw deleteError;
      return [];
    }

    // Validate userId exists
    if (!this.userId) {
      throw new Error("User ID is required");
    }

    // Check question exists and get its questionnaire_id
    const { data: question, error: questionError } = await this.supabase
      .from("questionnaire_questions")
      .select("id, questionnaire_id")
      .eq("id", questionId)
      .eq("is_deleted", false)
      .maybeSingle();

    if (questionError) throw questionError;
    if (!question) throw new Error("Question not found");

    // Validate all role IDs exist
    const { data: validRoles, error: rolesError } = await this.supabase
      .from("shared_roles")
      .select("id, name, description")
      .in("id", sharedRoleIds);

    if (rolesError) throw rolesError;
    if (validRoles.length !== sharedRoleIds.length) {
      throw new Error("One or more invalid shared role IDs provided");
    }

    // Option 1: Delete with error handling
    const { error: deleteError } = await this.supabase
      .from("questionnaire_question_roles")
      .delete()
      .eq("questionnaire_question_id", questionId);

    if (deleteError) throw deleteError;

    // Insert new associations with select to return data
    const { data: newRoleAssociations, error: insertError } =
      await this.supabase
        .from("questionnaire_question_roles")
        .insert(
          validRoles.map((r) => ({
            questionnaire_question_id: questionId,
            shared_role_id: r.id,
            questionnaire_id: question.questionnaire_id,
            created_by: this.userId,
          }))
        )
        .select(); // Add select to return inserted data

    // Add name and description to the returned data
    const data = newRoleAssociations?.map((d) => {
      const role = validRoles.find((r) => r.id === d.shared_role_id);
      return {
        ...d,
        name: role?.name || "",
        description: role?.description || null,
      };
    });

    if (insertError) {
      // Critical: Try to restore something or log this failure
      console.error("Failed to insert roles after deletion:", insertError);
      throw insertError;
    }
    return data;
  }

  private async fetchCounts(questionnaireIds: number[]) {
    return Promise.all([
      this.supabase
        .from("questionnaire_sections")
        .select("id, questionnaire_id")
        .eq("is_deleted", false)
        .in("questionnaire_id", questionnaireIds),
      this.supabase
        .from("questionnaire_steps")
        .select("id, questionnaire_id")
        .eq("is_deleted", false)
        .in("questionnaire_id", questionnaireIds),
      this.supabase
        .from("questionnaire_questions")
        .select("id, questionnaire_id")
        .eq("is_deleted", false)
        .in("questionnaire_id", questionnaireIds),
    ]).then(([sectionsResult, stepsResult, questionsResult]) => {
      if (sectionsResult.error || stepsResult.error || questionsResult.error) {
        throw (
          sectionsResult.error || stepsResult.error || questionsResult.error
        );
      }
      return [sectionsResult.data, stepsResult.data, questionsResult.data];
    });
  }

  private async fetchQuestionnaireStructure(questionnaireId: number) {
    return Promise.all([
      this.supabase
        .from("questionnaire_sections")
        .select("id, title, order_index, expanded, questionnaire_id")
        .eq("questionnaire_id", questionnaireId)
        .eq("is_deleted", false)
        .order("order_index", { ascending: true }),
      this.supabase
        .from("questionnaire_steps")
        .select(
          "id, title, order_index, expanded, questionnaire_section_id, questionnaire_id"
        )
        .eq("questionnaire_id", questionnaireId)
        .eq("is_deleted", false)
        .order("order_index", { ascending: true }),
      this.supabase
        .from("questionnaire_questions")
        .select(
          "id, question_text, context, order_index, title, questionnaire_step_id, questionnaire_id"
        )
        .eq("questionnaire_id", questionnaireId)
        .eq("is_deleted", false)
        .order("order_index", { ascending: true }),
      this.supabase
        .from("questionnaire_question_rating_scales")
        .select(
          "id, questionnaire_rating_scale_id(id,name,description,value), description, questionnaire_question_id, questionnaire_id"
        )
        .eq("questionnaire_id", questionnaireId)
        .eq("is_deleted", false),
      this.supabase
        .from("questionnaire_rating_scales")
        .select("id, name, description, value, order_index, questionnaire_id")
        .eq("questionnaire_id", questionnaireId)
        .eq("is_deleted", false)
        .order("order_index", { ascending: true }),
    ]).then(
      ([
        sectionsResult,
        stepsResult,
        questionsResult,
        questionRatingScalesResult,
        questionnaireRatingScalesResult,
      ]) => {
        if (
          sectionsResult.error ||
          stepsResult.error ||
          questionsResult.error ||
          questionRatingScalesResult.error ||
          questionnaireRatingScalesResult.error
        ) {
          throw (
            sectionsResult.error ||
            stepsResult.error ||
            questionsResult.error ||
            questionRatingScalesResult.error ||
            questionnaireRatingScalesResult.error
          );
        }
        return [
          sectionsResult.data,
          stepsResult.data,
          questionsResult.data,
          // Unpack nested joined data
          questionRatingScalesResult.data.map((qrs) => ({
            id: qrs.id,
            description: qrs.description,
            name: qrs.questionnaire_rating_scale_id.name,
            questionnaire_rating_scale_id: qrs.questionnaire_rating_scale_id.id,
            value: qrs.questionnaire_rating_scale_id.value,
            questionnaire_question_id: qrs.questionnaire_question_id,
            questionnaire_id: qrs.questionnaire_id,
          })),
          questionnaireRatingScalesResult.data,
        ];
      }
    );
  }

  private async fetchQuestionRoles(questionIds: number[]): Promise<
    Array<{
      id: number;
      shared_role_id: number;
      name: string;
      description: string | null;
    }>
  > {
    const { data, error } = await this.supabase
      .from("questionnaire_question_roles")
      .select("id, questionnaire_question_id, shared_roles(*)")
      .in("questionnaire_question_id", questionIds)
      .eq("is_deleted", false);

    if (error) throw error;

    return data.map((r) => ({
      id: r.id,
      shared_role_id: r.shared_roles.id,
      name: r.shared_roles.name,
      description: r.shared_roles.description,
      questionnaire_question_id: r.questionnaire_question_id, // used for indexing downstream
    }));
  }

  private buildQuestionnaireStructure(
    sectionsData: QuestionnaireSection[],
    stepsData: QuestionnaireStep[],
    questionsData: QuestionnaireQuestion[],
    questionRatingScalesData: any[],
    questionRolesData: any[]
  ) {
    const stepsBySection = new Map();
    const questionsByStep = new Map();
    const ratingScalesByQuestion = new Map();
    const rolesByQuestion = new Map();

    for (const step of stepsData) {
      const stepSectionId = step.questionnaire_section_id;
      if (!stepsBySection.has(stepSectionId)) {
        stepsBySection.set(stepSectionId, []);
      }
      stepsBySection.get(stepSectionId)!.push(step);
    }

    for (const question of questionsData) {
      const stepId = question.questionnaire_step_id;
      if (!questionsByStep.has(stepId)) {
        questionsByStep.set(stepId, []);
      }
      questionsByStep.get(stepId)!.push(question);
    }

    for (const qrs of questionRatingScalesData) {
      const questionId = qrs.questionnaire_question_id;
      if (!ratingScalesByQuestion.has(questionId)) {
        ratingScalesByQuestion.set(questionId, []);
      }
      ratingScalesByQuestion.get(questionId)!.push(qrs);
    }

    for (const qr of questionRolesData) {
      const questionId = qr.questionnaire_question_id;
      if (!rolesByQuestion.has(questionId)) {
        rolesByQuestion.set(questionId, []);
      }
      rolesByQuestion.get(questionId)!.push(qr);
    }

    console.log("questionRatingScalesData:", questionRatingScalesData);

    return sectionsData
      .map((section) => {
        const sectionSteps = stepsBySection.get(section.id) || [];

        return {
          ...section,
          steps: sectionSteps
            .map((step) => {
              const stepQuestions = questionsByStep.get(step.id) || [];

              return {
                ...step,
                questions: stepQuestions.map((question) => {
                  const questionRatingScalesList =
                    ratingScalesByQuestion.get(question.id) || [];
                  const questionRolesList =
                    rolesByQuestion.get(question.id) || [];

                  return {
                    ...question,
                    question_rating_scales: questionRatingScalesList.map(
                      (qrs) => ({
                        ...qrs,
                        rating_scale: qrs.rating_scale,
                      })
                    ),
                    question_roles: questionRolesList,
                  };
                }),
              };
            })
            .sort((a: any, b: any) => a.order_index - b.order_index),
        };
      })
      .sort((a: any, b: any) => a.order_index - b.order_index);
  }

  async checkQuestionnaireUsage(questionnaireId: number) {
    try {
      // Check assessments using this questionnaire
      const { data: assessments, error: assessmentError } = await this.supabase
        .from("assessments")
        .select("id, name")
        .eq("questionnaire_id", questionnaireId)
        .eq("is_deleted", false);

      if (assessmentError) throw assessmentError;

      // Check programs using this questionnaire (either as onsite or presite questionnaire)
      const { data: programs, error: programError } = await this.supabase
        .from("programs")
        .select("id, name")
        .or(
          `onsite_questionnaire_id.eq.${questionnaireId},presite_questionnaire_id.eq.${questionnaireId}`
        )
        .eq("is_deleted", false);

      if (programError) throw programError;

      // Get interview counts for each assessment
      const assessmentIds = assessments?.map((a) => a.id) || [];
      let totalInterviews = 0;

      if (assessmentIds.length > 0) {
        const { count, error: interviewError } = await this.supabase
          .from("interviews")
          .select("*", { count: "exact", head: true })
          .in("assessment_id", assessmentIds)
          .eq("is_deleted", false);

        if (interviewError) throw interviewError;
        totalInterviews = count || 0;
      }

      const assessmentCount = assessments?.length || 0;
      const programCount = programs?.length || 0;

      return {
        assessmentCount,
        assessments: assessments || [],
        interviewCount: totalInterviews,
        programCount,
        programs: programs || [],
        isInUse: assessmentCount > 0 || programCount > 0,
      };
    } catch (error) {
      console.error("Error checking questionnaire usage:", error);
      throw error;
    }
  }

  async checkQuestionnaireInUse(questionnaireId: number): Promise<{
    isInUse: boolean;
    message?: string;
  }> {
    const usage = await this.checkQuestionnaireUsage(questionnaireId);

    if (!usage.isInUse) {
      return { isInUse: false };
    }

    const parts: string[] = [];
    if (usage.assessmentCount > 0) {
      parts.push(
        `${usage.assessmentCount} assessment${usage.assessmentCount > 1 ? "s" : ""}`
      );
    }
    if (usage.programCount > 0) {
      parts.push(
        `${usage.programCount} program${usage.programCount > 1 ? "s" : ""}`
      );
    }

    return {
      isInUse: true,
      message: `Cannot modify questionnaire structure while in use by ${parts.join(" and ")}`,
    };
  }
}
