import { createClient } from "./client";
import { rolesService } from "./roles-service";
import type {
  Questionnaire,
  QuestionnaireSection,
  QuestionnaireStep,
  QuestionnaireQuestion,
  QuestionnaireRatingScale,
  QuestionnaireQuestionRatingScale,
  QuestionnaireWithCounts,
  QuestionnaireWithStructure,
  Role,
  CreateQuestionnaireStepData,
  CreateQuestionnaireData,
  UpdateQuestionnaireData,
  UpdateQuestionnaireStepData,
  UpdateQuestionnaireSectionData,
  CreateQuestionnaireSectionData,
  CreateQuestionnaireQuestionData,
  CreateQuestionnaireRatingScaleData,
  UpdateQuestionnaireRatingScaleData,
  UpdateQuestionnaireQuestionRatingScaleData,
  CreateQuestionnaireQuestionRatingScaleData,
  UpdateQuestionnaireQuestionData,
} from "@/types/assessment";
import { checkDemoAction } from "./utils";

export class QuestionnaireService {
  private supabase = createClient();

  // Helper method to check if questionnaire is locked due to usage
  private async checkQuestionnaireNotInUse(questionnaireId: number): Promise<void> {
    const usage = await this.checkQuestionnaireUsage(questionnaireId);
    if (usage.isInUse) {
      const usageParts = [];
      if (usage.assessmentCount > 0) {
        usageParts.push(`${usage.assessmentCount} assessment${usage.assessmentCount !== 1 ? "s" : ""}`);
      }
      if (usage.interviewCount > 0) {
        usageParts.push(`${usage.interviewCount} interview${usage.interviewCount !== 1 ? "s" : ""}`);
      }
      if (usage.programCount > 0) {
        usageParts.push(`${usage.programCount} program${usage.programCount !== 1 ? "s" : ""}`);
      }
      
      const usageText = usageParts.length > 1 
        ? usageParts.slice(0, -1).join(", ") + " and " + usageParts.slice(-1)
        : usageParts[0];

      throw new Error(`Cannot modify questionnaire structure while it's in use by ${usageText}. Please remove the questionnaire from all linked entities before making structural changes.`);
    }
  }

  // Questionnaire CRUD operations
  async getQuestionnaires(): Promise<QuestionnaireWithCounts[]> {
    try {
      // Get basic questionnaire data
      const { data: questionnaires, error: questionnaireError } =
        await this.supabase
          .from("questionnaires")
          .select("*")
          .eq("is_deleted", false)
          .order("updated_at", { ascending: false });

      if (questionnaireError) throw questionnaireError;
      if (!questionnaires?.length) return [];

      // Get counts for each questionnaire in parallel
      const questionnairesWithCounts = await Promise.all(
        questionnaires.map(async (questionnaire) => {
          const [sectionCount, stepCount, questionCount] = await Promise.all([
            // Count sections directly
            this.supabase
              .from("questionnaire_sections")
              .select("*", { count: "exact", head: true })
              .eq("questionnaire_id", questionnaire.id)
              .eq("is_deleted", false),

            // Count steps by joining with sections
            this.supabase
              .from("questionnaire_steps")
              .select(
                `
              questionnaire_sections!inner(questionnaire_id)
            `,
                { count: "exact", head: true }
              )
              .eq("questionnaire_sections.questionnaire_id", questionnaire.id)
              .eq("is_deleted", false)
              .eq("questionnaire_sections.is_deleted", false),

            // Count questions by joining with steps and sections
            this.supabase
              .from("questionnaire_questions")
              .select(
                `
              questionnaire_steps!inner(
                questionnaire_sections!inner(questionnaire_id)
              )
            `,
                { count: "exact", head: true }
              )
              .eq(
                "questionnaire_steps.questionnaire_sections.questionnaire_id",
                questionnaire.id
              )
              .eq("is_deleted", false)
              .eq("questionnaire_steps.is_deleted", false)
              .eq(
                "questionnaire_steps.questionnaire_sections.is_deleted",
                false
              ),
          ]);

          return {
            ...questionnaire,
            section_count: sectionCount.count || 0,
            step_count: stepCount.count || 0,
            question_count: questionCount.count || 0,
          };
        })
      );

      return questionnairesWithCounts;
    } catch (error) {
      console.error("Error in getQuestionnaires:", error);
      return [];
    }
  }

