// repositories/activityRepository.ts
// Handles all database queries for the "activity_logs" collection.
// This is the ONLY file that talks to MongoDB for activity data.

import { Db, ObjectId } from 'mongodb';
import type { ActivityLog, MoodType } from '../models/activityModel.ts';

// Step 1: Find today's activity log for a user — returns null if none exists yet
export async function findTodayLog(db: Db, userId: ObjectId, date: string): Promise<ActivityLog | null> {
  return db.collection<ActivityLog>('activity_logs').findOne({ userId, date });
}

// Step 2: Find activity logs for the last N days — used for the pet history calendar
export async function findHistoryLogs(db: Db, userId: ObjectId, fromDate: string): Promise<ActivityLog[]> {
  return db
    .collection<ActivityLog>('activity_logs')
    .find({ userId, date: { $gte: fromDate } })
    .sort({ date: 1 })
    .toArray();
}

// Step 3: Add an activity type to today's log — creates the log if it doesn't exist yet
// $addToSet prevents duplicate activity types on the same day
export async function addActivityToLog(
  db: Db,
  userId: ObjectId,
  date: string,
  activityType: string,
  xpEarned: number,
): Promise<void> {
  await db.collection<ActivityLog>('activity_logs').updateOne(
    { userId, date },
    {
      $addToSet: { activitiesDone: activityType },
      $inc: { xpEarned },
      $setOnInsert: {
        userId,
        date,
        steps: 0,
        gratitude: [],
        createdAt: new Date(),
      },
    },
    { upsert: true },
  );
}

// Step 4: Push a gratitude entry to today's log — creates the log if it doesn't exist
// $push appends the text — duplicate check is handled in the service
export async function addGratitudeToLog(
  db: Db,
  userId: ObjectId,
  date: string,
  text: string,
  xpEarned: number,
): Promise<void> {
  await db.collection<ActivityLog>('activity_logs').updateOne(
    { userId, date },
    {
      $push: { gratitude: text },
      $inc: { xpEarned },
      $setOnInsert: {
        userId,
        date,
        steps: 0,
        activitiesDone: [],
        createdAt: new Date(),
      },
    },
    { upsert: true },
  );
}

// Step 5: Set the daily note — overwrites any existing note for today
export async function setDailyNote(
  db: Db,
  userId: ObjectId,
  date: string,
  note: string,
): Promise<void> {
  await db.collection<ActivityLog>('activity_logs').updateOne(
    { userId, date },
    {
      $set: { dailyNote: note },
      $setOnInsert: {
        userId,
        date,
        steps: 0,
        activitiesDone: [],
        gratitude: [],
        xpEarned: 0,
        createdAt: new Date(),
      },
    },
    { upsert: true },
  );
}

// Step 5b: Set today's mood check-in — creates the log if it doesn't exist yet
// $set writes the mood, $inc adds the check-in XP. The service guards against
// awarding XP twice, so this is only called when the mood is first set for the day.
export async function setMoodForToday(
  db: Db,
  userId: ObjectId,
  date: string,
  mood: MoodType,
  xpEarned: number,
): Promise<void> {
  await db.collection<ActivityLog>('activity_logs').updateOne(
    { userId, date },
    {
      $set: { mood },
      $inc: { xpEarned },
      $setOnInsert: {
        userId,
        date,
        steps: 0,
        activitiesDone: [],
        gratitude: [],
        createdAt: new Date(),
      },
    },
    { upsert: true },
  );
}

// Step 6: Sum total XP earned from a given date onwards — used by weekly summary cron
// Uses aggregation pipeline to sum xpEarned across multiple days
export async function sumXpSince(db: Db, userId: ObjectId, fromDate: string): Promise<number> {
  const result = await db
    .collection<ActivityLog>('activity_logs')
    .aggregate<{ total: number }>([
      { $match: { userId, date: { $gte: fromDate } } },
      { $group: { _id: null, total: { $sum: '$xpEarned' } } },
    ])
    .toArray();

  return result[0]?.total ?? 0;
}

// Step 7: Upsert today's log — creates it if it doesn't exist, updates it if it does
// $setOnInsert runs only when creating (not updating) — sets createdAt once
// $inc adds to existing numbers — so steps accumulate across multiple syncs
export async function upsertTodayLog(
  db: Db,
  userId: ObjectId,
  date: string,
  steps: number,
  xpEarned: number,
): Promise<void> {
  await db.collection<ActivityLog>('activity_logs').updateOne(
    // Step 3: Filter — find log for this user on this date
    { userId, date },
    {
      // Step 4: $inc — add to existing steps and xp (accumulates)
      $inc: {
        steps,
        xpEarned,
      },
      // Step 5: $setOnInsert — only runs when creating a new document
      $setOnInsert: {
        userId,
        date,
        activitiesDone: [],
        gratitude: [],
        createdAt: new Date(),
      },
    },
    // Step 6: upsert true — create if not found
    { upsert: true },
  );
}
