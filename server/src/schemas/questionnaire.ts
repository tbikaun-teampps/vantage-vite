import { commonResponseSchemas } from "./common.js";

export const questionnaireSchemas = {
  params: {
    questionnaireId: {
      type: "object",
      properties: {
        questionnaireId: { type: "string" },
      },
      required: ["questionnaireId"],
    },
  },

  body: {
    create: {
      type: "object",
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        guidelines: { type: "string" },
        company_id: { type: "string" },
        status: {
          type: "string",
          enum: ["draft", "active", "under_review", "archived"],
        },
      },
      required: ["name"],
    },

    update: {
      type: "object",
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        guidelines: { type: "string" },
        status: {
          type: "string",
          enum: ["draft", "active", "under_review", "archived"],
        },
      },
    },
  },

  responses: {
    questionnaireList: {
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
              description: { type: "string" },
              guidelines: { type: "string" },
              status: { type: "string" },
              created_at: { type: "string" },
              updated_at: { type: "string" },
              section_count: { type: "number" },
              step_count: { type: "number" },
              question_count: { type: "number" },
            },
          },
        },
      },
    },

    questionnaireDetail: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        data: {
          type: "object",
          properties: {
            id: { type: "number" },
            name: { type: "string" },
            description: { type: "string" },
            guidelines: { type: "string" },
            status: { type: "string" },
            created_at: { type: "string" },
            updated_at: { type: "string" },
            section_count: { type: "number" },
            step_count: { type: "number" },
            question_count: { type: "number" },
            sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  title: { type: "string" },
                  order_index: { type: "number" },
                  expanded: { type: "boolean" },
                  steps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        title: { type: "string" },
                        expanded: { type: "boolean" },
                        order_index: { type: "number" },
                        questions: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              id: { type: "number" },
                              question_text: { type: "string" },
                              context: { type: "string" },
                              order_index: { type: "number" },
                              title: { type: "string" },
                              question_rating_scales: {
                                type: "array",
                                items: {
                                  type: "object",
                                  properties: {
                                    id: { type: "number" },
                                    questionnaire_rating_scale_id: {
                                      type: "number",
                                    },
                                    description: { type: "string" },
                                  },
                                },
                              },
                              question_roles: {
                                type: "array",
                                items: {
                                  type: "object",
                                  properties: {
                                    id: { type: "number" },
                                    shared_role_id: { type: "number" },
                                    name: { type: "string" },
                                    description: { type: "string" },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            questionnaire_rating_scales: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  name: { type: "string" },
                  description: { type: "string" },
                  value: { type: "number" },
                  order_index: { type: "number" },
                },
              },
            },
          },
        },
      },
    },

    questionnaireCreate: {
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
              description: { type: "string" },
              guidelines: { type: "string" },
              status: { type: "string" },
              created_at: { type: "string" },
              updated_at: { type: "string" },
            },
          },
        },
      },
    },

    ...commonResponseSchemas.responses,
  },
} as const;
