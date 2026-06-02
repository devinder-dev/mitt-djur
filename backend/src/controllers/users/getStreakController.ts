// controllers/users/getStreakController.ts
// Handles GET /api/users/me/streak
// Job: call service → return current streak count and last streak date

import type { FastifyRequest, FastifyReply } from 'fastify';
import * as streakService from '../../services/streakService.ts';

export const getStreakController = async (request: FastifyRequest, reply: FastifyReply) => {

  // Step 1: Get streak data for the logged-in user
  const data = await streakService.getStreak(request.server.db, request.userId);

  // Step 2: Send it back
  return reply.status(200).send({
    success: true,
    data,
  });
};
