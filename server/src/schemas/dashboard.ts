import { Type } from "@sinclair/typebox";

export const dashboardSchemas = {
  body: {
    createDashboard: Type.Object({
      name: Type.String({ description: "Dashboard name" }),
      widgets: Type.Array(
        Type.Object({
          id: Type.String(),
          widgetType: Type.String(),
          config: Type.Object({}, { additionalProperties: true }),
        }),
        { description: "Widget configurations" }
      ),
      layout: Type.Array(
        Type.Object({
          i: Type.String(),
          x: Type.Number(),
          y: Type.Number(),
          w: Type.Number(),
          h: Type.Number(),
        }),
        { description: "React Grid Layout configuration" }
      ),
    }),

    updateDashboard: Type.Object({
      name: Type.Optional(Type.String({ description: "Dashboard name" })),
      widgets: Type.Optional(
        Type.Array(
          Type.Object({}, { additionalProperties: true }),
          { description: "Widget configurations" }
        )
      ),
      layout: Type.Optional(
        Type.Array(
          Type.Object({}, { additionalProperties: true }),
          { description: "React Grid Layout configuration" }
        )
      ),
    }),
  },

  responses: {
    dashboard: Type.Object({
      id: Type.Number(),
      name: Type.String(),
      company_id: Type.String(),
      created_by: Type.String(),
      created_at: Type.String(),
      updated_at: Type.String(),
      is_deleted: Type.Boolean(),
      deleted_at: Type.Union([Type.String(), Type.Null()]),
      widgets: Type.Array(Type.Object({}, { additionalProperties: true })),
      layout: Type.Array(Type.Object({}, { additionalProperties: true })),
    }),

    dashboardList: Type.Object({
      success: Type.Boolean(),
      data: Type.Array(
        Type.Object({
          id: Type.Number(),
          name: Type.String(),
          company_id: Type.String(),
          created_by: Type.String(),
          created_at: Type.String(),
          updated_at: Type.String(),
          is_deleted: Type.Boolean(),
          deleted_at: Type.Union([Type.String(), Type.Null()]),
          widgets: Type.Array(Type.Object({}, { additionalProperties: true })),
          layout: Type.Array(Type.Object({}, { additionalProperties: true })),
        })
      ),
    }),

    dashboardSingle: Type.Object({
      success: Type.Boolean(),
      data: Type.Object({
        id: Type.Number(),
        name: Type.String(),
        company_id: Type.String(),
        created_by: Type.String(),
        created_at: Type.String(),
        updated_at: Type.String(),
        is_deleted: Type.Boolean(),
        deleted_at: Type.Union([Type.String(), Type.Null()]),
        widgets: Type.Array(Type.Object({}, { additionalProperties: true })),
        layout: Type.Array(Type.Object({}, { additionalProperties: true })),
      }),
    }),

    dashboardDeleted: Type.Object({
      success: Type.Boolean(),
      message: Type.String(),
    }),
  },
};
