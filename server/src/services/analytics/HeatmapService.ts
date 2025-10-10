import { SupabaseClient } from "@supabase/supabase-js";

type HeatMapAxisType =
  | "business_unit"
  | "region"
  | "site"
  | "asset_group"
  | "work_group"
  | "role"
  | "role_level"
  | "section"
  | "step"
  | "question";

type HeatMapMetric =
  | "average_score"
  | "total_interviews"
  | "completion_rate"
  | "total_actions";

export class HeatmapService {
  private supabase;
  private companyId: string;
  private questionnaireId: number;
  private assessmentId?: number;
  private xAxis: HeatMapAxisType;
  private yAxis: HeatMapAxisType;

  constructor(
    companyId: string,
    supabaseClient: SupabaseClient,
    questionnaireId: number,
    xAxis?: HeatMapAxisType,
    yAxis?: HeatMapAxisType,
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
  private async fetchRawData() {
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

    return interviews;
  }

  /**
   * Flatten the nested data structure once
   */
  private flattenRawData(rawData: any[]) {
    const flattened = [];

    rawData.forEach((interview) => {
      interview.interview_responses?.forEach((response) => {
        response.interview_response_roles?.forEach((roleData) => {
          const role = roleData.roles;

          // Find the question details for this response
          const questionnaire = interview.questionnaires;
          let questionDetails = null;

          // Search through sections/steps/questions to find the one matching this response
          questionnaire?.questionnaire_sections?.forEach((section) => {
            section.questionnaire_steps?.forEach((step) => {
              step.questionnaire_questions?.forEach((question) => {
                if (question.id === response.questionnaire_question_id) {
                  questionDetails = {
                    section: section.title,
                    section_id: section.id,
                    step: step.title,
                    step_id: step.id,
                    question: question.title,
                    question_id: question.id,
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
              role.work_groups?.asset_groups?.sites?.regions?.business_units
                ?.name,
            region: role.work_groups?.asset_groups?.sites?.regions?.name,
            site: role.work_groups?.asset_groups?.sites?.name,
            asset_group: role.work_groups?.asset_groups?.name,
            work_group: role.work_groups?.name,
            role: role.shared_roles?.name,
            role_level: role.level,

            // Geographic data
            site_lat: role.work_groups?.asset_groups?.sites?.lat,
            site_lng: role.work_groups?.asset_groups?.sites?.lng,

            // Question details (if found)
            section: questionDetails?.section || null,
            section_id: questionDetails?.section_id || null,
            step: questionDetails?.step || null,
            step_id: questionDetails?.step_id || null,
            question: questionDetails?.question || null,
            question_id:
              questionDetails?.question_id ||
              response.questionnaire_question_id,
            question_context: questionDetails?.question_context || null,
            question_text: questionDetails?.question_text || null,
          });
        });
      });
    });

    return flattened;
  }

  /**
   * Super simple aggregation using the flat structure
   */
  private generateHeatmap(flatData: any[]) {
    // Group by x and y axes - simple property access!
    const grouped = this.groupBy(flatData);

    // Define all metrics to calculate
    const metrics: HeatMapMetric[] = [
      "average_score",
      "total_interviews",
      "completion_rate",
      "total_actions",
    ];

    // Calculate all metrics for each group
    const metricResults: Record<HeatMapMetric, any[]> = {
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

  private groupBy(data: any[]) {
    const groups = {};

    data.forEach((row) => {
      // Direct property access - no complex traversal!
      const xValue = row[this.xAxis];
      const yValue = row[this.yAxis];
      const key = `${xValue}|||${yValue}`;

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(row);
    });

    return groups;
  }

  /**
   * Calculate metrics
   */
  private calculateMetric(rows: any[], metric: HeatMapMetric) {
    switch (metric) {
      case "average_score": {
        const scores = rows
          .filter((r) => r.rating_score !== null)
          .map((r) => r.rating_score);
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
 * @param supabase
 * @param companyId
 * @returns
 */
export async function getOverallHeatmapFilters(
  supabase: SupabaseClient,
  companyId: string
) {
  // Fetch assessment and questionnaire options for the user to select from
  const { data: assessments, error: assessmentsError } = await supabase
    .from("assessments")
    .select("id, name, questionnaires(id, name)")
    .eq("company_id", companyId)
    .eq("is_deleted", false)
    .eq("questionnaires.is_deleted", false)
    .order("created_at", { ascending: false });

  if (assessmentsError) {
    console.log("assessmentsError:", assessmentsError);
    throw new Error(assessmentsError.message);
  }

  // Build unique questionnaires map with their associated assessments
  const questionnairesMap = new Map();
  assessments?.forEach((assessment) => {
    const questionnaire = assessment.questionnaires;
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

  return {
    options: {
      assessments: assessments.map((a) => ({
        id: a.id,
        name: a.name,
        questionnaireId: a.questionnaires?.id || null,
      })),
      questionnaires: Array.from(questionnairesMap.values()),
      // TODO: populate these with the parts of the company that are associated with the assessments/interviews.
      regions: [],
      businessUnits: [],
      sites: [],
      roles: [],
      axes: [
        {
          value: "business_unit",
          category: "company",
          order: 1,
        },
        {
          value: "region",
          category: "company",
          order: 2,
        },
        {
          value: "site",
          category: "company",
          order: 3,
        },
        {
          value: "asset_group",
          category: "company",
          order: 4,
        },
        {
          value: "work_group",
          category: "company",
          order: 5,
        },
        {
          value: "role",
          category: "company",
          order: 6,
        },
        { value: "section", category: "questionnaire", order: 1 },
        { value: "step", category: "questionnaire", order: 2 },
        { value: "question", category: "questionnaire", order: 3 },
      ],
      metrics: [
        "average_score",
        "total_interviews",
        "completion_rate",
        "total_actions",
      ],
    },
  };
}

/**
 * Get overall heatmap data for a specific company, questionnaire, and assessment
 *   TODO: Handle whether interviews should be filtered by their status (e.g., completed only)
 *   TODO: Handle whether to fetch sites that don't have responses so they can be shown on the map.
 *   TODO: Handle filtering out sites that have no lat/lng as they cannot be visualized on the map. Perhaps warn the user.
 * @param supabase
 * @param companyId
 * @param questionnaireId
 * @param assessmentId
 * @returns
 */
export async function getOverallGeographicalMapData(
  supabase: SupabaseClient,
  companyId: string,
  questionnaireId: number,
  assessmentId?: number
) {
  // Fetch all the assessments that use the questionnaireId
  let query = supabase
    .from("assessments")
    .select("*")
    .eq("questionnaire_id", questionnaireId);

  if (assessmentId) {
    query = query.eq("id", assessmentId);
  }

  const { data: assessments, error } = await query;

  if (error) {
    throw error;
  }

  // NOTE: The only reliable way to get the location details
  // is by finding the site of roles that answer interviews.

  const { data: interviews, error: interviewError } = await supabase
    .from("interviews")
    .select(
      `
          id,
          status,
          name,
          is_deleted,
          interview_responses(
            id,
            rating_score,
            is_applicable,
            is_deleted,
            interview_response_roles(
              id,
              roles(
                id,
                level,
                is_deleted,
                shared_roles(
                  name,
                  description,
                  is_deleted
                  ),
                work_groups(
                  id,
                  name,
                  description,
                  is_deleted,
                  asset_groups(
                    id,
                    name,
                    description,
                    is_deleted,
                    sites(
                      id,
                      name,
                      description,
                      lat,
                      lng,
                      is_deleted,
                      regions(
                        id,
                        name,
                        description,
                        is_deleted,
                        business_units(
                          id,
                          name,
                          description,
                          is_deleted
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
    .eq("company_id", companyId)
    .eq("is_deleted", false)
    .eq("interview_responses.is_deleted", false)
    .eq("interview_responses.is_applicable", true) // Only get applicable responses
    .eq("interview_responses.interview_response_roles.roles.is_deleted", false)
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

  if (interviewError) {
    throw interviewError;
  }

  function aggregateDataBySite(interviews) {
    const siteMap = new Map();

    interviews.forEach((interview) => {
      interview.interview_responses.forEach((response) => {
        // Group roles by site
        const siteGroups = groupRolesBySite(response.interview_response_roles);

        // Full attribution: each site gets the full response counted
        siteGroups.forEach((roles, siteKey) => {
          const siteInfo = roles[0].roles.work_groups.asset_groups.sites;
          const region = siteInfo.regions;
          const businessUnit = region.business_units;

          if (!siteMap.has(siteKey)) {
            siteMap.set(siteKey, {
              name: siteInfo.name,
              lat: siteInfo.lat,
              lng: siteInfo.lng,
              region: region.name,
              businessUnit: businessUnit.name,
              assetGroups: new Set(),
              workGroups: new Set(),
              ratings: [],
              interviews: new Set(),
              totalResponses: 0,
              completedResponses: 0,
            });
          }

          const site = siteMap.get(siteKey);

          // Track unique interviews
          site.interviews.add(interview.id);

          // Full attribution of the response to this site
          site.totalResponses++;

          if (response.rating_score !== null) {
            site.ratings.push(response.rating_score);
            site.completedResponses++;
          }

          // Collect asset and work groups from this site's roles
          roles.forEach((role) => {
            site.assetGroups.add(role.roles.work_groups.asset_groups.name);
            site.workGroups.add(role.roles.work_groups.name);
          });
        });
      });
    });

    return Array.from(siteMap.values()).map((site) =>
      calculateSiteMetrics(site)
    );
  }

  function groupRolesBySite(roles) {
    const groups = new Map();

    roles.forEach((role) => {
      const site = role.roles.work_groups.asset_groups.sites;
      const siteKey = `${site.id}_${site.name}`;

      if (!groups.has(siteKey)) {
        groups.set(siteKey, []);
      }
      groups.get(siteKey).push(role);
    });

    return groups;
  }

  function calculateSiteMetrics(site) {
    // Calculate average score
    const avgScore =
      site.ratings.length > 0
        ? site.ratings.reduce((sum, score) => sum + score, 0) /
          site.ratings.length
        : 0;

    // Calculate completion rate
    const completionRate =
      site.totalResponses > 0
        ? site.completedResponses / site.totalResponses
        : 0;

    // Define metrics configuration
    const metrics = [
      {
        key: "score",
        value: avgScore,
      },
      {
        key: "interviews",
        value: site.interviews.size,
      },
      {
        key: "totalActions",
        value: site.totalResponses,
      },
      {
        key: "completionRate",
        value: completionRate,
        range: [0, 1],
      },
    ];

    // Build metrics object
    const result = {
      name: site.name,
      lat: site.lat,
      lng: site.lng,
      region: site.region,
      businessUnit: site.businessUnit,
      // assetGroups: Array.from(site.assetGroups).join(", "),
      // workGroups: Array.from(site.workGroups).join(", "),
    };

    // Add metric properties
    metrics.forEach((metric) => {
      result[metric.key] = metric.value;
    });

    return result;
  }

  // TODO: Fetch all sites in the company even without data as they will be used to show 0 data points on the map.

  return aggregateDataBySite(interviews);
}

export async function getOverallGeographicalMapFilters(
  supabase: SupabaseClient,
  companyId: string
) {
  // Fetch assessment and questionnaire options for the user to select from
  const { data: assessments, error: assessmentsError } = await supabase
    .from("assessments")
    .select("id, name, questionnaires(id, name)")
    .eq("company_id", companyId)
    .eq("is_deleted", false)
    .eq("questionnaires.is_deleted", false)
    .order("created_at", { ascending: false });

  if (assessmentsError) {
    throw assessmentsError;
  }

  // Build unique questionnaires map with their associated assessments
  const questionnairesMap = new Map();
  assessments?.forEach((assessment) => {
    const questionnaire = assessment.questionnaires;
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

  return {
    options: {
      assessments: assessments.map((a) => ({
        id: a.id,
        name: a.name,
        questionnaireId: a.questionnaires?.id || null,
      })),
      questionnaires: Array.from(questionnairesMap.values()),
    },
  };
}