  async getQuestionnaireById(
    id: number
  ): Promise<QuestionnaireWithStructure | null> {
    // Get questionnaire with full structure
    const { data: questionnaire, error: questionnaireError } =
      await this.supabase
        .from("questionnaires")
        .select("*")
        .eq("id", id)
        .eq("is_deleted", false)
        .single();

    if (questionnaireError) throw questionnaireError;
    if (!questionnaire) return null;

    // Fetch all related data in parallel with proper filtering
    const [
      sectionsResult,
      stepsResult,
      questionsResult,
      questionRatingScalesResult,
      questionRolesResult,
      ratingScalesResult,
    ] = await Promise.all([
      // Get sections
      this.supabase
        .from("questionnaire_sections")
        .select("*")
        .eq("questionnaire_id", id)
        .eq("is_deleted", false)
        .order("order_index"),

      // Get steps
      this.supabase
        .from("questionnaire_steps")
        .select(
          `
          *,
          questionnaire_sections!inner(questionnaire_id)
        `
        )
        .eq("questionnaire_sections.questionnaire_id", id)
        .eq("is_deleted", false)
        .eq("questionnaire_sections.is_deleted", false)
        .order("order_index"),

      // Get questions
      this.supabase
        .from("questionnaire_questions")
        .select(
          `
          *,
          questionnaire_steps!inner(
            questionnaire_sections!inner(questionnaire_id)
          )
        `
        )
        .eq("questionnaire_steps.questionnaire_sections.questionnaire_id", id)
        .eq("is_deleted", false)
        .eq("questionnaire_steps.is_deleted", false)
        .eq("questionnaire_steps.questionnaire_sections.is_deleted", false)
        .order("order_index"),

      // Get question rating scales
      this.supabase
        .from("questionnaire_question_rating_scales")
        .select(
          `
          *,
          rating_scale:questionnaire_rating_scales(*),
          questionnaire_questions!inner(
            questionnaire_steps!inner(
              questionnaire_sections!inner(questionnaire_id)
            )
          )
        `
        )
        .eq(
          "questionnaire_questions.questionnaire_steps.questionnaire_sections.questionnaire_id",
          id
        )
        .eq("is_deleted", false)
        .eq("questionnaire_questions.is_deleted", false)
        .eq("questionnaire_questions.questionnaire_steps.is_deleted", false)
        .eq(
          "questionnaire_questions.questionnaire_steps.questionnaire_sections.is_deleted",
          false
        ),

      // Get question roles
      this.supabase
        .from("questionnaire_question_roles")
        .select(
          `
          *,
          role:shared_roles(*),
          questionnaire_questions!inner(
            questionnaire_steps!inner(
              questionnaire_sections!inner(questionnaire_id)
            )
          )
        `
        )
        .eq(
          "questionnaire_questions.questionnaire_steps.questionnaire_sections.questionnaire_id",
          id
        )
        .eq("is_deleted", false)
        .eq("questionnaire_questions.is_deleted", false)
        .eq("questionnaire_questions.questionnaire_steps.is_deleted", false)
        .eq(
          "questionnaire_questions.questionnaire_steps.questionnaire_sections.is_deleted",
          false
        ),

      // Get rating scales
      this.supabase
        .from("questionnaire_rating_scales")
        .select("*")
        .eq("questionnaire_id", id)
        .eq("is_deleted", false)
        .order("order_index"),
    ]);

    // Check for errors
    if (sectionsResult.error) throw sectionsResult.error;
    if (stepsResult.error) throw stepsResult.error;
    if (questionsResult.error) throw questionsResult.error;
    if (questionRatingScalesResult.error)
      throw questionRatingScalesResult.error;
    if (questionRolesResult.error) throw questionRolesResult.error;
    if (ratingScalesResult.error) throw ratingScalesResult.error;

    // Extract data
    const sections = sectionsResult.data || [];
    const steps = stepsResult.data || [];
    const questions = questionsResult.data || [];
    const questionRatingScales = questionRatingScalesResult.data || [];
    const questionRoles = questionRolesResult.data || [];
    const ratingScales = ratingScalesResult.data || [];

    // Create lookup maps for efficient data organization
    const stepsBySection = new Map<number, typeof steps>();
    const questionsByStep = new Map<number, typeof questions>();
    const ratingScalesByQuestion = new Map<
      number,
      typeof questionRatingScales
    >();
    const rolesByQuestion = new Map<number, typeof questionRoles>();

    // Group steps by section
    for (const step of steps) {
      const sectionId = step.questionnaire_section_id;
      if (!stepsBySection.has(sectionId)) {
        stepsBySection.set(sectionId, []);
      }
      stepsBySection.get(sectionId)!.push(step);
    }

    // Group questions by step
    for (const question of questions) {
      const stepId = question.questionnaire_step_id;
      if (!questionsByStep.has(stepId)) {
        questionsByStep.set(stepId, []);
      }
      questionsByStep.get(stepId)!.push(question);
    }

    // Group rating scales by question
    for (const qrs of questionRatingScales) {
      const questionId = qrs.questionnaire_question_id;
      if (!ratingScalesByQuestion.has(questionId)) {
        ratingScalesByQuestion.set(questionId, []);
      }
      ratingScalesByQuestion.get(questionId)!.push(qrs);
    }

    // Group roles by question
    for (const qr of questionRoles) {
      const questionId = qr.questionnaire_question_id;
      if (!rolesByQuestion.has(questionId)) {
        rolesByQuestion.set(questionId, []);
      }
      rolesByQuestion.get(questionId)!.push(qr);
    }

    // Build the nested structure
    const transformedSections = sections
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
                    question_roles: questionRolesList.map((qr) => ({
                      ...qr,
                      role: qr.role,
                    })),
                  };
                }),
              };
            })
            .sort((a, b) => a.order_index - b.order_index),
        };
      })
      .sort((a, b) => a.order_index - b.order_index);

    return {
      ...questionnaire,
      sections: transformedSections,
      rating_scales: ratingScales,
    };
  }

  async createQuestionnaire(
    questionnaireData: CreateQuestionnaireData
  ): Promise<Questionnaire> {
    await checkDemoAction();
    const { data, error } = await this.supabase
      .from("questionnaires")
      .insert([questionnaireData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateQuestionnaire(
    id: number,
    updates: UpdateQuestionnaireData
  ): Promise<Questionnaire> {
    await checkDemoAction();
    const { data, error } = await this.supabase
      .from("questionnaires")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteQuestionnaire(id: number): Promise<void> {
    await checkDemoAction();
    const { error } = await this.supabase
      .from("questionnaires")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  }

  async cleanupFailedQuestionnaire(id: number): Promise<void> {
    // This method is specifically for cleaning up questionnaires that failed during import
    // It will cascade delete all related sections, steps, questions, and rating scales
    const { error } = await this.supabase
      .from("questionnaires")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to cleanup questionnaire:", error);
      // Don't throw here as this is cleanup - log the error but continue
    }
  }

  async duplicateQuestionnaire(originalId: number): Promise<Questionnaire> {
    await checkDemoAction();
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
          },
        ])
        .select()
        .single();

    if (questionnaireError) throw questionnaireError;

    // Duplicate rating scales
    if (originalQuestionnaire.rating_scales.length > 0) {
      const { error: ratingError } = await this.supabase
        .from("questionnaire_rating_scales")
        .insert(
          originalQuestionnaire.rating_scales.map((scale) => ({
            name: scale.name,
            description: scale.description,
            order_index: scale.order_index,
            value: scale.value,
            questionnaire_id: newQuestionnaire.id,
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
                  (nrs) =>
                    nrs.value === qrs.rating_scale.value &&
                    nrs.name === qrs.rating_scale.name
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

  // Section operations
  async createSection(
    sectionData: CreateQuestionnaireSectionData
  ): Promise<QuestionnaireSection> {
    await checkDemoAction();
    await this.checkQuestionnaireNotInUse(sectionData.questionnaire_id);

    const { data, error } = await this.supabase
      .from("questionnaire_sections")
      .insert([sectionData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSection(
    id: number,
    updates: UpdateQuestionnaireSectionData
  ): Promise<QuestionnaireSection> {
    await checkDemoAction();
    
    // Get questionnaire_id to check if it's in use
    const { data: section, error: fetchError } = await this.supabase
      .from("questionnaire_sections")
      .select("questionnaire_id")
      .eq("id", id)
      .single();
    
    if (fetchError) throw fetchError;
    await this.checkQuestionnaireNotInUse(section.questionnaire_id);
    
    const { data, error } = await this.supabase
      .from("questionnaire_sections")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSection(id: number): Promise<void> {
    await checkDemoAction();
    
    // Get questionnaire_id to check if it's in use
    const { data: section, error: fetchError } = await this.supabase
      .from("questionnaire_sections")
      .select("questionnaire_id")
      .eq("id", id)
      .single();
    
    if (fetchError) throw fetchError;
    await this.checkQuestionnaireNotInUse(section.questionnaire_id);
    
    const { error } = await this.supabase
      .from("questionnaire_sections")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  }

  // Step operations
  async createStep(
    stepData: CreateQuestionnaireStepData
  ): Promise<QuestionnaireStep> {
    await checkDemoAction();

    // Get questionnaire_id from section to check if it's in use
    const { data: section, error: sectionError } = await this.supabase
      .from("questionnaire_sections")
      .select("questionnaire_id")
      .eq("id", stepData.questionnaire_section_id)
      .single();
    
    if (sectionError) throw sectionError;
    await this.checkQuestionnaireNotInUse(section.questionnaire_id);

    // Get the highest order_index in the same section to insert after
    const { data: maxOrderData, error: maxOrderError } = await this.supabase
      .from("questionnaire_steps")
      .select("order_index")
      .eq("questionnaire_section_id", stepData.questionnaire_section_id)
      .order("order_index", { ascending: false })
      .limit(1);

    if (maxOrderError) throw maxOrderError;
    const newOrderIndex = (maxOrderData?.[0]?.order_index || 0) + 1;

    const { data, error } = await this.supabase
      .from("questionnaire_steps")
      .insert([{ ...stepData, order_index: newOrderIndex }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateStep(
    id: number,
    updates: UpdateQuestionnaireStepData
  ): Promise<QuestionnaireStep> {
    await checkDemoAction();
    
    // Get questionnaire_id via section to check if it's in use
    const { data: step, error: fetchError } = await this.supabase
      .from("questionnaire_steps")
      .select("questionnaire_section_id, questionnaire_sections!inner(questionnaire_id)")
      .eq("id", id)
      .single();
    
    if (fetchError) throw fetchError;
    await this.checkQuestionnaireNotInUse(step.questionnaire_sections.questionnaire_id);
    
    const { data, error } = await this.supabase
      .from("questionnaire_steps")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteStep(id: number): Promise<void> {
    await checkDemoAction();
    
    // Get questionnaire_id via section to check if it's in use
    const { data: step, error: fetchError } = await this.supabase
      .from("questionnaire_steps")
      .select("questionnaire_section_id, questionnaire_sections!inner(questionnaire_id)")
      .eq("id", id)
      .single();
    
    if (fetchError) throw fetchError;
    await this.checkQuestionnaireNotInUse(step.questionnaire_sections.questionnaire_id);
    
    const { error } = await this.supabase
      .from("questionnaire_steps")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  }

  // Question operations
  async createQuestion(
    questionData: CreateQuestionnaireQuestionData
  ): Promise<QuestionnaireQuestion> {
    await checkDemoAction();

    // Get questionnaire_id via step and section to check if it's in use
    const { data: step, error: stepError } = await this.supabase
      .from("questionnaire_steps")
      .select("questionnaire_sections!inner(questionnaire_id)")
      .eq("id", questionData.questionnaire_step_id)
      .single();
    
    if (stepError) throw stepError;
    await this.checkQuestionnaireNotInUse(step.questionnaire_sections.questionnaire_id);

    // Get the highest order_index in the same step to insert after
    const { data: maxOrderData, error: maxOrderError } = await this.supabase
      .from("questionnaire_questions")
      .select("order_index")
      .eq("questionnaire_step_id", questionData.questionnaire_step_id)
      .order("order_index", { ascending: false })
      .limit(1);

    if (maxOrderError) throw maxOrderError;
    const newOrderIndex = (maxOrderData?.[0]?.order_index || 0) + 1;

    const { data, error } = await this.supabase
      .from("questionnaire_questions")
      .insert([{ ...questionData, order_index: newOrderIndex }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateQuestion(
    id: number,
    updates: UpdateQuestionnaireQuestionData
  ): Promise<QuestionnaireQuestion> {
    await checkDemoAction();
    
    // Get questionnaire_id via step and section to check if it's in use
    const { data: question, error: fetchError } = await this.supabase
      .from("questionnaire_questions")
      .select("questionnaire_steps!inner(questionnaire_sections!inner(questionnaire_id))")
      .eq("id", id)
      .single();
    
    if (fetchError) throw fetchError;
    await this.checkQuestionnaireNotInUse(question.questionnaire_steps.questionnaire_sections.questionnaire_id);
    
    const { data, error } = await this.supabase
      .from("questionnaire_questions")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteQuestion(id: number): Promise<void> {
    await checkDemoAction();
    
    // Get questionnaire_id via step and section to check if it's in use
    const { data: question, error: fetchError } = await this.supabase
      .from("questionnaire_questions")
      .select("questionnaire_steps!inner(questionnaire_sections!inner(questionnaire_id))")
      .eq("id", id)
      .single();
    
    if (fetchError) throw fetchError;
    await this.checkQuestionnaireNotInUse(question.questionnaire_steps.questionnaire_sections.questionnaire_id);
    
    const { error } = await this.supabase
      .from("questionnaire_questions")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  }

  async duplicateQuestion(
    originalQuestionId: number
  ): Promise<QuestionnaireQuestion> {
    await checkDemoAction();
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

  // Question rating scale associations
  async updateQuestionRatingScales(
    questionId: number,
    ratingScaleAssociations: Array<{
      ratingScaleId: number;
      description: string;
    }>
  ): Promise<void> {
    await checkDemoAction();
    
    // Get questionnaire_id via step and section to check if it's in use
    const { data: question, error: fetchError } = await this.supabase
      .from("questionnaire_questions")
      .select("questionnaire_steps!inner(questionnaire_sections!inner(questionnaire_id))")
      .eq("id", questionId)
      .single();
    
    if (fetchError) throw fetchError;
    await this.checkQuestionnaireNotInUse(question.questionnaire_steps.questionnaire_sections.questionnaire_id);
    
    // First, delete existing associations
    await this.supabase
      .from("questionnaire_question_rating_scales")
      .delete()
      .eq("questionnaire_question_id", questionId);

    // Then, insert new associations
    if (ratingScaleAssociations.length > 0) {
      const { error } = await this.supabase
        .from("questionnaire_question_rating_scales")
        .insert(
          ratingScaleAssociations.map((association) => ({
            questionnaire_question_id: questionId,
            questionnaire_rating_scale_id: association.ratingScaleId,
            description: association.description,
          }))
        );

      if (error) throw error;
    }
  }

  // Bulk insert question rating scale associations for multiple questions
  async bulkInsertQuestionRatingScales(
    questionRatingScales: Array<{
      questionId: number;
      ratingScaleId: number;
      description: string;
    }>
  ): Promise<void> {
    await checkDemoAction();
    if (questionRatingScales.length === 0) return;

    const { error } = await this.supabase
      .from("questionnaire_question_rating_scales")
      .insert(
        questionRatingScales.map((association) => ({
          questionnaire_question_id: association.questionId,
          questionnaire_rating_scale_id: association.ratingScaleId,
          description: association.description,
        }))
      );

    if (error) throw error;
  }

  // Question role associations
  async updateQuestionRoles(
    questionId: number,
    roleIds: number[]
  ): Promise<void> {
    await checkDemoAction();
    
    // Get questionnaire_id via step and section to check if it's in use
    const { data: question, error: fetchError } = await this.supabase
      .from("questionnaire_questions")
      .select("questionnaire_steps!inner(questionnaire_sections!inner(questionnaire_id))")
      .eq("id", questionId)
      .single();
    
    if (fetchError) throw fetchError;
    await this.checkQuestionnaireNotInUse(question.questionnaire_steps.questionnaire_sections.questionnaire_id);
    
    // First, delete existing associations
    await this.supabase
      .from("questionnaire_question_roles")
      .delete()
      .eq("questionnaire_question_id", questionId);

    // Then, insert new associations
    if (roleIds.length > 0) {
      const { error } = await this.supabase
        .from("questionnaire_question_roles")
        .insert(
          roleIds.map((roleId) => ({
            questionnaire_question_id: questionId,
            shared_role_id: roleId,
          }))
        );

      if (error) throw error;
    }
  }

  // Question Rating Scale operations
  async createQuestionRatingScale(
    data: CreateQuestionnaireQuestionRatingScaleData
  ): Promise<QuestionnaireQuestionRatingScale> {
    await checkDemoAction();
    const { data: result, error } = await this.supabase
      .from("questionnaire_question_rating_scales")
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async updateQuestionRatingScale(
    id: number,
    updates: UpdateQuestionnaireQuestionRatingScaleData
  ): Promise<QuestionnaireQuestionRatingScale> {
    await checkDemoAction();
    const { data, error } = await this.supabase
      .from("questionnaire_question_rating_scales")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteQuestionRatingScale(id: number): Promise<void> {
    await checkDemoAction();
    const { error } = await this.supabase
      .from("questionnaire_question_rating_scales")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  }

  // Questionnaire rating scale operations
  async createRatingScale(
    ratingData: CreateQuestionnaireRatingScaleData
  ): Promise<QuestionnaireRatingScale> {
    await checkDemoAction();
    await this.checkQuestionnaireNotInUse(ratingData.questionnaire_id);
    
    const { data, error } = await this.supabase
      .from("questionnaire_rating_scales")
      .insert([ratingData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateRatingScale(
    id: number,
    updates: UpdateQuestionnaireRatingScaleData
  ): Promise<QuestionnaireRatingScale> {
    await checkDemoAction();
    
    // Get questionnaire_id to check if it's in use
    const { data: ratingScale, error: fetchError } = await this.supabase
      .from("questionnaire_rating_scales")
      .select("questionnaire_id")
      .eq("id", id)
      .single();
    
    if (fetchError) throw fetchError;
    await this.checkQuestionnaireNotInUse(ratingScale.questionnaire_id);
    
    const { data, error } = await this.supabase
      .from("questionnaire_rating_scales")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteRatingScale(id: number): Promise<void> {
    await checkDemoAction();
    
    // Get questionnaire_id to check if it's in use
    const { data: ratingScale, error: fetchError } = await this.supabase
      .from("questionnaire_rating_scales")
      .select("questionnaire_id")
      .eq("id", id)
      .single();
    
    if (fetchError) throw fetchError;
    await this.checkQuestionnaireNotInUse(ratingScale.questionnaire_id);
    
    const { error } = await this.supabase
      .from("questionnaire_rating_scales")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  }

  // Role operations
  async getRoles(): Promise<Role[]> {
    return rolesService.getRoles({
      includeSharedRole: true,
      includeCompany: true,
    });
  }

  // Share q to another user (duplicate to their account)
  async shareQuestionnaireToUserId(
    questionnaireId: number,
    targetUserId: string
  ): Promise<Questionnaire> {
    // Get the original questionnaire with all its structure
    const originalQuestionnaire =
      await this.getQuestionnaireById(questionnaireId);
    if (!originalQuestionnaire) throw new Error("Questionnaire not found");

    // Create new questionnaire for the target user
    const { data: newQuestionnaire, error: questionnaireError } =
      await this.supabase
        .from("questionnaires")
        .insert([
          {
            name: `${originalQuestionnaire.name} (Shared)`,
            description: originalQuestionnaire.description,
            guidelines: originalQuestionnaire.guidelines,
            status: "draft",
            created_by: targetUserId, // Assign to target user
          },
        ])
        .select()
        .single();

    if (questionnaireError) throw questionnaireError;

    // Duplicate rating scales for target user
    if (originalQuestionnaire.rating_scales.length > 0) {
      const { error: ratingError } = await this.supabase
        .from("questionnaire_rating_scales")
        .insert(
          originalQuestionnaire.rating_scales.map((scale) => ({
            name: scale.name,
            description: scale.description,
            order_index: scale.order_index,
            value: scale.value,
            questionnaire_id: newQuestionnaire.id,
            created_by: targetUserId, // Assign to target user
          }))
        );

      if (ratingError) throw ratingError;
    }

    // Duplicate sections, steps, and questions for target user
    for (const section of originalQuestionnaire.sections) {
      const { data: newSection, error: sectionError } = await this.supabase
        .from("questionnaire_sections")
        .insert([
          {
            questionnaire_id: newQuestionnaire.id,
            title: section.title,
            order_index: section.order_index,
            expanded: section.expanded,
            created_by: targetUserId, // Assign to target user
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
              created_by: targetUserId, // Assign to target user
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
                  created_by: targetUserId, // Assign to target user
                },
              ])
              .select()
              .single();

          if (questionError) throw questionError;
        }
      }
    }

    return newQuestionnaire;
  }

  // Check questionnaire usage in assessments, interviews, and programs
  async checkQuestionnaireUsage(questionnaireId: number) {
    try {
      // Check assessments using this questionnaire
      const { data: assessments, error: assessmentError } = await this.supabase
        .from("assessments")
        .select("id, name")
        .eq("questionnaire_id", questionnaireId);

      if (assessmentError) throw assessmentError;

      // Check programs using this questionnaire
      const { data: programs, error: programError } = await this.supabase
        .from("programs")
        .select("id, name")
        .eq("questionnaire_id", questionnaireId)
        .eq("is_deleted", false);

      if (programError) throw programError;

      // Get interview counts for each assessment
      const assessmentIds = assessments?.map((a) => a.id) || [];
      let totalInterviews = 0;

      if (assessmentIds.length > 0) {
        const { count, error: interviewError } = await this.supabase
          .from("interviews")
          .select("*", { count: "exact", head: true })
          .in("assessment_id", assessmentIds);

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
}

export const questionnaireService = new QuestionnaireService();
