// controllers/friends/acceptFriendController.ts
// Handles POST /api/friends/:id/accept

import type { FastifyRequest, FastifyReply } from 'fastify';
import * as friendService from '../../services/friendService.ts';

export const acceptFriendController = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const result = await friendService.acceptRequest(request.server.db, request.userId, id);
  return reply.status(200).send({ success: true, data: result });
};
