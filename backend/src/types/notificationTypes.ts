// types/notificationTypes.ts
// TypeScript types for notification response bodies.

import type { NotificationType } from '../models/notificationModel.ts';

// Response type — one notification item
export type NotificationItem = {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: Date;
};
