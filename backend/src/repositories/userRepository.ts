// repositories/userRepository.ts
// Handles all database queries for the "users" collection.
// This is the ONLY file that talks to MongoDB for user data.
// All other layers (services, controllers) go through this file.

import { Db, ObjectId } from 'mongodb';
import type { User } from '../models/userModel.ts';

// Step 1: Find a user by their email address
export async function findUserByEmail(db: Db, email: string): Promise<User | null> {
  return db.collection<User>('users').findOne({ email });
}

// Step 2: Find a user by their username
export async function findUserByUsername(db: Db, username: string): Promise<User | null> {
  return db.collection<User>('users').findOne({ username });
}

// Step 3: Find a user by their ID
export async function findUserById(db: Db, id: string): Promise<User | null> {
  return db.collection<User>('users').findOne({ _id: new ObjectId(id) });
}

// Step 3: Create a new user — returns the inserted ID
export async function createUser(db: Db, user: Omit<User, '_id'>): Promise<ObjectId> {
  const result = await db.collection<User>('users').insertOne(user);
  return result.insertedId;
}

// Step 4: Save the hashed refresh token to the user document
export async function updateRefreshToken(db: Db, userId: ObjectId, refreshTokenHash: string | null): Promise<void> {
  await db.collection<User>('users').updateOne(
    { _id: userId },
    { $set: { refreshToken: refreshTokenHash } },
  );
}

// Step 5: Update username and/or avatarUrl — only sets fields that are provided
export async function updateUserProfile(
  db: Db,
  userId: ObjectId,
  fields: { username?: string; avatarUrl?: string },
): Promise<void> {
  await db.collection<User>('users').updateOne(
    { _id: userId },
    { $set: fields },
  );
}

// Step 6: Save onboarding choices — petAnimal, goals, marks onboarding complete
export async function updateOnboarding(
  db: Db,
  userId: ObjectId,
  petAnimal: string,
  goals: string[],
): Promise<void> {
  await db.collection<User>('users').updateOne(
    { _id: userId },
    { $set: { petAnimal, goals, onboardingComplete: true } },
  );
}

// Step 7: Add coins to a user's balance — called when completing a mission
export async function addCoinsToUser(db: Db, userId: ObjectId, coins: number): Promise<void> {
  await db.collection<User>('users').updateOne(
    { _id: userId },
    { $inc: { coins } },
  );
}

// Step 8: Update streak — set new streak count and today's date
export async function updateStreak(db: Db, userId: ObjectId, streak: number, lastStreakDate: string): Promise<void> {
  await db.collection<User>('users').updateOne(
    { _id: userId },
    { $set: { streak, lastStreakDate } },
  );
}

// Step 9: Delete a user by their ID
export async function deleteUserById(db: Db, userId: ObjectId): Promise<void> {
  await db.collection<User>('users').deleteOne({ _id: userId });
}

// Step 10: Get all users who have completed onboarding — used by the weekly summary cron job
export async function findAllOnboardedUsers(db: Db): Promise<User[]> {
  return db.collection<User>('users').find({ onboardingComplete: true }).toArray();
}

// Step 11: Batch-load multiple users by their IDs — used by friendService to avoid N+1 queries
export async function findUsersByIds(db: Db, ids: ObjectId[]): Promise<User[]> {
  if (ids.length === 0) return [];
  return db.collection<User>('users').find({ _id: { $in: ids } }).toArray();
}
