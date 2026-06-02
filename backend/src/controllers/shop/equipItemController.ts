// controllers/shop/equipItemController.ts
// Handles POST /api/shop/equip/:itemId
// Job: grab itemId from params → call service → send result

import type { FastifyRequest, FastifyReply } from 'fastify';
import * as shopService from '../../services/shopService.ts';

export const equipItemController = async (request: FastifyRequest, reply: FastifyReply) => {

  // Step 1: Get item id from URL params
  const { itemId } = request.params as { itemId: string };

  // Step 2: Call the service — verify ownership, replace equip slot
  const result = await shopService.equipItem(request.server.db, request.userId, itemId);

  // Step 3: Send the result back
  return reply.status(200).send({
    success: true,
    data: result,
  });
};
