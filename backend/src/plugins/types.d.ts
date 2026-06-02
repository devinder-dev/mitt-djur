// plugins/types.d.ts
// Extends Fastify's TypeScript types to include our custom decorators.

import { Db } from 'mongodb';
import type { FastifyRequest, FastifyReply } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    // db — MongoDB database instance, attached by plugins/mongodb.ts
    db: Db;

    // authenticate — JWT guard, attached by middleware/authenticate.ts
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    // userId — set by authenticate middleware after verifying the JWT
    userId: string;
  }
}
