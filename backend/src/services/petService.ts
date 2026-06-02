// services/petService.ts
// Business logic for pet endpoints.
// Does NOT touch request/response — that's the controller's job.
// Does NOT query the database directly — that's the repository's job.

import { Db, ObjectId } from 'mongodb';
import { AppError } from '../plugins/errorHandler.ts';
import type { UpdatePetNameBody, PetProfile, PetHistoryDay, RevivePetBody, PetHistoryItem } from '../types/petTypes.ts';
import { createPet, findAlivePetByUserId, findAllPetsByUserId, updatePetName } from '../repositories/petRepository.ts';
import { findHistoryLogs } from '../repositories/activityRepository.ts';
import type { Pet } from '../models/petModel.ts';

// ─── Helper ───────────────────────────────────────────────────────────────────

// Converts a raw Pet document into a clean PetProfile for the response
const toPetProfile = (pet: Pet): PetProfile => {
  return {
    id: pet._id!.toString(),
    name: pet.name,
    petAnimal: pet.petAnimal,
    level: pet.level,
    xp: pet.xp,
    health: pet.health,
    stage: pet.stage,
    mood: pet.mood,
    status: pet.status,
    healthHitsZero: pet.healthHitsZero,
    lastActiveDate: pet.lastActiveDate,
    ownedAccessories: pet.ownedAccessories ?? [],
    accessoriesEquipped: pet.accessoriesEquipped,
    bornAt: pet.bornAt,
  };
};

// ─── Get My Pet ───────────────────────────────────────────────────────────────

export const getMyPet = async (db: Db, userId: string): Promise<PetProfile> => {

  // Step 1: Find the alive pet — a user can have dead pets too after revival
  const pet = await findAlivePetByUserId(db, new ObjectId(userId));
  if (!pet) {
    throw new AppError('No alive pet found', 404);
  }

  // Step 2: Return clean profile — no internal fields
  return toPetProfile(pet);
};

// ─── Get Pet History ──────────────────────────────────────────────────────────

export const getPetHistory = async (db: Db, userId: string): Promise<PetHistoryDay[]> => {

  // Step 1: Calculate the date 90 days ago as YYYY-MM-DD
  const from = new Date();
  from.setDate(from.getDate() - 90);
  const fromDate = from.toISOString().substring(0, 10);

  // Step 2: Fetch all activity logs from the last 90 days
  const logs = await findHistoryLogs(db, new ObjectId(userId), fromDate);

  // Step 3: Map each log to a clean PetHistoryDay — strip internal fields
  return logs.map((log) => ({
    date: log.date,
    steps: log.steps,
    xpEarned: log.xpEarned,
    activitiesDone: log.activitiesDone,
  }));
};

// ─── Revive Pet ───────────────────────────────────────────────────────────────

export const revivePet = async (db: Db, userId: string, body: RevivePetBody): Promise<PetProfile> => {

  // Step 1: Check there is no alive pet — can only revive if current pet is dead
  const alivePet = await findAlivePetByUserId(db, new ObjectId(userId));
  if (alivePet) {
    throw new AppError('Your pet is still alive', 400);
  }

  // Step 2: Create a brand new pet with the chosen name and animal
  await createPet(db, {
    userId: new ObjectId(userId),
    name: body.name,
    petAnimal: body.petAnimal,
    level: 0,
    xp: 0,
    health: 100,
    stage: 'egg',
    mood: 'happy',
    status: 'alive',
    healthHitsZero: 0,
    lastActiveDate: new Date().toISOString().substring(0, 10),
    ownedAccessories: [],
    accessoriesEquipped: [],
    bornAt: new Date(),
  });

  // Step 3: Fetch and return the new pet
  const newPet = await findAlivePetByUserId(db, new ObjectId(userId));
  return toPetProfile(newPet!);
};

// ─── Get All Pets History ─────────────────────────────────────────────────────

export const getAllPetsHistory = async (db: Db, userId: string): Promise<PetHistoryItem[]> => {

  // Step 1: Fetch all pets — alive and dead — sorted newest first
  const pets = await findAllPetsByUserId(db, new ObjectId(userId));

  // Step 2: Return clean list with only the fields the frontend needs
  return pets.map((pet) => ({
    id: pet._id!.toString(),
    name: pet.name,
    petAnimal: pet.petAnimal,
    level: pet.level,
    stage: pet.stage,
    status: pet.status,
    bornAt: pet.bornAt,
    diedAt: pet.diedAt,
  }));
};

// ─── Update My Pet Name ───────────────────────────────────────────────────────

export const updateMyPetName = async (db: Db, userId: string, body: UpdatePetNameBody): Promise<PetProfile> => {

  // Step 1: Make sure the alive pet exists before trying to update
  const pet = await findAlivePetByUserId(db, new ObjectId(userId));
  if (!pet) {
    throw new AppError('No alive pet found', 404);
  }

  // Step 2: Update the name in the database
  await updatePetName(db, new ObjectId(userId), body.name);

  // Step 3: Fetch the updated pet and return clean profile
  const updated = await findAlivePetByUserId(db, new ObjectId(userId));
  return toPetProfile(updated!);
};
