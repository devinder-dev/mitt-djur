// types/missionTypes.ts
// TypeScript types for mission request/response bodies.

import type { PetStage } from '../models/petModel.ts';

// Response type — one mission in the filtered list (GET /api/missions)
export type MissionListItem = {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  xp: number;
  coins: number;
};

// Response type — one of the user's active missions (GET /api/missions/my)
export type ActiveMissionItem = {
  id: string;
  missionId: string;
  title: string;
  category: string;
  difficulty: string;
  xp: number;
  coins: number;
  progressDays: number;   // days completed in the current 7-day cycle (0–6)
  totalDays: number;      // length of a cycle — always 7
  selectedAt: Date;
};

// Response type — what POST /api/missions/:id/complete sends back
export type CompleteMissionResult = {
  mission: string;
  xpEarned: number;
  coinsEarned: number;
  progressDays: number;     // day-streak progress after this completion (0 once a cycle finishes)
  totalDays: number;        // length of a cycle — always 7
  cycleCompleted: boolean;  // true when this completion finished a full 7-day streak
  bonusXp: number;          // extra XP awarded on top of the base reward (only on day 7)
  pet: {
    xp: number;
    level: number;
    stage: PetStage;
    leveledUp: boolean;
  };
};
