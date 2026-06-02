// repositories/petRepository.ts
// Handles all database queries for the "pets" collection.
// This is the ONLY file that talks to MongoDB for pet data.

import { Db, ObjectId } from 'mongodb';
import type { Pet, PetStage, PetMood } from '../models/petModel.ts';

// Step 1: Create a new pet — called automatically when a user registers or revives
export async function createPet(db: Db, pet: Omit<Pet, '_id'>): Promise<ObjectId> {
  const result = await db.collection<Pet>('pets').insertOne(pet);
  return result.insertedId;
}

// Step 2: Find a pet by the owner's user ID (any status)
export async function findPetByUserId(db: Db, userId: ObjectId): Promise<Pet | null> {
  return db.collection<Pet>('pets').findOne({ userId });
}

// Step 3: Find only the alive pet for a user
export async function findAlivePetByUserId(db: Db, userId: ObjectId): Promise<Pet | null> {
  return db.collection<Pet>('pets').findOne({ userId, status: 'alive' });
}

// Step 4: Find all pets for a user — alive and dead — for history view
export async function findAllPetsByUserId(db: Db, userId: ObjectId): Promise<Pet[]> {
  return db.collection<Pet>('pets').find({ userId }).sort({ bornAt: -1 }).toArray();
}

// Step 5: Delete a pet by the owner's user ID — called when deleting an account
export async function deletePetByUserId(db: Db, userId: ObjectId): Promise<void> {
  await db.collection<Pet>('pets').deleteMany({ userId });
}

// Step 6: Update the pet's name by the owner's user ID
export async function updatePetName(db: Db, userId: ObjectId, name: string): Promise<void> {
  await db.collection<Pet>('pets').updateOne(
    { userId, status: 'alive' },
    { $set: { name } },
  );
}

// Step 6b: Set the alive pet's animal — chosen at onboarding (visual + shop catalog)
export async function setPetAnimal(db: Db, userId: ObjectId, petAnimal: string): Promise<void> {
  await db.collection<Pet>('pets').updateOne(
    { userId, status: 'alive' },
    { $set: { petAnimal } },
  );
}

// Step 7: Update pet XP, level and stage after earning XP
export async function updatePetXpAndLevel(
  db: Db,
  userId: ObjectId,
  xp: number,
  level: number,
  stage: PetStage,
  lastActiveDate: string,
): Promise<void> {
  await db.collection<Pet>('pets').updateOne(
    { userId, status: 'alive' },
    { $set: { xp, level, stage, lastActiveDate } },
  );
}

// Step 8: Set mood to happy for pets that were active today
export async function setActivePetsMoodHappy(db: Db, today: string): Promise<void> {
  await db.collection<Pet>('pets').updateMany(
    { lastActiveDate: today, status: 'alive' },
    { $set: { mood: 'happy' as PetMood } },
  );
}

// Step 9: Reduce health for inactive alive pets that still have health above the decay amount
export async function decayHealthNormal(db: Db, today: string, amount: number): Promise<number> {
  const result = await db.collection<Pet>('pets').updateMany(
    { lastActiveDate: { $lt: today }, status: 'alive', health: { $gt: amount } },
    [{ $set: { health: { $subtract: ['$health', amount] }, mood: 'sad' as PetMood } }],
  );
  return result.modifiedCount;
}

// Step 10: Warn pets — health hits 0 but not the 3rd time yet
// Reset health to 1, increment healthHitsZero counter, set mood sad
export async function warnPets(db: Db, today: string, amount: number): Promise<number> {
  const result = await db.collection<Pet>('pets').updateMany(
    { lastActiveDate: { $lt: today }, status: 'alive', health: { $lte: amount }, healthHitsZero: { $lt: 2 } },
    { $set: { health: 1, mood: 'sad' as PetMood }, $inc: { healthHitsZero: 1 } },
  );
  return result.modifiedCount;
}

// Step 11: Kill pets — health hits 0 for the 3rd time
// Sets status to dead and saves the death timestamp
export async function killPets(db: Db, today: string, amount: number): Promise<number> {
  const result = await db.collection<Pet>('pets').updateMany(
    { lastActiveDate: { $lt: today }, status: 'alive', health: { $lte: amount }, healthHitsZero: { $gte: 2 } },
    { $set: { status: 'dead', diedAt: new Date(), mood: 'sad' as PetMood } },
  );
  return result.modifiedCount;
}

// Step 12: Batch-load alive pets for multiple users — used by friendService to avoid N+1 queries
export async function findAlivePetsByUserIds(db: Db, userIds: ObjectId[]): Promise<Pet[]> {
  if (userIds.length === 0) return [];
  return db.collection<Pet>('pets').find({ userId: { $in: userIds }, status: 'alive' }).toArray();
}
