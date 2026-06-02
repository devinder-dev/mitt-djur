// plugins/errorHandler.ts
// Global error handler plugin + AppError class.
// AppError is a custom error that carries an HTTP status code.
// The error handler catches ALL errors and sends clean JSON responses.

import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ValidationError } from '../utils/validate.ts';

// ─── AppError ─────────────────────────────────────────────────────────────────

// Use this to throw errors with a specific HTTP status code.
// Example: throw new AppError('Email already in use', 409)
export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}

// ─── Error Handler Plugin ─────────────────────────────────────────────────────

async function errorHandlerPlugin(fastify: FastifyInstance): Promise<void> {

  fastify.setErrorHandler(
    async (error: Error, request: FastifyRequest, reply: FastifyReply) => {

      // Step 1: Validation errors → 400
      if (error instanceof ValidationError) {
        return reply.status(400).send({
          success: false,
          message: 'Validation failed',
          details: error.details,
        });
      }

      // Step 2: AppError → use the status code it carries
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      // Step 3: Everything else → 500
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error',
      });
    }
  );
}

export default fp(errorHandlerPlugin);
