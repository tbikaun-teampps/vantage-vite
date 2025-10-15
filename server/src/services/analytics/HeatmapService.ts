import { SupabaseClient } from "@supabase/supabase-js";
import {
  FlattenedOverallHeatmapData,
  HeatmapAxisType,
  HeatmapMetric,
  HeatmapMetricResult,
  OverallHeatmapFilters,
  RawOverallHeatmapData,
} from "../../types/entities/analytics";

export class HeatmapService {
  private supabase;
  private companyId: string;
  private questionnaireId: number;
  private assessmentId?: number;
  private xAxis: HeatmapAxisType;
  private yAxis: HeatmapAxisType;

  constructor(
    companyId: string,
    supabaseClient: SupabaseClient,
    questionnaireId: number,
    xAxis?: HeatmapAxisType,
    yAxis?: HeatmapAxisType,
    assessmentId?: number
  ) {
    this.supabase = supabaseClient;
    this.companyId = companyId;
    this.questionnaireId = questionnaireId;
    this.assessmentId = assessmentId;
    this.xAxis = xAxis ?? "business_unit";
    this.yAxis = yAxis ?? "role";
  }

  /**
   * Main method to get heatmap data
   */
  public async getHeatmap() {
    const rawData = await this.fetchRawData();
    console.log(`Fetched ${rawData.length} raw records`);
    const flatData = this.flattenRawData(rawData);
    console.log(`Flattened to ${flatData.length} records`);
    const heatmapData = this.generateHeatmap(flatData);

    return {
      ...heatmapData,
      config: {
        xAxis: this.xAxis,
        yAxis: this.yAxis,
        questionnaireId: this.questionnaireId,
        assessmentId: this.assessmentId ?? null,
      },
    };
  }

  /**
   * Fetch raw data
   */
  private async fetchRawData(): Promise<RawOverallHeatmapData[]> {
    // Fetch all the assessments that use the questionnaireId
    let query = this.supabase
      .from("assessments")
      .select("*")
      .eq("questionnaire_id", this.questionnaireId);

    if (this.assessmentId) {
      query = query.eq("id", this.assessmentId);
    }

    const { data: assessments, error } = await query;

    if (error) throw error;

    // NOTE: The only reliable way to get the location details
    // is by finding the site of roles that answer interviews.

    const { data: interviews, error: interviewError } = await this.supabase
      .from("interviews")
      .select(
        `
          id,
          status,
          name,
          questionnaires(
            id,
            name,
            description,
            questionnaire_sections(
              id,
              title,
              questionnaire_steps(
                id,
                title,
                questionnaire_questions(
                  id,
                  title,
                  question_text,
                  context
                  )
                )
              )
          ),
          interview_responses(
            id,
            rating_score,
            is_applicable,
            questionnaire_question_id,
            interview_response_roles(
              id,
              roles(
                id,
                level,
                shared_roles(
                  name,
                  description
                  ),
                work_groups(
                  id,
                  name,
                  description,
                  asset_groups(
                    id,
                    name,
                    description,
                    sites(
                      id,
                      name,
                      description,
                      lat,
                      lng,
                      regions(
                        id,
                        name,
                        description,
                        business_units(
                          id,
                          name,
                          description
                          )
                          )
                        )
                      )
                  )
                )
            )
          )`
      )
      .in("assessment_id", assessments?.map((a) => a.id) || [])
      .eq("company_id", this.companyId)
      .eq("is_deleted", false)
      .eq("interview_responses.is_deleted", false)
      .eq("interview_responses.is_applicable", true) // Only get applicable responses
      .eq(
        "interview_responses.interview_response_roles.roles.is_deleted",
        false
      )
      .eq(
        "interview_responses.interview_response_roles.roles.shared_roles.is_deleted",
        false
      )
      .eq(
        "interview_responses.interview_response_roles.roles.work_groups.is_deleted",
        false
      )
      .eq(
        "interview_responses.interview_response_roles.roles.work_groups.asset_groups.is_deleted",
        false
      )
      .eq(
        "interview_responses.interview_response_roles.roles.work_groups.asset_groups.sites.is_deleted",
        false
      )
      .eq(
        "interview_responses.interview_response_roles.roles.work_groups.asset_groups.sites.regions.is_deleted",
        false
      )
      .eq(
        "interview_responses.interview_response_roles.roles.work_groups.asset_groups.sites.regions.business_units.is_deleted",
        false
      );

    if (interviewError) throw interviewError;

    return interviews as RawOverallHeatmapData[];
  }

