// controllers/pet/getPetController.ts
// Handles GET /api/pet
// Job: grab userId from request → call service → send pet profile

import type { FastifyRequest, FastifyReply } from 'fastify';
import * as petService from '../../services/petService.ts';

export const getPetController = async (request: FastifyRequest, reply: FastifyReply) => {

  // Step 1: userId is already set by the authenticate middleware
  const pet = await petService.getMyPet(request.server.db, request.userId);

  // Step 2: Send the pet profile back
  return reply.status(200).send({
    success: true,
    data: pet,
  });
};
