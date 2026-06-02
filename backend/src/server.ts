// server.ts
// Entry point — builds and starts the Fastify server.
// Registers plugins first, then routes. Order matters.

import Fastify from 'fastify';
import { env } from './config/env.ts';
import { connectDB } from './config/db.ts';
import errorHandlerPlugin from './plugins/errorHandler.ts';
import mongodbPlugin from './plugins/mongodb.ts';
import cookiePlugin from './plugins/jwt.ts';
import corsPlugin from './plugins/cors.ts';
import rateLimitPlugin from './plugins/rateLimit.ts';
import authenticatePlugin from './middleware/authenticate.ts';
import authRoutes from './routes/auth/index.ts';
import userRoutes from './routes/users/index.ts';
import petRoutes from './routes/pet/index.ts';
import activityRoutes from './routes/activity/index.ts';
import missionRoutes from './routes/missions/index.ts';
import shopRoutes from './routes/shop/index.ts';
import notificationRoutes from './routes/notifications/index.ts';
import achievementRoutes from './routes/achievements/index.ts';
import friendRoutes from './routes/friends/index.ts';
import hudRoutes from './routes/hud/index.ts';
import { startHealthDecayJob } from './jobs/healthDecay.ts';
import { startWeeklySummaryJob } from './jobs/weeklySummary.ts';

// Step 1: Build the server
const buildServer = async () => {
  const server = Fastify({
    logger: env.NODE_ENV === 'development',
  });

  // Step 2: Connect to MongoDB
  await connectDB();

  // Step 3: Register plugins (order matters!)
  await server.register(errorHandlerPlugin);
  await server.register(corsPlugin);
  await server.register(rateLimitPlugin);
  await server.register(mongodbPlugin);
  await server.register(cookiePlugin);
  await server.register(authenticatePlugin);

  // Step 4: Register routes
  await server.register(authRoutes, { prefix: '/api/auth' });
  await server.register(userRoutes, { prefix: '/api/users' });
  await server.register(petRoutes, { prefix: '/api/pet' });
  await server.register(activityRoutes, { prefix: '/api/activity' });
  await server.register(missionRoutes, { prefix: '/api/missions' });
  await server.register(shopRoutes, { prefix: '/api/shop' });
  await server.register(notificationRoutes, { prefix: '/api/notifications' });
  await server.register(achievementRoutes, { prefix: '/api/achievements' });
  await server.register(friendRoutes, { prefix: '/api/friends' });
  await server.register(hudRoutes, { prefix: '/api/hud' });

  // Step 5: Health check route
  server.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    };
  });

  return server;
};

// Step 6: Start the server
const start = async () => {
  try {
    const server = await buildServer();

    await server.listen({
      port: Number(env.PORT),
      host: env.HOST,
    });

    console.log(`🚀 Server running on http://${env.HOST}:${env.PORT}`);

    // Step 7: Start background jobs
    startHealthDecayJob(server.db);
    startWeeklySummaryJob(server.db);
  } catch (error) {
    console.error('❌ Server failed to start:');
    console.error(error);
    process.exit(1);
  }
};

start();
