// controllers/friends/removeFriendController.ts
// Handles DELETE /api/friends/:id

import type { FastifyRequest, FastifyReply } from 'fastify';
import * as friendService from '../../services/friendService.ts';

export const removeFriendController = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  await friendService.removeFriend(request.server.db, request.userId, id);
  return reply.status(200).send({ success: true, data: { message: 'Friend removed' } });
};
