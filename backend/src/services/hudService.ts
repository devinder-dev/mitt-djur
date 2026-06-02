// services/hudService.ts
// Business logic for GET /api/hud.
// Aggregates data from pets, activity_logs, user_missions, and users
// into one response for the home screen.

import { Db, ObjectId } from 'mongodb';
import type { HudResponse } from '../types/hudTypes.ts';
import { findAlivePetByUserId } from '../repositories/petRepository.ts';
import { findTodayLog } from '../repositories/activityRepository.ts';
import { findActiveMissions } from '../repositories/missionRepository.ts';
import { findUserById } from '../repositories/userRepository.ts';
import { AppError } from '../plugins/errorHandler.ts';

export const getHud = async (db: Db, userId: string): Promise<HudResponse> => {

  // Step 1: Get today's date as YYYY-MM-DD
  const today = new Date().toISOString().substring(0, 10);
  const userObjectId = new ObjectId(userId);

  // Step 2: Run all 4 queries in parallel — they are independent of each other
  const [pet, todayLog, activeMissions, user] = await Promise.all([
    findAlivePetByUserId(db, userObjectId),
    findTodayLog(db, userObjectId, today),
    findActiveMissions(db, userObjectId),
    findUserById(db, userId),
  ]);

  // Step 3: User must exist
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Step 4: Build pet section — null if no alive pet (e.g. pet just died)
  const petData: HudResponse['pet'] = pet
    ? {
        name: pet.name,
        health: pet.health,
        mood: pet.mood,
        level: pet.level,
        xp: pet.xp,
        stage: pet.stage,
        status: pet.status,
        healthHitsZero: pet.healthHitsZero,
      }
    : null;

  // Step 5: Build today's activity section — defaults to zero if no log yet
  const todayData: HudResponse['today'] = {
    steps: todayLog?.steps ?? 0,
    xpEarned: todayLog?.xpEarned ?? 0,
    activitiesDone: todayLog?.activitiesDone ?? [],
  };

  // Step 6: Build active missions list — map to clean shape without internal DB fields
  const missionsData = activeMissions.map((m) => ({
    id: String(m._id),
    title: m.title,
    category: m.category,
    difficulty: m.difficulty,
    xp: m.xp,
    coins: m.coins,
  }));

  // Step 7: Return full HUD
  return {
    pet: petData,
    today: todayData,
    missions: missionsData,
    streak: user.streak,
    coins: user.coins,
  };
};
