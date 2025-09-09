import { FastifyInstance } from "fastify";
import { ProgramService } from "../services/ProgramService.js";
import { authMiddleware } from "../middleware/auth.js";

export async function programRoutes(fastify: FastifyInstance) {
  // GET /api/programs - Get all programs
  fastify.get("/api/programs", {
    preHandler: authMiddleware,
    schema: {
      querystring: {
        type: "object",
        properties: {
          company_id: { type: "string" }
        }
      },
      response: {
        200: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: {
              type: "array",
              items: { type: "object" }
            }
          }
        },
        401: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            error: { type: "string" }
          }
        },
        500: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            error: { type: "string" }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      // Get auth token from request
      const authToken = request.headers.authorization?.substring(7); // Remove "Bearer "
      
      if (!authToken) {
        return reply.status(401).send({
          success: false,
          error: "No authorization token provided"
        });
      }

      const programService = new ProgramService(authToken);
      const { company_id } = request.query as { company_id?: string };
      
      const programs = await programService.getPrograms(company_id);
      
      return reply.send({
        success: true,
        data: programs
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error"
      });
    }
  });

  // POST /api/programs/:id/interviews - Create interviews for a program phase
  fastify.post("/api/programs/:id/interviews", {
    preHandler: authMiddleware,
    schema: {
      params: {
        type: "object",
        properties: {
          id: { type: "number" }
        },
        required: ["id"]
      },
      body: {
        type: "object",
        properties: {
          phaseId: { type: "number" },
          isPublic: { type: "boolean", default: false },
          roleIds: { 
            type: "array", 
            items: { type: "number" },
            minItems: 1
          },
          contactIds: {
            type: "array",
            items: { type: "number" }
          },
          interviewType: {
            type: "string",
            enum: ["onsite", "presite"]
          }
        },
        required: ["phaseId", "roleIds", "contactIds", "interviewType"]
      },
      response: {
        200: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                message: { type: "string" },
                interviewsCreated: { type: "number" }
              }
            }
          }
        },
        400: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            error: { type: "string" }
          }
        },
        401: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            error: { type: "string" }
          }
        },
        500: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            error: { type: "string" }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      // Get auth token and user from request
      const authToken = request.headers.authorization?.substring(7); // Remove "Bearer "
      
      if (!authToken) {
        return reply.status(401).send({
          success: false,
          error: "No authorization token provided"
        });
      }

      const programId = (request.params as { id: number }).id;
      const { 
        phaseId, 
        isPublic = false, 
        roleIds, 
        contactIds, 
        interviewType 
      } = request.body as {
        phaseId: number;
        isPublic?: boolean;
        roleIds: number[];
        contactIds: number[];
        interviewType: "onsite" | "presite";
      };

      // Get the user ID from the request (set by auth middleware)
      const createdBy = (request as any).user?.id;
      
      if (!createdBy) {
        return reply.status(401).send({
          success: false,
          error: "User ID not found in request"
        });
      }

      const programService = new ProgramService(authToken);
      
      // Call the complex interview creation method
      const result = await programService.createInterviews(
        programId,
        phaseId,
        isPublic,
        roleIds,
        contactIds,
        interviewType,
        createdBy
      );
      
      return reply.send({
        success: true,
        data: result
      });
    } catch (error) {
      fastify.log.error(error);
      
      // Handle validation errors vs other errors
      if (error instanceof Error) {
        const isValidationError = error.message.includes("must be selected") ||
                                 error.message.includes("questionnaire configured") ||
                                 error.message.includes("No questions found");
        
        return reply.status(isValidationError ? 400 : 500).send({
          success: false,
          error: error.message
        });
      }
      
      return reply.status(500).send({
        success: false,
        error: "Internal server error"
      });
    }
  });
}