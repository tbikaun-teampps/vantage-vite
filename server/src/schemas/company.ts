import { commonResponseSchemas } from "./common.js";

export const companySchemas = {
  params: {
    companyId: {
      type: "object",
      properties: {
        companyId: { type: "string" },
      },
      required: ["companyId"],
    },

    entityParams: {
      type: "object",
      properties: {
        companyId: { type: "string" },
        entityId: { type: "string" },
      },
      required: ["companyId", "entityId"],
    },

    contactParams: {
      type: "object",
      properties: {
        companyId: { type: "string" },
        entityType: {
          type: "string",
          enum: ["company", "business-unit", "region", "site", "asset-group", "work-group", "role"],
        },
        entityId: { type: "string" },
      },
      required: ["companyId", "entityType", "entityId"],
    },

    contactDeleteParams: {
      type: "object",
      properties: {
        companyId: { type: "string" },
        entityType: {
          type: "string",
          enum: ["company", "business-unit", "region", "site", "asset-group", "work-group", "role"],
        },
        entityId: { type: "string" },
        contactId: { type: "string" },
      },
      required: ["companyId", "entityType", "entityId", "contactId"],
    },

    contactUpdateParams: {
      type: "object",
      properties: {
        companyId: { type: "string" },
        contactId: { type: "string" },
      },
      required: ["companyId", "contactId"],
    },
  },

  querystring: {
    entityType: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["business-units", "regions", "sites", "asset-groups", "work-groups", "roles"],
        },
      },
      additionalProperties: false,
    },
  },

  body: {
    createCompany: {
      type: "object",
      properties: {
        name: { type: "string" },
        code: { type: "string" },
        description: { type: "string" },
      },
      additionalProperties: false,
      required: ["name", "code"],
    },

    updateCompany: {
      type: "object",
      properties: {
        name: { type: "string" },
        code: { type: "string" },
        description: { type: "string" },
      },
      additionalProperties: false,
    },

    createContact: {
      type: "object",
      properties: {
        full_name: { type: "string" },
        email: { type: "string", format: "email" },
        phone: { type: "string" },
        title: { type: "string" },
      },
      required: ["full_name", "email"],
      additionalProperties: false,
    },

    updateContact: {
      type: "object",
      properties: {
        full_name: { type: "string" },
        email: { type: "string", format: "email" },
        phone: { type: "string" },
        title: { type: "string" },
      },
      additionalProperties: false,
    },
  },

  responses: {
    companyList: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              code: { type: "string" },
              description: { type: "string" },
              created_at: { type: "string" },
              updated_at: { type: "string" },
            },
          },
        },
      },
    },

    companyDetail: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        data: { type: "object" },
      },
    },

    entityList: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        data: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: true,
          },
        },
      },
    },

    companyTree: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        data: { type: "object" },
      },
    },

    contactList: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "number" },
              full_name: { type: "string" },
              email: { type: "string" },
              phone: { type: "string" },
              title: { type: "string" },
            },
          },
        },
      },
    },

    contactDetail: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        data: {
          type: "object",
          properties: {
            id: { type: "number" },
            full_name: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            title: { type: "string" },
            company_id: { type: "string" },
          },
        },
      },
    },

    ...commonResponseSchemas.responses,
  },
} as const;