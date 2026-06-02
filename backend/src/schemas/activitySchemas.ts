// schemas/activitySchemas.ts
// Zod validation schemas for activity-related request bodies.

import { z } from 'zod';

// POST /api/activity/log — log a specific activity type for today
export const logActivitySchema = z.object({
  type: z.enum(['walk', 'water', 'sleep', 'read'], {
    message: 'Type must be one of: walk, water, sleep, read',
  }),
});

// POST /api/activity/mood — set today's mood check-in (one per day, locks after)
export const setMoodSchema = z.object({
  mood: z.enum(['great', 'good', 'okay', 'bad', 'awful'], {
    message: 'Mood must be one of: great, good, okay, bad, awful',
  }),
});

// POST /api/activity/note — set the daily journal note (one per day, overwrites)
export const addNoteSchema = z.object({
  note: z
    .string({ message: 'Note is required' })
    .min(1, 'Note cannot be empty')
    .max(1000, 'Note cannot exceed 1000 characters'),
});

// POST /api/activity/gratitude — add a gratitude entry for today (max 3)
export const addGratitudeSchema = z.object({
  text: z
    .string({ message: 'Text is required' })
    .min(1, 'Gratitude text cannot be empty')
    .max(300, 'Gratitude text cannot exceed 300 characters'),
});

// POST /api/activity/steps — sync step count for today
export const syncStepsSchema = z.object({
  steps: z
    .number()
    .int('Steps must be a whole number')
    .min(0, 'Steps cannot be negative')
    .max(100000, 'Steps cannot exceed 100,000 per day'),
});
