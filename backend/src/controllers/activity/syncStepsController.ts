// controllers/activity/syncStepsController.ts
// Handles POST /api/activity/steps
// Job: validate body → call service → send result

import type { FastifyRequest, FastifyReply } from 'fastify';
import { validate } from '../../utils/validate.ts';
import { syncStepsSchema } from '../../schemas/activitySchemas.ts';
import * as activityService from '../../services/activityService.ts';

export const syncStepsController = async (request: FastifyRequest, reply: FastifyReply) => {

  // Step 1: Validate the request body
  const body = validate(syncStepsSchema, request.body);

  // Step 2: Call the service
  const result = await activityService.syncSteps(request.server.db, request.userId, body);

  // Step 3: Send result — include level up message if pet leveled up
  return reply.status(200).send({
    success: true,
    message: result.pet.leveledUp ? '🎉 Your pet leveled up!' : 'Steps synced successfully',
    data: result,
  });
};
