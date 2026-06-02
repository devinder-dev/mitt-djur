// models/friendshipModel.ts
// Defines the shape of a Friendship document in the "friendships" collection.
// Tracks friend requests and accepted friendships between users.

import { ObjectId } from 'mongodb';

export type FriendshipStatus = 'pending' | 'accepted';

export interface Friendship {
  _id?: ObjectId;
  requesterId: ObjectId;
  receiverId: ObjectId;
  status: FriendshipStatus;
  createdAt: Date;
}
