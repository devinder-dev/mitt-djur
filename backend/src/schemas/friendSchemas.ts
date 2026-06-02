// schemas/friendSchemas.ts
// Zod validation schemas for friend-related request bodies.

import { z } from 'zod';

// POST /api/friends/add — send a friend request by username
export const addFriendSchema = z.object({
  username: z
    .string({ message: 'Username is required' })
    .min(1, 'Username cannot be empty'),
});
