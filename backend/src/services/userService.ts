// services/userService.ts
// Business logic for user profile endpoints.
// Does NOT touch request/response — that's the controller's job.
// Does NOT query the database directly — that's the repository's job.

import { Db, ObjectId } from 'mongodb';
import { AppError } from '../plugins/errorHandler.ts';
import type { UpdateMeBody, UserProfile, OnboardingBody, OnboardingResult } from '../types/userTypes.ts';
import { findUserById, updateUserProfile, deleteUserById, updateOnboarding } from '../repositories/userRepository.ts';
import { deletePetByUserId, setPetAnimal } from '../repositories/petRepository.ts';

// ─── Get Me ───────────────────────────────────────────────────────────────────

export const getMe = async (db: Db, userId: string): Promise<UserProfile> => {

  // Step 1: Find the user by ID
  const user = await findUserById(db, userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Step 2: Return only safe fields — never expose passwordHash or refreshToken
  return {
    id: user._id!.toString(),
    email: user.email,
    username: user.username,
    avatarUrl: user.avatarUrl,
    coins: user.coins,
    goals: user.goals,
    petAnimal: user.petAnimal,
    onboardingComplete: user.onboardingComplete,
    streak: user.streak,
    createdAt: user.createdAt,
  };
};

// ─── Update Me ────────────────────────────────────────────────────────────────

export const updateMe = async (db: Db, userId: string, body: UpdateMeBody): Promise<UserProfile> => {

  // Step 1: Make sure the user exists
  const user = await findUserById(db, userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Step 2: Only update the fields that were actually sent
  await updateUserProfile(db, new ObjectId(userId), body);

  // Step 3: Fetch the updated user and return clean profile
  const updated = await findUserById(db, userId);

  return {
    id: updated!._id!.toString(),
    email: updated!.email,
    username: updated!.username,
    avatarUrl: updated!.avatarUrl,
    coins: updated!.coins,
    goals: updated!.goals,
    petAnimal: updated!.petAnimal,
    onboardingComplete: updated!.onboardingComplete,
    streak: updated!.streak,
    createdAt: updated!.createdAt,
  };
};

// ─── Complete Onboarding ──────────────────────────────────────────────────────

export const completeOnboarding = async (db: Db, userId: string, body: OnboardingBody): Promise<OnboardingResult> => {

  // Step 1: Make sure the user exists
  const user = await findUserById(db, userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Step 2: Save pet animal + goals, mark onboarding complete
  await updateOnboarding(db, new ObjectId(userId), body.petAnimal, body.goals);

  // Step 2b: Mirror the chosen animal onto the pet doc — drives the shop
  // catalog and the pet's on-screen art
  await setPetAnimal(db, new ObjectId(userId), body.petAnimal);

  // Step 3: Return the saved onboarding data
  return {
    onboardingComplete: true,
    petAnimal: body.petAnimal,
    goals: body.goals,
  };
};

// ─── Delete Me ────────────────────────────────────────────────────────────────

export const deleteMe = async (db: Db, userId: string): Promise<void> => {

  // Step 1: Make sure the user exists
  const user = await findUserById(db, userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Step 2: Delete the pet first (pet belongs to user)
  await deletePetByUserId(db, new ObjectId(userId));

  // Step 3: Delete the user
  await deleteUserById(db, new ObjectId(userId));
};
