// controllers/notifications/markAllReadController.ts
// Handles PATCH /api/notifications/read-all

import type { FastifyRequest, FastifyReply } from 'fastify';
import * as notificationService from '../../services/notificationService.ts';

export const markAllReadController = async (request: FastifyRequest, reply: FastifyReply) => {
  await notificationService.markAllRead(request.server.db, request.userId);
  return reply.status(200).send({ success: true, data: { message: 'All notifications marked as read' } });
};
