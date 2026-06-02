// controllers/users/getCoinsController.ts
// Handles GET /api/users/me/coins
// Job: call service → return current coin balance

import type { FastifyRequest, FastifyReply } from 'fastify';
import * as shopService from '../../services/shopService.ts';

export const getCoinsController = async (request: FastifyRequest, reply: FastifyReply) => {

  // Step 1: Get the coin balance for the logged-in user
  const data = await shopService.getCoins(request.server.db, request.userId);

  // Step 2: Send it back
  return reply.status(200).send({
    success: true,
    data,
  });
};
