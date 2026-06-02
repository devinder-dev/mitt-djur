// services/activityService.ts
// Business logic for activity endpoints.
// Orchestrates XP calculation, activity logging and pet updates.
// Does NOT touch request/response — that's the controller's job.
// Does NOT query the database directly — that's the repository's job.

import { Db, ObjectId } from 'mongodb';
import { AppError } from '../plugins/errorHandler.ts';
import type { SyncStepsBody, SyncStepsResult, TodayLogResponse, LogActivityBody, LogActivityResult, AddGratitudeBody, AddGratitudeResult, AddNoteBody, AddNoteResult, SetMoodBody, SetMoodResult, ActivityHistoryItem } from '../types/activityTypes.ts';
import { findAlivePetByUserId, updatePetXpAndLevel } from '../repositories/petRepository.ts';
import { findTodayLog, upsertTodayLog, addActivityToLog, addGratitudeToLog, setDailyNote, setMoodForToday, findHistoryLogs } from '../repositories/activityRepository.ts';
import { calculateXpFromSteps, applyXp } from './xpService.ts';
import { checkAndUpdateStreak } from './streakService.ts';

// ─── Get Today's Log ─────────────────────────────────────────────────────────

export const getTodayLog = async (db: Db, userId: string): Promise<TodayLogResponse> => {

  // Step 1: Get today's date as YYYY-MM-DD
  const today = new Date().toISOString().substring(0, 10);

  // Step 2: Try to find today's log — returns null if user hasn't logged anything yet
  const log = await findTodayLog(db, new ObjectId(userId), today);

  // Step 3: If no log exists yet, return empty defaults — not an error
  if (!log) {
    return {
      date: today,
      steps: 0,
      xpEarned: 0,
      activitiesDone: [],
      gratitude: [],
      dailyNote: null,
      mood: null,
    };
  }

  // Step 4: Return the log with clean fields
  return {
    date: log.date,
    steps: log.steps,
    xpEarned: log.xpEarned,
    activitiesDone: log.activitiesDone,
    gratitude: log.gratitude,
    dailyNote: log.dailyNote ?? null,
    mood: log.mood ?? null,
  };
};

// ─── Add Daily Note ───────────────────────────────────────────────────────────

export const addNote = async (db: Db, userId: string, body: AddNoteBody): Promise<AddNoteResult> => {

  // Step 1: Get today's date as YYYY-MM-DD
  const today = new Date().toISOString().substring(0, 10);

  // Step 2: Save the note — overwrites any existing note for today
  await setDailyNote(db, new ObjectId(userId), today, body.note);

  // Step 3: Update streak — counts as daily activity
  await checkAndUpdateStreak(db, userId);

  // Step 4: Return the saved note
  return { dailyNote: body.note };
};

// ─── Add Gratitude ────────────────────────────────────────────────────────────

const GRATITUDE_XP = 5;        // XP per gratitude entry
const GRATITUDE_BONUS_XP = 10; // Extra XP awarded on the 3rd entry
const GRATITUDE_MAX = 3;       // Max entries per day

export const addGratitude = async (db: Db, userId: string, body: AddGratitudeBody): Promise<AddGratitudeResult> => {

  // Step 1: Get today's date as YYYY-MM-DD
  const today = new Date().toISOString().substring(0, 10);

  // Step 2: Check how many gratitude entries the user has already added today
  const existingLog = await findTodayLog(db, new ObjectId(userId), today);
  const currentCount = existingLog?.gratitude.length ?? 0;

  // Step 3: Reject if already at max
  if (currentCount >= GRATITUDE_MAX) {
    throw new AppError('You have already added 3 gratitude entries today', 400);
  }

  // Step 4: Find the user's pet — we need current XP and level
  const pet = await findAlivePetByUserId(db, new ObjectId(userId));
  if (!pet) {
    throw new AppError('Pet not found', 404);
  }

  // Step 5: Calculate XP — bonus awarded on the 3rd entry
  const isThird = currentCount + 1 === GRATITUDE_MAX;
  const xpEarned = GRATITUDE_XP + (isThird ? GRATITUDE_BONUS_XP : 0);

  // Step 6: Save the gratitude entry to today's log
  await addGratitudeToLog(db, new ObjectId(userId), today, body.text, xpEarned);

  // Step 7: Apply XP to pet
  const { newXp, newLevel, newStage, leveledUp } = applyXp(pet.xp, pet.level, xpEarned);
  await updatePetXpAndLevel(db, new ObjectId(userId), newXp, newLevel, newStage, today);

  // Step 8: Update streak — counts as daily activity
  await checkAndUpdateStreak(db, userId);

  // Step 9: Return result — include updated gratitude list
  const updatedLog = await findTodayLog(db, new ObjectId(userId), today);

  return {
    gratitude: updatedLog?.gratitude ?? [],
    xpEarned,
    bonusAwarded: isThird,
    pet: {
      xp: newXp,
      level: newLevel,
      stage: newStage,
      leveledUp,
    },
  };
};

// ─── Log Activity ─────────────────────────────────────────────────────────────

// XP reward per activity type
const ACTIVITY_XP: Record<string, number> = {
  walk:  20,
  water: 10,
  sleep: 15,
  read:  15,
};

