// controllers/setMoodController.ts
// Handles POST /api/activity/mood
// Job: validate body → call service → send result

import type { FastifyRequest, FastifyReply } from 'fastify';
import { validate } from '../../utils/validate.ts';
import { setMoodSchema } from '../../schemas/activitySchemas.ts';
import * as activityService from '../../services/activityService.ts';

export const setMoodController = async (request: FastifyRequest, reply: FastifyReply) => {

  // Step 1: Validate the request body
  const body = validate(setMoodSchema, request.body);

  // Step 2: Call the service — set the mood and award XP
  const result = await activityService.setMood(request.server.db, request.userId, body);

  // Step 3: Send the result back
  return reply.status(200).send({
    success: true,
    data: result,
  });
};
