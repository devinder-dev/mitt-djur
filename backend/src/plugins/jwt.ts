// plugins/jwt.ts
// Fastify plugin that registers cookie support.
// Cookies are needed for the httpOnly refresh token.
// JWT signing/verifying is handled by jsonwebtoken in the service layer.

import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import fCookie from '@fastify/cookie';

async function jwtPlugin(fastify: FastifyInstance): Promise<void> {

  // Register cookie plugin — needed for httpOnly refresh token
  fastify.register(fCookie);
}

export default fp(jwtPlugin);
