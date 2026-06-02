// types/authTypes.ts
// TypeScript types for auth request/response bodies.
// These are INFERRED from the Zod schemas — so if you update a schema,
// the type updates automatically. No manual syncing needed.

import { z } from 'zod';
import { registerSchema, loginSchema } from '../schemas/authSchemas.ts';

// Request body types — inferred from schemas
export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;

// Response types — what the API sends back
export interface AuthResponse {
  accessToken: string;
}

export interface ErrorResponse {
  message: string;
  details?: Record<string, string[]>;
}
