// repositories/achievementRepository.ts
// Handles all database queries for the "user_achievements" collection.

import { Db, ObjectId } from 'mongodb';
import type { UserAchievement } from '../models/achievementModel.ts';

// Step 1: Check if a user already has a specific achievement
export async function hasAchievement(db: Db, userId: ObjectId, achievementId: string): Promise<boolean> {
  const result = await db.collection<UserAchievement>('user_achievements').findOne({ userId, achievementId });
  return result !== null;
}

// Step 2: Award an achievement to a user
export async function awardAchievement(db: Db, userId: ObjectId, achievementId: string): Promise<void> {
  await db.collection<UserAchievement>('user_achievements').insertOne({
    userId,
    achievementId,
    earnedAt: new Date(),
  });
}

// Step 3: Get all achievements earned by a user
export async function findUserAchievements(db: Db, userId: ObjectId): Promise<UserAchievement[]> {
  return db.collection<UserAchievement>('user_achievements')
    .find({ userId })
    .sort({ earnedAt: -1 })
    .toArray();
}

// Step 4: Count completed missions for a user — used for missions_30 achievement check
export async function countCompletedMissions(db: Db, userId: ObjectId): Promise<number> {
  return db.collection('user_missions').countDocuments({ userId, status: 'completed' });
}