export const logActivity = async (db: Db, userId: string, body: LogActivityBody): Promise<LogActivityResult> => {

  // Step 1: Get today's date as YYYY-MM-DD
  const today = new Date().toISOString().substring(0, 10);

  // Step 2: Check if this activity was already logged today
  const existingLog = await findTodayLog(db, new ObjectId(userId), today);
  const alreadyLogged = existingLog?.activitiesDone.includes(body.type) ?? false;

  // Step 3: Find the user's pet — we need current XP and level
  const pet = await findAlivePetByUserId(db, new ObjectId(userId));
  if (!pet) {
    throw new AppError('Pet not found', 404);
  }

  // Step 4: Only award XP if the activity hasn't been logged today yet
  const xpEarned = alreadyLogged ? 0 : (ACTIVITY_XP[body.type] ?? 0);

  // Step 5: Save the activity to today's log (addToSet prevents duplicates)
  await addActivityToLog(db, new ObjectId(userId), today, body.type, xpEarned);

  // Step 6: Apply XP to pet only if new activity
  const { newXp, newLevel, newStage, leveledUp } = applyXp(pet.xp, pet.level, xpEarned);

  // Step 7: Save updated pet state if XP was awarded
  if (!alreadyLogged) {
    await updatePetXpAndLevel(db, new ObjectId(userId), newXp, newLevel, newStage, today);
  }

  // Step 8: Update streak — counts as daily activity
  await checkAndUpdateStreak(db, userId);

  // Step 9: Return result for the controller
  return {
    activity: body.type,
    xpEarned,
    alreadyLogged,
    pet: {
      xp: newXp,
      level: newLevel,
      stage: newStage,
      leveledUp,
    },
  };
};

// ─── Mood Check-in ──────────────────────────────────────────────────────────────

const MOOD_XP = 10; // XP awarded for the daily mood check-in

export const setMood = async (db: Db, userId: string, body: SetMoodBody): Promise<SetMoodResult> => {

  // Step 1: Get today's date as YYYY-MM-DD
  const today = new Date().toISOString().substring(0, 10);

  // Step 2: Check whether a mood was already set today — the check-in locks after the first
  const existingLog = await findTodayLog(db, new ObjectId(userId), today);
  const alreadyLogged = existingLog?.mood != null;

  // Step 3: Reject changes once the day is locked — one mood per day
  if (alreadyLogged) {
    throw new AppError('You have already checked in today', 409);
  }

  // Step 4: Find the user's pet — we need current XP and level
  const pet = await findAlivePetByUserId(db, new ObjectId(userId));
  if (!pet) {
    throw new AppError('Pet not found', 404);
  }

  // Step 5: Save the mood and award the check-in XP
  const xpEarned = MOOD_XP;
  await setMoodForToday(db, new ObjectId(userId), today, body.mood, xpEarned);

  // Step 6: Apply XP to the pet
  const { newXp, newLevel, newStage, leveledUp } = applyXp(pet.xp, pet.level, xpEarned);
  await updatePetXpAndLevel(db, new ObjectId(userId), newXp, newLevel, newStage, today);

  // Step 7: Update streak — checking in counts as daily activity
  await checkAndUpdateStreak(db, userId);

  // Step 8: Return result for the controller
  return {
    mood: body.mood,
    xpEarned,
    alreadyLogged: false,
    pet: {
      xp: newXp,
      level: newLevel,
      stage: newStage,
      leveledUp,
    },
  };
};

// ─── Activity History ─────────────────────────────────────────────────────────

const HISTORY_DAYS = 60; // How many days back to look

export const getActivityHistory = async (db: Db, userId: string): Promise<ActivityHistoryItem[]> => {

  // Step 1: Calculate the start date — 60 days ago from today as YYYY-MM-DD
  const from = new Date();
  from.setDate(from.getDate() - HISTORY_DAYS);
  const fromDate = from.toISOString().substring(0, 10);

  // Step 2: Fetch all logs in the date range — sorted oldest → newest
  const logs = await findHistoryLogs(db, new ObjectId(userId), fromDate);

  // Step 3: Map each log to the response shape — clean and consistent
  return logs.map((log) => ({
    date: log.date,
    steps: log.steps,
    xpEarned: log.xpEarned,
    activitiesDone: log.activitiesDone,
    gratitude: log.gratitude,
    dailyNote: log.dailyNote ?? null,
    mood: log.mood ?? null,
  }));
};

// ─── Sync Steps ───────────────────────────────────────────────────────────────

export const syncSteps = async (db: Db, userId: string, body: SyncStepsBody): Promise<SyncStepsResult> => {

  // Step 1: Find the user's pet — we need current XP and level
  const pet = await findAlivePetByUserId(db, new ObjectId(userId));
  if (!pet) {
    throw new AppError('Pet not found', 404);
  }

  // Step 2: Calculate XP earned from the steps
  const xpEarned = calculateXpFromSteps(body.steps);

  // Step 3: Get today's date as YYYY-MM-DD for the activity log
  const today = new Date().toISOString().substring(0, 10);

  // Step 4: Save the steps to today's activity log (upsert — add to existing)
  await upsertTodayLog(db, new ObjectId(userId), today, body.steps, xpEarned);

  // Step 5: Apply XP to the pet — get back new xp, level, stage and leveledUp flag
  const { newXp, newLevel, newStage, leveledUp } = applyXp(pet.xp, pet.level, xpEarned);

  // Step 6: Save the updated pet state to the database
  await updatePetXpAndLevel(db, new ObjectId(userId), newXp, newLevel, newStage, today);

  // Step 7: Update streak — syncing steps counts as daily activity
  await checkAndUpdateStreak(db, userId);

  // Step 8: Return the result for the controller to send back
  return {
    xpEarned,
    totalSteps: body.steps,
    pet: {
      xp: newXp,
      level: newLevel,
      stage: newStage,
      leveledUp,
    },
  };
};
