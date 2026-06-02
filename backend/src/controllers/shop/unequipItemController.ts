// controllers/shop/unequipItemController.ts
// Handles POST /api/shop/unequip
// Job: call service → clear the pet's equip slot

import type { FastifyRequest, FastifyReply } from 'fastify';
import * as shopService from '../../services/shopService.ts';

export const unequipItemController = async (request: FastifyRequest, reply: FastifyReply) => {

  // Step 1: Call the service — clears accessoriesEquipped
  const result = await shopService.unequipItem(request.server.db, request.userId);

  // Step 2: Send the result back
  return reply.status(200).send({
    success: true,
    data: result,
  });
};
