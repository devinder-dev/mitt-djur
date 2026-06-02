// types/activityTypes.ts
// TypeScript types for activity request/response bodies.
// Inferred from Zod schemas where possible.

import { z } from 'zod';
import { syncStepsSchema, logActivitySchema, addGratitudeSchema, addNoteSchema, setMoodSchema } from '../schemas/activitySchemas.ts';
import type { PetStage } from '../models/petModel.ts';

// Request body type — inferred from schema
export type SyncStepsBody = z.infer<typeof syncStepsSchema>;

// Request body type — inferred from schema
export type LogActivityBody = z.infer<typeof logActivitySchema>;

// Request body type — inferred from schema
export type AddGratitudeBody = z.infer<typeof addGratitudeSchema>;

// Request body type — inferred from schema
export type AddNoteBody = z.infer<typeof addNoteSchema>;

// Request body type — inferred from schema
export type SetMoodBody = z.infer<typeof setMoodSchema>;

// Response type — what POST /api/activity/mood sends back
export type SetMoodResult = {
  mood: string;
  xpEarned: number;
  alreadyLogged: boolean;
  pet: {
    xp: number;
    level: number;
    stage: PetStage;
    leveledUp: boolean;
  };
};

// Response type — what POST /api/activity/note sends back
export type AddNoteResult = {
  dailyNote: string;
};

// Response type — what POST /api/activity/gratitude sends back
export type AddGratitudeResult = {
  gratitude: string[];
  xpEarned: number;
  bonusAwarded: boolean;
  pet: {
    xp: number;
    level: number;
    stage: PetStage;
    leveledUp: boolean;
  };
};

// Response type — what POST /api/activity/log sends back
export type LogActivityResult = {
  activity: string;
  xpEarned: number;
  alreadyLogged: boolean;
  pet: {
    xp: number;
    level: number;
    stage: PetStage;
    leveledUp: boolean;
  };
};

// Response type — what GET /api/activity/today sends back
export type TodayLogResponse = {
  date: string;
  steps: number;
  xpEarned: number;
  activitiesDone: string[];
  gratitude: string[];
  dailyNote: string | null;
  mood: string | null;
};

// Response type — what POST /api/activity/steps sends back
export type SyncStepsResult = {
  xpEarned: number;
  totalSteps: number;
  pet: {
    xp: number;
    level: number;
    stage: PetStage;
    leveledUp: boolean;
  };
};

// One day's activity summary — used in GET /api/activity/history
export type ActivityHistoryItem = {
  date: string;
  steps: number;
  xpEarned: number;
  activitiesDone: string[];
  gratitude: string[];
  dailyNote: string | null;
  mood: string | null;
};
