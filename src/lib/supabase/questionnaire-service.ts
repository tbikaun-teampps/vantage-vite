import { createClient } from "./client";
import { useAuthStore } from "@/stores/auth-store";
import type {
  Questionnaire,
  QuestionnaireSection,
  QuestionnaireStep,
  QuestionnaireQuestion,
  QuestionnaireRatingScale,
  QuestionnaireQuestionRatingScale,
  QuestionnaireWithCounts,
  QuestionnaireWithStructure,
  Role
} from "@/types/questionnaire";

interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export class QuestionnaireService {
  private supabase = createClient();

  // Questionnaire CRUD operations
  async getQuestionnaires(): Promise<QuestionnaireWithCounts[]> {
    try {
      // Get current user and demo mode status with fallbacks
      const { data: authData, error: authError } =
        await this.supabase.auth.getUser();

      let query = this.supabase.from("questionnaires").select("*");

      // Apply demo mode filtering only if we have auth data
      if (!authError && authData?.user) {
        const authStore = useAuthStore.getState();
        const isDemoMode = authStore?.isDemoMode ?? false;

        if (isDemoMode) {
          // Demo users only see demo questionnaires
          query = query.eq("is_demo", true);
        } else {
          // Get user's own questionnaires
          const ownQuestionnaires = await this.supabase
            .from("questionnaires")
            .select("id")
            .eq("is_demo", false)
            .eq("created_by", authData.user.id);

          const allQuestionnaireIds =
            ownQuestionnaires.data?.map((q) => q.id) || [];

          if (allQuestionnaireIds.length > 0) {
            query = query.in("id", allQuestionnaireIds);
          } else {
            // No accessible questionnaires, return empty result immediately
            return [];
          }
        }
      }
      // If no auth or auth error, return all questionnaires (will be filtered by RLS)

      const { data: questionnaires, error } = await query.order("updated_at", {
        ascending: false,
      });

      if (error) throw error;

      // Calculate counts and format data
      return questionnaires.map((questionnaire) => ({
        ...questionnaire,
        section_count: questionnaire.questionnaire_sections?.length || 0,
        question_count:
          questionnaire.questionnaire_sections?.reduce(
            (total, section) =>
              total +
              (section.questionnaire_steps?.reduce(
                (stepTotal, step) =>
                  stepTotal + (step.questionnaire_questions?.length || 0),
                0
              ) || 0),
            0
          ) || 0,
        last_modified: this.formatLastModified(questionnaire.updated_at),
        created_by_email: questionnaire.created_by, // You might want to join with auth.users for email
      }));
    } catch (error) {
      console.error("Error in getQuestionnaires:", error);
      // Return empty array on error to prevent page crashes
      return [];
    }
  }

  async getQuestionnaireById(
    id: string
  ): Promise<QuestionnaireWithStructure | null> {
    // Get questionnaire with full structure
    const { data: questionnaire, error: questionnaireError } =
      await this.supabase
        .from("questionnaires")
        .select("*")
        .eq("id", id)
        .single();

    if (questionnaireError) throw questionnaireError;
    if (!questionnaire) return null;

    // Get sections with steps and questions
    const { data: sections, error: sectionsError } = await this.supabase
      .from("questionnaire_sections")
      .select(
        `
        *,
        questionnaire_steps(
          *,
          questionnaire_questions(
            *,
            questionnaire_question_rating_scales(
              *,
              rating_scale:questionnaire_rating_scales(*)
            ),
            questionnaire_question_roles(
              *,
              role:shared_roles(*)
            )
          )
        )
      `
      )
      .eq("questionnaire_id", id)
      .order("order_index");

    if (sectionsError) throw sectionsError;

    // Get rating scales
    const { data: ratingScales, error: ratingError } = await this.supabase
      .from("questionnaire_rating_scales")
      .select("*")
      .eq("questionnaire_id", id)
      .order("order_index");

    if (ratingError) throw ratingError;

    // Transform the data structure
    const transformedSections =
      sections
        ?.map((section) => ({
          ...section,
          steps:
            section.questionnaire_steps
              ?.map((step) => ({
                ...step,
                questions:
                  step.questionnaire_questions?.map((question) => ({
                    ...question,
                    question_rating_scales:
                      question.questionnaire_question_rating_scales?.map(
                        (qrs) => ({
                          ...qrs,
                          rating_scale: qrs.rating_scale,
                        })
                      ) || [],
                    question_roles:
                      question.questionnaire_question_roles?.map((qar) => ({
                        ...qar,
                        role: qar.role,
                      })) || [],
                  })) || [],
              }))
              ?.sort((a, b) => a.order_index - b.order_index) || [],
        }))
        ?.sort((a, b) => a.order_index - b.order_index) || [];

    return {
      ...questionnaire,
      sections: transformedSections,
      rating_scales: ratingScales || [],
    };
  }

  async createQuestionnaire(
    questionnaireData: Omit<Questionnaire, "id" | "created_at" | "updated_at">
  ): Promise<Questionnaire> {
    const { data, error } = await this.supabase
      .from("questionnaires")
      .insert([questionnaireData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateQuestionnaire(
    id: string,
    updates: Partial<Questionnaire>
  ): Promise<Questionnaire> {
    const { data, error } = await this.supabase
      .from("questionnaires")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteQuestionnaire(id: string): Promise<void> {
    // Delete will cascade to related tables due to foreign key constraints
    const { error } = await this.supabase
      .from("questionnaires")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async cleanupFailedQuestionnaire(id: string): Promise<void> {
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

  async duplicateQuestionnaire(originalId: string): Promise<Questionnaire> {
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
            created_by: originalQuestionnaire.created_by,
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
            created_by: scale.created_by,
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
            created_by: section.created_by,
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
              created_by: step.created_by,
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
                  created_by: question.created_by,
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
                        created_by: originalQuestionnaire.created_by,
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
    sectionData: Omit<QuestionnaireSection, "id" | "created_at" | "updated_at">
  ): Promise<QuestionnaireSection> {
    const { data, error } = await this.supabase
      .from("questionnaire_sections")
      .insert([sectionData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSection(
    id: string,
    updates: Partial<QuestionnaireSection>
  ): Promise<QuestionnaireSection> {
    const { data, error } = await this.supabase
      .from("questionnaire_sections")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSection(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("questionnaire_sections")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  // Step operations
  async createStep(
    stepData: Omit<QuestionnaireStep, "id" | "created_at" | "updated_at">
  ): Promise<QuestionnaireStep> {
    const { data, error } = await this.supabase
      .from("questionnaire_steps")
      .insert([stepData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateStep(
    id: string,
    updates: Partial<QuestionnaireStep>
  ): Promise<QuestionnaireStep> {
    const { data, error } = await this.supabase
      .from("questionnaire_steps")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteStep(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("questionnaire_steps")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  // Question operations
  async createQuestion(
    questionData: Omit<
      QuestionnaireQuestion,
      "id" | "created_at" | "updated_at"
    >
  ): Promise<QuestionnaireQuestion> {
    const { data, error } = await this.supabase
      .from("questionnaire_questions")
      .insert([questionData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateQuestion(
    id: string,
    updates: Partial<QuestionnaireQuestion>
  ): Promise<QuestionnaireQuestion> {
    const { data, error } = await this.supabase
      .from("questionnaire_questions")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteQuestion(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("questionnaire_questions")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async duplicateQuestion(originalQuestionId: string): Promise<QuestionnaireQuestion> {
    // First, get the original question with all its data
    const { data: originalQuestion, error: questionError } = await this.supabase
      .from("questionnaire_questions")
      .select(`
        *,
        questionnaire_question_rating_scales(
          questionnaire_rating_scale_id,
          description
        ),
        questionnaire_question_roles(
          shared_role_id
        )
      `)
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
      created_by: await this.getCurrentUserId(),
    };

    const { data: newQuestion, error: createError } = await this.supabase
      .from("questionnaire_questions")
      .insert([newQuestionData])
      .select()
      .single();

    if (createError) throw createError;

    // Duplicate rating scale associations if any exist
    if (originalQuestion.questionnaire_question_rating_scales?.length > 0) {
      const ratingScaleAssociations = originalQuestion.questionnaire_question_rating_scales.map((rs: any) => ({
        questionnaire_question_id: newQuestion.id,
        questionnaire_rating_scale_id: rs.questionnaire_rating_scale_id,
        description: rs.description,
        created_by: newQuestion.created_by,
      }));

      const { error: ratingScaleError } = await this.supabase
        .from("questionnaire_question_rating_scales")
        .insert(ratingScaleAssociations);

      if (ratingScaleError) throw ratingScaleError;
    }

    // Duplicate role associations if any exist
    if (originalQuestion.questionnaire_question_roles?.length > 0) {
      const roleAssociations = originalQuestion.questionnaire_question_roles.map((qr: any) => ({
        questionnaire_question_id: newQuestion.id,
        shared_role_id: qr.shared_role_id,
        created_by: newQuestion.created_by,
      }));

      const { error: roleError } = await this.supabase
        .from("questionnaire_question_roles")
        .insert(roleAssociations);

      if (roleError) throw roleError;
    }

    // Fetch the complete question with all associations to return
    const { data: completeQuestion, error: fetchError } = await this.supabase
      .from("questionnaire_questions")
      .select(`
        *,
        questionnaire_question_rating_scales(
          *,
          rating_scale:questionnaire_rating_scales(*)
        ),
        questionnaire_question_roles(
          *,
          role:shared_roles(*)
        )
      `)
      .eq("id", newQuestion.id)
      .single();

    if (fetchError) throw fetchError;

    // Transform to match the expected format
    const transformedQuestion = {
      ...completeQuestion,
      question_rating_scales: completeQuestion.questionnaire_question_rating_scales?.map((qrs: any) => ({
        ...qrs,
        rating_scale: qrs.rating_scale,
      })) || [],
      question_roles: completeQuestion.questionnaire_question_roles?.map((qar: any) => ({
        ...qar,
        role: qar.role,
      })) || [],
    };

    return transformedQuestion;
  }

  // Question rating scale associations
  async updateQuestionRatingScales(
    questionId: string,
    ratingScaleAssociations: Array<{
      ratingScaleId: string;
      description: string;
    }>,
    createdBy: string
  ): Promise<void> {
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
            created_by: createdBy,
          }))
        );

      if (error) throw error;
    }
  }

  // Bulk insert question rating scale associations for multiple questions
  async bulkInsertQuestionRatingScales(
    questionRatingScales: Array<{
      questionId: string;
      ratingScaleId: string;
      description: string;
      createdBy: string;
    }>
  ): Promise<void> {
    if (questionRatingScales.length === 0) return;

    const { error } = await this.supabase
      .from("questionnaire_question_rating_scales")
      .insert(
        questionRatingScales.map((association) => ({
          questionnaire_question_id: association.questionId,
          questionnaire_rating_scale_id: association.ratingScaleId,
          description: association.description,
          created_by: association.createdBy,
        }))
      );

    if (error) throw error;
  }

  // Question role associations
  async updateQuestionRoles(
    questionId: string,
    roleIds: string[],
    createdBy: string
  ): Promise<void> {
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
            created_by: createdBy,
          }))
        );

      if (error) throw error;
    }
  }

  // Question Rating Scale operations
  async createQuestionRatingScale(
    data: Omit<
      QuestionnaireQuestionRatingScale,
      "id" | "created_at" | "updated_at"
    >
  ): Promise<QuestionnaireQuestionRatingScale> {
    const { data: result, error } = await this.supabase
      .from("questionnaire_question_rating_scales")
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async updateQuestionRatingScale(
    id: string,
    updates: Partial<QuestionnaireQuestionRatingScale>
  ): Promise<QuestionnaireQuestionRatingScale> {
    const { data, error } = await this.supabase
      .from("questionnaire_question_rating_scales")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteQuestionRatingScale(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("questionnaire_question_rating_scales")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  // Rating scale operations
  async createRatingScale(
    ratingData: Omit<
      QuestionnaireRatingScale,
      "id" | "created_at" | "updated_at"
    >
  ): Promise<QuestionnaireRatingScale> {
    const { data, error } = await this.supabase
      .from("questionnaire_rating_scales")
      .insert([ratingData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateRatingScale(
    id: string,
    updates: Partial<QuestionnaireRatingScale>
  ): Promise<QuestionnaireRatingScale> {
    const { data, error } = await this.supabase
      .from("questionnaire_rating_scales")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteRatingScale(id: string): Promise<void> {
    // First delete all question-rating scale associations
    const { error: associationsError } = await this.supabase
      .from("questionnaire_question_rating_scales")
      .delete()
      .eq("questionnaire_rating_scale_id", id);

    if (associationsError) throw associationsError;

    // Then delete the rating scale itself
    const { error } = await this.supabase
      .from("questionnaire_rating_scales")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  // Role operations
  async getRoles(): Promise<Role[]> {
    try {
      // Get current user and demo mode status with fallbacks
      const { data: authData, error: authError } =
        await this.supabase.auth.getUser();

      let query = this.supabase
        .from("roles")
        .select(`
          *,
          shared_role:shared_roles(
            id,
            name,
            description
          ),
          company:companies!inner(id, name, deleted_at, is_demo, created_by)
        `)
        .is("company.deleted_at", null)
        .eq("is_active", true);

      // Apply demo mode filtering only if we have auth data
      if (!authError && authData?.user) {
        const authStore = useAuthStore.getState();
        const isDemoMode = authStore?.isDemoMode ?? false;

        if (isDemoMode) {
          // Demo users only see roles from demo companies
          query = query.eq("company.is_demo", true);
        } else {
          // Regular users see roles from their own companies (non-demo) and demo companies
          query = query.or(
            `and(company.is_demo.eq.false,company.created_by.eq.${authData.user.id}),company.is_demo.eq.true`
          );
        }
      }
      // If no auth or auth error, return all roles (will be filtered by RLS)

      const { data, error } = await query.order("shared_role_id");

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error in getRoles:", error);
      // Return empty array on error to prevent page crashes
      return [];
    }
  }

  // Utility functions
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

  // Get current user ID (you might want to move this to a separate auth service)
  async getCurrentUserId(): Promise<string> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) {
      throw new Error("Authentication required");
    }
    return user.id;
  }

  async getUsers(currentUserId: string): Promise<User[]> {
    try {
      // Option 1: Use RPC function (recommended)
      const { data: users, error } = await this.supabase.rpc(
        "get_users_for_sharing"
      );

      if (error) {
        console.error(
          "RPC function failed, falling back to direct query:",
          error
        );

        // Option 2: Direct query to profiles table (fallback)
        const { data: profileUsers, error: profileError } = await this.supabase
          .from("profiles")
          .select("id, email, full_name, avatar_url")
          .neq("id", currentUserId)
          .order("full_name", { ascending: true });

        if (profileError) throw profileError;
        return profileUsers || [];
      }

      // Filter out current user from RPC results (double-check)
      return (users || []).filter((user: User) => user.id !== currentUserId);
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Failed to load users");
    }
  }

  // Share q to another user (duplicate to their account)
  async shareQuestionnaireToUserId(
    questionnaireId: string,
    targetUserId: string
  ): Promise<Questionnaire> {
    // Get the original questionnaire with all its structure
    const originalQuestionnaire = await this.getQuestionnaireById(
      questionnaireId
    );
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

  // Check questionnaire usage in assessments and interviews
  async checkQuestionnaireUsage(questionnaireId: string) {
    try {
      // Check assessments using this questionnaire
      const { data: assessments, error: assessmentError } = await this.supabase
        .from("assessments")
        .select("id, name")
        .eq("questionnaire_id", questionnaireId);

      if (assessmentError) throw assessmentError;

      // Get interview counts for each assessment
      const assessmentIds = assessments?.map(a => a.id) || [];
      let totalInterviews = 0;
      
      if (assessmentIds.length > 0) {
        const { count, error: interviewError } = await this.supabase
          .from("interviews")
          .select("*", { count: "exact", head: true })
          .in("assessment_id", assessmentIds);

        if (interviewError) throw interviewError;
        totalInterviews = count || 0;
      }

      return {
        assessmentCount: assessments?.length || 0,
        assessments: assessments || [],
        interviewCount: totalInterviews,
        isInUse: (assessments?.length || 0) > 0,
      };
    } catch (error) {
      console.error("Error checking questionnaire usage:", error);
      throw error;
    }
  }
}

export const questionnaireService = new QuestionnaireService();
