// services/authService.ts
// Contains all auth-related business logic.
// This file does NOT touch request/response — that's the controller's job.
// This file does NOT query the database directly — that's the repository's job.
// It only handles: hashing, comparing, token signing, and orchestrating the flow.

import { Db, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { env } from '../config/env.ts';
import { AppError } from '../plugins/errorHandler.ts';
import type { RegisterBody, LoginBody } from '../types/authTypes.ts';
import { findUserByEmail, findUserById, createUser, updateRefreshToken } from '../repositories/userRepository.ts';
import { createPet } from '../repositories/petRepository.ts';

// ─── Constants ────────────────────────────────────────────────────────────────

const SALT_ROUNDS = 10;

// ─── Token Payload Type ──────────────────────────────────────────────────────

interface TokenPayload {
  id: string;
  email: string;
}

// ─── Token Helper ─────────────────────────────────────────────────────────────

// Generates both access and refresh tokens for a user
export const generateTokens = (id: string, email: string) => {
  const accessToken = jwt.sign(
    { id, email },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES as StringValue },
  );

  const refreshToken = jwt.sign(
    { id, email },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES as StringValue },
  );

  return { accessToken, refreshToken };
};

// ─── Register ─────────────────────────────────────────────────────────────────

export const register = async (db: Db, body: RegisterBody) => {

  // Step 1: Check if email is already taken
  const existingUser = await findUserByEmail(db, body.email);
  if (existingUser) {
    throw new AppError('Email already in use', 409);
  }

  // Step 2: Hash the password before storing
  const passwordHash = await bcrypt.hash(body.password, SALT_ROUNDS);

  // Step 3: Create the user document
  const userId = await createUser(db, {
    email: body.email,
    username: body.username,
    passwordHash,
    coins: 0,
    goals: [],
    petAnimal: '',
    onboardingComplete: false,
    streak: 0,
    lastStreakDate: '',
    createdAt: new Date(),
  });

  // Step 4: Auto-create a starter pet for the new user
  // petAnimal is empty until onboarding is completed
  await createPet(db, {
    userId,
    name: 'My Pet',
    petAnimal: '',
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

  // Step 5: Generate tokens
  const tokens = generateTokens(userId.toString(), body.email);

  // Step 6: Hash and store the refresh token
  const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, SALT_ROUNDS);
  await updateRefreshToken(db, userId, refreshTokenHash);

  return { tokens };
};

// ─── Login ────────────────────────────────────────────────────────────────────

export const login = async (db: Db, body: LoginBody) => {

  // Step 1: Find user by email
  const user = await findUserByEmail(db, body.email);
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Step 2: Compare provided password with stored hash
  const isValid = await bcrypt.compare(body.password, user.passwordHash);
  if (!isValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Step 3: Generate tokens
  const tokens = generateTokens(user._id!.toString(), user.email);

  // Step 4: Hash the refresh token before storing in DB
  const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, SALT_ROUNDS);
  await updateRefreshToken(db, user._id!, refreshTokenHash);

  return { tokens };
};

// ─── Refresh ──────────────────────────────────────────────────────────────────

export const refresh = async (db: Db, refreshToken: string) => {

  // Step 1: Verify the refresh token
  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as TokenPayload;

    // Step 2: Find the user in DB by ID (faster than email lookup)
    const user = await findUserById(db, decoded.id);
    if (!user || !user.refreshToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Step 3: Compare the provided refresh token with the stored hash
    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Step 4: Generate new tokens
    const tokens = generateTokens(user._id!.toString(), user.email);

    // Step 5: Update the stored refresh token hash
    const newRefreshHash = await bcrypt.hash(tokens.refreshToken, SALT_ROUNDS);
    await updateRefreshToken(db, user._id!, newRefreshHash);

    return { tokens };

  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Invalid or expired refresh token', 401);
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────

export const logout = async (db: Db, userId: string) => {
  await updateRefreshToken(db, new ObjectId(userId), null);
};
