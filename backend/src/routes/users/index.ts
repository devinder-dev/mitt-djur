// routes/users/index.ts
// Route file for all user profile endpoints.
// This file ONLY maps URLs to controllers — no logic here.
// Prefix: /api/users (set in server.ts)

import type { FastifyInstance } from 'fastify';
import { getMeController } from '../../controllers/users/getMeController.ts';
import { updateMeController } from '../../controllers/users/updateMeController.ts';
import { deleteMeController } from '../../controllers/users/deleteMeController.ts';
import { onboardingController } from '../../controllers/users/onboardingController.ts';
import { getStreakController } from '../../controllers/users/getStreakController.ts';
import { getCoinsController } from '../../controllers/users/getCoinsController.ts';

export default async function userRoutes(server: FastifyInstance): Promise<void> {

  // GET /api/users/me — return own profile (protected)
  server.get('/me', { preHandler: server.authenticate }, getMeController);

  // PATCH /api/users/me — update username / avatarUrl (protected)
  server.patch('/me', { preHandler: server.authenticate }, updateMeController);

  // DELETE /api/users/me — delete account + pet (protected)
  server.delete('/me', { preHandler: server.authenticate }, deleteMeController);

  // PATCH /api/users/me/onboarding — save pet animal + goals (protected)
  server.patch('/me/onboarding', { preHandler: server.authenticate }, onboardingController);

  // GET /api/users/me/streak — return current streak count and last streak date (protected)
  server.get('/me/streak', { preHandler: server.authenticate }, getStreakController);

  // GET /api/users/me/coins — return current coin balance (protected)
  server.get('/me/coins', { preHandler: server.authenticate }, getCoinsController);
}
