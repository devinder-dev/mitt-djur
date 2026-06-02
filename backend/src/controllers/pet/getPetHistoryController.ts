// controllers/pet/getPetHistoryController.ts
// Handles GET /api/pet/history
// Job: grab userId from request → call service → send last 90 days of activity

import type { FastifyRequest, FastifyReply } from 'fastify';
import * as petService from '../../services/petService.ts';

export const getPetHistoryController = async (request: FastifyRequest, reply: FastifyReply) => {

  // Step 1: userId is already set by the authenticate middleware
  const history = await petService.getPetHistory(request.server.db, request.userId);

  // Step 2: Send the history array back
  return reply.status(200).send({
    success: true,
    data: history,
  });
};
