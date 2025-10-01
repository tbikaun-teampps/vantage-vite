type DataMeasure =
  | "average_score"
  | "total_interviews"
  | "total_actions"
  | "completion_rate";

type HeatMapDataMeasure = DataMeasure;

type ComparisonAxis = "assessment";
type QuestionnaireAxis = "section" | "step" | "question";
type HierarchyAxis =
  | "businessUnit"
  | "region"
  | "site"
  | "assetGroup"
  | "workGroup"
  | "role";
type HeatMapAxisType = QuestionnaireAxis | HierarchyAxis | ComparisonAxis;

// Typed constants to ensure consistency
const HEATMAP_GROUP_BY = {
  questionnaire: [
    "section",
    "step",
    "question",
  ] as readonly QuestionnaireAxis[],
  hierarchy: [
    "businessUnit",
    "region",
    "site",
    "assetGroup",
    "workGroup",
    "role",
  ] as readonly HierarchyAxis[],
  comparison: ["assessment"] as readonly ComparisonAxis[],
};

export class AnalyticsService {
  private supabase;
  private companyId: string;

  constructor(companyId: string, supabaseClient: any) {
    this.supabase = supabaseClient;
    this.companyId = companyId;
  }

  private async fetchAssessments() {
    const { data: assessments, error } = await this.supabase
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
      .not("interviews.interview_responses.rating_score", "is", null)
      .eq("company_id", this.companyId)
      .order("updated_at", {
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

  /**
   *
   * Notes: Only a single questionnaire and its associated data can be viewed
   * at a time. This is because the questions are different across questionnaires.
   * @param filters
   * @returns
   */
  private async fetchInterviewResponses(filters: {
    assessmentIds?: number[];
    questionnaireId: number;
  }) {
    // TODO: handle programs
    console.log("fetchInterviewResponses filters: ", filters);
    const { data: assessments, error: assessmentError } = await this.supabase
      .from("assessments")
      .select("id, questionnaire_id")
      .eq("company_id", this.companyId)
      .eq("is_deleted", false)
      .in("id", filters?.assessmentIds || [])
      .eq("questionnaire_id", filters.questionnaireId);

    console.log("assessments: ", assessments);

    if (assessmentError) throw assessmentError;

    // Get interviews associated
    const { data: interviews, error: interviewError } = await this.supabase
      .from("interviews")
      .select("id, assessment_id, program_id")
      .eq("questionnaire_id", filters.questionnaireId)
      .eq("is_deleted", false)
      .eq("company_id", this.companyId);
    // .eq('program_id', null); // only non-program assessments for now
    // .in(
    //   "assessment_id",
    //   assessments?.map((a) => a.id) || []
    // )

    if (interviewError) throw interviewError;

    console.log("interviews: ", interviews);
    const interviewIds = interviews?.map((i) => i.id) || [];

    // Get questionnaire
    const { data: questionnaire, error: questionnaireError } =
      await this.supabase
        .from("questionnaires")
        .select("id, name")
        .eq("id", filters.questionnaireId)
        .single();

    console.log("questionnaire: ", questionnaire);

    if (questionnaireError) throw questionnaireError;

    // Get interview responses
    const { data: interviewResponses, error: interviewResponsesError } =
      await this.supabase
        .from("interview_responses")
        .select(
          `id,rating_score,interview_id,questionnaire_question_id,
          interview_response_roles(
              role_id,
              roles!inner(id, shared_role_id, is_deleted,
                shared_roles!inner(id, name, is_deleted)
                )
            ),
          interview_response_actions(count)
          `
        )
        .eq("is_deleted", false)
        .eq("interview_response_roles.roles.is_deleted", false)
        .eq("interview_response_roles.roles.shared_roles.is_deleted", false)
        .eq("interview_response_actions.is_deleted", false)
        .eq("company_id", this.companyId)
        .in("interview_id", interviewIds);

    console.log(`interviewResponses: ${interviewResponses.length}`);

    console.log('interview response example: ', JSON.stringify(interviewResponses[0], null, 2))

    if (interviewResponsesError) throw interviewResponsesError;

    return interviewResponses;
  }

  async getOverallHeatmapData(
    filters: {
      questionnaireId: number;
      assessmentIds?: number[];
      measure?: HeatMapDataMeasure; // Equivalent to 'dataType'
      xAxisType?: HeatMapAxisType;
      yAxisType?: HeatMapAxisType;
      organizationalFilters?: {
        businessUnits?: string[];
        sites?: string[];
        roles?: string[];
      };
    } = { measure: "average_score", xAxisType: "assessment", yAxisType: "role" }
  ) {
    console.log(
      "Fetching overall heatmap data for companyId:",
      this.companyId,
      "with filters:",
      filters
    );

    // Fetch assessments
    // const assessments = await this.fetchAssessments();

    // Fetch interview responses
    const interviewResponses = await this.fetchInterviewResponses({
      questionnaireId: filters.questionnaireId,
    });

    // Create heatmap data

    return {
      data: [],
      xLabels: [],
      yLabels: [],
      values: [],
    };
  }

  async getOverallMapData(filters?: {
    assessmentId?: number;
    questionnaireId?: number;
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
                rating_score,
                interview_response_actions (
                  id
                )
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
        .eq(
          "assessments.interviews.interview_responses.interview_response_actions.is_deleted",
          false
        )
        .not("lat", "is", null)
        .not("lng", "is", null)
        .eq("regions.business_units.companies.is_deleted", false);

      // Apply filters if provided
      if (filters?.assessmentId) {
        //  && filters.assessmentId !== "all"
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

          const totalActions = allResponses.reduce(
            (sum, r) => sum + (r.interview_response_actions?.length || 0),
            0
          );

          return {
            name: site.name,
            lat: site.lat,
            lng: site.lng,
            score: Number(avgScore.toFixed(2)),
            interviews: allInterviews.length,
            completionRate: Number(completionRate.toFixed(2)),
            totalActions: totalActions,
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

  async getOverallProgress() {
    // Implementation for fetching overall progress data
  }

  async getFilters(analytics_type: "heatmap" | "geographicalMap") {
    console.log("Fetching filters for:", analytics_type, this.companyId);

    // Define all queries
    const queries = {
      assessments: this.supabase
        .from("assessments")
        .select("id, name, questionnaire:questionnaire_id(id,name)")
        .eq("company_id", this.companyId)
        .eq("is_deleted", false),

      businessUnits: this.supabase
        .from("business_units")
        .select("id, name")
        .eq("company_id", this.companyId)
        .eq("is_deleted", false),

      regions: this.supabase
        .from("regions")
        .select("id, name")
        .eq("company_id", this.companyId)
        .eq("is_deleted", false),

      sites: this.supabase
        .from("sites")
        .select("id, name")
        .eq("is_deleted", false),

      assetGroups: this.supabase
        .from("asset_groups")
        .select("id, name")
        .eq("company_id", this.companyId)
        .eq("is_deleted", false),

      workGroups: this.supabase
        .from("work_groups")
        .select("id, name")
        .eq("company_id", this.companyId)
        .eq("is_deleted", false),

      // TODO: this should be the unique shared roles. otherwise there can be duplicates.
      roles: this.supabase
        .from("roles")
        .select("id, shared_role:shared_role_id(name)")
        .eq("company_id", this.companyId)
        .eq("is_deleted", false),
    };

    // Execute all queries in parallel
    const results = await Promise.all(
      Object.entries(queries).map(async ([key, query]) => {
        const { data, error } = await query;
        if (error) {
          console.error(`Error fetching ${key}:`, error);
          throw new Error(`Failed to fetch ${key}: ${error.message}`);
        }
        return { [key]: data };
      })
    );

    // Merge results into a single object
    const data = Object.assign({}, ...results);

    // Transform assessments to include questionnaire details
    // Don't include duplicate questionnaires
    const questionnaireData = [
      ...new Map(
        data.assessments.map((a) => [
          a.questionnaire.id,
          { id: a.questionnaire.id, name: a.questionnaire.name },
        ])
      ).values(),
    ];

    const assessmentData = data.assessments.map((a) => ({
      id: a.id,
      name: a.name,
      // questionnaireId: a.questionnaire.id,
    }));

    return {
      // TODO: update questionnaires with assessment dependency and vice versa.
      // shouldn't be able to select an assessment that doesn't belong to the selected
      // questionnaire and vice versa.
      general: {
        questionnaires: [
          ...questionnaireData,
          { id: -1, name: "All Questionnaires" },
        ],
        assessments: [
          ...assessmentData,
          {
            id: -1,
            name: "All Assessments (Cross-Analysis)",
            // questionnaireId: -1,
          },
        ],
        measures: [
          "average_score",
          "total_interviews",
          "total_actions",
          "completion_rate",
        ],
      },
      company: {
        businessUnits: data.businessUnits,
        regions: data.regions,
        sites: data.sites,
        assetGroups: data.assetGroups,
        workGroups: data.workGroups,
        roles: data.roles.map((r) => ({ id: r.id, name: r.shared_role.name })),
      },
      heatmap: {
        groupBy: HEATMAP_GROUP_BY,
      },
      geographicalMap: {
        colourBy: ["region", "businessUnit"],
      },
    };
  }
}
