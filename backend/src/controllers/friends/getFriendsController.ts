// controllers/friends/getFriendsController.ts
// Handles GET /api/friends

import type { FastifyRequest, FastifyReply } from 'fastify';
import * as friendService from '../../services/friendService.ts';

export const getFriendsController = async (request: FastifyRequest, reply: FastifyReply) => {
  const friends = await friendService.getFriends(request.server.db, request.userId);
  return reply.status(200).send({ success: true, data: friends });
};
