// repositories/missionRepository.ts
// Handles all database queries for the "user_missions" collection.
// The master missions list lives in data/missions.json — not in MongoDB.

import { Db, ObjectId } from 'mongodb';
import type { UserMission } from '../models/missionModel.ts';

// Step 1: Count how many active missions a user currently has
export async function countActiveMissions(db: Db, userId: ObjectId): Promise<number> {
  return db.collection<UserMission>('user_missions').countDocuments({ userId, status: 'active' });
}

// Step 2: Check if a user already has a specific mission active or completed today
export async function findExistingMission(db: Db, userId: ObjectId, missionId: string): Promise<UserMission | null> {
  return db.collection<UserMission>('user_missions').findOne({ userId, missionId, status: 'active' });
}

// Step 3: Save a selected mission to the user's active missions
export async function insertUserMission(db: Db, mission: Omit<UserMission, '_id'>): Promise<ObjectId> {
  const result = await db.collection<UserMission>('user_missions').insertOne(mission);
  return result.insertedId;
}

// Step 4: Get all active missions for a user
export async function findActiveMissions(db: Db, userId: ObjectId): Promise<UserMission[]> {
  return db.collection<UserMission>('user_missions').find({ userId, status: 'active' }).toArray();
}

// Step 5: Find one active mission by its document ID
export async function findMissionById(db: Db, id: ObjectId): Promise<UserMission | null> {
  return db.collection<UserMission>('user_missions').findOne({ _id: id, status: 'active' });
}

// Step 6: Advance a mission's day-streak progress within its current 7-day cycle.
// lastProgressDate (YYYY-MM-DD) is stored so the service can block same-day re-completion.
export async function updateMissionProgress(db: Db, id: ObjectId, progressDays: number, lastProgressDate: string): Promise<void> {
  await db.collection<UserMission>('user_missions').updateOne(
    { _id: id },
    { $set: { progressDays, lastProgressDate } },
  );
}

// Step 7: Mark a mission as completed — records a full 7-day cycle
export async function markMissionCompleted(db: Db, id: ObjectId): Promise<void> {
  await db.collection<UserMission>('user_missions').updateOne(
    { _id: id },
    { $set: { status: 'completed', progressDays: 7, completedAt: new Date() } },
  );
}

// Step 8: Count missions completed on or after a given date — used by weekly summary cron
export async function countMissionsCompletedSince(db: Db, userId: ObjectId, since: Date): Promise<number> {
  return db.collection<UserMission>('user_missions').countDocuments({
    userId,
    status: 'completed',
    completedAt: { $gte: since },
  });
}
