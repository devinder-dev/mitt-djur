// models/missionModel.ts
// Two shapes live here:
// - MissionTemplate — a mission from missions.json (never stored in MongoDB)
// - UserMission — a mission a user has selected (stored in "user_missions" collection)

import { ObjectId } from 'mongodb';

// Shape of one entry in missions.json
export interface MissionTemplate {
  id: string;
  title: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  xp: number;
  coins: number;
}

// Status of a user's selected mission
export type UserMissionStatus = 'active' | 'completed';

// Shape stored in MongoDB "user_missions" collection
export interface UserMission {
  _id?: ObjectId;
  userId: ObjectId;
  missionId: string;              // references MissionTemplate.id from missions.json
  title: string;                  // copied from template for quick access
  category: string;
  difficulty: string;
  xp: number;
  coins: number;
  status: UserMissionStatus;
  progressDays: number;           // days completed in the current 7-day cycle (0–6); resets to 0 after a full cycle
  lastProgressDate?: string;      // ISO date string (YYYY-MM-DD) of the last day progress was recorded — prevents same-day re-completion
  selectedAt: Date;
  completedAt?: Date;
}
