// controllers/activity/getActivityHistoryController.ts
// Handles GET /api/activity/history

import type { FastifyRequest, FastifyReply } from 'fastify';
import * as activityService from '../../services/activityService.ts';

export const getActivityHistoryController = async (request: FastifyRequest, reply: FastifyReply) => {
  const history = await activityService.getActivityHistory(request.server.db, request.userId);
  return reply.status(200).send({ success: true, data: history });
};
