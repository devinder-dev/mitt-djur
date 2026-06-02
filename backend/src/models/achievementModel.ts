// models/achievementModel.ts
// Defines the shape of a UserAchievement document in the "user_achievements" collection.
// The master achievements list is a hardcoded constant — not stored in MongoDB.

import { ObjectId } from 'mongodb';

// One achievement in the master list
export interface Achievement {
  id: string;
  title: string;
  description: string;
}

// All available achievements — add new ones here only
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_mission',  title: 'First Step',          description: 'Complete your first mission' },
  { id: 'missions_30',    title: 'Mission Master',       description: 'Complete 30 missions' },
  { id: 'streak_7',       title: 'Week Warrior',         description: 'Reach a 7-day streak' },
  { id: 'streak_14',      title: 'Two Week Champion',    description: 'Reach a 14-day streak' },
  { id: 'streak_30',      title: 'Monthly Legend',       description: 'Reach a 30-day streak' },
  { id: 'level_10',       title: 'Seasoned Trainer',     description: 'Reach pet level 10' },
  { id: 'first_friend',   title: 'Social Animal',        description: 'Accept your first friend' },
  { id: 'first_purchase', title: 'Shopaholic',           description: 'Buy your first shop item' },
];

// A record of a user earning an achievement — stored in MongoDB
export interface UserAchievement {
  _id?: ObjectId;
  userId: ObjectId;
  achievementId: string;
  earnedAt: Date;
}
