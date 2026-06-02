// services/missionService.ts
// Business logic for mission endpoints.
// Does NOT touch request/response — that's the controller's job.
// Does NOT query the database directly — that's the repository's job.

import { Db, ObjectId } from 'mongodb';
import missionsData from '../data/missions.json' with { type: 'json' };
import { AppError } from '../plugins/errorHandler.ts';
import { toObjectId } from '../utils/toObjectId.ts';
import type { MissionTemplate } from '../models/missionModel.ts';
import type { MissionListItem, ActiveMissionItem, CompleteMissionResult } from '../types/missionTypes.ts';
import { countActiveMissions, findExistingMission, insertUserMission, findActiveMissions, findMissionById, updateMissionProgress, markMissionCompleted } from '../repositories/missionRepository.ts';
import { findUserById, addCoinsToUser } from '../repositories/userRepository.ts';
import { findAlivePetByUserId, updatePetXpAndLevel } from '../repositories/petRepository.ts';
import { applyXp } from './xpService.ts';
import { checkMissionAchievements, checkLevelAchievement } from './achievementService.ts';

// Cast the JSON import to the correct type
const missions = missionsData as MissionTemplate[];

// A mission is a 7-day streak. Completing the final day grants triple rewards
// (XP and coins), then the streak resets.
const CYCLE_DAYS = 7;
const SEVENTH_DAY_MULTIPLIER = 3;

// ─── Get Missions (filtered by user goals) ────────────────────────────────────

