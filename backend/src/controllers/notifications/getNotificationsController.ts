// controllers/notifications/getNotificationsController.ts
// Handles GET /api/notifications

import type { FastifyRequest, FastifyReply } from 'fastify';
import * as notificationService from '../../services/notificationService.ts';

export const getNotificationsController = async (request: FastifyRequest, reply: FastifyReply) => {
  const notifications = await notificationService.getNotifications(request.server.db, request.userId);
  return reply.status(200).send({ success: true, data: notifications });
};
