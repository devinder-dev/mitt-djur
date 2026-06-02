// controllers/users/onboardingController.ts
// Handles PATCH /api/users/me/onboarding
// Job: validate body → call service → send result

import type { FastifyRequest, FastifyReply } from 'fastify';
import { validate } from '../../utils/validate.ts';
import { onboardingSchema } from '../../schemas/userSchemas.ts';
import * as userService from '../../services/userService.ts';

export const onboardingController = async (request: FastifyRequest, reply: FastifyReply) => {

  // Step 1: Validate the request body
  const body = validate(onboardingSchema, request.body);

  // Step 2: Call the service — save pet animal + goals
  const result = await userService.completeOnboarding(request.server.db, request.userId, body);

  // Step 3: Send the result back
  return reply.status(200).send({
    success: true,
    data: result,
  });
};
