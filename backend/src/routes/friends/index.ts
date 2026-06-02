// routes/friends/index.ts
// Route file for all friend endpoints.
// This file ONLY maps URLs to controllers — no logic here.
// Prefix: /api/friends (set in server.ts)

import type { FastifyInstance } from 'fastify';
import { addFriendController } from '../../controllers/friends/addFriendController.ts';
import { getFriendsController } from '../../controllers/friends/getFriendsController.ts';
import { getLeaderboardController } from '../../controllers/friends/getLeaderboardController.ts';
import { getPendingRequestsController } from '../../controllers/friends/getPendingRequestsController.ts';
import { acceptFriendController } from '../../controllers/friends/acceptFriendController.ts';
import { removeFriendController } from '../../controllers/friends/removeFriendController.ts';

export default async function friendRoutes(server: FastifyInstance): Promise<void> {

  // POST /api/friends/add — send a friend request by username (protected)
  server.post('/add', { preHandler: server.authenticate }, addFriendController);

  // GET /api/friends — list accepted friends + their pet data (protected)
  server.get('/', { preHandler: server.authenticate }, getFriendsController);

  // GET /api/friends/leaderboard — friends ranked by XP (protected)
  server.get('/leaderboard', { preHandler: server.authenticate }, getLeaderboardController);

  // GET /api/friends/requests — incoming pending requests (protected)
  server.get('/requests', { preHandler: server.authenticate }, getPendingRequestsController);

  // POST /api/friends/:id/accept — accept a pending request (protected)
  server.post('/:id/accept', { preHandler: server.authenticate }, acceptFriendController);

  // DELETE /api/friends/:id — remove a friend or decline a request (protected)
  server.delete('/:id', { preHandler: server.authenticate }, removeFriendController);
}
