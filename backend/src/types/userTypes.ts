// types/userTypes.ts
// TypeScript types for user profile request/response bodies.
// Inferred from Zod schemas — update the schema and the type updates automatically.

import { z } from 'zod';
import { updateMeSchema, onboardingSchema } from '../schemas/userSchemas.ts';

// Request body type — inferred from schema
export type UpdateMeBody = z.infer<typeof updateMeSchema>;

// Request body type — inferred from schema
export type OnboardingBody = z.infer<typeof onboardingSchema>;

// Response type — what PATCH /api/users/me/onboarding sends back
export type OnboardingResult = {
  onboardingComplete: boolean;
  petAnimal: string;
  goals: string[];
};

// Response type — what GET /api/users/me sends back
// Omits sensitive fields that should never leave the server
export type UserProfile = {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  coins: number;
  goals: string[];
  petAnimal: string;
  onboardingComplete: boolean;
  streak: number;
  createdAt: Date;
};
