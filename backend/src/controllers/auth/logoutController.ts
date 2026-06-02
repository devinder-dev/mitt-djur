// controllers/auth/logoutController.ts
// Handles POST /api/auth/logout
// Job: remove refresh token from DB + clear cookie
// Requires authentication (preHandler: server.authenticate)

import type { FastifyRequest, FastifyReply } from 'fastify';
import * as authService from '../../services/authService.ts';

export const logoutController = async (request: FastifyRequest, reply: FastifyReply) => {

  // Step 1: Remove refresh token from DB (userId set by authenticate middleware)
  await authService.logout(request.server.db, request.userId);

  // Step 2: Clear the refresh token cookie
  reply.clearCookie('refreshToken', {
    path: '/api/auth',
  });

  // Step 3: Send success response
  return reply.status(200).send({
    success: true,
    message: 'Logged out successfully',
  });
};