  /**
   * Flatten the nested data structure once
   * TODO: This function will need to be optimised in the future. It's O(n^3) in the worst case
   */
  private flattenRawData(
    rawData: RawOverallHeatmapData[]
  ): FlattenedOverallHeatmapData[] {
    const flattened: FlattenedOverallHeatmapData[] = [];

    rawData.forEach((interview) => {
      interview.interview_responses.forEach((response) => {
        response.interview_response_roles.forEach((roleData) => {
          const role = roleData.roles;

          // Find the question details for this response
          // PostgREST returns questionnaires as array, take first element
          const questionnaire = Array.isArray(interview.questionnaires)
            ? interview.questionnaires[0]
            : interview.questionnaires;
          let questionDetails = null as {
            section_title: string;
            section_id: number;
            step_title: string;
            step_id: number;
            question_id: number;
            question_title: string;
            question_context: string | null;
            question_text: string;
          } | null;

          // Search through sections/steps/questions to find the one matching this response
          questionnaire.questionnaire_sections.forEach((section) => {
            section.questionnaire_steps.forEach((step) => {
              step.questionnaire_questions.forEach((question) => {
                if (question.id === response.questionnaire_question_id) {
                  questionDetails = {
                    section_title: section.title,
                    section_id: section.id,
                    step_title: step.title,
                    step_id: step.id,
                    question_id: question.id,
                    question_title: question.title,
                    question_context: question.context,
                    question_text: question.question_text,
                  };
                }
              });
            });
          });

          // Create one row per response (which is already per-question)
          flattened.push({
            interview_id: interview.id,
            interview_name: interview.name,
            interview_status: interview.status,
            response_id: response.id,
            rating_score: response.rating_score,
            is_applicable: response.is_applicable,

            // Flatten company structure
            business_unit:
              role.work_groups.asset_groups.sites.regions.business_units.name,
            region: role.work_groups.asset_groups.sites.regions.name,
            site: role.work_groups.asset_groups.sites.name,
            asset_group: role.work_groups.asset_groups.name,
            work_group: role.work_groups.name,
            role: role.shared_roles.name,
            role_level: role.level,

            // Geographic data
            site_lat: role.work_groups.asset_groups.sites.lat,
            site_lng: role.work_groups.asset_groups.sites.lng,

            // Question details (if found)
            section_title: questionDetails?.section_title ?? null,
            section_id: questionDetails?.section_id ?? null,
            step_title: questionDetails?.step_title ?? null,
            step_id: questionDetails?.step_id ?? null,
            question_id: questionDetails?.question_id ?? null,
            question_title: questionDetails?.question_title ?? null,
            question_context: questionDetails?.question_context ?? null,
            question_text: questionDetails?.question_text ?? null,
          });
        });
      });
    });

    return flattened;
  }

  /**
   * Super simple aggregation using the flat structure
   */
  private generateHeatmap(flatData: FlattenedOverallHeatmapData[]) {
    // Group by x and y axes - simple property access!
    const grouped = this.groupBy(flatData);

    // Define all metrics to calculate
    const metrics: HeatmapMetric[] = [
      "average_score",
      "total_interviews",
      "completion_rate",
      "total_actions",
    ];

    // Calculate all metrics for each group
    const metricResults: Record<HeatmapMetric, HeatmapMetricResult[]> = {
      average_score: [],
      total_interviews: [],
      completion_rate: [],
      total_actions: [],
    };

    Object.entries(grouped).forEach(([key, rows]) => {
      const [xValue, yValue] = key.split("|||");

      // Calculate each metric for this group
      metrics.forEach((metric) => {
        const metricValue = this.calculateMetric(rows, metric);

        metricResults[metric].push({
          x: xValue,
          y: yValue,
          value: metricValue.value,
          sampleSize: rows.length,
          metadata: metricValue.metadata,
        });
      });
    });

    // Extract unique labels (same for all metrics)
    const xLabels = [
      ...new Set(metricResults.average_score.map((d) => d.x)),
    ].sort();
    const yLabels = [
      ...new Set(metricResults.average_score.map((d) => d.y)),
    ].sort();

    return {
      xLabels,
      yLabels,
      metrics: {
        average_score: {
          data: metricResults.average_score,
          values: metricResults.average_score.map((d) => d.value),
        },
        total_interviews: {
          data: metricResults.total_interviews,
          values: metricResults.total_interviews.map((d) => d.value),
        },
        completion_rate: {
          data: metricResults.completion_rate,
          values: metricResults.completion_rate.map((d) => d.value),
        },
        total_actions: {
          data: metricResults.total_actions,
          values: metricResults.total_actions.map((d) => d.value),
        },
      },
    };
  }

  /**
   * Groups flattened data by x-axis and y-axis values
   * @param data - Array of flattened heatmap data to group
   * @returns Object with keys in format "xValue|||yValue" mapping to arrays of grouped records
   */
  private groupBy(
    data: FlattenedOverallHeatmapData[]
  ): Record<string, FlattenedOverallHeatmapData[]> {
    const groups: Record<string, FlattenedOverallHeatmapData[]> = {};

    data.forEach((row) => {
      // Direct property access - no complex traversal!
      const xValue = this.getAxisValue(row, this.xAxis);
      const yValue = this.getAxisValue(row, this.yAxis);
      const key = `${xValue}|||${yValue}`;

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(row);
    });

    return groups;
  }

