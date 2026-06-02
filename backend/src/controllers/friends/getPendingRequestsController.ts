// controllers/friends/getPendingRequestsController.ts
// Handles GET /api/friends/requests

import type { FastifyRequest, FastifyReply } from 'fastify';
import * as friendService from '../../services/friendService.ts';

export const getPendingRequestsController = async (request: FastifyRequest, reply: FastifyReply) => {
  const requests = await friendService.getPendingRequests(request.server.db, request.userId);
  return reply.status(200).send({ success: true, data: requests });
};
