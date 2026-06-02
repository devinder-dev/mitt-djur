// controllers/hud/getHudController.ts
// Handles GET /api/hud

import type { FastifyRequest, FastifyReply } from 'fastify';
import * as hudService from '../../services/hudService.ts';

export const getHudController = async (request: FastifyRequest, reply: FastifyReply) => {
  const hud = await hudService.getHud(request.server.db, request.userId);
  return reply.status(200).send({ success: true, data: hud });
};
