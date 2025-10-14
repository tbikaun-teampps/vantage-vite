import { FastifyInstance } from "fastify";
import {
  getOverallHeatmapFilters,
  HeatmapService,
} from "../../services/analytics/HeatmapService";
import {
  getOverallGeographicalMapData,
  getOverallGeographicalMapFilters,
} from "../../services/analytics/GeographicalMapService";

export async function analyticsRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) {
      routeOptions.schema.tags = ["Analytics"];
    }
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
    async (_request, reply) => {
      return reply.send({
        success: true,
        data: [],
      });
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
        response: {
          // 200: {
          //   type: "object",
          //   properties: {
          //     success: { type: "boolean" },
          //     data: { type: "object" },
          //   },
          // },
        },
      },
    },
    async (request) => {
      const { companyId } = request.query as {
        companyId: string;
      };
      const { supabaseClient } = request;
      const filters = await getOverallHeatmapFilters(supabaseClient, companyId);
      return {
        success: true,
        data: filters,
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
                                value: { type: "number", nullable: true },
                                sampleSize: { type: "number" },
                                metadata: { type: "object" },
                              },
                            },
                          },
                          values: {
                            type: "array",
                            items: { type: "number", nullable: true },
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
                                value: { type: "number", nullable: true },
                                sampleSize: { type: "number" },
                                metadata: { type: "object" },
                              },
                            },
                          },
                          values: {
                            type: "array",
                            items: { type: "number", nullable: true },
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
                                value: { type: "number", nullable: true },
                                sampleSize: { type: "number" },
                                metadata: { type: "object" },
                              },
                            },
                          },
                          values: {
                            type: "array",
                            items: { type: "number", nullable: true },
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
                                value: { type: "number", nullable: true },
                                sampleSize: { type: "number" },
                                metadata: { type: "object" },
                              },
                            },
                          },
                          values: {
                            type: "array",
                            items: { type: "number", nullable: true },
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
                      assessmentId: { type: "number", nullable: true },
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
      const parsedAssessmentId = assessmentId
        ? parseInt(assessmentId)
        : undefined;

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
    }
  );

  // Method for fetching overall geographical map data
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
    async (request) => {
      // Questionnaire is required as this makes the context of the data aggregations make sense.
      const { companyId, assessmentId, questionnaireId } = request.query as {
        companyId: string;
        assessmentId: number;
        questionnaireId: number;
      };

      const { supabaseClient } = request;

      const data = await getOverallGeographicalMapData(
        supabaseClient,
        companyId,
        questionnaireId,
        assessmentId
      );
      return {
        success: true,
        data,
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
    async (request) => {
      const { companyId } = request.query as {
        companyId: string;
      };

      const { supabaseClient } = request;

      const filters = await getOverallGeographicalMapFilters(
        supabaseClient,
        companyId
      );

      return {
        success: true,
        data: filters,
      };
    }
  );
}
