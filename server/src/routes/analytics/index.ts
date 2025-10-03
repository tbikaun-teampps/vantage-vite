import { FastifyInstance } from "fastify";
import { AnalyticsService } from "../../services/analytics/AnalyticsService";
import { HeatmapService } from "../../services/analytics/HeatmapService";
// import { HeatmapService } from "../../services/analytics/HeatmapService";

export async function analyticsRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) routeOptions.schema.tags = [];
    routeOptions.schema.tags.push("Analytics");
  });
  fastify.get(
    "",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            company_id: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "array",
                items: { type: "object" },
              },
            },
          },
          401: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
          500: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        // Get

        return reply.send({
          success: true,
          data: [],
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );
  fastify.get(
    "/filters",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            analytics_type: {
              type: "string",
              enum: ["heatmap", "geographicalMap"],
            },
            companyId: { type: "string" },
          },
          required: ["analytics_type", "companyId"],
        },
        // response: {
        //   200: {
        //     type: "object",
        //     properties: {
        //       success: { type: "boolean" },
        //       data: { type: "object" },
        //     },
        //   },
        //   400: {
        //     type: "object",
        //     properties: {
        //       success: { type: "boolean" },
        //       error: { type: "string" },
        //     },
        //   },
        //   500: {
        //     type: "object",
        //     properties: {
        //       success: { type: "boolean" },
        //       error: { type: "string" },
        //     },
        //   },
        // },
      },
    },
    async (request, reply) => {
      try {
        const { analytics_type, companyId } = request.query as {
          analytics_type: "heatmap" | "geographicalMap";
          companyId: string;
        };

        const analyticsService = new AnalyticsService(
          companyId,
          request.supabaseClient
        );
        const data = await analyticsService.getFilters(analytics_type);

        console.log("data:", data);

        return reply.send({
          success: true,
          data,
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );

  // Method for fetching overall heatmap filter options
  fastify.get(
    "/overall/heatmap/filters",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            companyId: { type: "string" },
          },
          required: ["companyId"],
        },
      },
    },
    async (request, reply) => {
      const { companyId } = request.query as {
        companyId: string;
      };

      const { supabaseClient } = request;

      // Fetch assessment and questionnaire options for the user to select from
      const { data: assessments, error: assessmentsError } =
        await supabaseClient
          .from("assessments")
          .select("id, name, questionnaires(id, name)")
          .eq("company_id", companyId)
          .eq("is_deleted", false)
          .eq("questionnaires.is_deleted", false)
          .order("created_at", { ascending: false });

      if (assessmentsError) {
        console.log("assessmentsError:", assessmentsError);
        fastify.log.error(assessmentsError);
        return reply.status(500).send({
          success: false,
          error: assessmentsError.message,
        });
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
          questionnairesMap
            .get(questionnaire.id)
            .assessmentIds.push(assessment.id);
        }
      });

      return {
        success: true,
        data: {
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
        },
      };
    }
  );

  // Method for fetching overall heatmap data
  fastify.get(
    "/overall/heatmap",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            companyId: { type: "string" },
            questionnaireId: { type: "string" },
            assessmentId: { type: "string" },
            xAxis: {
              type: "string",
              enum: [
                "business_unit",
                "region",
                "site",
                "asset_group",
                "work_group",
                "role",
                "role_level",
                "section",
                "step",
                "question",
              ],
            },
            yAxis: {
              type: "string",
              enum: [
                "business_unit",
                "region",
                "site",
                "asset_group",
                "work_group",
                "role",
                "role_level",
                "section",
                "step",
                "question",
              ],
            },
          },
          required: ["companyId", "questionnaireId"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  xLabels: { type: "array", items: { type: "string" } },
                  yLabels: { type: "array", items: { type: "string" } },
                  metrics: {
                    type: "object",
                    properties: {
                      average_score: {
                        type: "object",
                        properties: {
                          data: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                x: { type: "string" },
                                y: { type: "string" },
                                value: { type: ["number", "null"] },
                                sampleSize: { type: "number" },
                                metadata: { type: "object" },
                              },
                            },
                          },
                          values: {
                            type: "array",
                            items: { type: ["number", "null"] },
                          },
                        },
                      },
                      total_interviews: {
                        type: "object",
                        properties: {
                          data: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                x: { type: "string" },
                                y: { type: "string" },
                                value: { type: ["number", "null"] },
                                sampleSize: { type: "number" },
                                metadata: { type: "object" },
                              },
                            },
                          },
                          values: {
                            type: "array",
                            items: { type: ["number", "null"] },
                          },
                        },
                      },
                      completion_rate: {
                        type: "object",
                        properties: {
                          data: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                x: { type: "string" },
                                y: { type: "string" },
                                value: { type: ["number", "null"] },
                                sampleSize: { type: "number" },
                                metadata: { type: "object" },
                              },
                            },
                          },
                          values: {
                            type: "array",
                            items: { type: ["number", "null"] },
                          },
                        },
                      },
                      total_actions: {
                        type: "object",
                        properties: {
                          data: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                x: { type: "string" },
                                y: { type: "string" },
                                value: { type: ["number", "null"] },
                                sampleSize: { type: "number" },
                                metadata: { type: "object" },
                              },
                            },
                          },
                          values: {
                            type: "array",
                            items: { type: ["number", "null"] },
                          },
                        },
                      },
                    },
                  },
                  config: {
                    type: "object",
                    properties: {
                      xAxis: { type: "string" },
                      yAxis: { type: "string" },
                      questionnaireId: { type: "number" },
                      assessmentId: { type: ["number", "null"] },
                    },
                  },
                },
              },
            },
          },
          500: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { companyId, questionnaireId, assessmentId, xAxis, yAxis } =
          request.query as {
            companyId: string;
            questionnaireId: string;
            assessmentId?: string;
            xAxis?:
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
            yAxis?:
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
          };

        const { supabaseClient } = request;

        // Parse string query params to numbers
        const parsedQuestionnaireId = parseInt(questionnaireId);
        const parsedAssessmentId = assessmentId ? parseInt(assessmentId) : undefined;

        const heatmapService = new HeatmapService(
          companyId,
          supabaseClient,
          parsedQuestionnaireId,
          xAxis,
          yAxis,
          parsedAssessmentId
        );
        return reply.send({
          success: true,
          data: await heatmapService.getHeatmap(),
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );

  // Method for fetching overall geographical map data
  // TODO: Handle whether interviews should be filtered by their status (e.g., completed only)
  // TODO: Handle whether to fetch sites that don't have responses so they can be shown on the map.
  // TODO: Handle filtering out sites that have no lat/lng as they cannot be visualized on the map. Perhaps warn the user.
  fastify.get(
    "/overall/geographical-map",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            companyId: { type: "string" },
            assessmentId: { type: "string" },
            questionnaireId: { type: "string" },
          },
          required: ["questionnaireId"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    lat: { type: "number" },
                    lng: { type: "number" },
                    region: { type: "string" },
                    businessUnit: { type: "string" },
                    score: { type: "number" },
                    interviews: { type: "number" },
                    totalActions: { type: "number" },
                    completionRate: { type: "number" },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      // Questionnaire is required as this makes the context of the data aggregations make sense.
      const { companyId, assessmentId, questionnaireId } = request.query as {
        companyId: string;
        assessmentId: number;
        questionnaireId: number;
      };

      const { supabaseClient } = request;

      // Fetch all the assessments that use the questionnaireId
      let query = supabaseClient
        .from("assessments")
        .select("*")
        .eq("questionnaire_id", questionnaireId);

      if (assessmentId) {
        query = query.eq("id", assessmentId);
      }

      const { data: assessments, error } = await query;

      if (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: error.message,
        });
      }

      // NOTE: The only reliable way to get the location details
      // is by finding the site of roles that answer interviews.

      const { data: interviews, error: interviewError } = await supabaseClient
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

      if (interviewError) {
        fastify.log.error(interviewError);
        return reply.status(500).send({
          success: false,
          error: interviewError.message,
        });
      }

      function aggregateDataBySite(interviews) {
        const siteMap = new Map();

        interviews.forEach((interview) => {
          interview.interview_responses.forEach((response) => {
            // Group roles by site
            const siteGroups = groupRolesBySite(
              response.interview_response_roles
            );

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

      return {
        success: true,
        data: aggregateDataBySite(interviews),
      };
    }
  );

  // Method for fetching overall geographical map filter options
  fastify.get(
    "/overall/geographical-map/filters",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            companyId: { type: "string" },
          },
          required: ["companyId"],
        },
      },
    },
    async (request, reply) => {
      const { companyId } = request.query as {
        companyId: string;
      };

      const { supabaseClient } = request;

      // Fetch assessment and questionnaire options for the user to select from
      const { data: assessments, error: assessmentsError } =
        await supabaseClient
          .from("assessments")
          .select("id, name, questionnaires(id, name)")
          .eq("company_id", companyId)
          .eq("is_deleted", false)
          .eq("questionnaires.is_deleted", false)
          .order("created_at", { ascending: false });

      if (assessmentsError) {
        console.log("assessmentsError:", assessmentsError);
        fastify.log.error(assessmentsError);
        return reply.status(500).send({
          success: false,
          error: assessmentsError.message,
        });
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
          questionnairesMap
            .get(questionnaire.id)
            .assessmentIds.push(assessment.id);
        }
      });

      return {
        success: true,
        data: {
          options: {
            assessments: assessments.map((a) => ({
              id: a.id,
              name: a.name,
              questionnaireId: a.questionnaires?.id || null,
            })),
            questionnaires: Array.from(questionnairesMap.values()),
          },
        },
      };
    }
  );
}
