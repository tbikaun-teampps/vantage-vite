import { createClient } from "./client";
import type { AssessmentProgress } from "@/types/assessment";

export type GroupByDimension =
  | "business_unit"
  | "region"
  | "site"
  | "asset_group"
  | "questionnaire_section"
  | "questionnaire_step"
  | "questionnaire_question"
  | "role";

export class AnalyticsService {
  private supabase = createClient();
  // Assessment Progress Analytics
  async getAssessmentProgress(
    assessmentId: number
  ): Promise<AssessmentProgress> {
    try {
      // Get assessment with interviews and questionnaire structure
      const query = this.supabase
        .from("assessments")
        .select(
          `
          *,
          company:companies(id, is_demo, created_by),
          interviews(
            id,
            status,
            interview_responses(
              id,
              rating_score,
              interview_response_roles(id)
            )
          ),
          questionnaire:questionnaires(
            questionnaire_sections(
              questionnaire_steps(
                questionnaire_questions(id)
              )
            )
          )
        `
        )
        .eq("id", assessmentId)
        .eq("is_deleted", false)
        .eq("interviews.is_deleted", false);
      const { data: assessment, error: assessmentError } = await query.single();

      if (assessmentError) throw assessmentError;
      if (!assessment) throw new Error("Assessment not found");

      const totalInterviews = assessment.interviews?.length || 0;
      const completedInterviews =
        assessment.interviews?.filter((i) => i.status === "completed").length ||
        0;

      // Calculate total questions from questionnaire structure
      const totalQuestions =
        assessment.questionnaire?.questionnaire_sections?.reduce(
          (total, section) =>
            total +
            (section.questionnaire_steps?.reduce(
              (stepTotal, step) =>
                stepTotal + (step.questionnaire_questions?.length || 0),
              0
            ) || 0),
          0
        ) || 0;

      // Calculate answered questions (only count responses with rating_score and roles)
      const answeredQuestions =
        assessment.interviews?.reduce(
          (total, interview) =>
            total +
            (interview.interview_responses?.filter(
              (response) =>
                response.rating_score !== null &&
                response.interview_response_roles &&
                response.interview_response_roles.length > 0
            ).length || 0),
          0
        ) || 0;

      // Calculate average score (only for responses with rating_score and roles)
      const { data: responses, error: responsesError } = await this.supabase
        .from("interview_responses")
        .select(
          `
          rating_score,
          interview_response_roles(id)
        `
        )
        .in("interview_id", assessment.interviews?.map((i) => i.id) || [])
        .eq("is_deleted", false)
        .not("rating_score", "is", null);

      if (responsesError) throw responsesError;

      // Filter responses to only include those with roles assigned
      const validResponses =
        responses?.filter(
          (r) =>
            r.interview_response_roles && r.interview_response_roles.length > 0
        ) || [];

      const allScores = validResponses.map((r) => r.rating_score);
      const averageScore =
        allScores.length > 0
          ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length
          : 0;

      const completionPercentage =
        totalQuestions > 0 && totalInterviews > 0
          ? (answeredQuestions / (totalInterviews * totalQuestions)) * 100
          : 0;

      return {
        assessment_id: assessmentId,
        total_interviews: totalInterviews,
        completed_interviews: completedInterviews,
        total_questions: totalQuestions,
        answered_questions: answeredQuestions,
        average_score: Math.round(averageScore * 100) / 100,
        completion_percentage: Math.round(completionPercentage * 100) / 100,
      };
    } catch (error) {
      console.error("Error in getAssessmentProgress:", error);
      throw error;
    }
  }
  async getAssessmentMetrics(assessmentId: string) {
    try {
      // 1. Get assessment with full hierarchy in one query
      const query = this.supabase
        .from("assessments")
        .select(
          `
          id, name, description, status, questionnaire_id, is_deleted,
          companies(id, name, code, is_demo, created_by, is_deleted),
          business_units(id, name, code, is_deleted),
          regions(id, name, code, is_deleted),
          sites(id, name, code, is_deleted),
          asset_groups(id, name, code, is_deleted)
        `
        )
        .eq("id", assessmentId)
        .eq("is_deleted", false)
        .eq("companies.is_deleted", false)
        .eq("business_units.is_deleted", false)
        .eq("regions.is_deleted", false)
        .eq("sites.is_deleted", false)
        .eq("asset_groups.is_deleted", false);
      const { data: assessment, error: assessmentError } = await query.single();

      if (assessmentError) throw assessmentError;

      // 2. Get questionnaire structure in one query
      const { data: questionnaire, error: questionnaireError } =
        await this.supabase
          .from("questionnaires")
          .select(
            `
          id, name, description, status, is_deleted,
          questionnaire_sections(
            id, title, order_index, is_deleted,
            questionnaire_steps(
              id, title, order_index, is_deleted,
              questionnaire_questions(
                id, title, question_text, context, order_index, is_deleted
              )
            )
          )
        `
          )
          .eq("id", assessment.questionnaire_id)
          .eq("is_deleted", false)
          .eq("questionnaire_sections.is_deleted", false)
          .eq("questionnaire_sections.questionnaire_steps.is_deleted", false)
          .eq(
            "questionnaire_sections.questionnaire_steps.questionnaire_questions.is_deleted",
            false
          )
          .single();

      if (questionnaireError) throw questionnaireError;

      // 3. Get all interviews and responses in one query
      // Filters out responses without roles via !inner and null rating_scores via `not`.
      const { data: interviews, error: interviewsError } = await this.supabase
        .from("interviews")
        .select(
          `
          id, name, status, notes, interviewer_id, is_deleted,
          interview_responses(
            id, rating_score, comments, answered_at, questionnaire_question_id, is_deleted,
            interview_response_roles(
              role_id,
              roles!inner(id, level, department, shared_role_id, is_deleted, 
              shared_roles!inner(id, name, is_deleted))
            )
          )
        `
        )
        .eq("assessment_id", assessmentId)
        .eq("is_deleted", false)
        .eq("interview_responses.is_deleted", false)
        .not("interview_responses.rating_score", "is", null)
        .eq(
          "interview_responses.interview_response_roles.roles.is_deleted",
          false
        )
        .eq(
          "interview_responses.interview_response_roles.roles.shared_roles.is_deleted",
          false
        );

      console.log("interviews data:", interviews);

      if (interviewsError) throw interviewsError;

      // 4. Process everything and compute metrics
      return this.processAssessmentData({
        assessment,
        questionnaire,
        interviews,
      });
    } catch (error) {
      console.error("Error fetching assessment metrics:", error);
      throw error;
    }
  }

