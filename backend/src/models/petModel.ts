// models/petModel.ts
// Defines the shape of a Pet document in the "pets" collection.
// Every user gets one pet, auto-created on registration.
// The pet evolves through stages as the user gains XP.
// A pet can die after health hits 0 three times — archived but never deleted.

import { ObjectId } from 'mongodb';

// All possible pet stages — ordered by level progression
export type PetStage = 'egg' | 'chick' | 'small_bird' | 'bird' | 'parrot' | 'eagle' | 'dragon';

// Pet mood — calculated daily based on task completion
export type PetMood = 'happy' | 'neutral' | 'sad';

// Pet status — dead pets are archived, not deleted
export type PetStatus = 'alive' | 'dead';

export interface Pet {
  _id?: ObjectId;
  userId: ObjectId;
  name: string;
  petAnimal: string;                  // chosen at onboarding/revive — visual only
  level: number;
  xp: number;
  health: number;
  stage: PetStage;
  mood: PetMood;                      // updated daily by healthDecay job
  status: PetStatus;                  // alive until health hits 0 three times
  healthHitsZero: number;             // counts how many times health reached 0 (max 3 = death)
  lastActiveDate: string;             // format: YYYY-MM-DD
  ownedAccessories: string[];         // all shop item ids the user has purchased
  accessoriesEquipped: string[];      // currently worn — max length 1 (single-equip rule)
  bornAt: Date;
  diedAt?: Date;                      // set when status becomes 'dead'
}
