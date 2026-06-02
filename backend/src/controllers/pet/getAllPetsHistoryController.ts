// controllers/pet/getAllPetsHistoryController.ts
// Handles GET /api/pet/history/all
// Job: call service → send all pets (alive + dead) for history view

import type { FastifyRequest, FastifyReply } from 'fastify';
import * as petService from '../../services/petService.ts';

export const getAllPetsHistoryController = async (request: FastifyRequest, reply: FastifyReply) => {

  // Step 1: Get all pets for this user — alive and dead
  const history = await petService.getAllPetsHistory(request.server.db, request.userId);

  // Step 2: Send the list back
  return reply.status(200).send({
    success: true,
    data: history,
  });
};
