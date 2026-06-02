// repositories/friendRepository.ts
// Handles all database queries for the "friendships" collection.

import { Db, ObjectId } from 'mongodb';
import type { Friendship } from '../models/friendshipModel.ts';

// Step 1: Check if a friendship (pending or accepted) already exists between two users
export async function findExistingFriendship(
  db: Db,
  userA: ObjectId,
  userB: ObjectId,
): Promise<Friendship | null> {
  return db.collection<Friendship>('friendships').findOne({
    $or: [
      { requesterId: userA, receiverId: userB },
      { requesterId: userB, receiverId: userA },
    ],
  });
}

// Step 2: Create a new pending friend request
export async function createFriendRequest(
  db: Db,
  requesterId: ObjectId,
  receiverId: ObjectId,
): Promise<ObjectId> {
  const result = await db.collection<Friendship>('friendships').insertOne({
    requesterId,
    receiverId,
    status: 'pending',
    createdAt: new Date(),
  });
  return result.insertedId;
}

// Step 3: Get all accepted friendships for a user
export async function findAcceptedFriendships(db: Db, userId: ObjectId): Promise<Friendship[]> {
  return db.collection<Friendship>('friendships').find({
    status: 'accepted',
    $or: [{ requesterId: userId }, { receiverId: userId }],
  }).toArray();
}

// Step 4: Get all pending requests where the user is the receiver
export async function findPendingRequests(db: Db, receiverId: ObjectId): Promise<Friendship[]> {
  return db.collection<Friendship>('friendships').find({
    receiverId,
    status: 'pending',
  }).toArray();
}

// Step 5: Find a friendship by its document ID
export async function findFriendshipById(db: Db, id: ObjectId): Promise<Friendship | null> {
  return db.collection<Friendship>('friendships').findOne({ _id: id });
}

// Step 6: Accept a pending friend request — set status to accepted
export async function acceptFriendRequest(db: Db, id: ObjectId): Promise<void> {
  await db.collection<Friendship>('friendships').updateOne(
    { _id: id },
    { $set: { status: 'accepted' } },
  );
}

// Step 7: Delete a friendship — used to remove a friend or decline a request
export async function deleteFriendship(db: Db, id: ObjectId): Promise<void> {
  await db.collection<Friendship>('friendships').deleteOne({ _id: id });
}
