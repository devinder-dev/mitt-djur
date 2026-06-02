// controllers/friends/getLeaderboardController.ts
// Handles GET /api/friends/leaderboard

import type { FastifyRequest, FastifyReply } from 'fastify';
import * as friendService from '../../services/friendService.ts';

export const getLeaderboardController = async (request: FastifyRequest, reply: FastifyReply) => {
  const leaderboard = await friendService.getLeaderboard(request.server.db, request.userId);
  return reply.status(200).send({ success: true, data: leaderboard });
};
