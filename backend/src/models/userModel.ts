// models/userModel.ts
// Defines the shape of a User document in the "users" collection.
// This interface matches the exact structure stored in MongoDB.

import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  email: string;
  passwordHash: string;
  username: string;
  avatarUrl?: string;
  coins: number;
  goals: string[];                    // selected during onboarding — validated by Zod schema, not here
  petAnimal: string;                  // chosen during onboarding — visual only (e.g. 'cat', 'dog', 'bird')
  onboardingComplete: boolean;        // false until user completes onboarding after register
  streak: number;                     // current daily streak count
  lastStreakDate: string;             // last date streak was incremented — format: YYYY-MM-DD
  refreshToken?: string | null;       // hashed refresh token for authentication
  createdAt: Date;
}
