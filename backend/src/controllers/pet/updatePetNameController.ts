// controllers/pet/updatePetNameController.ts
// Handles PATCH /api/pet/name
// Job: validate body → call service → send updated pet profile

import type { FastifyRequest, FastifyReply } from 'fastify';
import { validate } from '../../utils/validate.ts';
import { updatePetNameSchema } from '../../schemas/petSchemas.ts';
import * as petService from '../../services/petService.ts';

export const updatePetNameController = async (request: FastifyRequest, reply: FastifyReply) => {

  // Step 1: Validate the request body
  const body = validate(updatePetNameSchema, request.body);

  // Step 2: Call the service with userId + validated body
  const pet = await petService.updateMyPetName(request.server.db, request.userId, body);

  // Step 3: Send the updated pet profile back
  return reply.status(200).send({
    success: true,
    message: 'Pet name updated successfully',
    data: pet,
  });
};
