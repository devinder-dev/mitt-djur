// controllers/notifications/markReadController.ts
// Handles PATCH /api/notifications/:id/read

import type { FastifyRequest, FastifyReply } from 'fastify';
import * as notificationService from '../../services/notificationService.ts';

export const markReadController = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  await notificationService.markOneRead(request.server.db, request.userId, id);
  return reply.status(200).send({ success: true, data: { message: 'Notification marked as read' } });
};
