// types/friendTypes.ts
// TypeScript types for friend request/response bodies.

import { z } from 'zod';
import { addFriendSchema } from '../schemas/friendSchemas.ts';
import type { PetStage, PetMood } from '../models/petModel.ts';

// Request body type — inferred from schema
export type AddFriendBody = z.infer<typeof addFriendSchema>;

// Pet snapshot shown inside a friend's profile
export type FriendPetSnapshot = {
  name: string;
  level: number;
  xp: number;
  stage: PetStage;
  mood: PetMood;
  health: number;
};

// One friend in the friends list (GET /api/friends)
export type FriendProfile = {
  friendshipId: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  pet: FriendPetSnapshot | null;
};

// One entry in the leaderboard (GET /api/friends/leaderboard)
export type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  pet: FriendPetSnapshot | null;
};

// One pending friend request (GET /api/friends/requests)
export type FriendRequest = {
  requestId: string;
  fromUserId: string;
  fromUsername: string;
  sentAt: Date;
};
