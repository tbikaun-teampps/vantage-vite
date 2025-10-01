export const widgetSchemas = {
  querystring: {
    activity: {
      type: "object",
      properties: {
        entityType: {
          type: "string",
          enum: ["interviews", "assessments", "programs"],
          description: "The type of entity to fetch activity data for",
        },
      },
      required: ["entityType"],
    },
    metrics: {
      type: "object",
      properties: {
        metricType: {
          type: "string",
          enum: [
            "generated-actions",
            "generated-recommendations",
            "worst-performing-domain",
            "high-risk-areas",
            "assessment-activity",
          ],
          description: "The type of metric to fetch",
        },
        title: {
          type: "string",
          description: "Optional custom title for the metric",
        },
      },
      required: ["metricType"],
    },
  },
  responses: {
    activityData: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        data: {
          type: "object",
          properties: {
            total: {
              type: "number",
              description: "Total count of entities",
            },
            breakdown: {
              type: "object",
              description:
                "Status breakdown with status names as keys and counts as values",
              additionalProperties: { type: "number" },
            },
          },
          required: ["total", "breakdown"],
        },
      },
    },
    metricData: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        data: {
          type: "object",
          properties: {
            title: { type: "string" },
            metricType: { type: "string" },
            value: {
              oneOf: [{ type: "number" }, { type: "string" }],
            },
            phaseBadge: {
              type: "object",
              properties: {
                text: { type: "string" },
                color: { type: "string" },
                borderColor: { type: "string" },
              },
            },
            badges: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  color: { type: "string" },
                  borderColor: { type: "string" },
                  icon: { type: "string" },
                },
              },
            },
            secondaryMetrics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  value: {
                    oneOf: [{ type: "number" }, { type: "string" }],
                  },
                  label: { type: "string" },
                  icon: { type: "string" },
                },
              },
            },
            subtitle: { type: "string" },
            description: { type: "string" },
            trend: { type: "number" },
            status: {
              type: "string",
              enum: ["up", "down", "neutral"],
            },
          },
          required: ["title", "metricType"],
        },
      },
    },
  },
};