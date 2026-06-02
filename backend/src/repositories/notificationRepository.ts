// repositories/notificationRepository.ts
// Handles all database queries for the "notifications" collection.

import { Db, ObjectId } from 'mongodb';
import type { Notification, NotificationType } from '../models/notificationModel.ts';

// Step 1: Create a new notification for a user
export async function createNotification(
  db: Db,
  userId: ObjectId,
  type: NotificationType,
  message: string,
): Promise<void> {
  await db.collection<Notification>('notifications').insertOne({
    userId,
    type,
    message,
    read: false,
    createdAt: new Date(),
  });
}

// Step 2: Get all unread notifications for a user — newest first
export async function findUnreadNotifications(db: Db, userId: ObjectId): Promise<Notification[]> {
  return db.collection<Notification>('notifications')
    .find({ userId, read: false })
    .sort({ createdAt: -1 })
    .toArray();
}

// Step 3: Get all notifications for a user (read + unread) — newest first, limit 50
export async function findAllNotifications(db: Db, userId: ObjectId): Promise<Notification[]> {
  return db.collection<Notification>('notifications')
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();
}

// Step 4: Find a single notification by ID
export async function findNotificationById(db: Db, id: ObjectId): Promise<Notification | null> {
  return db.collection<Notification>('notifications').findOne({ _id: id });
}

// Step 5: Mark a single notification as read
export async function markNotificationRead(db: Db, id: ObjectId): Promise<void> {
  await db.collection<Notification>('notifications').updateOne(
    { _id: id },
    { $set: { read: true } },
  );
}

// Step 6: Mark all notifications as read for a user
export async function markAllNotificationsRead(db: Db, userId: ObjectId): Promise<void> {
  await db.collection<Notification>('notifications').updateMany(
    { userId, read: false },
    { $set: { read: true } },
  );
}
