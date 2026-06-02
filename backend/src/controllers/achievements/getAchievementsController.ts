// controllers/achievements/getAchievementsController.ts
// Handles GET /api/achievements

import type { FastifyRequest, FastifyReply } from 'fastify';
import * as achievementService from '../../services/achievementService.ts';

export const getAchievementsController = async (request: FastifyRequest, reply: FastifyReply) => {
  const achievements = await achievementService.getAchievements(request.server.db, request.userId);
  return reply.status(200).send({ success: true, data: achievements });
};
