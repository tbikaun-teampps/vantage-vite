export const dashboardSchemas = {
  body: {
    createDashboard: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Dashboard name",
        },
        widgets: {
          type: "array",
          description: "Widget configurations",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              widgetType: { type: "string" },
              config: { type: "object" },
            },
          },
        },
        layout: {
          type: "array",
          description: "React Grid Layout configuration",
          items: {
            type: "object",
            properties: {
              i: { type: "string" },
              x: { type: "number" },
              y: { type: "number" },
              w: { type: "number" },
              h: { type: "number" },
            },
          },
        },
      },
      required: ["name", "widgets", "layout"],
    },
    updateDashboard: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Dashboard name",
        },
        widgets: {
          type: "array",
          description: "Widget configurations",
          items: {
            type: "object",
          },
        },
        layout: {
          type: "array",
          description: "React Grid Layout configuration",
          items: {
            type: "object",
          },
        },
      },
    },
  },
  responses: {
    dashboard: {
      type: "object",
      properties: {
        id: { type: "number" },
        name: { type: "string" },
        company_id: { type: "string" },
        created_by: { type: "string" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
        is_deleted: { type: "boolean" },
        deleted_at: { type: ["string", "null"] },
        widgets: { type: "array" },
        layout: { type: "array" },
      },
    },
    dashboardList: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "number" },
              name: { type: "string" },
              company_id: { type: "string" },
              created_by: { type: "string" },
              created_at: { type: "string" },
              updated_at: { type: "string" },
              is_deleted: { type: "boolean" },
              deleted_at: { type: ["string", "null"] },
              widgets: { type: "array" },
              layout: { type: "array" },
            },
          },
        },
      },
    },
    dashboardSingle: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        data: {
          type: "object",
          properties: {
            id: { type: "number" },
            name: { type: "string" },
            company_id: { type: "string" },
            created_by: { type: "string" },
            created_at: { type: "string" },
            updated_at: { type: "string" },
            is_deleted: { type: "boolean" },
            deleted_at: { type: ["string", "null"] },
            widgets: { type: "array" },
            layout: { type: "array" },
          },
        },
      },
    },
    dashboardDeleted: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" },
      },
    },
  },
};