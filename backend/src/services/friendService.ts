// services/friendService.ts
// Business logic for friend endpoints.
// Does NOT touch request/response — that's the controller's job.
// Does NOT query the database directly — that's the repository's job.

import { Db, ObjectId } from 'mongodb';
import { AppError } from '../plugins/errorHandler.ts';
import { toObjectId } from '../utils/toObjectId.ts';
import type { AddFriendBody, FriendProfile, LeaderboardEntry, FriendRequest } from '../types/friendTypes.ts';
import { findUserByUsername, findUserById, findUsersByIds } from '../repositories/userRepository.ts';
import { findAlivePetByUserId, findAlivePetsByUserIds } from '../repositories/petRepository.ts';
import {
  findExistingFriendship,
  createFriendRequest,
  findAcceptedFriendships,
  findPendingRequests,
  findFriendshipById,
  acceptFriendRequest,
  deleteFriendship,
} from '../repositories/friendRepository.ts';

// ─── Helper — get pet snapshot for a user ─────────────────────────────────────

const getPetSnapshot = async (db: Db, userId: ObjectId) => {
  const pet = await findAlivePetByUserId(db, userId);
  if (!pet) return null;
  return {
    name: pet.name,
    level: pet.level,
    xp: pet.xp,
    stage: pet.stage,
    mood: pet.mood,
    health: pet.health,
  };
};

// ─── Add Friend ───────────────────────────────────────────────────────────────

export const addFriend = async (db: Db, userId: string, body: AddFriendBody): Promise<{ message: string }> => {

  // Step 1: Find the target user by username
  const target = await findUserByUsername(db, body.username);
  if (!target) {
    throw new AppError('User not found', 404);
  }

  // Step 2: Cannot send a request to yourself
  if (target._id!.toString() === userId) {
    throw new AppError('You cannot add yourself as a friend', 400);
  }

  // Step 3: Check if friendship already exists
  const existing = await findExistingFriendship(db, new ObjectId(userId), target._id!);
  if (existing) {
    throw new AppError(
      existing.status === 'accepted' ? 'Already friends' : 'Friend request already sent',
      400,
    );
  }

  // Step 4: Create the friend request
  await createFriendRequest(db, new ObjectId(userId), target._id!);

  return { message: `Friend request sent to ${target.username}` };
};

// ─── Get Friends ──────────────────────────────────────────────────────────────

export const getFriends = async (db: Db, userId: string): Promise<FriendProfile[]> => {

  // Step 1: Get all accepted friendships
  const friendships = await findAcceptedFriendships(db, new ObjectId(userId));
  if (friendships.length === 0) return [];

  // Step 2: Collect all friend IDs
  const friendIds = friendships.map((f) =>
    f.requesterId.toString() === userId ? f.receiverId : f.requesterId,
  );

  // Step 3: Batch-load all friend users and their pets in 2 queries instead of 2N
  const [users, pets] = await Promise.all([
    findUsersByIds(db, friendIds),
    findAlivePetsByUserIds(db, friendIds),
  ]);

  // Step 4: Build lookup maps for O(1) join
  const userMap = new Map(users.map((u) => [u._id!.toString(), u]));
  const petMap = new Map(pets.map((p) => [p.userId.toString(), p]));

  // Step 5: Join and build profiles
  const profiles: FriendProfile[] = [];
  for (const f of friendships) {
    const friendId = f.requesterId.toString() === userId ? f.receiverId : f.requesterId;
    const friend = userMap.get(friendId.toString());
    if (!friend) continue;

    const pet = petMap.get(friendId.toString());
    profiles.push({
      friendshipId: f._id!.toString(),
      userId: friendId.toString(),
      username: friend.username,
      avatarUrl: friend.avatarUrl,
      pet: pet
        ? { name: pet.name, level: pet.level, xp: pet.xp, stage: pet.stage, mood: pet.mood, health: pet.health }
        : null,
    });
  }

  return profiles;
};

// ─── Get Leaderboard ──────────────────────────────────────────────────────────

export const getLeaderboard = async (db: Db, userId: string): Promise<LeaderboardEntry[]> => {

  // Step 1: Get friends list
  const friends = await getFriends(db, userId);

  // Step 2: Include the current user in the leaderboard
  const me = await findUserById(db, userId);
  const myPet = await getPetSnapshot(db, new ObjectId(userId));
  const allEntries = [
    { userId, username: me?.username ?? '', pet: myPet },
    ...friends.map((f) => ({ userId: f.userId, username: f.username, pet: f.pet })),
  ];

  // Step 3: Sort by XP descending, then add rank
  allEntries.sort((a, b) => (b.pet?.xp ?? 0) - (a.pet?.xp ?? 0));

  return allEntries.map((entry, index) => ({
    rank: index + 1,
    userId: entry.userId,
    username: entry.username,
    pet: entry.pet,
  }));
};

// ─── Get Pending Requests ─────────────────────────────────────────────────────

export const getPendingRequests = async (db: Db, userId: string): Promise<FriendRequest[]> => {

  // Step 1: Fetch all pending requests where I am the receiver
  const requests = await findPendingRequests(db, new ObjectId(userId));
  if (requests.length === 0) return [];

  // Step 2: Batch-load all requesters in 1 query instead of N
  const requesterIds = requests.map((r) => r.requesterId);
  const requesters = await findUsersByIds(db, requesterIds);
  const requesterMap = new Map(requesters.map((u) => [u._id!.toString(), u]));

  // Step 3: Join and build result
  const results: FriendRequest[] = [];
  for (const r of requests) {
    const requester = requesterMap.get(r.requesterId.toString());
    if (!requester) continue;
    results.push({
      requestId: r._id!.toString(),
      fromUserId: r.requesterId.toString(),
      fromUsername: requester.username,
      sentAt: r.createdAt,
    });
  }

  return results;
};

// ─── Accept Friend Request ────────────────────────────────────────────────────

export const acceptRequest = async (db: Db, userId: string, requestId: string): Promise<{ message: string }> => {

  // Step 1: Validate and convert the URL param ID — throws 400 if malformed
  const requestObjectId = toObjectId(requestId);

  // Step 2: Find the request
  const request = await findFriendshipById(db, requestObjectId);
  if (!request || request.status !== 'pending') {
    throw new AppError('Friend request not found', 404);
  }

  // Step 3: Make sure the logged-in user is the receiver
  if (request.receiverId.toString() !== userId) {
    throw new AppError('Forbidden', 403);
  }

  // Step 4: Accept it
  await acceptFriendRequest(db, requestObjectId);

  return { message: 'Friend request accepted' };
};

// ─── Remove Friend ────────────────────────────────────────────────────────────

export const removeFriend = async (db: Db, userId: string, friendshipId: string): Promise<void> => {

  // Step 1: Validate and convert the URL param ID — throws 400 if malformed
  const friendshipObjectId = toObjectId(friendshipId);

  // Step 2: Find the friendship
  const friendship = await findFriendshipById(db, friendshipObjectId);
  if (!friendship) {
    throw new AppError('Friendship not found', 404);
  }

  // Step 3: Make sure the logged-in user is part of this friendship
  const isParticipant =
    friendship.requesterId.toString() === userId ||
    friendship.receiverId.toString() === userId;

  if (!isParticipant) {
    throw new AppError('Forbidden', 403);
  }

  // Step 4: Delete the friendship
  await deleteFriendship(db, friendshipObjectId);
};
