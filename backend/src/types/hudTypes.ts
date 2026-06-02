// types/hudTypes.ts
// TypeScript types for the HUD endpoint response.

import type { PetStage, PetMood, PetStatus } from '../models/petModel.ts';

// Pet section of the HUD
type HudPet = {
  name: string;
  health: number;
  mood: PetMood;
  level: number;
  xp: number;
  stage: PetStage;
  status: PetStatus;
  healthHitsZero: number;
};

// Today's activity section of the HUD
type HudToday = {
  steps: number;
  xpEarned: number;
  activitiesDone: string[];
};

// One active mission shown in the HUD
type HudMission = {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  xp: number;
  coins: number;
};

// Full HUD response shape — what GET /api/hud sends back
export type HudResponse = {
  pet: HudPet | null;   // null if the user has no alive pet
  today: HudToday;
  missions: HudMission[];
  streak: number;
  coins: number;
};
