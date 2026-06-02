// models/notificationModel.ts
// Defines the shape of a Notification document in the "notifications" collection.
// Notifications are created by system events (friend requests, achievements etc.)

import { ObjectId } from 'mongodb';

// All possible notification types
export type NotificationType =
  | 'friend_request'       // someone sent you a friend request
  | 'friend_accepted'      // someone accepted your friend request
  | 'pet_warning'          // pet health hit 0 — warning
  | 'pet_died'             // pet died (3rd time health hit 0)
  | 'level_up'             // pet leveled up
  | 'streak_milestone'     // streak reached a milestone (7, 14, 30 days)
  | 'weekly_summary';      // weekly recap sent every Sunday

export interface Notification {
  _id?: ObjectId;
  userId: ObjectId;           // who receives this notification
  type: NotificationType;
  message: string;            // human-readable message
  read: boolean;
  createdAt: Date;
}
