// routes/auth/index.ts
// Head route file for all auth-related endpoints.
// This file ONLY maps URLs to controllers — no logic here.
// Prefix: /api/auth (set in server.ts)

import type { FastifyInstance } from 'fastify';
import { registerController } from '../../controllers/auth/registerController.ts';
import { loginController } from '../../controllers/auth/loginController.ts';
import { refreshController } from '../../controllers/auth/refreshController.ts';
import { logoutController } from '../../controllers/auth/logoutController.ts';

// Tight rate limit for login + register — 10 requests per minute per IP
// Brute force and credential stuffing target these endpoints specifically
const authRateLimit = { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } };

export default async function authRoutes(server: FastifyInstance): Promise<void> {

  // POST /api/auth/register — create a new user + pet (strict rate limit)
  server.post('/register', authRateLimit, registerController);

  // POST /api/auth/login — verify credentials, return tokens (strict rate limit)
  server.post('/login', authRateLimit, loginController);

  // POST /api/auth/refresh — issue new tokens using refresh cookie
  server.post('/refresh', refreshController);

  // POST /api/auth/logout — requires auth, clears refresh token
  server.post('/logout', { preHandler: server.authenticate }, logoutController);
}
