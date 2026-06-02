// routes/notifications/index.ts
// Route file for all notification endpoints.
// This file ONLY maps URLs to controllers — no logic here.
// Prefix: /api/notifications (set in server.ts)

import type { FastifyInstance } from 'fastify';
import { getNotificationsController } from '../../controllers/notifications/getNotificationsController.ts';
import { markReadController } from '../../controllers/notifications/markReadController.ts';
import { markAllReadController } from '../../controllers/notifications/markAllReadController.ts';

export default async function notificationRoutes(server: FastifyInstance): Promise<void> {

  // GET /api/notifications — list latest 50 notifications (protected)
  server.get('/', { preHandler: server.authenticate }, getNotificationsController);

  // PATCH /api/notifications/read-all — mark all as read (protected)
  server.patch('/read-all', { preHandler: server.authenticate }, markAllReadController);

  // PATCH /api/notifications/:id/read — mark one as read (protected)
  server.patch('/:id/read', { preHandler: server.authenticate }, markReadController);
}
