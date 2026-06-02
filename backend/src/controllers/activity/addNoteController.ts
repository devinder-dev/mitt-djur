// controllers/activity/addNoteController.ts
// Handles POST /api/activity/note
// Job: validate body → call service → send result

import type { FastifyRequest, FastifyReply } from 'fastify';
import { validate } from '../../utils/validate.ts';
import { addNoteSchema } from '../../schemas/activitySchemas.ts';
import * as activityService from '../../services/activityService.ts';

export const addNoteController = async (request: FastifyRequest, reply: FastifyReply) => {

  // Step 1: Validate the request body
  const body = validate(addNoteSchema, request.body);

  // Step 2: Call the service — save the daily note
  const result = await activityService.addNote(request.server.db, request.userId, body);

  // Step 3: Send the result back
  return reply.status(200).send({
    success: true,
    data: result,
  });
};
