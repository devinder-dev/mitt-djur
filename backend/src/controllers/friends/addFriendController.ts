// controllers/friends/addFriendController.ts
// Handles POST /api/friends/add

import type { FastifyRequest, FastifyReply } from 'fastify';
import { validate } from '../../utils/validate.ts';
import { addFriendSchema } from '../../schemas/friendSchemas.ts';
import * as friendService from '../../services/friendService.ts';

export const addFriendController = async (request: FastifyRequest, reply: FastifyReply) => {
  const body = validate(addFriendSchema, request.body);
  const result = await friendService.addFriend(request.server.db, request.userId, body);
  return reply.status(201).send({ success: true, data: result });
};
