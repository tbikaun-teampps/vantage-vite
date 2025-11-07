import { Type } from "@sinclair/typebox";
import { commonResponseSchemas } from "./common.js";





// ----

export const questionnaireSchemas = {
  params: {
    questionnaireId: Type.Object({
      questionnaireId: Type.String(),
    }),
  },

  body: {
    create: Type.Object({
      name: Type.String(),
      description: Type.Optional(Type.String()),
      guidelines: Type.Optional(Type.String()),
      company_id: Type.Optional(Type.String()),
      status: Type.Optional(
        Type.Union([
          Type.Literal("draft"),
          Type.Literal("active"),
          Type.Literal("under_review"),
          Type.Literal("archived"),
        ])
      ),
    }),

    update: Type.Object({
      name: Type.Optional(Type.String()),
      description: Type.Optional(Type.String()),
      guidelines: Type.Optional(Type.String()),
      status: Type.Optional(
        Type.Union([
          Type.Literal("draft"),
          Type.Literal("active"),
          Type.Literal("under_review"),
          Type.Literal("archived"),
        ])
      ),
    }),
  },

  responses: {
    questionnaireList: Type.Object({
      success: Type.Boolean(),
      data: Type.Array(
        Type.Object({
          id: Type.Number(),
          name: Type.String(),
          description: Type.String(),
          guidelines: Type.String(),
          status: Type.String(),
          created_at: Type.String(),
          updated_at: Type.String(),
          section_count: Type.Number(),
          step_count: Type.Number(),
          question_count: Type.Number(),
        })
      ),
    }),

    questionnaireDetail: Type.Object({
      success: Type.Boolean(),
      data: Type.Object({
        id: Type.Number(),
        name: Type.String(),
        description: Type.String(),
        guidelines: Type.String(),
        status: Type.String(),
        created_at: Type.String(),
        updated_at: Type.String(),
        section_count: Type.Number(),
        step_count: Type.Number(),
        question_count: Type.Number(),
        sections: Type.Array(
          Type.Object({
            id: Type.Number(),
            title: Type.String(),
            order_index: Type.Number(),
            expanded: Type.Boolean(),
            steps: Type.Array(
              Type.Object({
                id: Type.Number(),
                title: Type.String(),
                expanded: Type.Boolean(),
                order_index: Type.Number(),
                questions: Type.Array(
                  Type.Object({
                    id: Type.Number(),
                    question_text: Type.String(),
                    context: Type.String(),
                    order_index: Type.Number(),
                    title: Type.String(),
                    question_rating_scales: Type.Array(
                      Type.Object({
                        id: Type.Number(),
                        questionnaire_rating_scale_id: Type.Number(),
                        description: Type.String(),
                      })
                    ),
                    question_roles: Type.Array(
                      Type.Object({
                        id: Type.Number(),
                        shared_role_id: Type.Number(),
                        name: Type.String(),
                        description: Type.String(),
                      })
                    ),
                  })
                ),
              })
            ),
          })
        ),
        questionnaire_rating_scales: Type.Array(
          Type.Object({
            id: Type.Number(),
            name: Type.String(),
            description: Type.String(),
            value: Type.Number(),
            order_index: Type.Number(),
          })
        ),
      }),
    }),

    questionnaireCreate: Type.Object({
      success: Type.Boolean(),
      data: Type.Array(
        Type.Object({
          id: Type.Number(),
          name: Type.String(),
          description: Type.String(),
          guidelines: Type.String(),
          status: Type.String(),
          created_at: Type.String(),
          updated_at: Type.String(),
        })
      ),
    }),

    ...commonResponseSchemas.responses,
  },
};
