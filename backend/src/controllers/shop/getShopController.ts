// controllers/shop/getShopController.ts
// Handles GET /api/shop
// Job: call service → return all shop items with owned status

import type { FastifyRequest, FastifyReply } from 'fastify';
import * as shopService from '../../services/shopService.ts';

export const getShopController = async (request: FastifyRequest, reply: FastifyReply) => {

  // Step 1: Get all shop items for this user
  const items = await shopService.getShop(request.server.db, request.userId);

  // Step 2: Send the list back
  return reply.status(200).send({
    success: true,
    data: items,
  });
};
