// services/notificationService.ts
// Business logic for notification endpoints.
// Also exports createNotification for use by other services (friends, health decay etc.)

import { Db, ObjectId } from 'mongodb';
import { AppError } from '../plugins/errorHandler.ts';
import { toObjectId } from '../utils/toObjectId.ts';
import type { NotificationType } from '../models/notificationModel.ts';
import type { NotificationItem } from '../types/notificationTypes.ts';
import {
  createNotification,
  findAllNotifications,
  findNotificationById,
  markNotificationRead,
  markAllNotificationsRead,
} from '../repositories/notificationRepository.ts';

// ─── Create Notification (used by other services) ─────────────────────────────

export const notify = async (
  db: Db,
  userId: string,
  type: NotificationType,
  message: string,
): Promise<void> => {
  await createNotification(db, new ObjectId(userId), type, message);
};

// ─── Get Notifications ────────────────────────────────────────────────────────

export const getNotifications = async (db: Db, userId: string): Promise<NotificationItem[]> => {

  // Step 1: Fetch latest 50 notifications (read + unread)
  const notifications = await findAllNotifications(db, new ObjectId(userId));

  // Step 2: Return clean list
  return notifications.map((n) => ({
    id: n._id!.toString(),
    type: n.type,
    message: n.message,
    read: n.read,
    createdAt: n.createdAt,
  }));
};

// ─── Mark One As Read ─────────────────────────────────────────────────────────

export const markOneRead = async (db: Db, userId: string, notificationId: string): Promise<void> => {

  // Step 1: Validate and convert the URL param ID — throws 400 if malformed
  const notifObjectId = toObjectId(notificationId);

  // Step 2: Find the notification
  const notification = await findNotificationById(db, notifObjectId);
  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  // Step 3: Make sure it belongs to this user
  if (notification.userId.toString() !== userId) {
    throw new AppError('Forbidden', 403);
  }

  // Step 4: Mark as read
  await markNotificationRead(db, notifObjectId);
};

// ─── Mark All As Read ─────────────────────────────────────────────────────────

export const markAllRead = async (db: Db, userId: string): Promise<void> => {
  await markAllNotificationsRead(db, new ObjectId(userId));
};