  processAssessmentData({ assessment, questionnaire, interviews }) {
    // Build question lookup with hierarchy context
    const questions = new Map();
    const sections = new Map();
    const steps = new Map();

    questionnaire.questionnaire_sections.forEach((section) => {
      sections.set(section.id, section);

      section.questionnaire_steps.forEach((step) => {
        steps.set(step.id, { ...step, section });

        step.questionnaire_questions.forEach((question) => {
          questions.set(question.id, {
            ...question,
            step: step.title,
            section: section.title,
            step_order: step.order_index,
            section_order: section.order_index,
          });
        });
      });
    });

    // Flatten all responses with context
    const allResponses = [];
    interviews.forEach((interview) => {
      interview.interview_responses.forEach((response) => {
        const question = questions.get(response.questionnaire_question_id);

        // Each response can have multiple roles
        response.interview_response_roles.forEach((roleAssignment) => {
          allResponses.push({
            response_id: response.id,
            interview_id: interview.id,
            interview_name: interview.name,
            interview_status: interview.status,
            question_id: response.questionnaire_question_id,
            question,
            rating_score: response.rating_score,
            comments: response.comments,
            answered_at: response.answered_at,
            role: roleAssignment.roles,
          });
        });
      });
    });

    // Build hierarchy structure with metrics
    const hierarchy = this.buildHierarchyMetrics(
      assessment,
      allResponses,
      questions,
      interviews
    );

    // Build question breakdown
    const questionBreakdown = this.buildQuestionBreakdown(
      allResponses,
      questions,
      assessment
    );

    // Build role breakdown
    const roleBreakdown = this.buildRoleBreakdown(allResponses, assessment);

    return {
      assessment: {
        id: assessment.id,
        name: assessment.name,
        status: assessment.status,
      },
      questionnaire: {
        id: questionnaire.id,
        name: questionnaire.name,
        description: questionnaire.description,
        total_questions: questions.size,
        total_sections: sections.size,
        total_steps: steps.size,
      },
      hierarchy,
      question_breakdown: questionBreakdown,
      role_breakdown: roleBreakdown,
      summary: this.calculateSummaryMetrics(
        allResponses,
        interviews,
        questions
      ),
      raw_responses: allResponses, // Add raw response data for cross-dimensional analysis
      generated_at: new Date().toISOString(),
    };
  }

