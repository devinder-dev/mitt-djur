// controllers/missions/completeMissionController.ts
// Handles POST /api/missions/:id/complete
// Job: grab mission document id from params → call service → send result

import type { FastifyRequest, FastifyReply } from 'fastify';
import * as missionService from '../../services/missionService.ts';

export const completeMissionController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {

  // Step 1: Get the user mission document id from URL params
  const { id } = request.params as { id: string };

  // Step 2: Call the service — mark complete, award XP + coins
  const result = await missionService.completeMission(request.server.db, request.userId, id);

  // Step 3: Send the result back
  return reply.status(200).send({
    success: true,
    data: result,
  });
};
