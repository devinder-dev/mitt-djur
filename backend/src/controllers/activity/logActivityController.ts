// controllers/activity/logActivityController.ts
// Handles POST /api/activity/log
// Job: validate body → call service → send result

import type { FastifyRequest, FastifyReply } from 'fastify';
import { validate } from '../../utils/validate.ts';
import { logActivitySchema } from '../../schemas/activitySchemas.ts';
import * as activityService from '../../services/activityService.ts';

export const logActivityController = async (request: FastifyRequest, reply: FastifyReply) => {

  // Step 1: Validate the request body
  const body = validate(logActivitySchema, request.body);

  // Step 2: Call the service — log the activity and award XP
  const result = await activityService.logActivity(request.server.db, request.userId, body);

  // Step 3: Send the result back
  return reply.status(200).send({
    success: true,
    data: result,
  });
};
