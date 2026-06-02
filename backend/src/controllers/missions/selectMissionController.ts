// controllers/missions/selectMissionController.ts
// Handles POST /api/missions/select/:id
// Job: grab missionId from params → call service → send result

import type { FastifyRequest, FastifyReply } from 'fastify';
import * as missionService from '../../services/missionService.ts';

export const selectMissionController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {

  // Step 1: Get mission id from URL params
  const { id } = request.params as { id: string };

  // Step 2: Call the service — validate and save the selected mission
  const result = await missionService.selectMission(request.server.db, request.userId, id);

  // Step 3: Send the new active mission back
  return reply.status(201).send({
    success: true,
    data: result,
  });
};
