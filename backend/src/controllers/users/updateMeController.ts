// controllers/users/updateMeController.ts
// Handles PATCH /api/users/me
// Job: validate body → call service → send updated profile

import type { FastifyRequest, FastifyReply } from 'fastify';
import { validate } from '../../utils/validate.ts';
import { updateMeSchema } from '../../schemas/userSchemas.ts';
import * as userService from '../../services/userService.ts';

export const updateMeController = async (request: FastifyRequest, reply: FastifyReply) => {

  // Step 1: Validate the request body
  const body = validate(updateMeSchema, request.body);

  // Step 2: Call the service with userId + validated body
  const profile = await userService.updateMe(request.server.db, request.userId, body);

  // Step 3: Send the updated profile back
  return reply.status(200).send({
    success: true,
    message: 'Profile updated successfully',
    data: profile,
  });
};
