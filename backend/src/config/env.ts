// config/env.ts
// Validates all environment variables at startup using Zod.
// If any required variable is missing or invalid, the app will exit immediately
// with a clear error message — no silent failures.

import { z } from 'zod';

// Step 1: Define the schema — what variables we expect and their rules
const envSchema = z.object({
  // Server
  PORT: z.string().default('3000'),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  // JWT — separate secrets for access and refresh tokens
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),

  // Frontend — used for CORS
  FRONTEND_URL: z.url('FRONTEND_URL must be a valid URL').default('http://localhost:5173'),
});

// Step 2: Parse and validate process.env against the schema
const parsedEnv = envSchema.safeParse(process.env);

// Step 3: If validation fails, print exactly what's wrong and exit
if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsedEnv.error);
  process.exit(1);
}

// Step 4: Export the validated, typed env object for use across the app
export const env = parsedEnv.data;
