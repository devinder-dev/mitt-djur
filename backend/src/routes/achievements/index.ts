// routes/achievements/index.ts
// Route file for all achievement endpoints.
// This file ONLY maps URLs to controllers — no logic here.
// Prefix: /api/achievements (set in server.ts)

import type { FastifyInstance } from 'fastify';
import { getAchievementsController } from '../../controllers/achievements/getAchievementsController.ts';

export default async function achievementRoutes(server: FastifyInstance): Promise<void> {

  // GET /api/achievements — list all earned achievements for the user (protected)
  server.get('/', { preHandler: server.authenticate }, getAchievementsController);
}
