import { commonResponseSchemas } from "./common.js";

const companyItem = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    code: { type: "string" },
    description: { type: "string" },
    created_at: { type: "string" },
    updated_at: { type: "string" },
    is_demo: { type: "boolean" },
  },
  required: ["id", "name", "code", "created_at", "updated_at"],
};

const companyWithRoleItem = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    code: { type: "string" },
    description: { type: "string" },
    created_at: { type: "string" },
    updated_at: { type: "string" },
    role: { type: "string" },
    is_demo: { type: "boolean" },
  },
  required: ["id", "name", "code", "created_at", "updated_at", "role"],
};

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
          enum: [
            "company",
            "business-unit",
            "region",
            "site",
            "asset-group",
            "work-group",
            "role",
          ],
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
          enum: [
            "company",
            "business-unit",
            "region",
            "site",
            "asset-group",
            "work-group",
            "role",
          ],
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

    teamMemberParams: {
      type: "object",
      properties: {
        companyId: { type: "string" },
        userId: { type: "string" },
      },
      required: ["companyId", "userId"],
    },
  },

  querystring: {
    entityType: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: [
            "business-units",
            "regions",
            "sites",
            "asset-groups",
            "work-groups",
            "roles",
          ],
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
      required: ["name"],
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

    addTeamMember: {
      type: "object",
      properties: {
        email: { type: "string", format: "email" },
        role: {
          type: "string",
          enum: ["owner", "admin", "viewer", "interviewee"],
        },
      },
      required: ["email", "role"],
      additionalProperties: false,
    },

    updateTeamMember: {
      type: "object",
      properties: {
        role: {
          type: "string",
          enum: ["owner", "admin", "viewer", "interviewee"],
        },
      },
      required: ["role"],
      additionalProperties: false,
    },
  },

  responses: {
    company: companyWithRoleItem,
    companyList: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        data: {
          type: "array",
          items: companyWithRoleItem,
        },
      },
    },

    companyWithRoleDetail: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        data: companyWithRoleItem,
      },
    },

    companyDetail: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        data: companyItem,
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

    teamMemberList: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "number" },
              user_id: { type: "string" },
              company_id: { type: "string" },
              role: { type: "string" },
              created_at: { type: "string" },
              updated_at: { type: "string" },
              user: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  email: { type: "string" },
                  full_name: { type: ["string", "null"] },
                },
              },
            },
          },
        },
      },
    },

    teamMemberDetail: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        data: {
          type: "object",
          properties: {
            id: { type: "number" },
            user_id: { type: "string" },
            company_id: { type: "string" },
            role: { type: "string" },
            created_at: { type: "string" },
            updated_at: { type: "string" },
            user: {
              type: "object",
              properties: {
                id: { type: "string" },
                email: { type: "string" },
                full_name: { type: ["string", "null"] },
              },
            },
          },
        },
      },
    },

    ...commonResponseSchemas.responses,
  },
} as const;
