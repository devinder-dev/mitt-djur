// jobs/weeklySummary.ts
// Cron job that runs every Sunday at 20:00 Stockholm time.
// Sends each onboarded user a weekly recap notification with their stats for the past 7 days.

import type { Db } from 'mongodb';
import cron from 'node-cron';
import { findAllOnboardedUsers } from '../repositories/userRepository.ts';
import { countMissionsCompletedSince } from '../repositories/missionRepository.ts';
import { sumXpSince } from '../repositories/activityRepository.ts';
import { findAlivePetByUserId } from '../repositories/petRepository.ts';
import { createNotification } from '../repositories/notificationRepository.ts';

export function startWeeklySummaryJob(db: Db): void {

  // Runs every Sunday at 20:00 Stockholm time
  cron.schedule('0 20 * * 0', async () => {

    console.log('📋 Weekly summary job started');

    try {
      // Step 1: Calculate the start of this week — 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const fromDate = sevenDaysAgo.toISOString().substring(0, 10);

      // Step 2: Get all users who have completed onboarding
      const users = await findAllOnboardedUsers(db);

      // Step 3: Send a summary notification to each user
      let sent = 0;

      for (const user of users) {
        try {
          const userId = user._id!;

          // Step 4: Fetch this user's weekly stats in parallel
          const [missionsThisWeek, xpThisWeek, pet] = await Promise.all([
            countMissionsCompletedSince(db, userId, sevenDaysAgo),
            sumXpSince(db, userId, fromDate),
            findAlivePetByUserId(db, userId),
          ]);

          // Step 5: Build the summary message
          const petInfo = pet
            ? `${pet.name} is level ${pet.level} with ${pet.health} health`
            : 'no active pet';

          const message =
            `Weekly recap — ${missionsThisWeek} mission${missionsThisWeek === 1 ? '' : 's'} done, ` +
            `${xpThisWeek} XP earned, ${user.streak}-day streak. ` +
            `Pet: ${petInfo}. Keep it up! 🐾`;

          // Step 6: Create the notification
          await createNotification(db, userId, 'weekly_summary', message);
          sent++;

        } catch (userError) {
          // Step 7: If one user fails, log and continue — don't stop the whole job
          console.error(`❌ Weekly summary failed for user ${user._id}:`, userError);
        }
      }

      console.log(`✅ Weekly summary done — sent to ${sent}/${users.length} users`);

    } catch (error) {
      console.error('❌ Weekly summary job failed:', error);
    }

  }, { timezone: 'Europe/Stockholm' });

  console.log('🗓️ Weekly summary job scheduled — runs every Sunday at 20:00 Stockholm time');
}
