// controllers/users/getMeController.ts
// Handles GET /api/users/me
// Job: grab userId from request → call service → send profile

import type { FastifyRequest, FastifyReply } from 'fastify';
import * as userService from '../../services/userService.ts';

export const getMeController = async (request: FastifyRequest, reply: FastifyReply) => {

  // Step 1: userId is already set by the authenticate middleware
  const profile = await userService.getMe(request.server.db, request.userId);

  // Step 2: Send the profile back
  return reply.status(200).send({
    success: true,
    data: profile,
  });
};
