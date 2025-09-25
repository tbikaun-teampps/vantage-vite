type DataMeasure =
  | "average_score"
  | "total_interviews"
  | "total_actions"
  | "completion_rate";

type HeatMapDataMeasure = DataMeasure;

export class AnalyticsService {
  private supabase;

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  async getOverallHeatmapData() {
    // Implementation for fetching overall heatmap data
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
}
