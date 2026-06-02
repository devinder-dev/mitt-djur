// schemas/petSchemas.ts
// Zod validation schema for pet-related request bodies.
// Only the rename endpoint has a body — GET has nothing to validate.

import { z } from 'zod';

// POST /api/pet/revive — choose a new pet after the current one dies
export const revivePetSchema = z.object({
  name: z
    .string()
    .min(1, 'Pet name cannot be empty')
    .max(20, 'Pet name must be at most 20 characters'),
  petAnimal: z
    .string({ message: 'Pet animal is required' })
    .min(1, 'Pet animal cannot be empty'),
});

// PATCH /api/pet/name — rename the pet
export const updatePetNameSchema = z.object({
  name: z
    .string()
    .min(1, 'Pet name cannot be empty')
    .max(20, 'Pet name must be at most 20 characters'),
});
