// plugins/rateLimit.ts
// Global rate limiter — protects all routes from brute force and spam.
// Auth endpoints (login, register) are the most critical targets.
// Default: max 60 requests per minute per IP across the whole API.

import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import fRateLimit from '@fastify/rate-limit';

async function rateLimitPlugin(fastify: FastifyInstance): Promise<void> {
  fastify.register(fRateLimit, {
    // Step 1: Time window — 1 minute
    timeWindow: '1 minute',

    // Step 2: Max requests per IP per window
    max: 60,

    // Step 3: Return a clean JSON error when the limit is hit
    errorResponseBuilder: () => ({
      success: false,
      message: 'Too many requests — please try again in a minute',
    }),
  });
}

export default fp(rateLimitPlugin);
