// routes/shop/index.ts
// Route file for all shop endpoints.
// This file ONLY maps URLs to controllers — no logic here.
// Prefix: /api/shop (set in server.ts)

import type { FastifyInstance } from 'fastify';
import { getShopController } from '../../controllers/shop/getShopController.ts';
import { buyItemController } from '../../controllers/shop/buyItemController.ts';
import { equipItemController } from '../../controllers/shop/equipItemController.ts';
import { unequipItemController } from '../../controllers/shop/unequipItemController.ts';

export default async function shopRoutes(server: FastifyInstance): Promise<void> {

  // GET /api/shop — list all shop items with owned + equipped status (protected)
  server.get('/', { preHandler: server.authenticate }, getShopController);

  // POST /api/shop/buy/:itemId — buy an item with coins, auto-equips (protected)
  server.post('/buy/:itemId', { preHandler: server.authenticate }, buyItemController);

  // POST /api/shop/equip/:itemId — equip an item already owned (single slot) (protected)
  server.post('/equip/:itemId', { preHandler: server.authenticate }, equipItemController);

  // POST /api/shop/unequip — clear the equip slot (protected)
  server.post('/unequip', { preHandler: server.authenticate }, unequipItemController);
}
