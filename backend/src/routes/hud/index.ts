// routes/hud/index.ts
// Route file for the HUD endpoint.
// This file ONLY maps URLs to controllers — no logic here.
// Prefix: /api/hud (set in server.ts)

import type { FastifyInstance } from 'fastify';
import { getHudController } from '../../controllers/hud/getHudController.ts';

export default async function hudRoutes(server: FastifyInstance): Promise<void> {

  // GET /api/hud — today's summary for the home screen (protected)
  server.get('/', { preHandler: server.authenticate }, getHudController);
}
