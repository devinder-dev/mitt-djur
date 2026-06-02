// types/petTypes.ts
// TypeScript types for pet request/response bodies.
// Inferred from Zod schemas — update the schema and the type updates automatically.

import { z } from 'zod';
import { updatePetNameSchema, revivePetSchema } from '../schemas/petSchemas.ts';
import type { PetStage, PetMood, PetStatus } from '../models/petModel.ts';

// Request body type — inferred from schema
export type UpdatePetNameBody = z.infer<typeof updatePetNameSchema>;

// Request body type — inferred from schema
export type RevivePetBody = z.infer<typeof revivePetSchema>;

// Response type — one pet in the full history list (GET /api/pet/history/all)
export type PetHistoryItem = {
  id: string;
  name: string;
  petAnimal: string;
  level: number;
  stage: PetStage;
  status: PetStatus;
  bornAt: Date;
  diedAt?: Date;
};

// Response type — one day entry in the pet history calendar
export type PetHistoryDay = {
  date: string;
  steps: number;
  xpEarned: number;
  activitiesDone: string[];
};

// Response type — what GET /api/pet sends back to the frontend
export type PetProfile = {
  id: string;
  name: string;
  petAnimal: string;
  level: number;
  xp: number;
  health: number;
  stage: PetStage;
  mood: PetMood;
  status: PetStatus;
  healthHitsZero: number;
  lastActiveDate: string;
  ownedAccessories: string[];
  accessoriesEquipped: string[];
  bornAt: Date;
};
