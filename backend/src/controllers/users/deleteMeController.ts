// controllers/users/deleteMeController.ts
// Handles DELETE /api/users/me
// Job: call service to delete account → clear cookie → send response

import type { FastifyRequest, FastifyReply } from 'fastify';
import * as userService from '../../services/userService.ts';

export const deleteMeController = async (request: FastifyRequest, reply: FastifyReply) => {

  // Step 1: Delete the user + their pet from the database
  await userService.deleteMe(request.server.db, request.userId);

  // Step 2: Clear the refresh token cookie — account is gone, cookie is useless
  reply.clearCookie('refreshToken', {
    path: '/api/auth',
  });

  // Step 3: Send success response
  return reply.status(200).send({
    success: true,
    message: 'Account deleted successfully',
  });
};