  buildHierarchyMetrics(assessment, allResponses, questions, interviews) {
    const hierarchy = {};

    // Define hierarchy levels with their data
    const levels = [
      { key: "company", data: assessment.companies, parent: null },
      {
        key: "business_unit",
        data: assessment.business_units,
        parent: "company",
      },
      { key: "region", data: assessment.regions, parent: "business_unit" },
      { key: "site", data: assessment.sites, parent: "region" },
      { key: "asset_group", data: assessment.asset_groups, parent: "site" },
    ];

    // For this assessment, all responses belong to the same hierarchy path
    levels.forEach((level) => {
      if (level.data) {
        hierarchy[level.key] = {
          id: level.data.id,
          name: level.data.name,
          code: level.data.code,
          parent_type: level.parent,
          metrics: this.calculateMetricsForLevel(
            allResponses,
            interviews,
            questions
          ),
        };
      }
    });

    return hierarchy;
  }

  buildQuestionBreakdown(allResponses, questions, assessment) {
    const breakdown = {};

    questions.forEach((question, questionId) => {
      const questionResponses = allResponses.filter(
        (r) => r.question_id === questionId
      );

      breakdown[questionId] = {
        id: questionId,
        title: question.title,
        question_text: question.question_text,
        section: question.section,
        step: question.step,
        section_order: question.section_order,
        step_order: question.step_order,
        question_order: question.order_index,
        metrics: this.calculateQuestionMetrics(questionResponses),
      };
    });

    return breakdown;
  }

  buildRoleBreakdown(allResponses, assessment) {
    const roleGroups = {};

    allResponses.forEach((response) => {
      if (response.role) {
        const roleId = response.role.id;
        if (!roleGroups[roleId]) {
          roleGroups[roleId] = {
            id: response.role.id,
            name: response.role.shared_roles.name || "Unknown",
            level: response.role.level,
            department: response.role.department,
            responses: [],
          };
        }
        roleGroups[roleId].responses.push(response);
      }
    });

    // Calculate metrics for each role
    Object.keys(roleGroups).forEach((roleId) => {
      const role = roleGroups[roleId];
      role.metrics = this.calculateQuestionMetrics(role.responses);
      delete role.responses; // Clean up
    });

    return roleGroups;
  }

  calculateMetricsForLevel(responses, interviews, questions) {
    const validResponses = responses.filter((r) => r.rating_score !== null);
    const totalQuestions = questions.size;
    const totalInterviews = interviews.length;
    const totalPossible = totalQuestions * totalInterviews;

    // Score distribution
    const scoreDistribution = {};
    validResponses.forEach((response) => {
      const score = response.rating_score;
      scoreDistribution[score] = (scoreDistribution[score] || 0) + 1;
    });

    return {
      average_score:
        validResponses.length > 0
          ? +(
              validResponses.reduce((sum, r) => sum + r.rating_score, 0) /
              validResponses.length
            ).toFixed(2)
          : 0,
      completion_rate:
        totalPossible > 0
          ? +((validResponses.length / totalPossible) * 100).toFixed(2)
          : 0,
      total_responses: validResponses.length,
      total_possible: totalPossible,
      total_interviews: totalInterviews,
      response_rate_per_interview:
        totalInterviews > 0
          ? +(validResponses.length / totalInterviews).toFixed(2)
          : 0,
      score_distribution: scoreDistribution,
    };
  }

  calculateQuestionMetrics(responses) {
    const validResponses = responses.filter((r) => r.rating_score !== null);
    const uniqueInterviews = new Set(responses.map((r) => r.interview_id)).size;

    // Score distribution for this question
    const scoreDistribution = {};
    validResponses.forEach((response) => {
      const score = response.rating_score;
      scoreDistribution[score] = (scoreDistribution[score] || 0) + 1;
    });

    return {
      average_score:
        validResponses.length > 0
          ? +(
              validResponses.reduce((sum, r) => sum + r.rating_score, 0) /
              validResponses.length
            ).toFixed(2)
          : 0,
      completion_rate:
        uniqueInterviews > 0
          ? +((validResponses.length / uniqueInterviews) * 100).toFixed(2)
          : 0,
      total_responses: validResponses.length,
      unique_interviews: uniqueInterviews,
      score_distribution: scoreDistribution,
      comments: validResponses
        .filter((r) => r.comments && r.comments.trim())
        .map((r) => ({
          comment: r.comments,
          score: r.rating_score,
          interview: r.interview_name,
        })),
    };
  }

