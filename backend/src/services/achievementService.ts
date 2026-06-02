// services/achievementService.ts
// Handles achievement checks and awarding.
// Each check function is called from the relevant service after an action completes.
// All checks are idempotent — safe to call multiple times, only awards once.

import { Db, ObjectId } from 'mongodb';
import { ACHIEVEMENTS } from '../models/achievementModel.ts';
import type { AchievementItem } from '../types/achievementTypes.ts';
import {
  hasAchievement,
  awardAchievement,
  findUserAchievements,
  countCompletedMissions,
} from '../repositories/achievementRepository.ts';
import { notify } from './notificationService.ts';

// ─── Helper — award if not already earned ────────────────────────────────────

const award = async (db: Db, userId: string, achievementId: string): Promise<void> => {
  const alreadyEarned = await hasAchievement(db, new ObjectId(userId), achievementId);
  if (alreadyEarned) return;

  await awardAchievement(db, new ObjectId(userId), achievementId);

  // Send a notification when an achievement is earned
  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (achievement) {
    await notify(db, userId, 'level_up', `🏆 Achievement unlocked: ${achievement.title}`);
  }
};

// ─── Get Achievements ─────────────────────────────────────────────────────────

export const getAchievements = async (db: Db, userId: string): Promise<AchievementItem[]> => {

  // Step 1: Fetch all earned achievements for this user
  const earned = await findUserAchievements(db, new ObjectId(userId));

  // Step 2: Join with master list to get title + description
  return earned.map((ua) => {
    const achievement = ACHIEVEMENTS.find((a) => a.id === ua.achievementId);
    return {
      id: ua.achievementId,
      title: achievement?.title ?? ua.achievementId,
      description: achievement?.description ?? '',
      earnedAt: ua.earnedAt,
    };
  });
};

// ─── Check — Mission Achievements ────────────────────────────────────────────

export const checkMissionAchievements = async (db: Db, userId: string): Promise<void> => {

  // first_mission — complete at least 1 mission
  await award(db, userId, 'first_mission');

  // missions_30 — complete 30 missions
  const totalCompleted = await countCompletedMissions(db, new ObjectId(userId));
  if (totalCompleted >= 30) {
    await award(db, userId, 'missions_30');
  }
};

// ─── Check — Streak Achievements ─────────────────────────────────────────────

export const checkStreakAchievements = async (db: Db, userId: string, streak: number): Promise<void> => {
  if (streak >= 7)  await award(db, userId, 'streak_7');
  if (streak >= 14) await award(db, userId, 'streak_14');
  if (streak >= 30) await award(db, userId, 'streak_30');
};

// ─── Check — Level Achievement ────────────────────────────────────────────────

export const checkLevelAchievement = async (db: Db, userId: string, level: number): Promise<void> => {
  if (level >= 10) await award(db, userId, 'level_10');
};

// ─── Check — Friend Achievement ───────────────────────────────────────────────

export const checkFriendAchievement = async (db: Db, userId: string): Promise<void> => {
  await award(db, userId, 'first_friend');
};

// ─── Check — Shop Achievement ─────────────────────────────────────────────────

export const checkShopAchievement = async (db: Db, userId: string): Promise<void> => {
  await award(db, userId, 'first_purchase');
};
