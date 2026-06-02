// config/db.ts
// Handles the MongoDB client connection and index creation.
// The client is exported so it can be used by the MongoDB plugin (plugins/mongodb.ts)
// which attaches the database instance to the Fastify server.

import { MongoClient } from 'mongodb';
import { env } from './env.ts';

// Step 1: Create the MongoDB client using the validated URI from env
const client = new MongoClient(env.MONGODB_URI);

export async function connectDB(): Promise<void> {

  // Step 2: Set up event listeners BEFORE connecting
  client.once('serverHeartbeatSucceeded', () => {
    console.log('🟢 MongoDB connected successfully');
  });

  client.once('serverHeartbeatFailed', (event) => {
    console.error('🔴 MongoDB heartbeat failed:', event.failure?.message);
  });

  client.once('close', () => {
    console.log('🔌 MongoDB disconnected');
  });

  // Step 3: Connect to MongoDB
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB initial connection failed:');
    console.error(error);
    process.exit(1);
  }

  // Step 4: Create indexes — runs once on startup, safe to re-run (idempotent)
  await createIndexes();
}

async function createIndexes(): Promise<void> {
  try {
    // client.db() uses the database name from the MONGODB_URI connection string
    const db = client.db();

    // users — login by email, friend lookup by username
    await db.collection('users').createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { username: 1 }, unique: true },
    ]);

    // pets — alive pet lookup is the most common query in the whole app
    await db.collection('pets').createIndexes([
      { key: { userId: 1, status: 1 } },
    ]);

    // activity_logs — queried by userId + date on almost every request
    await db.collection('activity_logs').createIndexes([
      { key: { userId: 1, date: 1 }, unique: true },
    ]);

    // user_missions — active mission checks and mission completion
    await db.collection('user_missions').createIndexes([
      { key: { userId: 1, status: 1 } },
      { key: { userId: 1, missionId: 1, status: 1 } },
    ]);

    // notifications — fetch latest 50 for a user
    await db.collection('notifications').createIndexes([
      { key: { userId: 1, createdAt: -1 } },
    ]);

    // friendships — lookups go both directions (userId1 and userId2)
    await db.collection('friendships').createIndexes([
      { key: { userId1: 1, status: 1 } },
      { key: { userId2: 1, status: 1 } },
    ]);

    // user_achievements — hasAchievement checks on every mission/streak/shop action
    await db.collection('user_achievements').createIndexes([
      { key: { userId: 1, achievementId: 1 }, unique: true },
    ]);

    console.log('📇 MongoDB indexes created');
  } catch (error) {
    console.error('⚠️  MongoDB index creation failed (non-fatal):', error);
    // Non-fatal — app still works without indexes, just slower
  }
}

// Export the client so plugins can access the database instance
export { client };
