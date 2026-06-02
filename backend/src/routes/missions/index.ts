// routes/missions/index.ts
// Route file for all mission endpoints.
// This file ONLY maps URLs to controllers — no logic here.
// Prefix: /api/missions (set in server.ts)

import type { FastifyInstance } from 'fastify';
import { getMissionsController } from '../../controllers/missions/getMissionsController.ts';
import { selectMissionController } from '../../controllers/missions/selectMissionController.ts';
import { getMyMissionsController } from '../../controllers/missions/getMyMissionsController.ts';
import { completeMissionController } from '../../controllers/missions/completeMissionController.ts';

export default async function missionRoutes(server: FastifyInstance): Promise<void> {

  // GET /api/missions — list all missions filtered by user's goals (protected)
  server.get('/', { preHandler: server.authenticate }, getMissionsController);

  // GET /api/missions/my — user's currently active missions (protected)
  server.get('/my', { preHandler: server.authenticate }, getMyMissionsController);

  // POST /api/missions/select/:id — select a mission from the list (protected)
  server.post('/select/:id', { preHandler: server.authenticate }, selectMissionController);

  // POST /api/missions/:id/complete — mark a mission as completed (protected)
  server.post('/:id/complete', { preHandler: server.authenticate }, completeMissionController);
}
