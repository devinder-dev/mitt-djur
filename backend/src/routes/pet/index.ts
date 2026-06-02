// routes/pet/index.ts
// Route file for all pet endpoints.
// This file ONLY maps URLs to controllers — no logic here.
// Prefix: /api/pet (set in server.ts)

import type { FastifyInstance } from 'fastify';
import { getPetController } from '../../controllers/pet/getPetController.ts';
import { updatePetNameController } from '../../controllers/pet/updatePetNameController.ts';
import { getPetHistoryController } from '../../controllers/pet/getPetHistoryController.ts';
import { revivePetController } from '../../controllers/pet/revivePetController.ts';
import { getAllPetsHistoryController } from '../../controllers/pet/getAllPetsHistoryController.ts';

export default async function petRoutes(server: FastifyInstance): Promise<void> {

  // GET /api/pet — return own pet profile (protected)
  server.get('/', { preHandler: server.authenticate }, getPetController);

  // PATCH /api/pet/name — rename the pet (protected)
  server.patch('/name', { preHandler: server.authenticate }, updatePetNameController);

  // GET /api/pet/history — last 90 days of activity for calendar heatmap (protected)
  server.get('/history', { preHandler: server.authenticate }, getPetHistoryController);

  // GET /api/pet/history/all — all pets alive and dead for history view (protected)
  server.get('/history/all', { preHandler: server.authenticate }, getAllPetsHistoryController);

  // POST /api/pet/revive — create a new pet after current pet dies (protected)
  server.post('/revive', { preHandler: server.authenticate }, revivePetController);
}
