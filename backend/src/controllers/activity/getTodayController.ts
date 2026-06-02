// controllers/activity/getTodayController.ts
// Handles GET /api/activity/today
// Job: grab userId from request → call service → send today's activity log

import type { FastifyRequest, FastifyReply } from 'fastify';
import * as activityService from '../../services/activityService.ts';

export const getTodayController = async (request: FastifyRequest, reply: FastifyReply) => {

  // Step 1: userId is already set by the authenticate middleware
  const log = await activityService.getTodayLog(request.server.db, request.userId);

  // Step 2: Send today's log back
  return reply.status(200).send({
    success: true,
    data: log,
  });
};
