// plugins/mongodb.ts
// Fastify plugin that attaches the MongoDB database instance to the Fastify server.
// By using fastify-plugin (fp), the decorator is shared across the entire app —
// every route can access the database via server.db

import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { client } from '../config/db.ts';

// Step 1: Define the plugin — attach db to the Fastify instance
async function mongodbPlugin(fastify: FastifyInstance): Promise<void> {

  // Step 2: Get the database instance from the already-connected client
  const db = client.db();

  // Step 3: Decorate the Fastify instance with the database
  // This makes fastify.db available in all routes and plugins
  fastify.decorate('db', db);
}

// Step 4: Wrap with fp so the decorator is shared across the whole app
// Without fp, decorators are scoped only to the plugin they are defined in
export default fp(mongodbPlugin);
