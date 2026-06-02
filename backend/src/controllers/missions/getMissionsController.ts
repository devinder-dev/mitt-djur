// controllers/missions/getMissionsController.ts
// Handles GET /api/missions
// Job: call service → return missions filtered by user's goals

import type { FastifyRequest, FastifyReply } from 'fastify';
import * as missionService from '../../services/missionService.ts';

export const getMissionsController = async (request: FastifyRequest, reply: FastifyReply) => {

  // Step 1: Get missions filtered by the logged-in user's goals
  const missions = await missionService.getMissions(request.server.db, request.userId);

  // Step 2: Send the list back
  return reply.status(200).send({
    success: true,
    data: missions,
  });
};
