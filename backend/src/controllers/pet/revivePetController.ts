// controllers/pet/revivePetController.ts
// Handles POST /api/pet/revive
// Job: validate body → call service → send new pet profile

import type { FastifyRequest, FastifyReply } from 'fastify';
import { validate } from '../../utils/validate.ts';
import { revivePetSchema } from '../../schemas/petSchemas.ts';
import * as petService from '../../services/petService.ts';

export const revivePetController = async (request: FastifyRequest, reply: FastifyReply) => {

  // Step 1: Validate the request body
  const body = validate(revivePetSchema, request.body);

  // Step 2: Call the service — create a new pet after death
  const pet = await petService.revivePet(request.server.db, request.userId, body);

  // Step 3: Send the new pet back
  return reply.status(201).send({
    success: true,
    data: pet,
  });
};
