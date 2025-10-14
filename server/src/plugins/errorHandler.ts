import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fastifyPlugin from "fastify-plugin";

/**
 * Custom error classes for different HTTP status codes
 * These errors can be thrown from anywhere in the application
 * and will be automatically caught and handled by the error handler
 */

export class HttpError extends Error {
  statusCode: number;
  context?: Record<string, any>;

  constructor(message: string, statusCode: number, context?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string = "Bad request", context?: Record<string, any>) {
    super(message, 400, context);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string = "Unauthorized", context?: Record<string, any>) {
    super(message, 401, context);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string = "Forbidden", context?: Record<string, any>) {
    super(message, 403, context);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string = "Resource not found", context?: Record<string, any>) {
    super(message, 404, context);
  }
}

export class InternalServerError extends HttpError {
  constructor(message: string = "Internal server error", context?: Record<string, any>) {
    super(message, 500, context);
  }
}

/**
 * Centralized error handler plugin for Fastify
 * Catches all errors thrown in route handlers and middleware
 */
async function errorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler(
    (error: Error, request: FastifyRequest, reply: FastifyReply) => {
      // Check if it's one of our custom HTTP errors
      if (error instanceof HttpError) {
        fastify.log.warn(
          {
            err: error,
            url: request.url,
            method: request.method,
            statusCode: error.statusCode,
            context: error.context,
          },
          `HTTP ${error.statusCode}: ${error.message}`
        );

        const response: any = {
          success: false,
          error: error.message,
        };

        // If the error has additional context data, merge it into the response
        if (error.context) {
          Object.assign(response, error.context);
        }

        return reply.status(error.statusCode).send(response);
      }

      // Handle validation errors from Fastify schema validation
      if (error.name === "FastifyError" && (error as any).validation) {
        fastify.log.warn(
          {
            err: error,
            url: request.url,
            method: request.method,
            validation: (error as any).validation,
          },
          "Validation error"
        );

        return reply.status(400).send({
          success: false,
          error: "Validation error",
          details: (error as any).validation,
        });
      }

      // Handle all other unexpected errors as 500
      fastify.log.error(
        {
          err: error,
          url: request.url,
          method: request.method,
          stack: error.stack,
        },
        `Unhandled error: ${error.message}`
      );

      return reply.status(500).send({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  );
}

export default fastifyPlugin(errorHandler);
