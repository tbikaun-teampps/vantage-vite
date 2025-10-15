import { SupabaseClient } from "@supabase/supabase-js";
import {
  GeographicalMapFilters,
  GeographicalMapSiteData,
  RawOverallAnalyticsData,
} from "../../types/entities/analytics";

// Internal type for site aggregation during processing
interface SiteAggregation {
  name: string;
  lat: number | null;
  lng: number | null;
  region: string;
  businessUnit: string;
  assetGroups: Set<string>;
  workGroups: Set<string>;
  ratings: number[];
  interviews: Set<number>;
  totalResponses: number;
  completedResponses: number;
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
): Promise<GeographicalMapSiteData[]> {
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

  function aggregateDataBySite(
    interviews: RawOverallAnalyticsData[]
  ): GeographicalMapSiteData[] {
    const siteMap = new Map<string, SiteAggregation>();

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
          if (!site) return;

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

  function groupRolesBySite(
    roles: RawOverallAnalyticsData["interview_responses"][0]["interview_response_roles"]
  ): Map<
    string,
    RawOverallAnalyticsData["interview_responses"][0]["interview_response_roles"]
  > {
    const groups = new Map<
      string,
      RawOverallAnalyticsData["interview_responses"][0]["interview_response_roles"]
    >();

    roles.forEach((role) => {
      const site = role.roles.work_groups.asset_groups.sites;
      const siteKey = `${site.id}_${site.name}`;

      if (!groups.has(siteKey)) {
        groups.set(siteKey, []);
      }
      const group = groups.get(siteKey);
      if (group) {
        group.push(role);
      }
    });

    return groups;
  }

  function calculateSiteMetrics(
    site: SiteAggregation
  ): GeographicalMapSiteData {
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

    return {
      name: site.name,
      lat: site.lat,
      lng: site.lng,
      region: site.region,
      businessUnit: site.businessUnit,
      score: avgScore,
      interviews: site.interviews.size,
      totalActions: site.totalResponses,
      completionRate: completionRate,
    };
  }

  // TODO: Fetch all sites in the company even without data as they will be used to show 0 data points on the map.
  return aggregateDataBySite(interviews as RawOverallAnalyticsData[]);
}

export async function getOverallGeographicalMapFilters(
  supabase: SupabaseClient,
  companyId: string
): Promise<GeographicalMapFilters> {
  // Fetch assessment and questionnaire options for the user to select from
  const { data: assessments, error: assessmentsError } = await supabase
    .from("assessments")
    .select("id, name, questionnaires(id, name)")
    .eq("company_id", companyId)
    .eq("is_deleted", false)
    .eq("type", "onsite") // TODO: Support desktop assessments too
    .eq("questionnaires.is_deleted", false)
    .order("created_at", { ascending: false });

  if (assessmentsError) {
    throw assessmentsError;
  }

  // Build unique questionnaires map with their associated assessments
  const questionnairesMap = new Map();
  assessments?.forEach((assessment) => {
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

  return {
    options: {
      assessments: (assessments || []).map((a) => {
        const questionnaire = Array.isArray(a.questionnaires)
          ? a.questionnaires[0]
          : a.questionnaires;
        return {
          id: a.id,
          name: a.name,
          questionnaireId: questionnaire?.id || null,
        };
      }),
      questionnaires: Array.from(questionnairesMap.values()),
    },
  };
}