  calculateSummaryMetrics(allResponses, interviews, questions) {
    const validResponses = allResponses.filter((r) => r.rating_score !== null);

    return {
      total_interviews: interviews.length,
      completed_interviews: interviews.filter((i) => i.status === "completed")
        .length,
      total_questions: questions.size,
      total_possible_responses: interviews.length * questions.size,
      total_actual_responses: validResponses.length,
      overall_completion_rate:
        interviews.length * questions.size > 0
          ? +(
              (validResponses.length / (interviews.length * questions.size)) *
              100
            ).toFixed(2)
          : 0,
      overall_average_score:
        validResponses.length > 0
          ? +(
              validResponses.reduce((sum, r) => sum + r.rating_score, 0) /
              validResponses.length
            ).toFixed(2)
          : 0,
      interviews_completion_rate:
        interviews.length > 0
          ? +(
              (interviews.filter((i) => i.status === "completed").length /
                interviews.length) *
              100
            ).toFixed(2)
          : 0,
    };
  }

  // Helper method to group metrics by any field
  groupMetricsBy(responses, groupByField) {
    const groups = {};

    responses.forEach((response) => {
      const groupValue = response[groupByField];
      if (groupValue) {
        if (!groups[groupValue]) {
          groups[groupValue] = [];
        }
        groups[groupValue].push(response);
      }
    });

    // Calculate metrics for each group
    Object.keys(groups).forEach((groupKey) => {
      const groupResponses = groups[groupKey];
      groups[groupKey] = {
        responses: groupResponses,
        metrics: this.calculateQuestionMetrics(groupResponses),
      };
    });

    return groups;
  }

  // Helper method to filter responses by hierarchy level
  filterByHierarchy(responses, level, entityId) {
    // Since all responses in this assessment belong to the same hierarchy,
    // for a PoC we just return all responses
    // In a real multi-hierarchy system, you'd filter based on the level
    return responses;
  }

  // Get site data for map visualization
  async getSiteMapData(filters?: {
    assessmentId?: string;
    questionnaireId?: string;
  }) {
    try {
      let query = this.supabase
        .from("sites")
        .select(
          `
          id,
          name,
          lat,
          lng,
          code,
          regions!inner (
            id,
            name,
            business_units!inner (
              id,
              name,
              companies!inner (
                id,
                is_deleted,
                is_demo,
                created_by
              )
            )
          ),
          assessments (
            id,
            questionnaire_id,
            status,
            interviews (
              id,
              status,
              interview_responses (
                id,
                rating_score
              )
            )
          )
        `
        )
        .eq("is_deleted", false)
        .eq("regions.is_deleted", false)
        .eq("regions.business_units.is_deleted", false)
        .eq("assessments.is_deleted", false)
        .eq("assessments.interviews.is_deleted", false)
        .eq("assessments.interviews.interview_responses.is_deleted", false)
        .not("lat", "is", null)
        .not("lng", "is", null)
        .eq("regions.business_units.companies.is_deleted", false);

      // Apply filters if provided
      if (filters?.assessmentId && filters.assessmentId !== "all") {
        query = query.eq("assessments.id", filters.assessmentId);
      }

      if (filters?.questionnaireId) {
        query = query.eq(
          "assessments.questionnaire_id",
          filters.questionnaireId
        );
      }

      const { data: sites, error } = await query;

      if (error) {
        console.error("Error fetching site map data:", error);
        throw error;
      }

      // Transform the data for the map component
      const mapData =
        sites?.map((site) => {
          // Calculate metrics for this site
          const allInterviews =
            site.assessments?.flatMap((a) => a.interviews || []) || [];
          const allResponses = allInterviews.flatMap(
            (i) => i.interview_responses || []
          );
          const completedInterviews = allInterviews.filter(
            (i) => i.status === "completed"
          );

          const avgScore =
            allResponses.length > 0
              ? allResponses.reduce(
                  (sum, r) => sum + (r.rating_score || 0),
                  0
                ) / allResponses.length
              : 0;

          const completionRate =
            allInterviews.length > 0
              ? completedInterviews.length / allInterviews.length
              : 0;
          return {
            name: site.name,
            lat: site.lat,
            lng: site.lng,
            score: Number(avgScore.toFixed(2)),
            interviews: allInterviews.length,
            completionRate: Number(completionRate.toFixed(2)),
            region: site.regions?.name || "Unknown",
            businessUnit: site.regions?.business_units?.name || "Unknown",
          };
        }) || [];

      return mapData;
    } catch (error) {
      console.error("Error in getSiteMapData:", error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
