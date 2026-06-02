// models/activityModel.ts
// Defines the shape of an ActivityLog document in the "activity_logs" collection.
// Tracks daily activities, steps, gratitude entries, and XP earned.

import { ObjectId } from 'mongodb';

// Valid activity types a user can log
export type ActivityType = 'walk' | 'water' | 'sleep' | 'read';

// Valid mood values for the daily check-in
export type MoodType = 'great' | 'good' | 'okay' | 'bad' | 'awful';

export interface ActivityLog {
  _id?: ObjectId;
  userId: ObjectId;
  date: string;                     // format: YYYY-MM-DD
  steps: number;
  activitiesDone: ActivityType[];
  gratitude: string[];              // max 3 per day
  dailyNote?: string;
  mood?: MoodType;                  // one mood check-in per day, locked once set
  xpEarned: number;
  createdAt: Date;
}
