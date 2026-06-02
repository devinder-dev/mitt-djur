// plugins/cors.ts
// Configures CORS so the frontend can talk to the backend.
// Allowed origin is read from FRONTEND_URL in the environment.
// Only the methods our API actually uses are allowed.

import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import fCors from '@fastify/cors';
import { env } from '../config/env.ts';

async function corsPlugin(fastify: FastifyInstance): Promise<void> {
  fastify.register(fCors, {
    // Step 1: Only allow requests from our frontend origin
    origin: env.FRONTEND_URL,

    // Step 2: Allow only the HTTP methods our API uses
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],

    // Step 3: Allow cookies to be sent cross-origin (needed for httpOnly refresh token)
    credentials: true,
  });
}

export default fp(corsPlugin);
