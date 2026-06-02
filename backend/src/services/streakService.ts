// services/streakService.ts
// Pure streak logic — handles incrementing, resetting, and checking streaks.
// Called from any activity endpoint to keep streak up to date.

import { Db, ObjectId } from 'mongodb';
import { findUserById, updateStreak } from '../repositories/userRepository.ts';
import { checkStreakAchievements } from './achievementService.ts';

// ─── Check and Update Streak ──────────────────────────────────────────────────

// Called after any daily activity is logged.
// Idempotent — safe to call multiple times per day, only counts once.
export const checkAndUpdateStreak = async (db: Db, userId: string): Promise<void> => {

  // Step 1: Get the user's current streak data
  const user = await findUserById(db, userId);
  if (!user) return;

  // Step 2: Get today and yesterday as YYYY-MM-DD
  const today = new Date().toISOString().substring(0, 10);
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().substring(0, 10);

  // Step 3: Already counted today — do nothing
  if (user.lastStreakDate === today) return;

  // Step 4: Consecutive day — increment streak
  if (user.lastStreakDate === yesterday) {
    const newStreak = user.streak + 1;
    await updateStreak(db, new ObjectId(userId), newStreak, today);
    await checkStreakAchievements(db, userId, newStreak);
    return;
  }

  // Step 5: Streak broken or first ever activity — reset to 1
  await updateStreak(db, new ObjectId(userId), 1, today);
  await checkStreakAchievements(db, userId, 1);
};

// ─── Get Streak ───────────────────────────────────────────────────────────────

export const getStreak = async (db: Db, userId: string): Promise<{ streak: number; lastStreakDate: string }> => {

  // Step 1: Fetch the user
  const user = await findUserById(db, userId);
  if (!user) return { streak: 0, lastStreakDate: '' };

  // Step 2: Return streak data
  return {
    streak: user.streak,
    lastStreakDate: user.lastStreakDate,
  };
};