  /**
   * Gets the value for a given axis type from a flattened data row
   */
  private getAxisValue(
    row: FlattenedOverallHeatmapData,
    axis: HeatmapAxisType
  ): string | number | null {
    // Map questionnaire axis types to their corresponding property names
    switch (axis) {
      case "section":
        return row.section_title;
      case "step":
        return row.step_title;
      case "question":
        return row.question_title;
      default:
        // Company axis types map directly to property names
        return row[axis];
    }
  }

  /**
   * Calculate metrics
   */
  private calculateMetric(
    rows: FlattenedOverallHeatmapData[],
    metric: HeatmapMetric
  ): {
    value: number | null;
    metadata: object;
  } {
    switch (metric) {
      case "average_score": {
        const scores = rows
          .filter((r) => r.rating_score !== null)
          .map((r) => r.rating_score) as number[];
        return {
          value:
            scores.length > 0
              ? scores.reduce((a, b) => a + b, 0) / scores.length
              : null,
          metadata: {
            validScores: scores.length,
            totalRows: rows.length,
          },
        };
      }

      case "total_interviews": {
        const uniqueInterviews = new Set(rows.map((r) => r.interview_id));
        return {
          value: uniqueInterviews.size,
          metadata: { interviewIds: Array.from(uniqueInterviews) },
        };
      }

      case "completion_rate": {
        const withScores = rows.filter((r) => r.rating_score !== null).length;
        const total = rows.length;
        return {
          value: total > 0 ? (withScores / total) * 100 : 0,
          metadata: { completed: withScores, total },
        };
      }

      case "total_actions": {
        const applicable = rows.filter((r) => r.is_applicable).length;
        return {
          value: applicable,
          metadata: { applicable },
        };
      }
    }
  }
}

/**
 * Get overall heatmap filters for user interface
 * NOTE: LIMITED TO ONSITE ASSESSMENTS
 * @param supabase
 * @param companyId
 * @returns
 */
export async function getOverallHeatmapFilters(
  supabase: SupabaseClient,
  companyId: string
): Promise<OverallHeatmapFilters> {
  // Fetch assessment and questionnaire options for the user to select from
  const { data: assessments, error: assessmentsError } = await supabase
    .from("assessments")
    .select("id, name, questionnaires(id, name)")
    .eq("company_id", companyId)
    .eq("is_deleted", false)
    .eq("questionnaires.is_deleted", false)
    .eq("type", "onsite") // TODO: Support desktop assessments too
    .order("created_at", { ascending: false });

  if (assessmentsError) {
    console.log("assessmentsError:", assessmentsError);
    throw new Error(assessmentsError.message);
  }
  console.log(`Fetched ${assessments.length} assessments`);

  const options: OverallHeatmapFilters["options"] = {
    assessments: [],
    questionnaires: [],
    axes: [
      {
        value: "business_unit" as const,
        category: "company" as const,
        order: 1,
      },
      {
        value: "region" as const,
        category: "company" as const,
        order: 2,
      },
      {
        value: "site" as const,
        category: "company" as const,
        order: 3,
      },
      {
        value: "asset_group" as const,
        category: "company" as const,
        order: 4,
      },
      {
        value: "work_group" as const,
        category: "company" as const,
        order: 5,
      },
      {
        value: "role" as const,
        category: "company" as const,
        order: 6,
      },
      {
        value: "section" as const,
        category: "questionnaire" as const,
        order: 1,
      },
      { value: "step" as const, category: "questionnaire" as const, order: 2 },
      {
        value: "question" as const,
        category: "questionnaire" as const,
        order: 3,
      },
    ],
    metrics: [
      "average_score" as const,
      "total_interviews" as const,
      "completion_rate" as const,
      "total_actions" as const,
    ],
    // TODO: populate these with the parts of the company that are associated with the assessments/interviews.
    regions: null,
    businessUnits: null,
    sites: null,
    roles: null,
    workGroups: null,
    assetGroups: null,
  };

  if (!assessments) {
    return { options };
  }

  // Build unique questionnaires map with their associated assessments
  const questionnairesMap = new Map();
  assessments.forEach((assessment) => {
    // Supabase returns questionnaires as an array due to PostgREST join behavior
    const questionnaire = Array.isArray(assessment.questionnaires)
      ? assessment.questionnaires[0]
      : assessment.questionnaires;
    if (questionnaire) {
      if (!questionnairesMap.has(questionnaire.id)) {
        questionnairesMap.set(questionnaire.id, {
          id: questionnaire.id,
          name: questionnaire.name,
          assessmentIds: [],
        });
      }
      questionnairesMap.get(questionnaire.id).assessmentIds.push(assessment.id);
    }
  });

  // Populate options
  options.assessments = assessments.map((a) => {
    const questionnaire = Array.isArray(a.questionnaires)
      ? a.questionnaires[0]
      : a.questionnaires;
    return {
      id: a.id,
      name: a.name,
      questionnaireId: questionnaire.id,
    };
  });
  options.questionnaires = Array.from(questionnairesMap.values());

  return {
    options,
  };
}
