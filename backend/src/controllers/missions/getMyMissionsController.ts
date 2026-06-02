// controllers/missions/getMyMissionsController.ts
// Handles GET /api/missions/my
// Job: call service → return user's active missions

import type { FastifyRequest, FastifyReply } from 'fastify';
import * as missionService from '../../services/missionService.ts';

export const getMyMissionsController = async (request: FastifyRequest, reply: FastifyReply) => {

  // Step 1: Get the user's currently active missions
  const missions = await missionService.getMyMissions(request.server.db, request.userId);

  // Step 2: Send the list back
  return reply.status(200).send({
    success: true,
    data: missions,
  });
};