export const getMissions = async (db: Db, userId: string): Promise<MissionListItem[]> => {

  // Step 1: Get the user's selected goals
  const user = await findUserById(db, userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Step 2: If no goals set yet, return all missions
  const goals = user.goals ?? [];
  const filtered = goals.length > 0
    ? missions.filter((m) => goals.includes(m.category))
    : missions;

  // Step 3: Return clean list
  return filtered.map((m) => ({
    id: m.id,
    title: m.title,
    category: m.category,
    difficulty: m.difficulty,
    xp: m.xp,
    coins: m.coins,
  }));
};

// ─── Select Mission ───────────────────────────────────────────────────────────

export const selectMission = async (db: Db, userId: string, missionId: string): Promise<ActiveMissionItem> => {

  // Step 1: Find the mission template in missions.json
  const template = missions.find((m) => m.id === missionId);
  if (!template) {
    throw new AppError('Mission not found', 404);
  }

  // Step 2: Check user has less than 5 active missions
  const activeCount = await countActiveMissions(db, new ObjectId(userId));
  if (activeCount >= 5) {
    throw new AppError('You already have 5 active missions. Complete one before selecting another.', 400);
  }

  // Step 3: Check user doesn't already have this mission active
  const existing = await findExistingMission(db, new ObjectId(userId), missionId);
  if (existing) {
    throw new AppError('You already have this mission active', 400);
  }

  // Step 4: Save to user_missions collection — a fresh 7-day streak starts at day 0
  const insertedId = await insertUserMission(db, {
    userId: new ObjectId(userId),
    missionId: template.id,
    title: template.title,
    category: template.category,
    difficulty: template.difficulty,
    xp: template.xp,
    coins: template.coins,
    status: 'active',
    progressDays: 0,
    selectedAt: new Date(),
  });

  // Step 5: Return the new active mission
  return {
    id: insertedId.toString(),
    missionId: template.id,
    title: template.title,
    category: template.category,
    difficulty: template.difficulty,
    xp: template.xp,
    coins: template.coins,
    progressDays: 0,
    totalDays: CYCLE_DAYS,
    selectedAt: new Date(),
  };
};

// ─── Get My Active Missions ───────────────────────────────────────────────────

export const getMyMissions = async (db: Db, userId: string): Promise<ActiveMissionItem[]> => {

  // Step 1: Fetch all active missions for this user
  const userMissions = await findActiveMissions(db, new ObjectId(userId));

  // Step 2: Return clean list (default progressDays for missions created before streaks existed)
  return userMissions.map((m) => ({
    id: m._id!.toString(),
    missionId: m.missionId,
    title: m.title,
    category: m.category,
    difficulty: m.difficulty,
    xp: m.xp,
    coins: m.coins,
    progressDays: m.progressDays ?? 0,
    totalDays: CYCLE_DAYS,
    selectedAt: m.selectedAt,
  }));
};

// ─── Complete Mission ─────────────────────────────────────────────────────────

export const completeMission = async (db: Db, userId: string, userMissionId: string): Promise<CompleteMissionResult> => {

  // Step 1: Validate and convert the URL param ID — throws 400 if malformed
  const missionObjectId = toObjectId(userMissionId);

  // Step 2: Find the user's active mission document
  const userMission = await findMissionById(db, missionObjectId);
  if (!userMission) {
    throw new AppError('Active mission not found', 404);
  }

  // Step 3: Make sure this mission belongs to this user
  if (userMission.userId.toString() !== userId) {
    throw new AppError('Forbidden', 403);
  }

  // Step 3b: Block same-day re-completion — one progress tick per calendar day
  const today = new Date().toISOString().substring(0, 10);
  if (userMission.lastProgressDate === today) {
    throw new AppError('Du har redan klarat det här uppdraget idag', 400);
  }

  // Step 4: Find the pet — we need current XP and level
  const pet = await findAlivePetByUserId(db, new ObjectId(userId));
  if (!pet) {
    throw new AppError('Pet not found', 404);
  }

  // Step 5: Advance the day-streak. The 7th day finishes the cycle.
  const currentProgress = userMission.progressDays ?? 0;
  const newProgress = currentProgress + 1;
  const cycleCompleted = newProgress >= CYCLE_DAYS;

  // Step 6: Day 7 awards triple XP + triple coins; every other day awards the base reward.
  const xpEarned = cycleCompleted
    ? userMission.xp * SEVENTH_DAY_MULTIPLIER
    : userMission.xp;
  const coinsEarned = cycleCompleted
    ? userMission.coins * SEVENTH_DAY_MULTIPLIER
    : userMission.coins;
  const bonusXp = xpEarned - userMission.xp;

  // Step 7: Award coins to user via repository — never touch db directly in a service
  await addCoinsToUser(db, new ObjectId(userId), coinsEarned);

  // Step 8: Apply XP to pet
  const { newXp, newLevel, newStage, leveledUp } = applyXp(pet.xp, pet.level, xpEarned);
  await updatePetXpAndLevel(db, new ObjectId(userId), newXp, newLevel, newStage, today);

  // Step 9: Persist the streak. On a full cycle, record the completed mission and
  // start a fresh active streak for the same mission so the habit keeps going.
  if (cycleCompleted) {
    await markMissionCompleted(db, missionObjectId);
    await insertUserMission(db, {
      userId: userMission.userId,
      missionId: userMission.missionId,
      title: userMission.title,
      category: userMission.category,
      difficulty: userMission.difficulty,
      xp: userMission.xp,
      coins: userMission.coins,
      status: 'active',
      progressDays: 0,
      selectedAt: new Date(),
    });
  } else {
    await updateMissionProgress(db, missionObjectId, newProgress, today);
  }

  // Step 10: Check mission + level achievements
  await checkMissionAchievements(db, userId);
  if (leveledUp) await checkLevelAchievement(db, userId, newLevel);

  // Step 11: Return result
  return {
    mission: userMission.title,
    xpEarned,
    coinsEarned,
    progressDays: cycleCompleted ? 0 : newProgress,
    totalDays: CYCLE_DAYS,
    cycleCompleted,
    bonusXp,
    pet: {
      xp: newXp,
      level: newLevel,
      stage: newStage,
      leveledUp,
    },
  };
};
