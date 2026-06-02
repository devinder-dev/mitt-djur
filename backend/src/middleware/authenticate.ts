// middleware/authenticate.ts
// JWT authentication plugin.
// Manually verifies the access token from the Authorization header.
// If valid, attaches request.userId for use in controllers/services.
// Registered as a Fastify plugin so server.authenticate is available everywhere.
//
// Usage in routes:
//   server.post('/logout', { preHandler: server.authenticate }, logoutController)

import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.ts';

// ─── Token Payload Type ──────────────────────────────────────────────────────

interface JwtPayload {
  id: string;
  email: string;
}

// ─── Authenticate Function ───────────────────────────────────────────────────

const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {

  // Step 1: Get the Authorization header
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({
      success: false,
      message: 'Access token is required',
    });
  }

  // Step 2: Extract the token
  const token = authHeader.split(' ')[1];

  if (!token) {
    return reply.status(401).send({
      success: false,
      message: 'Access token is required',
    });
  }

  // Step 3: Verify the token and attach userId to the request
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    request.userId = decoded.id;
  } catch {
    return reply.status(401).send({
      success: false,
      message: 'Invalid or expired access token',
    });
  }
};

// ─── Plugin ──────────────────────────────────────────────────────────────────

const authenticatePlugin = async (fastify: FastifyInstance) => {
  fastify.decorate('authenticate', authenticate);
};

export default fp(authenticatePlugin, {
  name: 'authenticate',
});
