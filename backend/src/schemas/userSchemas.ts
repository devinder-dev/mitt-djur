// schemas/userSchemas.ts
// Zod validation schema for user profile update requests.
// Only username and avatarUrl are allowed to be updated — nothing else.

import { z } from 'zod';

// Valid goal values — add new goals here only, model stays as string[]
export const VALID_GOALS = [
  'be_active',
  'quit_smoking',
  'quit_snus',
  'drink_water',
  'meditate',
  'read_more',
  'sleep_better',
  'workout',
  'eat_healthy',
  'be_productive',
] as const;

// PATCH /api/users/me/onboarding — save pet animal + goals after registration
export const onboardingSchema = z.object({
  petAnimal: z
    .string({ message: 'Pet animal is required' })
    .min(1, 'Pet animal cannot be empty'),
  goals: z
    .array(z.enum(VALID_GOALS, { message: 'Invalid goal value' }))
    .min(1, 'Select at least one goal')
    .max(10, 'Cannot select more than 10 goals'),
});

// PATCH /api/users/me
// Both fields are optional — user can update one or both at the same time
export const updateMeSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .optional(),
  avatarUrl: z
    .url('avatarUrl must be a valid URL')
    .optional(),
});
